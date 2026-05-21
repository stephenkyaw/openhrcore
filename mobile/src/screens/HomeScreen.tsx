import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEss } from '../store/EssStore';
import {
  AlertBanner, Avatar, Badge, Card, Metric, ProgressBar,
  Row, Screen, SectionTitle, StatRow,
} from '../components/ui';
import { WeeklyAttendanceChart } from '../components/charts';
import { colors, font, hairline, radius, shadowMd, spacing } from '../theme';
import { formatMoney, formatShortDate } from '../utils/dates';
import type { Payslip, NotificationKind, Tone } from '../types';

const QUICK_ACTIONS = [
  { id: 'leave',      icon: 'calendar-outline',     label: 'Leave',    bg: colors.primarySoft,  fg: colors.primary },
  { id: 'attendance', icon: 'time-outline',          label: 'Clock',    bg: colors.successSoft,  fg: colors.success },
  { id: 'pay',        icon: 'wallet-outline',        label: 'Payslip',  bg: colors.warningSoft,  fg: colors.warning },
  { id: 'profile',    icon: 'person-outline',        label: 'Profile',  bg: colors.infoSoft,     fg: colors.info },
];

function netPay(ps: Payslip): number {
  return ps.earnings.reduce((s, l) => s + l.amount, 0) - ps.deductions.reduce((s, l) => s + l.amount, 0);
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function statusTone(s: string): Tone {
  if (['present', 'approved', 'paid'].includes(s)) return 'success';
  if (['late', 'pending'].includes(s)) return 'warning';
  if (['absent', 'rejected'].includes(s)) return 'danger';
  return 'neutral';
}

export function HomeScreen({ setTab }: { setTab: (tab: string) => void }): React.ReactElement {
  const {
    attendance, balances, employee, leaveTypes,
    monthSummary, notifications, payslips, pendingApprovals,
    requests, tasks, upcomingLeave, weekAttendance, ytdEarnings,
  } = useEss();

  const today = attendance[0];
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = today?.date === todayStr;
  const isOpen = isToday && today?.in && !today?.out;

  const pendingLeave = requests.filter((r) => r.status === 'pending').length;
  const unread = notifications.filter((n) => !n.read).length;
  const openTasks = tasks.filter((t) => !t.done).length;
  const annual = balances.lt1 || { granted: 0, used: 0, pending: 0 };
  const annualLeft = annual.granted - annual.used - annual.pending;
  const latestPay = payslips[0];

  const todayLabel = new Date().toLocaleDateString('en', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <Screen>
      {/* ── Hero card ─────────────────────────────────────── */}
      <View style={styles.hero}>
        <Row style={styles.heroRow}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroDate}>{todayLabel}</Text>
            <Text style={styles.heroGreeting}>{greeting()},</Text>
            <Text style={styles.heroName}>{employee.first} {employee.last}</Text>
            <Text style={styles.heroRole}>{employee.position}</Text>
          </View>
          <Avatar
            initials={`${employee.first[0]}${employee.last[0]}`}
            size={60}
            color={colors.primary}
          />
        </Row>

        <View style={styles.heroFooter}>
          <View style={[
            styles.clockDot,
            isOpen ? { backgroundColor: colors.success } : null,
            isToday && today?.out ? { backgroundColor: colors.primary } : null,
            (!isToday || !today) ? { backgroundColor: colors.border } : null,
          ]} />
          <Text style={styles.heroClockText} numberOfLines={1}>
            {isToday && today?.in
              ? isOpen
                ? `Clocked in · ${today.in}${today.wfh ? ' · WFH' : ' · Office'}`
                : `${today.in} – ${today.out} · ${today.hours}h`
              : 'Not clocked in today'}
          </Text>
          {isToday && today && (
            <Badge tone={statusTone(today.status ?? 'neutral')}>{today.status}</Badge>
          )}
        </View>
      </View>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <Row style={styles.quickRow}>
        {QUICK_ACTIONS.map((q) => (
          <Pressable
            key={q.id}
            style={({ pressed }) => [styles.quickItem, pressed && { opacity: 0.75 }]}
            onPress={() => setTab(q.id)}
            accessibilityRole="button"
            accessibilityLabel={q.label}
          >
            <View style={[styles.quickIcon, { backgroundColor: q.bg }]}>
              <Ionicons name={q.icon as any} size={24} color={q.fg} />
            </View>
            <Text style={styles.quickLabel}>{q.label}</Text>
          </Pressable>
        ))}
      </Row>

      {/* ── Alerts ────────────────────────────────────────────── */}
      {pendingApprovals.length > 0 && (
        <AlertBanner
          tone="warning"
          message={`${pendingApprovals.length} leave request${pendingApprovals.length !== 1 ? 's' : ''} awaiting your approval`}
        />
      )}
      {unread > 0 && (
        <AlertBanner
          tone="info"
          message={`${unread} unread notification${unread !== 1 ? 's' : ''}`}
        />
      )}

      {/* ── Key metrics ───────────────────────────────────────── */}
      <Row style={styles.metricsRow}>
        <Metric
          label="Annual leave"
          value={annualLeft}
          sub={annual.pending > 0 ? `${annual.pending} pending` : `${annual.used} used`}
          tone={annualLeft <= 3 ? 'warning' : undefined}
        />
        <Metric
          label="Approvals"
          value={pendingApprovals.length}
          sub="Awaiting decision"
          tone={pendingApprovals.length > 0 ? 'warning' : undefined}
        />
      </Row>
      <Row style={styles.metricsRow}>
        <Metric
          label="My requests"
          value={pendingLeave}
          sub="Pending approval"
        />
        <Metric
          label="Open tasks"
          value={openTasks}
          sub={unread > 0 ? `${unread} unread` : 'All caught up'}
          tone={openTasks > 0 ? 'primary' : undefined}
        />
      </Row>

      {/* ── This week ─────────────────────────────────────────── */}
      {weekAttendance.length > 0 && (
        <>
          <SectionTitle title="This week" />
          <Card>
            <WeeklyAttendanceChart data={weekAttendance} />
            <StatRow
              style={styles.weekStats}
              items={[
                { label: 'Present', value: monthSummary.present + monthSummary.late },
                { label: 'Late', value: monthSummary.late, tone: monthSummary.late > 0 ? 'warning' : undefined },
                { label: 'WFH', value: monthSummary.wfh, tone: 'primary' },
                { label: 'Absent', value: monthSummary.absent, tone: monthSummary.absent > 0 ? 'danger' : undefined },
              ]}
            />
          </Card>
        </>
      )}

      {/* ── Upcoming leave ────────────────────────────────────── */}
      {upcomingLeave.length > 0 && (
        <>
          <SectionTitle title="Upcoming leave" />
          {upcomingLeave.slice(0, 2).map((req) => {
            const lt = leaveTypes.find((t) => t.id === req.type);
            return (
              <Card key={req.id} onPress={() => setTab('leave')} accent={colors.success}>
                <Row>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{lt?.name || req.type}</Text>
                    <Text style={styles.cardSub}>
                      {formatShortDate(req.from)} – {formatShortDate(req.to)}
                    </Text>
                  </View>
                  <View style={styles.upcomingRight}>
                    <Text style={styles.upcomingDays}>{req.days}</Text>
                    <Text style={styles.upcomingDaysUnit}>days</Text>
                  </View>
                </Row>
              </Card>
            );
          })}
        </>
      )}

      {/* ── Leave balances ────────────────────────────────────── */}
      <SectionTitle title="Leave balances" />
      {leaveTypes.map((type) => {
        const bal = balances[type.id] || { granted: 0, used: 0, pending: 0 };
        const left = bal.granted - bal.used - bal.pending;
        const pct = bal.granted > 0 ? (bal.used + bal.pending) / bal.granted : 0;
        const low = left <= 2;
        return (
          <Card key={type.id} onPress={() => setTab('leave')}>
            <Row style={styles.balRow}>
              <Text style={styles.cardTitle}>{type.name}</Text>
              <Row style={styles.balRight}>
                <Text style={[styles.balNum, low && styles.balWarn]}>{left}</Text>
                <Text style={styles.balDenom}> / {bal.granted} days</Text>
              </Row>
            </Row>
            <ProgressBar value={pct} color={low ? colors.warning : colors.primary} style={styles.balProgress} />
            <Text style={styles.cardSub}>{bal.used} used · {bal.pending} pending</Text>
          </Card>
        );
      })}

      {/* ── Latest payslip ────────────────────────────────────── */}
      {latestPay && (
        <>
          <SectionTitle title="Latest payslip" />
          <Card onPress={() => setTab('pay')} elevated>
            <Row>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{latestPay.period}</Text>
                <Text style={styles.cardSub}>Paid {formatShortDate(latestPay.payDate)}</Text>
                {ytdEarnings.months > 0 && (
                  <Text style={styles.ytdHint}>
                    YTD {formatMoney(ytdEarnings.net, 'THB')} · {ytdEarnings.months} months
                  </Text>
                )}
              </View>
              <View style={styles.payRight}>
                <Text style={styles.netPay}>{formatMoney(netPay(latestPay), latestPay.currency)}</Text>
                <Badge tone="success">{latestPay.status}</Badge>
              </View>
            </Row>
          </Card>
        </>
      )}

      {/* ── Notifications ─────────────────────────────────────── */}
      {unread > 0 && (
        <>
          <SectionTitle title="Notifications" />
          {notifications.filter((n) => !n.read).slice(0, 3).map((n) => (
            <Card key={n.id} onPress={() => setTab('profile')} accent={colors.primary}>
              <Row>
                <View style={[styles.notifIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name={kindIcon(n.kind) as any} size={17} color={colors.primary} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{n.title}</Text>
                  <Text style={styles.cardSub}>{n.body}</Text>
                </View>
                <View style={styles.unreadDot} />
              </Row>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}

function kindIcon(kind: NotificationKind): string {
  if (kind === 'payroll') return 'wallet-outline';
  if (kind === 'leave') return 'calendar-outline';
  if (kind === 'document') return 'document-text-outline';
  if (kind === 'attendance') return 'time-outline';
  return 'notifications-outline';
}

const styles = StyleSheet.create({
  // Hero
  hero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: hairline,
    overflow: 'hidden',
    ...shadowMd,
  },
  heroRow: {
    alignItems: 'flex-start',
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  heroLeft: { flex: 1, paddingRight: spacing.md },
  heroDate: {
    color: colors.muted,
    fontSize: font.xs,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  heroGreeting: { color: colors.muted, fontSize: font.md },
  heroName: {
    color: colors.text,
    fontSize: font.xxl,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginTop: 1,
  },
  heroRole: { color: colors.textSecondary, fontSize: font.sm, fontWeight: '500', marginTop: spacing.xs },
  heroFooter: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: hairline,
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  clockDot: { borderRadius: radius.full, height: 8, width: 8 },
  heroClockText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: font.sm,
    fontWeight: '500',
  },

  // Quick actions
  quickRow: { gap: spacing.md },
  quickItem: { alignItems: 'center', flex: 1, gap: spacing.xs },
  quickIcon: {
    alignItems: 'center',
    borderRadius: radius.xl,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  quickLabel: {
    color: colors.textSecondary,
    fontSize: font.xs,
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
  },

  // Metrics
  metricsRow: { gap: spacing.md },
  weekStats: { marginTop: spacing.md },

  // Common cards
  flex: { flex: 1, paddingRight: spacing.sm },
  cardTitle: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  cardSub: { color: colors.muted, fontSize: font.sm, marginTop: 2 },

  // Upcoming leave
  upcomingRight: { alignItems: 'center', gap: 1 },
  upcomingDays: { color: colors.success, fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  upcomingDaysUnit: { color: colors.muted, fontSize: font.xs, fontWeight: '600' },

  // Balances
  balRow: { marginBottom: spacing.sm },
  balRight: { alignItems: 'baseline', justifyContent: 'flex-end', gap: 1 },
  balNum: { color: colors.primary, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  balWarn: { color: colors.warning },
  balDenom: { color: colors.muted, fontSize: font.sm },
  balProgress: { marginBottom: spacing.sm },

  // Payslip
  payRight: { alignItems: 'flex-end', gap: spacing.xs },
  netPay: { color: colors.text, fontSize: font.lg, fontWeight: '900', letterSpacing: -0.5 },
  ytdHint: { color: colors.info, fontSize: font.xs, fontWeight: '600', marginTop: 2 },

  // Notifications
  notifIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 36,
  },
  unreadDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
});

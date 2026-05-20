import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEss } from '../store/EssStore';
import {
  Avatar, Badge, Card, Metric, ProgressBar, Row, Screen, SectionTitle,
} from '../components/ui';
import { WeeklyAttendanceChart } from '../components/charts';
import { colors, radius, spacing } from '../theme';
import { formatMoney, formatShortDate } from '../utils/dates';

const QUICK_ACTIONS = [
  { id: 'leave',      icon: 'calendar-outline',      label: 'Leave',    color: colors.primarySoft,   iconColor: colors.primary },
  { id: 'attendance', icon: 'time-outline',           label: 'Clock',    color: colors.successSoft,   iconColor: colors.success },
  { id: 'pay',        icon: 'wallet-outline',         label: 'Payslip',  color: colors.warningSoft,   iconColor: colors.warning },
  { id: 'profile',    icon: 'document-text-outline',  label: 'Docs',     color: colors.infoSoft,      iconColor: colors.info },
];

function netPay(ps) {
  const gross = ps.earnings.reduce((s, l) => s + l.amount, 0);
  const deduct = ps.deductions.reduce((s, l) => s + l.amount, 0);
  return gross - deduct;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function statusTone(s) {
  if (['present', 'approved', 'paid', 'verified'].includes(s)) return 'success';
  if (['late', 'pending', 'expiring'].includes(s)) return 'warning';
  if (['absent', 'rejected'].includes(s)) return 'danger';
  return 'neutral';
}

export function HomeScreen({ setTab }) {
  const {
    attendance, balances, employee, leaveTypes,
    monthSummary, notifications, payslips, pendingApprovals,
    requests, tasks, upcomingLeave, weekAttendance, ytdEarnings,
  } = useEss();

  const today = attendance[0];
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = today?.date === todayStr;
  const pendingLeave = requests.filter((r) => r.status === 'pending').length;
  const unread = notifications.filter((n) => !n.read).length;
  const openTasks = tasks.filter((t) => !t.done).length;
  const annual = balances.lt1 || { granted: 0, used: 0, pending: 0 };
  const annualLeft = annual.granted - annual.used - annual.pending;
  const latestPay = payslips[0];

  return (
    <Screen>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroGreeting}>{greeting()}</Text>
          <Text style={styles.heroName}>{employee.first} {employee.last}</Text>
          <Text style={styles.heroPos}>{employee.position}</Text>
          <Text style={styles.heroDept}>{employee.dept} · {employee.location}</Text>
        </View>
        <Avatar initials={`${employee.first[0]}${employee.last[0]}`} size={60} color={colors.primary} />
      </View>

      {/* Quick actions */}
      <Row style={styles.quickRow}>
        {QUICK_ACTIONS.map((q) => (
          <Pressable
            key={q.id}
            style={styles.quickItem}
            onPress={() => setTab(q.id)}
            accessibilityRole="button"
            accessibilityLabel={q.label}
          >
            <View style={[styles.quickIcon, { backgroundColor: q.color }]}>
              <Ionicons name={q.icon} size={22} color={q.iconColor} />
            </View>
            <Text style={styles.quickLabel}>{q.label}</Text>
          </Pressable>
        ))}
      </Row>

      {/* Key metrics */}
      <Row style={styles.metricRow}>
        <Metric
          label="Annual left"
          value={annualLeft}
          sub={annual.pending > 0 ? `${annual.pending} pending` : `${annual.used} used`}
          tone={annualLeft <= 3 ? 'warning' : undefined}
        />
        <Metric
          label="Approvals"
          value={pendingApprovals.length}
          sub="Awaiting your decision"
          tone={pendingApprovals.length > 0 ? 'warning' : undefined}
        />
      </Row>
      <Row style={styles.metricRow}>
        <Metric
          label="My requests"
          value={pendingLeave}
          sub="Pending approval"
        />
        <Metric
          label="Inbox"
          value={unread}
          sub={`${openTasks} open task${openTasks !== 1 ? 's' : ''}`}
          tone={unread > 0 ? 'primary' : undefined}
        />
      </Row>

      {/* Today */}
      <SectionTitle title="Today" />
      <Card>
        <Row>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>
              {isToday && today?.in
                ? `${today.in} – ${today.out || 'shift active'}`
                : 'Not clocked in yet'}
            </Text>
            <Text style={styles.cardSub}>
              {isToday && today?.hours
                ? `${today.hours}h worked${today.wfh ? ' · Work from home' : ' · Office'}`
                : monthSummary.present > 0
                  ? `${monthSummary.present} days present this month`
                  : 'Clock in to start your shift'}
            </Text>
          </View>
          <Badge tone={isToday && today ? statusTone(today.status) : 'neutral'}>
            {isToday && today ? today.status : 'absent'}
          </Badge>
        </Row>
      </Card>

      {/* This week */}
      {weekAttendance.length > 0 && (
        <>
          <SectionTitle title="This week" />
          <Card>
            <WeeklyAttendanceChart data={weekAttendance} />
            <Row style={styles.weekStats}>
              <View style={styles.weekStat}>
                <Text style={styles.weekStatNum}>{monthSummary.present + monthSummary.late}</Text>
                <Text style={styles.weekStatLabel}>Present</Text>
              </View>
              <View style={styles.weekStat}>
                <Text style={[styles.weekStatNum, monthSummary.late > 0 && styles.warn]}>{monthSummary.late}</Text>
                <Text style={styles.weekStatLabel}>Late</Text>
              </View>
              <View style={styles.weekStat}>
                <Text style={styles.weekStatNum}>{monthSummary.wfh}</Text>
                <Text style={styles.weekStatLabel}>WFH</Text>
              </View>
            </Row>
          </Card>
        </>
      )}

      {/* Upcoming leave */}
      {upcomingLeave.length > 0 && (
        <>
          <SectionTitle title="Upcoming leave" />
          {upcomingLeave.slice(0, 2).map((req) => {
            const lt = leaveTypes.find((t) => t.id === req.type);
            return (
              <Card key={req.id} style={styles.upcomingCard}>
                <Row>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{lt?.name || req.type}</Text>
                    <Text style={styles.cardSub}>
                      {formatShortDate(req.from)} – {formatShortDate(req.to)} · {req.days} day{req.days !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Badge tone="success">approved</Badge>
                </Row>
              </Card>
            );
          })}
        </>
      )}

      {/* Leave balances */}
      <SectionTitle title="Leave balances" />
      {leaveTypes.map((type) => {
        const bal = balances[type.id] || { granted: 0, used: 0, pending: 0 };
        const left = bal.granted - bal.used - bal.pending;
        const pct = bal.granted > 0 ? (bal.used + bal.pending) / bal.granted : 0;
        const low = left <= 2;
        return (
          <Pressable key={type.id} onPress={() => setTab('leave')}>
            <Card>
              <Row style={styles.balRow}>
                <Text style={styles.cardTitle}>{type.name}</Text>
                <Row style={styles.balRight}>
                  <Text style={[styles.balNum, low && styles.balWarn]}>{left}</Text>
                  <Text style={styles.balDenom}> / {bal.granted} days</Text>
                </Row>
              </Row>
              <ProgressBar value={pct} color={low ? colors.warning : colors.primary} style={styles.prog} />
              <Text style={styles.cardSub}>{bal.used} used · {bal.pending} pending</Text>
            </Card>
          </Pressable>
        );
      })}

      {/* Latest payslip */}
      {latestPay && (
        <>
          <SectionTitle title="Latest payslip" />
          <Pressable onPress={() => setTab('pay')}>
            <Card>
              <Row>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{latestPay.period}</Text>
                  <Text style={styles.cardSub}>Paid {formatShortDate(latestPay.payDate)}</Text>
                  {ytdEarnings.months > 0 && (
                    <Text style={styles.ytdHint}>
                      YTD net {formatMoney(ytdEarnings.net, 'THB')} · {ytdEarnings.months} months
                    </Text>
                  )}
                </View>
                <View style={styles.payRight}>
                  <Text style={styles.netPay}>{formatMoney(netPay(latestPay), latestPay.currency)}</Text>
                  <Badge tone="success">{latestPay.status}</Badge>
                </View>
              </Row>
            </Card>
          </Pressable>
        </>
      )}

      {/* Unread notifications */}
      {unread > 0 && (
        <>
          <SectionTitle title="Notifications" />
          {notifications
            .filter((n) => !n.read)
            .slice(0, 3)
            .map((n) => (
              <Card key={n.id} style={styles.notifCard}>
                <Row>
                  <Ionicons
                    name={kindIcon(n.kind)}
                    size={18}
                    color={colors.primary}
                    style={styles.notifIcon}
                  />
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

function kindIcon(kind) {
  if (kind === 'payroll') return 'wallet-outline';
  if (kind === 'leave') return 'calendar-outline';
  if (kind === 'document') return 'document-text-outline';
  if (kind === 'attendance') return 'time-outline';
  return 'notifications-outline';
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  heroLeft: { flex: 1, paddingRight: spacing.md },
  heroGreeting: { color: colors.muted, fontSize: 13 },
  heroName: { color: colors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginTop: 2 },
  heroPos: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: spacing.xs },
  heroDept: { color: colors.muted, fontSize: 13, marginTop: 2 },
  quickRow: { gap: spacing.sm, justifyContent: 'space-between' },
  quickItem: { alignItems: 'center', flex: 1 },
  quickIcon: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  quickLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 6, textAlign: 'center' },
  metricRow: { gap: spacing.md },
  flex: { flex: 1, paddingRight: spacing.md },
  weekStats: { justifyContent: 'space-around', marginTop: spacing.md },
  weekStat: { alignItems: 'center' },
  weekStatNum: { color: colors.text, fontSize: 18, fontWeight: '800' },
  weekStatLabel: { color: colors.muted, fontSize: 11, marginTop: 2 },
  warn: { color: colors.warning },
  upcomingCard: { borderLeftColor: colors.success, borderLeftWidth: 3 },
  balRow: { marginBottom: spacing.sm },
  balRight: { alignItems: 'baseline', justifyContent: 'flex-end' },
  balNum: { color: colors.primary, fontSize: 22, fontWeight: '900' },
  balWarn: { color: colors.warning },
  balDenom: { color: colors.muted, fontSize: 13 },
  prog: { marginBottom: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  cardSub: { color: colors.muted, fontSize: 13, marginTop: 3 },
  ytdHint: { color: colors.info, fontSize: 12, fontWeight: '600', marginTop: 3 },
  payRight: { alignItems: 'flex-end', gap: spacing.xs },
  netPay: { color: colors.text, fontSize: 17, fontWeight: '900' },
  notifCard: { borderLeftColor: colors.primary, borderLeftWidth: 3 },
  notifIcon: { marginRight: spacing.md },
  unreadDot: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
});

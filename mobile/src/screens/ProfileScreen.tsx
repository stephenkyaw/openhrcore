import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEss } from '../store/EssStore';
import {
  Avatar, Badge, Button, Card, Chip, Divider, Empty, InfoRow,
  ListItem, ProgressBar, Row, Screen, SectionTitle, StatRow,
} from '../components/ui';
import { FormField, TextFieldInput } from '../components/forms';
import { colors, font, radius, shadow, spacing } from '../theme';
import type { DocumentStatus, NotificationKind, Tone } from '../types';

function docStatusTone(s: DocumentStatus): Tone {
  if (s === 'verified') return 'success';
  if (s === 'expiring') return 'warning';
  if (s === 'pending') return 'info';
  return 'neutral';
}

function notifIcon(kind: NotificationKind): string {
  if (kind === 'payroll') return 'wallet-outline';
  if (kind === 'leave') return 'calendar-outline';
  if (kind === 'document') return 'document-text-outline';
  if (kind === 'attendance') return 'time-outline';
  return 'notifications-outline';
}

function notifColor(kind: NotificationKind): string {
  if (kind === 'payroll') return colors.warning;
  if (kind === 'leave') return colors.primary;
  if (kind === 'document') return colors.info;
  if (kind === 'attendance') return colors.success;
  return colors.muted;
}

function notifBg(kind: NotificationKind): string {
  if (kind === 'payroll') return colors.warningSoft;
  if (kind === 'leave') return colors.primarySoft;
  if (kind === 'document') return colors.infoSoft;
  if (kind === 'attendance') return colors.successSoft;
  return colors.surfaceAlt;
}

export function ProfileScreen({ onLogout }: { onLogout: () => void }): React.ReactElement {
  const {
    documents, employee, manager, markAllRead, markNotificationRead,
    notifications, tasks, team, toggleTask, uploadDocument,
  } = useEss();

  const [view, setView] = useState('info');
  const [docName, setDocName] = useState('');
  const [docCat, setDocCat] = useState('');
  const [docErrors, setDocErrors] = useState<Record<string, string | null>>({});

  const unread = notifications.filter((n) => !n.read).length;
  const openTasks = tasks.filter((t) => !t.done).length;
  const expiringDocs = documents.filter((d) => d.status === 'expiring').length;
  const doneTasks = tasks.filter((t) => t.done).length;
  const taskPct = tasks.length > 0 ? doneTasks / tasks.length : 0;

  const submitDoc = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!docName.trim()) errs.docName = 'Enter a document name';
    if (!docCat.trim()) errs.docCat = 'Enter a category';
    setDocErrors(errs);
    if (Object.keys(errs).length) return;
    const ok = uploadDocument({ name: docName, category: docCat });
    if (ok) { setDocName(''); setDocCat(''); setDocErrors({}); }
  }, [docCat, docName, uploadDocument]);

  return (
    <Screen>
      {/* Profile header card */}
      <Card elevated style={styles.profileCard}>
        {/* Color banner top */}
        <View style={styles.profileBanner} />

        <View style={styles.profileBody}>
          <View style={styles.avatarWrap}>
            <Avatar
              initials={`${employee.first[0]}${employee.last[0]}`}
              size={72}
              color={colors.primary}
              style={styles.avatarEl}
            />
            <View style={[styles.statusBadge, { backgroundColor: employee.status === 'active' ? colors.success : colors.muted }]} />
          </View>

          <View style={styles.profileTextWrap}>
            <Text style={styles.profileName}>{employee.first} {employee.last}</Text>
            <Text style={styles.profilePos}>{employee.position}</Text>
            <Row style={styles.profileMeta}>
              <Ionicons name="business-outline" size={12} color={colors.muted} />
              <Text style={styles.profileMetaText}>{employee.dept}</Text>
              <View style={styles.metaDot} />
              <Ionicons name="location-outline" size={12} color={colors.muted} />
              <Text style={styles.profileMetaText}>{employee.location}</Text>
            </Row>
          </View>
        </View>

        <Divider />

        <StatRow
          items={[
            { label: 'Tasks', value: openTasks, tone: openTasks > 0 ? 'primary' : undefined },
            { label: 'Unread', value: unread, tone: unread > 0 ? 'primary' : undefined },
            { label: 'Doc alerts', value: expiringDocs, tone: expiringDocs > 0 ? 'warning' : undefined },
            { label: 'Reports', value: team.length },
          ]}
        />
      </Card>

      {/* View tabs */}
      <Row style={styles.tabRow}>
        {[
          { id: 'info', label: 'Details' },
          { id: 'docs', label: 'Docs', count: expiringDocs },
          { id: 'tasks', label: 'Tasks', count: openTasks },
          { id: 'team', label: 'Team' },
        ].map((t) => (
          <Chip key={t.id} label={t.label} active={view === t.id} onPress={() => setView(t.id)} count={t.count} />
        ))}
      </Row>

      {view === 'info' && (
        <>
          <SectionTitle title="Employment" />
          <Card>
            {[
              ['Employee ID', employee.code],
              ['Email', employee.email],
              ['Phone', employee.phone || '—'],
              ['Department', employee.dept],
              ['Position', employee.position],
              ['Location', employee.location],
              ['Hire date', employee.hire],
              ['Manager', manager ? `${manager.first} ${manager.last}` : 'None'],
              ['Status', employee.status],
            ].map(([label, value], i, arr) => (
              <InfoRow key={label} label={label} value={value} last={i === arr.length - 1} />
            ))}
          </Card>

          {/* Notifications */}
          <SectionTitle
            title="Notifications"
            action={
              unread > 0 ? (
                <Pressable onPress={markAllRead} accessibilityRole="button">
                  <Text style={styles.markAllRead}>Mark all read</Text>
                </Pressable>
              ) : null
            }
          />
          {notifications.length === 0 ? (
            <Empty icon="notifications-outline" message="No notifications." />
          ) : (
            notifications.slice(0, 8).map((n) => (
              <Pressable key={n.id} onPress={() => markNotificationRead(n.id)}>
                <Card style={[!n.read ? styles.notifUnread : undefined]}>
                  <Row>
                    <View style={[styles.notifIconWrap, { backgroundColor: n.read ? colors.surfaceAlt : notifBg(n.kind) }]}>
                      <Ionicons
                        name={notifIcon(n.kind) as any}
                        size={18}
                        color={n.read ? colors.muted : notifColor(n.kind)}
                      />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={[styles.cardTitle, !n.read && styles.notifUnreadTitle]}>{n.title}</Text>
                      <Text style={styles.cardSub}>{n.body}</Text>
                    </View>
                    {!n.read && <View style={styles.unreadDot} />}
                  </Row>
                </Card>
              </Pressable>
            ))
          )}

          {/* Sign out */}
          <Card>
            <ListItem
              icon="log-out-outline"
              iconColor={colors.danger}
              iconBg={colors.dangerSoft}
              title="Sign out"
              subtitle="End your session"
              onPress={onLogout}
              showArrow
            />
          </Card>
        </>
      )}

      {view === 'docs' && (
        <>
          <SectionTitle title="Upload document" />
          <Card>
            <FormField label="Document name" error={docErrors.docName}>
              <TextFieldInput
                value={docName}
                onChangeText={(v) => { setDocName(v); setDocErrors((e) => ({ ...e, docName: null })); }}
                placeholder="Passport, certificate, contract…"
                error={docErrors.docName}
              />
            </FormField>
            <FormField label="Category" error={docErrors.docCat} style={styles.fieldMt}>
              <TextFieldInput
                value={docCat}
                onChangeText={(v) => { setDocCat(v); setDocErrors((e) => ({ ...e, docCat: null })); }}
                placeholder="Identity, Contract, Certificate…"
                error={docErrors.docCat}
              />
            </FormField>
            <Button
              style={styles.submitBtn}
              onPress={submitDoc}
              leftIcon={<Ionicons name="cloud-upload-outline" size={14} color={colors.white} />}
            >
              Add document
            </Button>
          </Card>

          <SectionTitle title="Document list" />
          {documents.length === 0 ? (
            <Empty icon="document-text-outline" message="No documents uploaded yet." />
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} accent={doc.status === 'expiring' ? colors.warning : undefined}>
                <Row>
                  <View style={[styles.docIconWrap, { backgroundColor: doc.status === 'expiring' ? colors.warningSoft : colors.surfaceAlt }]}>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={doc.status === 'expiring' ? colors.warning : colors.muted}
                    />
                  </View>
                  <View style={styles.docContent}>
                    <Text style={styles.cardTitle}>{doc.name}</Text>
                    <Text style={styles.cardSub}>{doc.category}</Text>
                    {doc.expires && (
                      <Text style={[styles.cardSub, doc.status === 'expiring' && styles.expireWarn]}>
                        Expires {doc.expires}
                      </Text>
                    )}
                  </View>
                  <Badge tone={docStatusTone(doc.status)}>{doc.status}</Badge>
                </Row>
              </Card>
            ))
          )}
        </>
      )}

      {view === 'tasks' && (
        <>
          {/* Progress header */}
          <Card>
            <Row style={styles.taskProgressRow}>
              <View style={styles.taskProgressLeft}>
                <Text style={styles.cardTitle}>Onboarding progress</Text>
                <Text style={styles.cardSub}>
                  {doneTasks} of {tasks.length} tasks completed
                </Text>
              </View>
              <Text style={[styles.taskPct, taskPct === 1 && styles.taskPctDone]}>
                {Math.round(taskPct * 100)}%
              </Text>
            </Row>
            <ProgressBar
              value={taskPct}
              color={taskPct === 1 ? colors.success : colors.primary}
              style={styles.taskProgressBar}
              height={8}
            />
          </Card>

          {tasks.length === 0 ? (
            <Empty icon="checkmark-circle-outline" message="No tasks assigned." />
          ) : (
            tasks.map((task) => (
              <Pressable key={task.id} onPress={() => toggleTask(task.id)}>
                <Card style={task.done ? styles.taskDoneCard : undefined}>
                  <Row>
                    <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
                      {task.done && <Ionicons name="checkmark" size={14} color={colors.white} />}
                    </View>
                    <View style={styles.taskText}>
                      <Text style={[styles.cardTitle, task.done && styles.taskDoneText]}>
                        {task.title}
                      </Text>
                      <Text style={styles.cardSub}>{task.owner}</Text>
                    </View>
                    <Badge tone={task.done ? 'success' : 'warning'}>
                      {task.done ? 'done' : 'open'}
                    </Badge>
                  </Row>
                </Card>
              </Pressable>
            ))
          )}
        </>
      )}

      {view === 'team' && (
        <>
          {manager && (
            <>
              <SectionTitle title="Reports to" />
              <Card>
                <Row style={styles.memberRow}>
                  <Avatar initials={`${manager.first[0]}${manager.last[0]}`} size={48} color={colors.primary} />
                  <View style={styles.memberInfo}>
                    <Text style={styles.cardTitle}>{manager.first} {manager.last}</Text>
                    <Text style={styles.cardSub}>{manager.position}</Text>
                    <Text style={styles.cardSub}>{manager.dept}</Text>
                  </View>
                  <Badge tone="primary">Manager</Badge>
                </Row>
              </Card>
            </>
          )}

          <SectionTitle title={`My reports (${team.length})`} />
          {team.length === 0 ? (
            <Empty icon="people-outline" message="No direct reports assigned." />
          ) : (
            team.map((member) => (
              <Card key={member.id}>
                <Row style={styles.memberRow}>
                  <Avatar
                    initials={`${member.first[0]}${member.last[0]}`}
                    size={44}
                    color={colors.primaryDark}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.cardTitle}>{member.first} {member.last}</Text>
                    <Text style={styles.cardSub}>{member.position}</Text>
                    <Text style={styles.cardSub}>{member.dept} · {member.location}</Text>
                  </View>
                  <Badge tone={member.status === 'active' ? 'success' : 'neutral'}>
                    {member.status}
                  </Badge>
                </Row>
              </Card>
            ))
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Profile card
  profileCard: { padding: 0, overflow: 'hidden' },
  profileBanner: {
    backgroundColor: colors.primary,
    height: 6,
  },
  profileBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  avatarWrap: { position: 'relative' },
  avatarEl: {},
  statusBadge: {
    borderColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: 2,
    height: 14,
    position: 'absolute',
    right: 2,
    width: 14,
  },
  profileTextWrap: { flex: 1 },
  profileName: {
    color: colors.text,
    fontSize: font.xl,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  profilePos: {
    color: colors.textSecondary,
    fontSize: font.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  profileMeta: {
    gap: spacing.xs,
    justifyContent: 'flex-start',
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  profileMetaText: { color: colors.muted, fontSize: font.xs },
  metaDot: {
    backgroundColor: colors.border,
    borderRadius: radius.full,
    height: 3,
    width: 3,
  },

  // Tabs
  tabRow: { flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-start' },

  // Info
  markAllRead: { color: colors.primary, fontSize: font.sm, fontWeight: '700' },
  notifUnread: { borderLeftColor: colors.primary, borderLeftWidth: 3 },
  notifIconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  notifContent: { flex: 1 },
  notifUnreadTitle: { fontWeight: '800' },
  unreadDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },

  // Docs
  fieldMt: { marginTop: spacing.md },
  submitBtn: { marginTop: spacing.lg },
  docIconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 48,
  },
  docContent: { flex: 1 },
  expireWarn: { color: colors.warning, fontWeight: '600' },

  // Tasks
  taskProgressRow: { marginBottom: spacing.md },
  taskProgressLeft: { flex: 1 },
  taskProgressBar: { marginTop: 0 },
  taskPct: { color: colors.text, fontSize: font.xxl, fontWeight: '900' },
  taskPctDone: { color: colors.success },
  taskDoneCard: { opacity: 0.6 },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 24,
  },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  taskText: { flex: 1 },
  taskDoneText: { color: colors.muted, textDecorationLine: 'line-through' },

  // Team
  memberRow: { alignItems: 'flex-start', gap: spacing.md, justifyContent: 'flex-start' },
  memberInfo: { flex: 1 },

  // Common
  cardTitle: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  cardSub: { color: colors.muted, fontSize: font.sm, marginTop: 2 },
});

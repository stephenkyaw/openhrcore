import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEss } from '../store/EssStore';
import {
  Avatar, Badge, Button, Card, Chip, Divider, Empty, InfoRow, Row, Screen, SectionTitle,
} from '../components/ui';
import { FormField, TextFieldInput } from '../components/forms';
import { colors, radius, spacing } from '../theme';

function docStatusTone(s) {
  if (s === 'verified') return 'success';
  if (s === 'expiring') return 'warning';
  if (s === 'pending') return 'info';
  return 'neutral';
}

function notifIcon(kind) {
  if (kind === 'payroll') return 'wallet-outline';
  if (kind === 'leave') return 'calendar-outline';
  if (kind === 'document') return 'document-text-outline';
  if (kind === 'attendance') return 'time-outline';
  return 'notifications-outline';
}

export function ProfileScreen({ onLogout }) {
  const {
    documents, employee, manager, markAllRead, markNotificationRead,
    notifications, tasks, team, toggleTask, uploadDocument,
  } = useEss();

  const [view, setView] = useState('info');
  const [docName, setDocName] = useState('');
  const [docCat, setDocCat] = useState('');
  const [docErrors, setDocErrors] = useState({});

  const unread = notifications.filter((n) => !n.read).length;
  const openTasks = tasks.filter((t) => !t.done).length;
  const expiringDocs = documents.filter((d) => d.status === 'expiring').length;
  const doneTasks = tasks.filter((t) => t.done).length;

  const submitDoc = useCallback(() => {
    const errs = {};
    if (!docName.trim()) errs.docName = 'Enter a document name';
    if (!docCat.trim()) errs.docCat = 'Enter a category';
    setDocErrors(errs);
    if (Object.keys(errs).length) return;
    const ok = uploadDocument({ name: docName, category: docCat });
    if (ok) { setDocName(''); setDocCat(''); setDocErrors({}); }
  }, [docCat, docName, uploadDocument]);

  return (
    <Screen>
      {/* Profile header */}
      <Card elevated>
        <Row style={styles.profileHead}>
          <Avatar initials={`${employee.first[0]}${employee.last[0]}`} size={64} color={colors.primary} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{employee.first} {employee.last}</Text>
            <Text style={styles.profilePos}>{employee.position}</Text>
            <Text style={styles.profileMeta}>{employee.dept} · {employee.location}</Text>
          </View>
        </Row>
        <Divider />
        <Row style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{openTasks}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, unread > 0 && styles.statPrimary]}>{unread}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, expiringDocs > 0 && styles.statWarn]}>{expiringDocs}</Text>
            <Text style={styles.statLabel}>Doc alerts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{team.length}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
        </Row>
      </Card>

      {/* View tabs */}
      <Row style={styles.tabRow}>
        {[
          { id: 'info', label: 'Details' },
          { id: 'docs', label: `Docs${expiringDocs ? ' ⚠' : ''}` },
          { id: 'tasks', label: `Tasks${openTasks ? ` (${openTasks})` : ''}` },
          { id: 'team', label: 'Team' },
        ].map((t) => (
          <Chip key={t.id} label={t.label} active={view === t.id} onPress={() => setView(t.id)} />
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
                <Pressable onPress={markAllRead}>
                  <Text style={styles.markAllRead}>Mark all read</Text>
                </Pressable>
              ) : null
            }
          />
          {notifications.length === 0 ? (
            <Empty icon="notifications-outline" message="No notifications." />
          ) : (
            notifications.map((n) => (
              <Pressable key={n.id} onPress={() => markNotificationRead(n.id)}>
                <Card style={[styles.notifCard, !n.read && styles.notifUnread]}>
                  <Row>
                    <View style={styles.notifIconWrap}>
                      <Ionicons
                        name={notifIcon(n.kind)}
                        size={16}
                        color={n.read ? colors.muted : colors.primary}
                      />
                    </View>
                    <View style={styles.flex}>
                      <Text style={[styles.cardTitle, !n.read && styles.bold]}>{n.title}</Text>
                      <Text style={styles.cardSub}>{n.body}</Text>
                    </View>
                    <Badge tone={n.read ? 'neutral' : 'primary'}>
                      {n.read ? 'read' : 'new'}
                    </Badge>
                  </Row>
                </Card>
              </Pressable>
            ))
          )}

          <Button
            variant="secondary"
            onPress={onLogout}
            style={styles.logoutBtn}
            leftIcon={<Ionicons name="log-out-outline" size={16} color={colors.text} />}
          >
            Sign out
          </Button>
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
            <Button style={styles.submitBtn} onPress={submitDoc}>Add document</Button>
          </Card>

          <SectionTitle title="Document list" />
          {documents.length === 0 ? (
            <Empty icon="document-text-outline" message="No documents uploaded yet." />
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} style={doc.status === 'expiring' && styles.expiringCard}>
                <Row>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{doc.name}</Text>
                    <Text style={styles.cardSub}>{doc.category}</Text>
                    {doc.expires && (
                      <Text style={[styles.cardSub, doc.status === 'expiring' && styles.expireWarn]}>
                        Expires {doc.expires}
                      </Text>
                    )}
                    <Text style={styles.cardSub}>Uploaded {doc.uploaded}</Text>
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
          <SectionTitle title="Onboarding tasks" />
          {tasks.length === 0 ? (
            <Empty icon="checkmark-circle-outline" message="No tasks assigned." />
          ) : (
            tasks.map((task) => (
              <Pressable key={task.id} onPress={() => toggleTask(task.id)}>
                <Card>
                  <Row>
                    <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
                      {task.done && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <View style={styles.taskText}>
                      <Text style={[styles.cardTitle, task.done && styles.taskDone]}>
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
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${tasks.length ? (doneTasks / tasks.length) * 100 : 0}%` }]} />
            </View>
            <Text style={styles.taskProgress}>
              {doneTasks} of {tasks.length} tasks completed
            </Text>
          </View>
        </>
      )}

      {view === 'team' && (
        <>
          {manager && (
            <>
              <SectionTitle title="Reports to" />
              <Card>
                <Row>
                  <Avatar initials={`${manager.first[0]}${manager.last[0]}`} size={44} color={colors.primary} />
                  <View style={styles.memberInfo}>
                    <Text style={styles.cardTitle}>{manager.first} {manager.last}</Text>
                    <Text style={styles.cardSub}>{manager.position}</Text>
                    <Text style={styles.cardSub}>{manager.dept} · {manager.location}</Text>
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
                <Row>
                  <Avatar initials={`${member.first[0]}${member.last[0]}`} size={44} />
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
  profileHead: { alignItems: 'center', gap: spacing.lg, justifyContent: 'flex-start' },
  profileInfo: { flex: 1 },
  profileName: { color: colors.text, fontSize: 20, fontWeight: '900' },
  profilePos: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 2 },
  profileMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  statsRow: { justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { color: colors.text, fontSize: 20, fontWeight: '800' },
  statPrimary: { color: colors.primary },
  statWarn: { color: colors.warning },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 2 },
  statDivider: { backgroundColor: colors.border, height: 24, width: 1 },
  tabRow: { flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-start' },
  markAllRead: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  notifCard: { borderWidth: 1, borderColor: colors.border },
  notifUnread: { borderLeftColor: colors.primary, borderLeftWidth: 3 },
  notifIconWrap: { marginRight: spacing.md },
  bold: { fontWeight: '800' },
  flex: { flex: 1, paddingRight: spacing.md },
  logoutBtn: { marginTop: spacing.md },
  fieldMt: { marginTop: spacing.md },
  submitBtn: { marginTop: spacing.lg },
  expiringCard: { borderLeftColor: colors.warning, borderLeftWidth: 3 },
  expireWarn: { color: colors.warning, fontWeight: '600' },
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
  taskDone: { color: colors.muted, textDecorationLine: 'line-through' },
  progressWrap: { alignItems: 'center', gap: spacing.sm },
  progressTrack: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: { backgroundColor: colors.success, borderRadius: radius.full, height: '100%' },
  taskProgress: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  memberInfo: { flex: 1, marginLeft: spacing.md },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  cardSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
});

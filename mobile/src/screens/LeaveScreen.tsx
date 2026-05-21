import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEss } from '../store/EssStore';
import {
  Avatar, Badge, Button, Card, Chip, Divider, Empty, ProgressBar, Row, Screen, SectionTitle,
} from '../components/ui';
import { DateFieldButton, FormField, InlineDatePicker, TextFieldInput } from '../components/forms';
import { colors, font, radius, spacing } from '../theme';
import { daysBetween, formatShortDate } from '../utils/dates';
import type { Tone } from '../types';

// Color palette for leave types
const LEAVE_COLORS = [
  { accent: colors.primary,  soft: colors.primarySoft,  text: colors.primaryText },
  { accent: colors.success,  soft: colors.successSoft,  text: colors.success },
  { accent: colors.warning,  soft: colors.warningSoft,  text: colors.warning },
  { accent: colors.info,     soft: colors.infoSoft,     text: colors.info },
];

function statusTone(s: string): Tone {
  if (s === 'approved') return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'rejected') return 'danger';
  return 'neutral';
}

export function LeaveScreen(): React.ReactElement {
  const {
    balances, cancelLeave, decideLeave, employees,
    leaveTypes, pendingApprovals, requests, submitLeave,
  } = useEss();

  const [tab, setTab] = useState('request');

  // Form state
  const [type, setType] = useState(leaveTypes[0]?.id || 'lt1');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const days = daysBetween(from, to);
  const selectedTypeIdx = leaveTypes.findIndex((t) => t.id === type);
  const selectedColor = LEAVE_COLORS[selectedTypeIdx % LEAVE_COLORS.length];

  const handleDateSelect = useCallback((dateStr: string) => {
    if (activePicker === 'from') {
      setFrom(dateStr);
      setErrors((e) => ({ ...e, from: null }));
      if (!to || dateStr > to) {
        setTo('');
        setActivePicker('to');
      } else {
        setActivePicker(null);
      }
    } else if (activePicker === 'to') {
      if (from && dateStr < from) {
        setErrors((e) => ({ ...e, to: 'End date must be after start date' }));
        return;
      }
      setTo(dateStr);
      setErrors((e) => ({ ...e, to: null }));
      setActivePicker(null);
    }
  }, [activePicker, from, to]);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!from) errs.from = 'Select a start date';
    if (!to) errs.to = 'Select an end date';
    if (from && to && to < from) errs.to = 'End date must be after start date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [from, to]);

  const submit = useCallback(() => {
    if (!validate()) return;
    const ok = submitLeave({ type, from, to, reason });
    if (ok) {
      setFrom(''); setTo(''); setReason(''); setActivePicker(null);
    }
  }, [from, reason, submitLeave, to, type, validate]);

  return (
    <Screen>
      {/* Tab switcher */}
      <Row style={styles.tabRow}>
        {[
          { id: 'request', label: 'Request' },
          { id: 'history', label: 'History' },
          { id: 'approvals', label: 'Approvals', count: pendingApprovals.length },
        ].map((t) => (
          <Chip key={t.id} label={t.label} active={tab === t.id} onPress={() => setTab(t.id)} count={t.count} />
        ))}
      </Row>

      {tab === 'request' && (
        <>
          {/* Balance cards — horizontal strip */}
          <SectionTitle title="Your balances" />
          <Row style={styles.balanceRow}>
            {leaveTypes.map((lt, i) => {
              const b = balances[lt.id] || { granted: 0, used: 0, pending: 0 };
              const left = b.granted - b.used - b.pending;
              const pct = b.granted > 0 ? (b.used + b.pending) / b.granted : 0;
              const col = LEAVE_COLORS[i % LEAVE_COLORS.length];
              const selected = type === lt.id;
              const low = left <= 2;
              return (
                <Pressable key={lt.id} style={styles.balCard} onPress={() => setType(lt.id)}>
                  <View style={[
                    styles.balCardInner,
                    selected && { borderColor: col.accent, borderWidth: 2, backgroundColor: col.soft },
                    !selected && { borderColor: colors.border, borderWidth: 1 },
                  ]}>
                    <Text style={[styles.balNum, { color: low ? colors.warning : col.accent }]}>{left}</Text>
                    <Text style={styles.balUnit}>days</Text>
                    <Text style={styles.balName} numberOfLines={2}>{lt.name.split(' ')[0]}</Text>
                    <ProgressBar
                      value={pct}
                      color={low ? colors.warning : col.accent}
                      style={styles.balProgress}
                      height={4}
                    />
                  </View>
                </Pressable>
              );
            })}
          </Row>

          {/* Request form */}
          <SectionTitle title="New request" />
          <Card>
            {/* Leave type selector */}
            <FormField label="Leave type">
              <Row style={styles.typeRow}>
                {leaveTypes.map((lt, i) => {
                  const active = lt.id === type;
                  const col = LEAVE_COLORS[i % LEAVE_COLORS.length];
                  return (
                    <Pressable
                      key={lt.id}
                      onPress={() => setType(lt.id)}
                      style={[
                        styles.typeBtn,
                        active && { backgroundColor: col.soft, borderColor: col.accent },
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                    >
                      <Text style={[styles.typeCode, active && { color: col.accent }]}>{lt.code}</Text>
                      <Text style={[styles.typeName, active && { color: col.text }]} numberOfLines={1}>
                        {lt.name.split(' ')[0]}
                      </Text>
                    </Pressable>
                  );
                })}
              </Row>
            </FormField>

            {/* Date range */}
            <View style={styles.dateRow}>
              <FormField label="From" style={styles.dateField} error={errors.from}>
                <DateFieldButton
                  value={from}
                  placeholder="Start date"
                  onPress={() => setActivePicker(activePicker === 'from' ? null : 'from')}
                  error={!!errors.from}
                />
              </FormField>
              <View style={styles.dateSep}>
                <Ionicons name="arrow-forward" size={16} color={colors.muted} />
              </View>
              <FormField label="To" style={styles.dateField} error={errors.to}>
                <DateFieldButton
                  value={to}
                  placeholder="End date"
                  onPress={() => setActivePicker(activePicker === 'to' ? null : 'to')}
                  error={!!errors.to}
                />
              </FormField>
            </View>

            {activePicker && (
              <View style={styles.pickerWrap}>
                <InlineDatePicker
                  value={activePicker === 'from' ? from : to}
                  rangeFrom={from}
                  rangeTo={to}
                  onSelect={handleDateSelect}
                  minDate={activePicker === 'to' ? from : undefined}
                />
              </View>
            )}

            {/* Days preview */}
            {days > 0 && (
              <View style={[styles.daysBadge, { backgroundColor: selectedColor.soft }]}>
                <Ionicons name="calendar" size={14} color={selectedColor.accent} />
                <Text style={[styles.daysText, { color: selectedColor.accent }]}>
                  {days} working day{days !== 1 ? 's' : ''}
                </Text>
              </View>
            )}

            <FormField label="Reason (optional)" style={styles.fieldMt}>
              <TextFieldInput
                value={reason}
                onChangeText={setReason}
                placeholder="Brief note for your manager…"
                multiline
                style={styles.textArea}
              />
            </FormField>

            <Divider />
            <Button
              onPress={submit}
              disabled={days <= 0}
              leftIcon={<Ionicons name="paper-plane-outline" size={16} color={colors.white} />}
            >
              Submit request
            </Button>
          </Card>
        </>
      )}

      {tab === 'history' && (
        <>
          <SectionTitle title="My requests" />
          {requests.length === 0 ? (
            <Empty icon="calendar-outline" message="No leave requests yet." />
          ) : (
            requests.map((req) => {
              const lt = leaveTypes.find((t) => t.id === req.type);
              const i = leaveTypes.findIndex((t) => t.id === req.type);
              const col = LEAVE_COLORS[i % LEAVE_COLORS.length];
              return (
                <Card key={req.id} accent={col.accent}>
                  <Row>
                    <View style={styles.flex}>
                      <Row style={styles.reqHeader}>
                        <Text style={styles.cardTitle}>{lt?.name || req.type}</Text>
                        <Text style={styles.reqDays}>{req.days} day{req.days !== 1 ? 's' : ''}</Text>
                      </Row>
                      <Text style={styles.cardSub}>
                        {formatShortDate(req.from)} – {formatShortDate(req.to)}
                      </Text>
                      {req.reason ? <Text style={styles.reasonText}>{req.reason}</Text> : null}
                    </View>
                    <Badge tone={statusTone(req.status)}>{req.status}</Badge>
                  </Row>
                  {req.status === 'pending' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      style={styles.cancelBtn}
                      onPress={() => cancelLeave(req.id)}
                      leftIcon={<Ionicons name="close-circle-outline" size={14} color={colors.muted} />}
                    >
                      Cancel request
                    </Button>
                  )}
                </Card>
              );
            })
          )}
        </>
      )}

      {tab === 'approvals' && (
        <>
          <SectionTitle title="Pending approvals" />
          {pendingApprovals.length === 0 ? (
            <Empty icon="checkmark-circle-outline" message="No leave requests waiting for your approval." />
          ) : (
            pendingApprovals.map((req) => {
              const requester = employees.find((e) => e.id === req.emp);
              const lt = leaveTypes.find((t) => t.id === req.type);
              const i = leaveTypes.findIndex((t) => t.id === req.type);
              const col = LEAVE_COLORS[i % LEAVE_COLORS.length];
              return (
                <Card key={req.id}>
                  {/* Requester info */}
                  <Row style={styles.approvalHeader}>
                    <Avatar
                      initials={`${requester?.first?.[0] || '?'}${requester?.last?.[0] || '?'}`}
                      size={44}
                      color={col.accent}
                    />
                    <View style={styles.approvalInfo}>
                      <Text style={styles.cardTitle}>
                        {requester?.first} {requester?.last}
                      </Text>
                      <Text style={styles.cardSub}>{requester?.position}</Text>
                    </View>
                    <Badge tone="warning">pending</Badge>
                  </Row>

                  <Divider />

                  {/* Leave details */}
                  <View style={styles.approvalDetail}>
                    <Row style={styles.approvalMeta}>
                      <Ionicons name="document-text-outline" size={14} color={colors.muted} />
                      <Text style={styles.approvalMetaText}>{lt?.name}</Text>
                      <View style={[styles.daysPill, { backgroundColor: col.soft }]}>
                        <Text style={[styles.daysPillText, { color: col.accent }]}>
                          {req.days} day{req.days !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </Row>
                    <Row style={styles.approvalMeta}>
                      <Ionicons name="calendar-outline" size={14} color={colors.muted} />
                      <Text style={styles.approvalMetaText}>
                        {formatShortDate(req.from)} – {formatShortDate(req.to)}
                      </Text>
                    </Row>
                    {req.reason ? (
                      <View style={styles.approvalReason}>
                        <Text style={styles.reasonText}>"{req.reason}"</Text>
                      </View>
                    ) : null}
                  </View>

                  <Row style={styles.approvalActions}>
                    <Button
                      variant="danger"
                      size="sm"
                      style={styles.actionBtn}
                      onPress={() => decideLeave(req.id, 'rejected')}
                      leftIcon={<Ionicons name="close" size={14} color={colors.danger} />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      style={styles.actionBtn}
                      onPress={() => decideLeave(req.id, 'approved')}
                      leftIcon={<Ionicons name="checkmark" size={14} color={colors.white} />}
                    >
                      Approve
                    </Button>
                  </Row>
                </Card>
              );
            })
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabRow: { gap: spacing.sm, justifyContent: 'flex-start' },

  // Balances
  balanceRow: { gap: spacing.sm, justifyContent: 'space-between' },
  balCard: { flex: 1 },
  balCardInner: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    gap: 1,
    padding: spacing.md,
  },
  balNum: { fontSize: font.xxl, fontWeight: '900', letterSpacing: -1 },
  balUnit: { color: colors.muted, fontSize: font.xs, marginTop: -2 },
  balName: { color: colors.muted, fontSize: font.xs, fontWeight: '700', textAlign: 'center', marginTop: spacing.xs },
  balProgress: { marginTop: spacing.sm, width: '100%' },

  // Type selector
  typeRow: { gap: spacing.xs, justifyContent: 'flex-start' },
  typeBtn: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
    padding: spacing.sm,
  },
  typeCode: { color: colors.muted, fontSize: font.sm, fontWeight: '800' },
  typeName: { color: colors.muted, fontSize: font.xs, marginTop: 2, textAlign: 'center' },

  // Date row
  dateRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  dateField: { flex: 1 },
  dateSep: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: spacing.md },

  fieldMt: { marginTop: spacing.lg },
  pickerWrap: { marginTop: spacing.sm },
  textArea: { minHeight: 72, paddingTop: spacing.md, textAlignVertical: 'top' },

  // Days preview
  daysBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  daysText: { fontSize: font.sm, fontWeight: '700' },

  // History
  flex: { flex: 1 },
  reqHeader: { marginBottom: 2 },
  reqDays: { color: colors.muted, fontSize: font.sm },
  cardTitle: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  cardSub: { color: colors.muted, fontSize: font.sm, marginTop: 2 },
  reasonText: { color: colors.muted, fontSize: font.xs, fontStyle: 'italic', marginTop: spacing.xs },
  cancelBtn: { alignSelf: 'flex-start', marginTop: spacing.md },

  // Approvals
  approvalHeader: { gap: spacing.md, justifyContent: 'flex-start', marginBottom: spacing.sm },
  approvalInfo: { flex: 1 },
  approvalDetail: { gap: spacing.sm },
  approvalMeta: { gap: spacing.sm, justifyContent: 'flex-start' },
  approvalMetaText: { color: colors.textSecondary, flex: 1, fontSize: font.sm },
  daysPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  daysPillText: { fontSize: font.xs, fontWeight: '700' },
  approvalReason: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  approvalActions: { gap: spacing.md, marginTop: spacing.md },
  actionBtn: { flex: 1 },
});

import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEss } from '../store/EssStore';
import {
  Badge, Button, Card, Chip, Divider, Empty, Row, Screen, SectionTitle, ProgressBar,
} from '../components/ui';
import { DateFieldButton, FormField, InlineDatePicker, TextFieldInput } from '../components/forms';
import { colors, radius, spacing } from '../theme';
import { daysBetween, formatShortDate } from '../utils/dates';

function statusTone(s) {
  if (s === 'approved') return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'rejected') return 'danger';
  if (s === 'cancelled') return 'neutral';
  return 'neutral';
}

// ── Leave type segment picker ─────────────────────────────────────────────────

function LeaveTypePicker({ types, value, onChange }) {
  return (
    <Row style={styles.segRow}>
      {types.map((lt) => {
        const active = lt.id === value;
        return (
          <Pressable
            key={lt.id}
            onPress={() => onChange(lt.id)}
            style={[styles.seg, active && styles.segActive]}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
          >
            <Text style={[styles.segCode, active && styles.segCodeActive]}>{lt.code}</Text>
            <Text style={[styles.segName, active && styles.segNameActive]}>
              {lt.name.split(' ')[0]}
            </Text>
          </Pressable>
        );
      })}
    </Row>
  );
}

export function LeaveScreen() {
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
  const [activePicker, setActivePicker] = useState(null); // 'from' | 'to' | null
  const [errors, setErrors] = useState({});

  const days = daysBetween(from, to);

  const handleDateSelect = useCallback((dateStr) => {
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
    const errs = {};
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
      setFrom('');
      setTo('');
      setReason('');
      setActivePicker(null);
    }
  }, [from, reason, submitLeave, to, type, validate]);

  return (
    <Screen>
      {/* Tab switcher */}
      <Row style={styles.tabRow}>
        {[
          { id: 'request', label: 'Request' },
          { id: 'history', label: 'History' },
          { id: 'approvals', label: `Approvals${pendingApprovals.length ? ` (${pendingApprovals.length})` : ''}` },
        ].map((t) => (
          <Chip key={t.id} label={t.label} active={tab === t.id} onPress={() => setTab(t.id)} />
        ))}
      </Row>

      {tab === 'request' && (
        <>
          {/* Balance cards */}
          <SectionTitle title="Your balances" />
          {leaveTypes.map((lt) => {
            const b = balances[lt.id] || { granted: 0, used: 0, pending: 0 };
            const left = b.granted - b.used - b.pending;
            const pct = b.granted > 0 ? (b.used + b.pending) / b.granted : 0;
            const selected = type === lt.id;
            return (
              <Pressable key={lt.id} onPress={() => setType(lt.id)}>
                <Card style={[styles.balCard, selected && styles.balCardActive]}>
                  <Row>
                    <View>
                      <Text style={styles.cardTitle}>{lt.name}</Text>
                      <Text style={styles.cardSub}>{b.used} used · {b.pending} pending</Text>
                    </View>
                    <View style={styles.balRight}>
                      <Text style={[styles.balNum, left <= 2 && styles.balWarn]}>{left}</Text>
                      <Text style={styles.balUnit}>days left</Text>
                    </View>
                  </Row>
                  <ProgressBar
                    value={pct}
                    color={selected ? colors.primary : (left <= 2 ? colors.warning : colors.border)}
                    style={styles.prog}
                  />
                </Card>
              </Pressable>
            );
          })}

          {/* Request form */}
          <SectionTitle title="New request" />
          <Card>
            <FormField label="Leave type">
              <LeaveTypePicker types={leaveTypes} value={type} onChange={setType} />
            </FormField>

            <View style={styles.dateRow}>
              <FormField label="From" style={styles.dateField} error={errors.from}>
                <DateFieldButton
                  value={from}
                  placeholder="Start date"
                  onPress={() => setActivePicker(activePicker === 'from' ? null : 'from')}
                  error={!!errors.from}
                />
              </FormField>
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

            <FormField label="Reason" style={styles.fieldMt}>
              <TextFieldInput
                value={reason}
                onChangeText={setReason}
                placeholder="Brief note for your manager…"
                multiline
                style={styles.textArea}
              />
            </FormField>

            <Divider />
            <Row>
              <Text style={styles.daysLabel}>
                {days > 0
                  ? `${days} working day${days !== 1 ? 's' : ''}`
                  : 'Select dates above'}
              </Text>
              <Button onPress={submit} disabled={days <= 0}>
                Submit request
              </Button>
            </Row>
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
              return (
                <Card key={req.id}>
                  <Row>
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>{lt?.name || req.type}</Text>
                      <Text style={styles.cardSub}>
                        {formatShortDate(req.from)} – {formatShortDate(req.to)} · {req.days} day{req.days !== 1 ? 's' : ''}
                      </Text>
                      {req.reason ? (
                        <Text style={styles.reasonText}>{req.reason}</Text>
                      ) : null}
                    </View>
                    <Badge tone={statusTone(req.status)}>{req.status}</Badge>
                  </Row>
                  {req.status === 'pending' && (
                    <Button variant="secondary" size="sm" style={styles.cancelBtn} onPress={() => cancelLeave(req.id)}>
                      Cancel
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
              return (
                <Card key={req.id}>
                  <Row style={styles.approvalHeader}>
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>
                        {requester?.first} {requester?.last}
                      </Text>
                      <Text style={styles.cardSub}>{requester?.position}</Text>
                    </View>
                    <Badge tone="warning">pending</Badge>
                  </Row>
                  <View style={styles.approvalDetail}>
                    <Row style={styles.approvalMeta}>
                      <Ionicons name="calendar-outline" size={14} color={colors.muted} />
                      <Text style={styles.approvalMetaText}>
                        {lt?.name} · {req.days} day{req.days !== 1 ? 's' : ''}
                      </Text>
                    </Row>
                    <Row style={styles.approvalMeta}>
                      <Ionicons name="time-outline" size={14} color={colors.muted} />
                      <Text style={styles.approvalMetaText}>
                        {formatShortDate(req.from)} – {formatShortDate(req.to)}
                      </Text>
                    </Row>
                    {req.reason ? (
                      <Text style={styles.reasonText}>"{req.reason}"</Text>
                    ) : null}
                  </View>
                  <Row style={styles.approvalActions}>
                    <Button
                      variant="danger"
                      size="sm"
                      style={styles.actionBtn}
                      onPress={() => decideLeave(req.id, 'rejected')}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      style={styles.actionBtn}
                      onPress={() => decideLeave(req.id, 'approved')}
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
  balCard: { borderWidth: 1, borderColor: colors.border },
  balCardActive: { borderColor: colors.primary, borderWidth: 2 },
  balRight: { alignItems: 'flex-end' },
  balNum: { color: colors.primary, fontSize: 26, fontWeight: '900', lineHeight: 28 },
  balWarn: { color: colors.warning },
  balUnit: { color: colors.muted, fontSize: 11, marginTop: 2 },
  prog: { marginTop: spacing.sm },
  segRow: { gap: spacing.xs, justifyContent: 'flex-start', marginTop: spacing.xs },
  seg: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    padding: spacing.sm,
  },
  segActive: { backgroundColor: colors.primarySoft },
  segCode: { color: colors.muted, fontSize: 13, fontWeight: '800' },
  segCodeActive: { color: colors.primaryText },
  segName: { color: colors.muted, fontSize: 11, marginTop: 2 },
  segNameActive: { color: colors.primaryText },
  dateRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  dateField: { flex: 1 },
  fieldMt: { marginTop: spacing.lg },
  pickerWrap: { marginTop: spacing.sm },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  daysLabel: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  flex: { flex: 1, paddingRight: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  cardSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  reasonText: { color: colors.muted, fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  cancelBtn: { alignSelf: 'flex-start', marginTop: spacing.md },
  approvalHeader: { marginBottom: spacing.xs },
  approvalDetail: { gap: spacing.xs, paddingTop: spacing.xs },
  approvalMeta: { gap: spacing.xs, justifyContent: 'flex-start' },
  approvalMetaText: { color: colors.textSecondary, fontSize: 13 },
  approvalActions: { gap: spacing.md, marginTop: spacing.md },
  actionBtn: { flex: 1 },
});

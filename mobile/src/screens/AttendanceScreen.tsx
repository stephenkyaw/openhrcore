import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEss } from '../store/EssStore';
import {
  AlertBanner, Badge, Button, Card, Chip, Divider, Empty,
  Row, Screen, SectionTitle, StatRow, StatusDot, Toggle,
} from '../components/ui';
import { WeeklyAttendanceChart } from '../components/charts';
import { DateFieldButton, FormField, InlineDatePicker, TextFieldInput } from '../components/forms';
import { colors, font, radius, spacing } from '../theme';
import { formatShortDate, todayStr } from '../utils/dates';
import { useClock } from '../hooks/useClock';
import type { AttendanceStatus, CorrectionRequest, OvertimeRequest, Tone } from '../types';

function statusTone(s: string): Tone {
  if (s === 'present' || s === 'approved') return 'success';
  if (s === 'late' || s === 'pending') return 'warning';
  if (s === 'absent' || s === 'rejected') return 'danger';
  return 'neutral';
}

function statusBorderColor(s: AttendanceStatus | null | undefined): string {
  if (s === 'present') return colors.success;
  if (s === 'late') return colors.warning;
  if (s === 'absent') return colors.danger;
  return colors.border;
}

function LiveClock({ isActive }: { isActive: boolean }): React.ReactElement {
  const now = useClock();
  const hm = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const sec = now.toLocaleTimeString('en-GB', { second: '2-digit' }).slice(-2);
  const date = now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.clockBlock}>
      <Row style={styles.clockRow}>
        <View style={styles.clockTimeRow}>
          <Text style={[styles.clockHM, isActive && styles.clockHMActive]}>{hm}</Text>
          <Text style={[styles.clockSec, isActive && styles.clockSecActive]}>:{sec}</Text>
        </View>
        {isActive && (
          <View style={styles.liveIndicator}>
            <StatusDot tone="success" size={8} pulse />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </Row>
      <Text style={styles.clockDate}>{date}</Text>
    </View>
  );
}

function Tag({ label, color, bg }: { label: string; color: string; bg: string }): React.ReactElement {
  return (
    <View style={[tagStyles.tag, { backgroundColor: bg }]}>
      <Text style={[tagStyles.text, { color }]}>{label}</Text>
    </View>
  );
}

const tagStyles = StyleSheet.create({
  tag: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  text: { fontSize: font.xs, fontWeight: '700' },
});

export function AttendanceScreen(): React.ReactElement {
  const {
    attendance, clockIn, clockOut, corrections, monthSummary,
    overtime, submitCorrection, submitOvertime, weekAttendance,
  } = useEss();

  const [view, setView] = useState('clock');
  const [wfh, setWfh] = useState(false);

  // Correction form
  const [corrDate, setCorrDate] = useState('');
  const [corrIn, setCorrIn] = useState('09:00');
  const [corrOut, setCorrOut] = useState('18:00');
  const [corrReason, setCorrReason] = useState('');
  const [showCorrPicker, setShowCorrPicker] = useState(false);
  const [corrErrors, setCorrErrors] = useState<Record<string, string | null>>({});

  // Overtime form
  const [otDate, setOtDate] = useState('');
  const [otHours, setOtHours] = useState('');
  const [otReason, setOtReason] = useState('');
  const [showOtPicker, setShowOtPicker] = useState(false);
  const [otErrors, setOtErrors] = useState<Record<string, string | null>>({});

  const today = attendance[0];
  const todayDate = todayStr();
  const isToday = today?.date === todayDate;
  const isOpen = isToday && today?.in && !today?.out;
  const canClockIn = !isOpen && !(isToday && today?.out);

  const submitCorrForm = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!corrDate) errs.corrDate = 'Select a date';
    if (!corrIn.match(/^\d{2}:\d{2}$/)) errs.corrIn = 'Format HH:MM';
    if (!corrOut.match(/^\d{2}:\d{2}$/)) errs.corrOut = 'Format HH:MM';
    setCorrErrors(errs);
    if (Object.keys(errs).length) return;
    const ok = submitCorrection({ date: corrDate, requestedIn: corrIn, requestedOut: corrOut, reason: corrReason });
    if (ok) { setCorrDate(''); setCorrReason(''); setCorrErrors({}); }
  }, [corrDate, corrIn, corrOut, corrReason, submitCorrection]);

  const submitOtForm = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!otDate) errs.otDate = 'Select a date';
    const parsed = Number(otHours);
    if (!parsed || parsed <= 0 || parsed > 12) errs.otHours = 'Enter hours (1–12)';
    setOtErrors(errs);
    if (Object.keys(errs).length) return;
    const ok = submitOvertime({ date: otDate, hours: otHours, reason: otReason });
    if (ok) { setOtDate(''); setOtHours(''); setOtReason(''); setOtErrors({}); }
  }, [otDate, otHours, otReason, submitOvertime]);

  // Combined request list for history display
  type RequestItem = (CorrectionRequest | OvertimeRequest) & { hours?: number; requestedIn?: string; requestedOut?: string };

  return (
    <Screen>
      {/* View switcher */}
      <Row style={styles.tabRow}>
        {[
          { id: 'clock', label: 'Clock' },
          { id: 'history', label: 'History' },
          { id: 'requests', label: 'Requests' },
        ].map((t) => (
          <Chip key={t.id} label={t.label} active={view === t.id} onPress={() => setView(t.id)} />
        ))}
      </Row>

      {view === 'clock' && (
        <>
          {/* Clock card */}
          <Card elevated>
            {/* Status accent bar */}
            <View style={[
              styles.statusBar,
              isOpen ? { backgroundColor: colors.success } : null,
              !isToday ? { backgroundColor: colors.border } : null,
              isToday && today?.out ? { backgroundColor: colors.primary } : null,
            ]} />

            <LiveClock isActive={!!isOpen} />
            <Divider />

            <Toggle
              value={wfh}
              onChange={setWfh}
              label="Work from home"
              sub="Toggle before clocking in"
            />

            <Row style={styles.clockBtns}>
              <Button
                style={styles.clockBtn}
                variant={canClockIn ? 'primary' : 'ghost'}
                onPress={() => clockIn({ wfh })}
                disabled={!canClockIn}
                leftIcon={<Ionicons name="log-in-outline" size={16} color={canClockIn ? colors.white : colors.muted} />}
              >
                {isOpen ? 'Shift active' : 'Clock in'}
              </Button>
              <Button
                variant={isOpen ? 'secondary' : 'ghost'}
                style={styles.clockBtn}
                onPress={clockOut}
                disabled={!isOpen}
                leftIcon={<Ionicons name="log-out-outline" size={16} color={isOpen ? colors.text : colors.muted} />}
              >
                Clock out
              </Button>
            </Row>
          </Card>

          {/* Today's shift detail */}
          {isToday && today && (
            <Card accent={statusBorderColor(today.status)}>
              <Row>
                <View style={styles.shiftInfo}>
                  <Text style={styles.cardTitle}>
                    {isOpen ? 'Shift in progress' : "Today's shift"}
                  </Text>
                  <Text style={styles.shiftTime}>
                    {today.in} → {today.out || 'ongoing'}
                    {today.hours > 0 ? ` · ${today.hours}h` : ''}
                  </Text>
                  {today.wfh && (
                    <Row style={styles.wfhTag}>
                      <Ionicons name="home-outline" size={12} color={colors.info} />
                      <Text style={styles.wfhText}>Work from home</Text>
                    </Row>
                  )}
                </View>
                <Badge tone={statusTone(today.status ?? 'neutral')}>{today.status}</Badge>
              </Row>
            </Card>
          )}

          {/* Monthly summary */}
          <SectionTitle title="This month" />
          <Card>
            <StatRow
              items={[
                { label: 'Present', value: monthSummary.present, tone: 'success' },
                { label: 'Late', value: monthSummary.late, tone: monthSummary.late > 0 ? 'warning' : undefined },
                { label: 'Absent', value: monthSummary.absent, tone: monthSummary.absent > 0 ? 'danger' : undefined },
                { label: 'WFH', value: monthSummary.wfh, tone: 'primary' },
              ]}
            />
          </Card>

          {/* This week */}
          {weekAttendance.length > 0 && (
            <>
              <SectionTitle title="This week" />
              <Card>
                <WeeklyAttendanceChart data={weekAttendance} />
              </Card>
            </>
          )}
        </>
      )}

      {view === 'history' && (
        <>
          {attendance.length === 0 ? (
            <Empty icon="time-outline" message="No attendance records yet." />
          ) : (
            <>
              <AlertBanner
                tone="info"
                message="Showing all attendance records. Contact HR for discrepancies."
              />
              {attendance.map((rec) => (
                <Card key={rec.id} accent={statusBorderColor(rec.status)}>
                  <Row>
                    <View style={styles.flex}>
                      <Row style={styles.recHeader}>
                        <Text style={styles.cardTitle}>{formatShortDate(rec.date)}</Text>
                        {rec.wfh && (
                          <Tag label="WFH" color={colors.info} bg={colors.infoSoft} />
                        )}
                      </Row>
                      <Text style={styles.cardSub}>
                        {rec.in ? `${rec.in} → ${rec.out || 'ongoing'}` : 'No check-in recorded'}
                        {rec.hours > 0 ? ` · ${rec.hours}h` : ''}
                      </Text>
                      {rec.source && (
                        <Text style={styles.recSource}>via {rec.source}</Text>
                      )}
                    </View>
                    <Badge tone={statusTone(rec.status ?? 'neutral')}>{rec.status}</Badge>
                  </Row>
                </Card>
              ))}
            </>
          )}
        </>
      )}

      {view === 'requests' && (
        <>
          {/* Correction form */}
          <SectionTitle title="Correction request" />
          <Card>
            <AlertBanner
              tone="info"
              message="Forgot to clock in or out? Submit a correction for your manager to approve."
              style={styles.formAlert}
            />

            <FormField label="Date" error={corrErrors.corrDate} style={styles.fieldGap}>
              <DateFieldButton
                value={corrDate}
                placeholder="Select date"
                onPress={() => { setShowCorrPicker(!showCorrPicker); setShowOtPicker(false); }}
                error={!!corrErrors.corrDate}
              />
            </FormField>
            {showCorrPicker && (
              <View style={styles.pickerWrap}>
                <InlineDatePicker
                  value={corrDate}
                  onSelect={(d) => { setCorrDate(d); setShowCorrPicker(false); setCorrErrors((e) => ({ ...e, corrDate: null })); }}
                  maxDate={todayDate}
                />
              </View>
            )}

            <Row style={styles.timeRow}>
              <FormField label="Clock-in" error={corrErrors.corrIn} style={styles.timeField}>
                <TextFieldInput
                  value={corrIn}
                  onChangeText={(v) => { setCorrIn(v); setCorrErrors((e) => ({ ...e, corrIn: null })); }}
                  placeholder="HH:MM"
                  keyboardType="numbers-and-punctuation"
                  error={corrErrors.corrIn}
                />
              </FormField>
              <View style={styles.timeSep}>
                <Ionicons name="arrow-forward" size={16} color={colors.muted} />
              </View>
              <FormField label="Clock-out" error={corrErrors.corrOut} style={styles.timeField}>
                <TextFieldInput
                  value={corrOut}
                  onChangeText={(v) => { setCorrOut(v); setCorrErrors((e) => ({ ...e, corrOut: null })); }}
                  placeholder="HH:MM"
                  keyboardType="numbers-and-punctuation"
                  error={corrErrors.corrOut}
                />
              </FormField>
            </Row>

            <FormField label="Reason" style={styles.fieldGap}>
              <TextFieldInput
                value={corrReason}
                onChangeText={setCorrReason}
                placeholder="Forgot badge tap, system error…"
              />
            </FormField>
            <Button
              style={styles.submitBtn}
              onPress={submitCorrForm}
              leftIcon={<Ionicons name="send-outline" size={14} color={colors.white} />}
            >
              Submit correction
            </Button>
          </Card>

          {/* Overtime form */}
          <SectionTitle title="Overtime request" />
          <Card>
            <Row style={styles.timeRow}>
              <FormField label="Date" error={otErrors.otDate} style={styles.timeField}>
                <DateFieldButton
                  value={otDate}
                  placeholder="Select date"
                  onPress={() => { setShowOtPicker(!showOtPicker); setShowCorrPicker(false); }}
                  error={!!otErrors.otDate}
                />
              </FormField>
              <FormField label="OT Hours" error={otErrors.otHours} style={styles.timeField}>
                <TextFieldInput
                  value={otHours}
                  onChangeText={(v) => { setOtHours(v); setOtErrors((e) => ({ ...e, otHours: null })); }}
                  placeholder="e.g. 2"
                  keyboardType="numeric"
                  error={otErrors.otHours}
                />
              </FormField>
            </Row>
            {showOtPicker && (
              <View style={styles.pickerWrap}>
                <InlineDatePicker
                  value={otDate}
                  onSelect={(d) => { setOtDate(d); setShowOtPicker(false); setOtErrors((e) => ({ ...e, otDate: null })); }}
                  maxDate={todayDate}
                />
              </View>
            )}

            <FormField label="Reason" style={styles.fieldGap}>
              <TextFieldInput
                value={otReason}
                onChangeText={setOtReason}
                placeholder="Release support, urgent deadline…"
              />
            </FormField>
            <Button
              style={styles.submitBtn}
              onPress={submitOtForm}
              leftIcon={<Ionicons name="send-outline" size={14} color={colors.white} />}
            >
              Request overtime
            </Button>
          </Card>

          {/* Request history */}
          <SectionTitle title="My requests" />
          {corrections.length === 0 && overtime.length === 0 ? (
            <Empty icon="document-text-outline" message="No correction or overtime requests yet." />
          ) : (
            ([...corrections, ...overtime] as RequestItem[])
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((item) => {
                const isOT = item.hours != null && !('requestedIn' in item && 'requestedOut' in item);
                return (
                  <Card key={item.id} accent={isOT ? colors.warning : colors.info}>
                    <Row>
                      <View style={styles.flex}>
                        <Row style={styles.reqHeader}>
                          <View style={[styles.reqTypePill, { backgroundColor: isOT ? colors.warningSoft : colors.infoSoft }]}>
                            <Ionicons
                              name={isOT ? 'hourglass-outline' : 'create-outline'}
                              size={12}
                              color={isOT ? colors.warning : colors.info}
                            />
                            <Text style={[styles.reqTypeText, { color: isOT ? colors.warning : colors.info }]}>
                              {isOT ? 'Overtime' : 'Correction'}
                            </Text>
                          </View>
                          <Text style={styles.cardSub}>{formatShortDate(item.date)}</Text>
                        </Row>
                        {isOT && <Text style={styles.cardTitle}>{item.hours}h overtime</Text>}
                        {'requestedIn' in item && item.requestedIn && (
                          <Text style={styles.cardSub}>
                            Requested: {item.requestedIn} → {(item as CorrectionRequest).requestedOut}
                          </Text>
                        )}
                        {item.reason ? <Text style={styles.reasonText}>{item.reason}</Text> : null}
                      </View>
                      <Badge tone={statusTone(item.status)}>{item.status}</Badge>
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

  // Clock
  statusBar: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    height: 4,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
  },
  clockBlock: { alignItems: 'center', paddingVertical: spacing.sm },
  clockRow: { alignItems: 'baseline', justifyContent: 'center', gap: spacing.md },
  clockTimeRow: { alignItems: 'baseline', flexDirection: 'row' },
  clockHM: { color: colors.text, fontSize: 54, fontWeight: '900', letterSpacing: -2 },
  clockHMActive: { color: colors.success },
  clockSec: { color: colors.muted, fontSize: font.xxl, fontWeight: '700', marginLeft: 2 },
  clockSecActive: { color: colors.success },
  clockDate: { color: colors.muted, fontSize: font.sm, marginTop: spacing.xs },
  liveIndicator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  liveText: { color: colors.success, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  clockBtns: { gap: spacing.md, marginTop: spacing.lg },
  clockBtn: { flex: 1 },

  // Today's shift
  shiftInfo: { flex: 1 },
  shiftTime: { color: colors.textSecondary, fontSize: font.md, fontWeight: '600', marginTop: 2 },
  wfhTag: { alignSelf: 'flex-start', gap: 4, marginTop: spacing.xs, justifyContent: 'flex-start' },
  wfhText: { color: colors.info, fontSize: font.xs, fontWeight: '700' },

  // History
  flex: { flex: 1, paddingRight: spacing.sm },
  recHeader: { justifyContent: 'flex-start', gap: spacing.sm, marginBottom: 2 },
  cardTitle: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  cardSub: { color: colors.muted, fontSize: font.sm, marginTop: 2 },
  recSource: { color: colors.muted, fontSize: font.xs, marginTop: 1 },

  // Requests
  formAlert: { marginBottom: spacing.md },
  fieldGap: { marginTop: spacing.md },
  pickerWrap: { marginTop: spacing.sm },
  timeRow: { alignItems: 'flex-start', gap: spacing.sm },
  timeField: { flex: 1 },
  timeSep: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: spacing.md },
  submitBtn: { marginTop: spacing.lg },

  // Request items
  reqHeader: { gap: spacing.sm, justifyContent: 'flex-start', marginBottom: spacing.xs },
  reqTypePill: {
    alignItems: 'center',
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  reqTypeText: { fontSize: font.xs, fontWeight: '700' },
  reasonText: { color: colors.muted, fontSize: font.xs, fontStyle: 'italic', marginTop: spacing.xs },
});

import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEss } from '../store/EssStore';
import {
  Badge, Button, Card, Chip, Divider, Empty, Row, Screen, SectionTitle, Toggle,
} from '../components/ui';
import { WeeklyAttendanceChart } from '../components/charts';
import { DateFieldButton, FormField, InlineDatePicker, TextFieldInput } from '../components/forms';
import { colors, spacing } from '../theme';
import { formatShortDate, todayStr } from '../utils/dates';
import { useClock } from '../hooks/useClock';

function statusTone(s) {
  if (s === 'present' || s === 'approved') return 'success';
  if (s === 'late' || s === 'pending') return 'warning';
  if (s === 'absent' || s === 'rejected') return 'danger';
  return 'neutral';
}

function LiveClock() {
  const now = useClock();
  const hm = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const sec = now.toLocaleTimeString('en-GB', { second: '2-digit' }).slice(-2);
  const date = now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.clockBlock}>
      <View style={styles.clockRow}>
        <Text style={styles.clockHM}>{hm}</Text>
        <Text style={styles.clockSec}>:{sec}</Text>
      </View>
      <Text style={styles.clockDate}>{date}</Text>
    </View>
  );
}

export function AttendanceScreen() {
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
  const [corrErrors, setCorrErrors] = useState({});

  // Overtime form
  const [otDate, setOtDate] = useState('');
  const [otHours, setOtHours] = useState('');
  const [otReason, setOtReason] = useState('');
  const [showOtPicker, setShowOtPicker] = useState(false);
  const [otErrors, setOtErrors] = useState({});

  const today = attendance[0];
  const todayDate = todayStr();
  const isToday = today?.date === todayDate;
  const isOpen = isToday && today?.in && !today?.out;
  const canClockIn = !isOpen && !(isToday && today?.out);

  const submitCorrForm = useCallback(() => {
    const errs = {};
    if (!corrDate) errs.corrDate = 'Select a date';
    if (!corrIn.match(/^\d{2}:\d{2}$/)) errs.corrIn = 'Format HH:MM';
    if (!corrOut.match(/^\d{2}:\d{2}$/)) errs.corrOut = 'Format HH:MM';
    setCorrErrors(errs);
    if (Object.keys(errs).length) return;
    const ok = submitCorrection({ date: corrDate, requestedIn: corrIn, requestedOut: corrOut, reason: corrReason });
    if (ok) { setCorrDate(''); setCorrReason(''); setCorrErrors({}); }
  }, [corrDate, corrIn, corrOut, corrReason, submitCorrection]);

  const submitOtForm = useCallback(() => {
    const errs = {};
    if (!otDate) errs.otDate = 'Select a date';
    const parsed = Number(otHours);
    if (!parsed || parsed <= 0 || parsed > 12) errs.otHours = 'Enter hours (1–12)';
    setOtErrors(errs);
    if (Object.keys(errs).length) return;
    const ok = submitOvertime({ date: otDate, hours: otHours, reason: otReason });
    if (ok) { setOtDate(''); setOtHours(''); setOtReason(''); setOtErrors({}); }
  }, [otDate, otHours, otReason, submitOvertime]);

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
          <Card elevated>
            <LiveClock />
            <Divider />
            <Toggle value={wfh} onChange={setWfh} label="Work from home today" />
            <Row style={styles.clockBtns}>
              <Button
                style={styles.clockBtn}
                onPress={() => clockIn({ wfh })}
                disabled={!canClockIn}
              >
                {isOpen ? 'Shift active…' : 'Clock in'}
              </Button>
              <Button
                variant="secondary"
                style={styles.clockBtn}
                onPress={clockOut}
                disabled={!isOpen}
              >
                Clock out
              </Button>
            </Row>
          </Card>

          {/* Today summary */}
          {isToday && today && (
            <Card>
              <Row>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{"Today's shift"}</Text>
                  <Text style={styles.cardSub}>
                    {today.in} – {today.out || 'active'}
                    {today.hours > 0 ? ` · ${today.hours}h` : ''}
                  </Text>
                  {(today.wfh || (isOpen && wfh)) && (
                    <View style={styles.wfhTag}>
                      <Ionicons name="home-outline" size={11} color={colors.info} />
                      <Text style={styles.wfhText}>Work from home</Text>
                    </View>
                  )}
                </View>
                <Badge tone={statusTone(today.status)}>{today.status}</Badge>
              </Row>
            </Card>
          )}

          {/* Monthly summary */}
          <SectionTitle title="This month" />
          <Card>
            <Row style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNum}>{monthSummary.present}</Text>
                <Text style={styles.summaryLabel}>Present</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNum, monthSummary.late > 0 && styles.warnText]}>
                  {monthSummary.late}
                </Text>
                <Text style={styles.summaryLabel}>Late</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNum, monthSummary.absent > 0 && styles.dangerText]}>
                  {monthSummary.absent}
                </Text>
                <Text style={styles.summaryLabel}>Absent</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNum}>{monthSummary.wfh}</Text>
                <Text style={styles.summaryLabel}>WFH</Text>
              </View>
            </Row>
          </Card>

          {/* This week chart */}
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
          <SectionTitle title="Attendance log" />
          {attendance.length === 0 ? (
            <Empty icon="time-outline" message="No attendance records yet." />
          ) : (
            attendance.map((rec) => (
              <Card key={rec.id} style={[styles.recCard, { borderLeftColor: statusBorderColor(rec.status) }]}>
                <Row>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{formatShortDate(rec.date)}</Text>
                    <Text style={styles.cardSub}>
                      {rec.in ? `${rec.in} – ${rec.out || 'ongoing'}` : 'No check-in recorded'}
                    </Text>
                    <Text style={styles.cardSub}>
                      {rec.hours > 0 ? `${rec.hours}h` : ''}
                      {rec.source ? ` · via ${rec.source}` : ''}
                      {rec.wfh ? ' · WFH' : ''}
                    </Text>
                  </View>
                  <Badge tone={statusTone(rec.status)}>{rec.status}</Badge>
                </Row>
              </Card>
            ))
          )}
        </>
      )}

      {view === 'requests' && (
        <>
          {/* Attendance correction form */}
          <SectionTitle title="Correction request" />
          <Card>
            <Text style={styles.formDesc}>
              Forgot to clock in or out? Submit a correction for your manager to approve.
            </Text>

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
            <Button style={styles.submitBtn} onPress={submitCorrForm}>Submit correction</Button>
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
              <FormField label="Hours" error={otErrors.otHours} style={styles.timeField}>
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
            <Button style={styles.submitBtn} onPress={submitOtForm}>Request overtime</Button>
          </Card>

          {/* Request history */}
          <SectionTitle title="My requests" />
          {corrections.length === 0 && overtime.length === 0 ? (
            <Empty icon="document-text-outline" message="No correction or overtime requests." />
          ) : (
            [...corrections, ...overtime]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((item) => (
                <Card key={item.id} style={styles.recCard}>
                  <Row>
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>
                        {item.hours != null ? `Overtime · ${item.hours}h` : 'Correction'} · {formatShortDate(item.date)}
                      </Text>
                      <Text style={styles.cardSub}>{item.reason}</Text>
                      {item.requestedIn && (
                        <Text style={styles.cardSub}>
                          Requested: {item.requestedIn} – {item.requestedOut}
                        </Text>
                      )}
                    </View>
                    <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                  </Row>
                </Card>
              ))
          )}
        </>
      )}
    </Screen>
  );
}

function statusBorderColor(s) {
  if (s === 'present') return colors.success;
  if (s === 'late') return colors.warning;
  if (s === 'absent') return colors.danger;
  return colors.border;
}

const styles = StyleSheet.create({
  tabRow: { gap: spacing.sm, justifyContent: 'flex-start' },
  clockBlock: { alignItems: 'center', paddingVertical: spacing.md },
  clockRow: { alignItems: 'baseline', flexDirection: 'row' },
  clockHM: { color: colors.text, fontSize: 54, fontWeight: '900', letterSpacing: -2 },
  clockSec: { color: colors.muted, fontSize: 26, fontWeight: '700', marginLeft: 2 },
  clockDate: { color: colors.muted, fontSize: 14, marginTop: spacing.xs },
  clockBtns: { gap: spacing.md, marginTop: spacing.lg },
  clockBtn: { flex: 1 },
  flex: { flex: 1, paddingRight: spacing.md },
  wfhTag: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 4, marginTop: spacing.xs },
  wfhText: { color: colors.info, fontSize: 12, fontWeight: '700' },
  summaryRow: { justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryNum: { color: colors.text, fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: colors.muted, fontSize: 11, marginTop: 2 },
  summaryDivider: { backgroundColor: colors.border, height: 28, width: 1 },
  warnText: { color: colors.warning },
  dangerText: { color: colors.danger },
  recCard: { borderLeftWidth: 3 },
  formDesc: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
  fieldGap: { marginTop: spacing.md },
  pickerWrap: { marginTop: spacing.sm },
  timeRow: { alignItems: 'flex-start', gap: spacing.md },
  timeField: { flex: 1 },
  submitBtn: { marginTop: spacing.lg },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  cardSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
});

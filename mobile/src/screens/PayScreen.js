import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEss } from '../store/EssStore';
import {
  Badge, Button, Card, Chip, Divider, Empty, Row, Screen, SectionTitle,
} from '../components/ui';
import { MonthlyPayChart } from '../components/charts';
import { FormField, TextFieldInput } from '../components/forms';
import { colors, spacing } from '../theme';
import { formatMoney, formatShortDate } from '../utils/dates';

function netPay(ps) {
  return ps.earnings.reduce((s, l) => s + l.amount, 0) - ps.deductions.reduce((s, l) => s + l.amount, 0);
}

function grossPay(ps) {
  return ps.earnings.reduce((s, l) => s + l.amount, 0);
}

function statusTone(s) {
  if (['approved', 'paid'].includes(s)) return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'rejected') return 'danger';
  return 'neutral';
}

function PayLine({ label, amount, currency, negative }) {
  return (
    <Row style={styles.payLine}>
      <Text style={styles.payLineLabel}>{label}</Text>
      <Text style={[styles.payLineAmt, negative && styles.deduction]}>
        {negative ? '–' : ''}{formatMoney(amount, currency)}
      </Text>
    </Row>
  );
}

export function PayScreen() {
  const { payslips, reimbursements, salaryAdvances, submitAdvance, submitReimbursement, ytdEarnings } = useEss();

  const [view, setView] = useState('payslips');
  const [selectedId, setSelectedId] = useState(payslips[0]?.id);

  // Claims form
  const [claimCat, setClaimCat] = useState('');
  const [claimAmt, setClaimAmt] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [claimErrors, setClaimErrors] = useState({});

  // Advance form
  const [advAmt, setAdvAmt] = useState('');
  const [advReason, setAdvReason] = useState('');
  const [advErrors, setAdvErrors] = useState({});

  const selected = payslips.find((ps) => ps.id === selectedId) || payslips[0];

  const submitClaim = useCallback(() => {
    const errs = {};
    if (!claimCat.trim()) errs.claimCat = 'Enter a category';
    const n = Number(claimAmt);
    if (!n || n <= 0) errs.claimAmt = 'Enter a valid amount';
    setClaimErrors(errs);
    if (Object.keys(errs).length) return;
    const ok = submitReimbursement({ category: claimCat, amount: claimAmt, reason: claimReason });
    if (ok) { setClaimCat(''); setClaimAmt(''); setClaimReason(''); setClaimErrors({}); }
  }, [claimAmt, claimCat, claimReason, submitReimbursement]);

  const submitAdv = useCallback(() => {
    const errs = {};
    const n = Number(advAmt);
    if (!n || n <= 0) errs.advAmt = 'Enter a valid amount';
    if (!advReason.trim()) errs.advReason = 'Provide a reason for the advance';
    setAdvErrors(errs);
    if (Object.keys(errs).length) return;
    const ok = submitAdvance({ amount: advAmt, reason: advReason });
    if (ok) { setAdvAmt(''); setAdvReason(''); setAdvErrors({}); }
  }, [advAmt, advReason, submitAdvance]);

  return (
    <Screen>
      {/* View switcher */}
      <Row style={styles.tabRow}>
        {[
          { id: 'payslips', label: 'Payslips' },
          { id: 'claims', label: 'Claims' },
          { id: 'advances', label: 'Advances' },
        ].map((t) => (
          <Chip key={t.id} label={t.label} active={view === t.id} onPress={() => setView(t.id)} />
        ))}
      </Row>

      {view === 'payslips' && (
        <>
          {/* YTD summary */}
          {ytdEarnings.months > 0 && (
            <>
              <SectionTitle title={`${new Date().getFullYear()} year to date`} />
              <Card>
                <Row style={styles.ytdRow}>
                  <View style={styles.ytdItem}>
                    <Text style={styles.ytdLabel}>Gross</Text>
                    <Text style={styles.ytdValue}>{formatMoney(ytdEarnings.gross, 'THB')}</Text>
                  </View>
                  <View style={styles.ytdDivider} />
                  <View style={styles.ytdItem}>
                    <Text style={styles.ytdLabel}>Tax paid</Text>
                    <Text style={[styles.ytdValue, styles.ytdTax]}>{formatMoney(ytdEarnings.tax, 'THB')}</Text>
                  </View>
                  <View style={styles.ytdDivider} />
                  <View style={styles.ytdItem}>
                    <Text style={styles.ytdLabel}>Net</Text>
                    <Text style={[styles.ytdValue, styles.ytdNet]}>{formatMoney(ytdEarnings.net, 'THB')}</Text>
                  </View>
                </Row>
                {payslips.length > 1 && (
                  <>
                    <Divider />
                    <Text style={styles.chartTitle}>Monthly trend</Text>
                    <MonthlyPayChart payslips={payslips} />
                  </>
                )}
              </Card>
            </>
          )}

          {/* Payslip list */}
          <SectionTitle title="Pay history" />
          {payslips.map((ps) => (
            <Pressable key={ps.id} onPress={() => setSelectedId(ps.id)}>
              <Card style={[styles.psRow, selected?.id === ps.id && styles.psRowActive]}>
                <Row>
                  <View>
                    <Text style={styles.cardTitle}>{ps.period}</Text>
                    <Text style={styles.cardSub}>Paid {formatShortDate(ps.payDate)}</Text>
                    {ps.earnings.length > 3 && (
                      <View style={styles.bonusTag}>
                        <Ionicons name="star" size={10} color={colors.success} />
                        <Text style={styles.bonusTagText}>Bonus</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.psRight}>
                    <Text style={styles.netNum}>{formatMoney(netPay(ps), ps.currency)}</Text>
                    <Badge tone="success">{ps.status}</Badge>
                  </View>
                </Row>
              </Card>
            </Pressable>
          ))}

          {/* Payslip detail */}
          {selected && (
            <>
              <SectionTitle title="Payslip detail" />
              <Card>
                <Row style={styles.psHeader}>
                  <View>
                    <Text style={styles.psTitle}>{selected.period}</Text>
                    <Text style={styles.cardSub}>Pay date: {formatShortDate(selected.payDate)}</Text>
                  </View>
                  <Badge tone="success">{selected.status}</Badge>
                </Row>
                <Divider />

                <Text style={styles.sectionLabel}>EARNINGS</Text>
                {selected.earnings.map((line) => (
                  <PayLine key={line.label} label={line.label} amount={line.amount} currency={selected.currency} />
                ))}
                <Row style={styles.subTotal}>
                  <Text style={styles.subTotalLabel}>Gross pay</Text>
                  <Text style={styles.subTotalValue}>{formatMoney(grossPay(selected), selected.currency)}</Text>
                </Row>

                <Divider />

                <Text style={styles.sectionLabel}>DEDUCTIONS</Text>
                {selected.deductions.map((line) => (
                  <PayLine key={line.label} label={line.label} amount={line.amount} currency={selected.currency} negative />
                ))}

                <Divider />

                <Row style={styles.netRow}>
                  <Text style={styles.netLabel}>Net pay</Text>
                  <Text style={styles.netValue}>{formatMoney(netPay(selected), selected.currency)}</Text>
                </Row>
              </Card>
            </>
          )}
        </>
      )}

      {view === 'claims' && (
        <>
          <SectionTitle title="Submit reimbursement" />
          <Card>
            <Text style={styles.formDesc}>
              Submit expense claims for approval. Approved claims are included in your next payslip.
            </Text>

            <Row style={styles.halfRow}>
              <FormField label="Category" error={claimErrors.claimCat} style={styles.half}>
                <TextFieldInput
                  value={claimCat}
                  onChangeText={(v) => { setClaimCat(v); setClaimErrors((e) => ({ ...e, claimCat: null })); }}
                  placeholder="Transport, Meals…"
                  error={claimErrors.claimCat}
                />
              </FormField>
              <FormField label="Amount (THB)" error={claimErrors.claimAmt} style={styles.half}>
                <TextFieldInput
                  value={claimAmt}
                  onChangeText={(v) => { setClaimAmt(v); setClaimErrors((e) => ({ ...e, claimAmt: null })); }}
                  keyboardType="numeric"
                  placeholder="0"
                  error={claimErrors.claimAmt}
                />
              </FormField>
            </Row>

            <FormField label="Description" style={styles.fieldMt}>
              <TextFieldInput
                value={claimReason}
                onChangeText={setClaimReason}
                placeholder="Brief description of the expense…"
              />
            </FormField>
            <Button style={styles.submitBtn} onPress={submitClaim}>Submit claim</Button>
          </Card>

          <SectionTitle title="My claims" />
          {reimbursements.length === 0 ? (
            <Empty icon="receipt-outline" message="No reimbursement claims yet." />
          ) : (
            reimbursements.map((item) => (
              <Card key={item.id}>
                <Row>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{item.category}</Text>
                    <Text style={styles.cardSub}>{item.reason}</Text>
                    <Text style={styles.cardSub}>Submitted {item.submitted}</Text>
                  </View>
                  <View style={styles.claimRight}>
                    <Text style={styles.claimAmt}>{formatMoney(item.amount, item.currency)}</Text>
                    <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                  </View>
                </Row>
              </Card>
            ))
          )}
        </>
      )}

      {view === 'advances' && (
        <>
          <SectionTitle title="Request salary advance" />
          <Card>
            <Text style={styles.formDesc}>
              Salary advances are deducted from your next payslip. Subject to HR approval.
            </Text>

            <FormField label="Amount (THB)" error={advErrors.advAmt}>
              <TextFieldInput
                value={advAmt}
                onChangeText={(v) => { setAdvAmt(v); setAdvErrors((e) => ({ ...e, advAmt: null })); }}
                keyboardType="numeric"
                placeholder="e.g. 10,000"
                error={advErrors.advAmt}
              />
            </FormField>

            <FormField label="Reason" error={advErrors.advReason} style={styles.fieldMt}>
              <TextFieldInput
                value={advReason}
                onChangeText={(v) => { setAdvReason(v); setAdvErrors((e) => ({ ...e, advReason: null })); }}
                placeholder="Emergency, urgent expense…"
                error={advErrors.advReason}
              />
            </FormField>
            <Button style={styles.submitBtn} onPress={submitAdv}>Request advance</Button>
          </Card>

          <SectionTitle title="My advances" />
          {salaryAdvances.length === 0 ? (
            <Empty icon="cash-outline" message="No salary advance requests yet." />
          ) : (
            salaryAdvances.map((item) => (
              <Card key={item.id}>
                <Row>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>Salary advance</Text>
                    <Text style={styles.cardSub}>{item.reason}</Text>
                    <Text style={styles.cardSub}>Requested {item.submitted}</Text>
                  </View>
                  <View style={styles.claimRight}>
                    <Text style={styles.claimAmt}>{formatMoney(item.amount, item.currency)}</Text>
                    <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                  </View>
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
  tabRow: { gap: spacing.sm, justifyContent: 'flex-start' },
  ytdRow: { justifyContent: 'space-around' },
  ytdItem: { alignItems: 'center' },
  ytdLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  ytdValue: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 4 },
  ytdTax: { color: colors.danger },
  ytdNet: { color: colors.primary },
  ytdDivider: { backgroundColor: colors.border, height: 28, width: 1 },
  chartTitle: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.sm, textTransform: 'uppercase' },
  psRow: {},
  psRowActive: { borderColor: colors.primary, borderWidth: 2 },
  psRight: { alignItems: 'flex-end', gap: spacing.xs },
  netNum: { color: colors.text, fontSize: 16, fontWeight: '900' },
  bonusTag: { alignItems: 'center', flexDirection: 'row', gap: 3, marginTop: 3 },
  bonusTagText: { color: colors.success, fontSize: 11, fontWeight: '700' },
  psHeader: { marginBottom: spacing.xs },
  psTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  sectionLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.sm },
  payLine: { paddingVertical: spacing.xs },
  payLineLabel: { color: colors.textSecondary, flex: 1, fontSize: 14 },
  payLineAmt: { color: colors.text, fontSize: 14, fontWeight: '700' },
  deduction: { color: colors.danger },
  subTotal: { marginTop: spacing.sm },
  subTotalLabel: { color: colors.text, fontSize: 14, fontWeight: '700' },
  subTotalValue: { color: colors.text, fontSize: 15, fontWeight: '800' },
  netRow: {},
  netLabel: { color: colors.text, fontSize: 16, fontWeight: '800' },
  netValue: { color: colors.primary, fontSize: 22, fontWeight: '900' },
  formDesc: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
  halfRow: { alignItems: 'flex-start', gap: spacing.md },
  half: { flex: 1 },
  fieldMt: { marginTop: spacing.md },
  submitBtn: { marginTop: spacing.lg },
  flex: { flex: 1, paddingRight: spacing.md },
  claimRight: { alignItems: 'flex-end', gap: spacing.xs },
  claimAmt: { color: colors.text, fontSize: 15, fontWeight: '800' },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  cardSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
});

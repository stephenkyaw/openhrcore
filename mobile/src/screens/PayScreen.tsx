import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEss } from '../store/EssStore';
import {
  AlertBanner, Badge, Button, Card, Chip, Divider, Empty, Row, Screen, SectionTitle,
} from '../components/ui';
import { MonthlyPayChart } from '../components/charts';
import { FormField, TextFieldInput } from '../components/forms';
import { colors, font, radius, spacing } from '../theme';
import { formatMoney, formatShortDate } from '../utils/dates';
import type { Payslip, RequestStatus, Tone } from '../types';

function netPay(ps: Payslip): number {
  return ps.earnings.reduce((s, l) => s + l.amount, 0) - ps.deductions.reduce((s, l) => s + l.amount, 0);
}

function grossPay(ps: Payslip): number {
  return ps.earnings.reduce((s, l) => s + l.amount, 0);
}

function statusTone(s: string): Tone {
  if (['approved', 'paid'].includes(s)) return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'rejected') return 'danger';
  return 'neutral';
}

function PayLine({ label, amount, currency, negative }: { label: string; amount: number; currency: string; negative?: boolean }): React.ReactElement {
  return (
    <Row style={styles.payLine}>
      <Text style={styles.payLineLabel}>{label}</Text>
      <Text style={[styles.payLineAmt, negative && styles.deduction]}>
        {negative ? '–' : '+'}{formatMoney(amount, currency)}
      </Text>
    </Row>
  );
}

function statusBorderColor(s: RequestStatus): string {
  if (s === 'approved') return colors.success;
  if (s === 'pending') return colors.warning;
  if (s === 'rejected') return colors.danger;
  return colors.border;
}

export function PayScreen(): React.ReactElement {
  const { payslips, reimbursements, salaryAdvances, submitAdvance, submitReimbursement, ytdEarnings } = useEss();

  const [view, setView] = useState('payslips');
  const [selectedId, setSelectedId] = useState(payslips[0]?.id);

  // Claims form
  const [claimCat, setClaimCat] = useState('');
  const [claimAmt, setClaimAmt] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [claimErrors, setClaimErrors] = useState<Record<string, string | null>>({});

  // Advance form
  const [advAmt, setAdvAmt] = useState('');
  const [advReason, setAdvReason] = useState('');
  const [advErrors, setAdvErrors] = useState<Record<string, string | null>>({});

  const selected = payslips.find((ps) => ps.id === selectedId) || payslips[0];

  const submitClaim = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!claimCat.trim()) errs.claimCat = 'Enter a category';
    const n = Number(claimAmt);
    if (!n || n <= 0) errs.claimAmt = 'Enter a valid amount';
    setClaimErrors(errs);
    if (Object.keys(errs).length) return;
    const ok = submitReimbursement({ category: claimCat, amount: claimAmt, reason: claimReason });
    if (ok) { setClaimCat(''); setClaimAmt(''); setClaimReason(''); setClaimErrors({}); }
  }, [claimAmt, claimCat, claimReason, submitReimbursement]);

  const submitAdv = useCallback(() => {
    const errs: Record<string, string> = {};
    const n = Number(advAmt);
    if (!n || n <= 0) errs.advAmt = 'Enter a valid amount';
    if (!advReason.trim()) errs.advReason = 'Provide a reason for the advance';
    setAdvErrors(errs);
    if (Object.keys(errs).length) return;
    const ok = submitAdvance({ amount: advAmt, reason: advReason });
    if (ok) { setAdvAmt(''); setAdvReason(''); setAdvErrors({}); }
  }, [advAmt, advReason, submitAdvance]);

  const pendingClaims = reimbursements.filter((r) => r.status === 'pending').length;
  const pendingAdvances = salaryAdvances.filter((a) => a.status === 'pending').length;

  return (
    <Screen>
      {/* View switcher */}
      <Row style={styles.tabRow}>
        {[
          { id: 'payslips', label: 'Payslips' },
          { id: 'claims', label: 'Claims', count: pendingClaims },
          { id: 'advances', label: 'Advances', count: pendingAdvances },
        ].map((t) => (
          <Chip key={t.id} label={t.label} active={view === t.id} onPress={() => setView(t.id)} count={t.count} />
        ))}
      </Row>

      {view === 'payslips' && (
        <>
          {/* YTD summary */}
          {ytdEarnings.months > 0 && (
            <>
              <SectionTitle title={`${new Date().getFullYear()} year to date`} />
              <Card elevated>
                <Row style={styles.ytdRow}>
                  <View style={styles.ytdItem}>
                    <Text style={styles.ytdLabel}>Gross</Text>
                    <Text style={styles.ytdValue}>{formatMoney(ytdEarnings.gross, 'THB')}</Text>
                    <Text style={styles.ytdSub}>{ytdEarnings.months} months</Text>
                  </View>
                  <View style={styles.ytdDivider} />
                  <View style={styles.ytdItem}>
                    <Text style={styles.ytdLabel}>Tax paid</Text>
                    <Text style={[styles.ytdValue, styles.ytdTax]}>{formatMoney(ytdEarnings.tax, 'THB')}</Text>
                    <Text style={styles.ytdSub}>withheld</Text>
                  </View>
                  <View style={styles.ytdDivider} />
                  <View style={styles.ytdItem}>
                    <Text style={styles.ytdLabel}>Net total</Text>
                    <Text style={[styles.ytdValue, styles.ytdNet]}>{formatMoney(ytdEarnings.net, 'THB')}</Text>
                    <Text style={styles.ytdSub}>take-home</Text>
                  </View>
                </Row>

                {payslips.length > 1 && (
                  <>
                    <Divider label="Monthly trend" />
                    <MonthlyPayChart payslips={payslips} />
                  </>
                )}
              </Card>
            </>
          )}

          {/* Payslip list */}
          <SectionTitle title="Pay history" />
          {payslips.map((ps) => {
            const net = netPay(ps);
            const isSelected = selected?.id === ps.id;
            const hasBonus = ps.earnings.length > 3;
            return (
              <Card
                key={ps.id}
                onPress={() => setSelectedId(ps.id)}
                style={isSelected ? styles.psRowActive : undefined}
                accent={isSelected ? colors.primary : undefined}
              >
                <Row>
                  <View style={styles.flex}>
                    <Row style={styles.psHeader}>
                      <Text style={styles.cardTitle}>{ps.period}</Text>
                      {hasBonus && (
                        <View style={styles.bonusTag}>
                          <Ionicons name="star" size={10} color={colors.success} />
                          <Text style={styles.bonusTagText}>Bonus</Text>
                        </View>
                      )}
                    </Row>
                    <Text style={styles.cardSub}>Paid {formatShortDate(ps.payDate)}</Text>
                  </View>
                  <View style={styles.psRight}>
                    <Text style={[styles.netNum, isSelected && styles.netNumActive]}>
                      {formatMoney(net, ps.currency)}
                    </Text>
                    <Badge tone="success">{ps.status}</Badge>
                  </View>
                </Row>
              </Card>
            );
          })}

          {/* Payslip detail */}
          {selected && (
            <>
              <SectionTitle title="Payslip detail" />
              <Card>
                <Row style={styles.detailHeader}>
                  <View>
                    <Text style={styles.detailPeriod}>{selected.period}</Text>
                    <Text style={styles.cardSub}>Pay date: {formatShortDate(selected.payDate)}</Text>
                  </View>
                  <Badge tone="success">{selected.status}</Badge>
                </Row>
                <Divider />

                {/* Earnings */}
                <Row style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>EARNINGS</Text>
                  <Text style={styles.sectionLabelAmt}>{formatMoney(grossPay(selected), selected.currency)}</Text>
                </Row>
                {selected.earnings.map((line) => (
                  <PayLine key={line.label} label={line.label} amount={line.amount} currency={selected.currency} />
                ))}

                <Divider />

                {/* Deductions */}
                <Row style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>DEDUCTIONS</Text>
                  <Text style={[styles.sectionLabelAmt, styles.deductionTotal]}>
                    –{formatMoney(selected.deductions.reduce((s, l) => s + l.amount, 0), selected.currency)}
                  </Text>
                </Row>
                {selected.deductions.map((line) => (
                  <PayLine key={line.label} label={line.label} amount={line.amount} currency={selected.currency} negative />
                ))}

                <Divider />

                {/* Net */}
                <View style={styles.netBox}>
                  <Row>
                    <Text style={styles.netLabel}>Net pay</Text>
                    <Text style={styles.netValue}>{formatMoney(netPay(selected), selected.currency)}</Text>
                  </Row>
                </View>
              </Card>
            </>
          )}
        </>
      )}

      {view === 'claims' && (
        <>
          <SectionTitle title="Submit reimbursement" />
          <Card>
            <AlertBanner
              tone="info"
              message="Approved claims are included in your next payslip."
              style={styles.formAlert}
            />

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
            <Button
              style={styles.submitBtn}
              onPress={submitClaim}
              leftIcon={<Ionicons name="send-outline" size={14} color={colors.white} />}
            >
              Submit claim
            </Button>
          </Card>

          <SectionTitle title="My claims" />
          {reimbursements.length === 0 ? (
            <Empty icon="receipt-outline" message="No reimbursement claims yet." />
          ) : (
            reimbursements.map((item) => (
              <Card key={item.id} accent={statusBorderColor(item.status)}>
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
            <AlertBanner
              tone="warning"
              message="Advances are deducted from your next payslip. Subject to HR approval."
              style={styles.formAlert}
            />

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
            <Button
              style={styles.submitBtn}
              onPress={submitAdv}
              leftIcon={<Ionicons name="send-outline" size={14} color={colors.white} />}
            >
              Request advance
            </Button>
          </Card>

          <SectionTitle title="My advances" />
          {salaryAdvances.length === 0 ? (
            <Empty icon="cash-outline" message="No salary advance requests yet." />
          ) : (
            salaryAdvances.map((item) => (
              <Card key={item.id} accent={statusBorderColor(item.status)}>
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

  // YTD
  ytdRow: { justifyContent: 'space-around', paddingBottom: spacing.sm },
  ytdItem: { alignItems: 'center', gap: 2 },
  ytdLabel: { color: colors.muted, fontSize: font.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  ytdValue: { color: colors.text, fontSize: font.lg, fontWeight: '900', marginTop: 2 },
  ytdSub: { color: colors.muted, fontSize: font.xs },
  ytdTax: { color: colors.danger },
  ytdNet: { color: colors.primary },
  ytdDivider: { backgroundColor: colors.border, height: 40, width: 1 },

  // Payslip list
  flex: { flex: 1, paddingRight: spacing.sm },
  psHeader: { justifyContent: 'flex-start', gap: spacing.sm, marginBottom: 2 },
  psRowActive: {},
  psRight: { alignItems: 'flex-end', gap: spacing.xs },
  netNum: { color: colors.text, fontSize: font.lg, fontWeight: '900' },
  netNumActive: { color: colors.primary },
  bonusTag: { alignItems: 'center', flexDirection: 'row', gap: 3 },
  bonusTagText: { color: colors.success, fontSize: font.xs, fontWeight: '700' },

  // Payslip detail
  detailHeader: { marginBottom: spacing.xs },
  detailPeriod: { color: colors.text, fontSize: font.lg, fontWeight: '800' },
  sectionLabelRow: { marginBottom: spacing.sm, marginTop: spacing.sm },
  sectionLabel: { color: colors.muted, fontSize: font.xs, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  sectionLabelAmt: { color: colors.text, fontSize: font.sm, fontWeight: '700' },
  deductionTotal: { color: colors.danger },
  payLine: { paddingVertical: 5 },
  payLineLabel: { color: colors.textSecondary, flex: 1, fontSize: font.sm },
  payLineAmt: { color: colors.success, fontSize: font.sm, fontWeight: '700' },
  deduction: { color: colors.danger },
  netBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    marginTop: spacing.xs,
    padding: spacing.md,
  },
  netLabel: { color: colors.primaryText, fontSize: font.lg, fontWeight: '800' },
  netValue: { color: colors.primary, fontSize: font.xxl, fontWeight: '900' },

  // Claims / Advances
  formAlert: { marginBottom: spacing.md },
  halfRow: { alignItems: 'flex-start', gap: spacing.md },
  half: { flex: 1 },
  fieldMt: { marginTop: spacing.md },
  submitBtn: { marginTop: spacing.lg },
  claimRight: { alignItems: 'flex-end', gap: spacing.xs },
  claimAmt: { color: colors.text, fontSize: font.lg, fontWeight: '800' },

  // Common
  cardTitle: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  cardSub: { color: colors.muted, fontSize: font.sm, marginTop: 2 },
});

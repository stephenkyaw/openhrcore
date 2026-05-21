import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';
import type { Payslip } from '../../types';

interface MonthlyPayChartProps {
  payslips?: Payslip[];
}

// Horizontal bar chart — monthly net pay trend.
// payslips: array of payslip objects (earnings/deductions arrays)
export function MonthlyPayChart({ payslips = [] }: MonthlyPayChartProps): React.ReactElement | null {
  const items = useMemo(() => {
    const ordered = [...payslips].reverse();
    const maxNet = Math.max(...ordered.map((ps) => netOf(ps)), 1);
    return ordered.map((ps) => ({
      label: ps.period.split(' ')[0].slice(0, 3),
      net: netOf(ps),
      pct: netOf(ps) / maxNet,
      currency: ps.currency,
      isBonus: ps.earnings.length > 3,
    }));
  }, [payslips]);

  if (items.length === 0) return null;

  return (
    <View style={styles.payChart}>
      {items.map((item) => (
        <View key={item.label} style={styles.payBarRow}>
          <Text style={styles.payBarLabel}>{item.label}</Text>
          <View style={styles.payBarTrack}>
            <View
              style={[
                styles.payBarFill,
                { width: `${item.pct * 100}%` },
                item.isBonus && styles.payBarBonus,
              ]}
            />
          </View>
          <Text style={[styles.payBarValue, item.isBonus && styles.payBarValueBonus]}>
            {compact(item.net)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function netOf(ps: Payslip): number {
  const gross = ps.earnings.reduce((s, l) => s + l.amount, 0);
  const deduct = ps.deductions.reduce((s, l) => s + l.amount, 0);
  return gross - deduct;
}

function compact(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

const styles = StyleSheet.create({
  payChart: { gap: spacing.sm + 2 },
  payBarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  payBarLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    width: 32,
  },
  payBarTrack: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    flex: 1,
    height: 14,
    overflow: 'hidden',
  },
  payBarFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: '100%',
  },
  payBarBonus: {
    backgroundColor: colors.success,
  },
  payBarValue: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
    width: 40,
  },
  payBarValueBonus: {
    color: colors.success,
  },
});

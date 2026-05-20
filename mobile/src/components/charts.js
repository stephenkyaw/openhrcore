import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

const BAR_H = 72;
const MAX_HOURS = 10;

function statusColor(status) {
  if (status === 'present') return colors.primary;
  if (status === 'late') return colors.warning;
  if (status === 'absent') return colors.danger;
  return colors.border;
}

// Vertical bar chart — Mon–Fri of a work week.
// data: [{ date: 'YYYY-MM-DD', hours: number, status: string }]
export function WeeklyAttendanceChart({ data = [] }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <View style={styles.chart}>
      {data.map((item) => {
        const isFuture = item.date > today;
        const isToday = item.date === today;
        const pct = isFuture ? 0 : Math.min((item.hours || 0) / MAX_HOURS, 1);
        const fillH = Math.round(pct * BAR_H);
        const barColor = isFuture ? 'transparent' : statusColor(item.status);
        const dayLabel = new Date(`${item.date}T12:00:00`)
          .toLocaleDateString('en', { weekday: 'short' })
          .slice(0, 2);

        return (
          <View key={item.date} style={styles.col}>
            <Text style={[styles.hoursLabel, (fillH === 0 || isFuture) && styles.invisible]}>
              {item.hours > 0 ? `${item.hours}` : ''}
            </Text>
            <View style={[styles.track, isToday && styles.trackToday]}>
              {fillH > 0 && (
                <View style={[styles.fill, { height: fillH, backgroundColor: barColor }]} />
              )}
            </View>
            <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
              {dayLabel}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// Horizontal bar chart — monthly net pay trend.
// payslips: array of payslip objects (earnings/deductions arrays)
export function MonthlyPayChart({ payslips = [] }) {
  const items = useMemo(() => {
    const ordered = [...payslips].reverse(); // oldest first
    const maxNet = Math.max(...ordered.map((ps) => netOf(ps)), 1);
    return ordered.map((ps) => ({
      label: ps.period.split(' ')[0].slice(0, 3), // "Apr"
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
          <Text style={styles.payBarValue}>{compact(item.net)}</Text>
        </View>
      ))}
    </View>
  );
}

function netOf(ps) {
  const gross = ps.earnings.reduce((s, l) => s + l.amount, 0);
  const deduct = ps.deductions.reduce((s, l) => s + l.amount, 0);
  return gross - deduct;
}

function compact(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

const styles = StyleSheet.create({
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  col: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  hoursLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  invisible: {
    opacity: 0,
  },
  track: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    height: BAR_H,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },
  trackToday: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  fill: {
    borderRadius: radius.sm,
    width: '100%',
  },
  dayLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  dayLabelToday: {
    color: colors.primary,
    fontWeight: '800',
  },

  payChart: {
    gap: spacing.sm,
  },
  payBarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  payBarLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    width: 28,
  },
  payBarTrack: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    flex: 1,
    height: 12,
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
    fontWeight: '700',
    textAlign: 'right',
    width: 36,
  },
});

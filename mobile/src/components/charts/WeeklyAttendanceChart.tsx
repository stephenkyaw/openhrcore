import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';
import type { WeekAttendanceDay, AttendanceStatus } from '../../types';

const BAR_H = 80;
const MAX_HOURS = 10;

function statusColor(status: AttendanceStatus | null | undefined): string {
  if (status === 'present') return colors.primary;
  if (status === 'late') return colors.warning;
  if (status === 'absent') return colors.danger;
  return colors.border;
}

function statusSoftColor(status: AttendanceStatus | null | undefined): string {
  if (status === 'present') return colors.primarySoft;
  if (status === 'late') return colors.warningSoft;
  if (status === 'absent') return colors.dangerSoft;
  return colors.surfaceAlt;
}

interface WeeklyAttendanceChartProps {
  data?: WeekAttendanceDay[];
}

// Vertical bar chart — Mon–Fri of a work week.
// data: [{ date: 'YYYY-MM-DD', hours: number, status: string }]
export function WeeklyAttendanceChart({ data = [] }: WeeklyAttendanceChartProps): React.ReactElement {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <View style={styles.chart}>
      {data.map((item) => {
        const isFuture = item.date > today;
        const isToday = item.date === today;
        const pct = isFuture ? 0 : Math.min((item.hours || 0) / MAX_HOURS, 1);
        const fillH = Math.round(pct * BAR_H);
        const barColor = isFuture ? 'transparent' : statusColor(item.status);
        const softColor = isFuture ? colors.surfaceAlt : statusSoftColor(item.status);
        const dayLabel = new Date(`${item.date}T12:00:00`)
          .toLocaleDateString('en', { weekday: 'short' })
          .slice(0, 2);

        return (
          <View key={item.date} style={styles.col}>
            {/* Hours label */}
            <Text style={[styles.hoursLabel, (fillH === 0 || isFuture) && styles.invisible]}>
              {item.hours > 0 ? `${item.hours}h` : ''}
            </Text>

            {/* Bar track */}
            <View style={[
              styles.track,
              isToday && styles.trackToday,
              { backgroundColor: isFuture ? colors.surfaceAlt : softColor },
            ]}>
              {fillH > 0 && (
                <View style={[
                  styles.fill,
                  { height: fillH, backgroundColor: barColor },
                  isToday && styles.fillToday,
                ]} />
              )}
              {/* Today marker line */}
              {isToday && fillH === 0 && (
                <View style={styles.trackDash} />
              )}
            </View>

            {/* Day label */}
            <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
              {dayLabel}
            </Text>

            {/* Today dot */}
            {isToday && (
              <View style={[styles.todayDot, { backgroundColor: fillH > 0 ? barColor : colors.primary }]} />
            )}
          </View>
        );
      })}
    </View>
  );
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
    position: 'relative',
  },
  hoursLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  invisible: { opacity: 0 },
  track: {
    borderRadius: radius.sm,
    height: BAR_H,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },
  trackToday: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  trackDash: {
    backgroundColor: colors.primary,
    height: 2,
    left: '10%',
    opacity: 0.4,
    position: 'absolute',
    top: '50%',
    width: '80%',
  },
  fill: {
    borderRadius: radius.sm,
    width: '100%',
  },
  fillToday: {
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
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
  todayDot: {
    borderRadius: radius.full,
    height: 5,
    width: 5,
  },
});

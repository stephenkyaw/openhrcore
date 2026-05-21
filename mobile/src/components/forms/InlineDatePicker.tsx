import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { calendarWeeks, DAY_ABBRS, MONTH_NAMES, toDateStr } from '../../utils/dates';

interface InlineDatePickerProps {
  value?: string;
  rangeFrom?: string;
  rangeTo?: string;
  onSelect: (dateStr: string) => void;
  minDate?: string;
  maxDate?: string;
}

// ─── InlineDatePicker ─────────────────────────────────────────────────────────
// Renders a full month calendar. Handles single-date and range selection.
//
// Props:
//   value       – currently selected single date "YYYY-MM-DD" (single mode)
//   rangeFrom   – range start "YYYY-MM-DD" (range mode)
//   rangeTo     – range end "YYYY-MM-DD" (range mode)
//   onSelect    – (dateStr) => void
//   minDate     – earliest selectable date
//   maxDate     – latest selectable date

export function InlineDatePicker({ value, rangeFrom, rangeTo, onSelect, minDate, maxDate }: InlineDatePickerProps): React.ReactElement {
  const today = new Date();
  const initDate = value || rangeFrom || toDateStr(today);
  const [year, setYear] = useState(() => parseInt(initDate.slice(0, 4), 10));
  const [month, setMonth] = useState(() => parseInt(initDate.slice(5, 7), 10) - 1);

  const weeks = useMemo(() => calendarWeeks(year, month), [year, month]);

  const fmt = useCallback(
    (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    [year, month],
  );

  const prevMonth = useCallback(() => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }, [month]);

  return (
    <View style={styles.picker}>
      {/* Month navigation */}
      <View style={styles.pickerHeader}>
        <Pressable onPress={prevMonth} style={styles.navBtn} accessibilityLabel="Previous month">
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </Pressable>
        <Text style={styles.pickerTitle}>{MONTH_NAMES[month]} {year}</Text>
        <Pressable onPress={nextMonth} style={styles.navBtn} accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
      </View>

      {/* Day-of-week headers */}
      <View style={styles.weekRow}>
        {DAY_ABBRS.map((d) => (
          <Text key={d} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            if (!day) return <View key={di} style={styles.cell} />;

            const dateStr = fmt(day);
            const isSelected = value === dateStr || rangeFrom === dateStr || rangeTo === dateStr;
            const isToday = dateStr === toDateStr(today);
            const inRange = rangeFrom && rangeTo && dateStr > rangeFrom && dateStr < rangeTo;
            const disabled = (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate);

            return (
              <Pressable
                key={di}
                disabled={!!disabled}
                onPress={() => onSelect(dateStr)}
                style={[
                  styles.cell,
                  isSelected && styles.cellSelected,
                  inRange && styles.cellInRange,
                  disabled && styles.cellDisabled,
                ]}
                accessibilityLabel={dateStr}
                accessibilityRole="button"
              >
                <Text style={[
                  styles.cellText,
                  isSelected && styles.cellTextSelected,
                  isToday && !isSelected && styles.cellTextToday,
                  disabled && styles.cellTextDisabled,
                ]}>
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  pickerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navBtn: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  pickerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayHeader: {
    color: colors.muted,
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: spacing.xs,
    textAlign: 'center',
  },
  cell: {
    alignItems: 'center',
    aspectRatio: 1,
    flex: 1,
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    margin: 2,
  },
  cellInRange: {
    backgroundColor: colors.primarySoft,
  },
  cellDisabled: {
    opacity: 0.3,
  },
  cellText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  cellTextSelected: {
    color: '#fff',
    fontWeight: '800',
  },
  cellTextToday: {
    color: colors.primary,
    fontWeight: '800',
  },
  cellTextDisabled: {
    color: colors.muted,
  },
});

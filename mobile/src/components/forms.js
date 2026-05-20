import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { calendarWeeks, DAY_ABBRS, MONTH_NAMES, toDateStr } from '../utils/dates';

// ─── FormField ────────────────────────────────────────────────────────────────

export function FormField({ label, error, children, style }) {
  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

// ─── TextFieldInput ───────────────────────────────────────────────────────────

export function TextFieldInput({ error, ...props }) {
  return (
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholderTextColor={colors.muted}
      {...props}
    />
  );
}

// ─── DateFieldButton ─────────────────────────────────────────────────────────
// Pressable that looks like an input, shows formatted date or placeholder.

export function DateFieldButton({ value, placeholder = 'Select date', onPress, error }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.input, styles.dateBtn, error && styles.inputError]}
      accessibilityRole="button"
      accessibilityLabel={value || placeholder}
    >
      <Text style={value ? styles.dateBtnValue : styles.dateBtnPlaceholder}>
        {value || placeholder}
      </Text>
      <Ionicons name="calendar-outline" size={16} color={colors.muted} />
    </Pressable>
  );
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

export function InlineDatePicker({ value, rangeFrom, rangeTo, onSelect, minDate, maxDate }) {
  const today = new Date();
  const initDate = value || rangeFrom || toDateStr(today);
  const [year, setYear] = useState(() => parseInt(initDate.slice(0, 4), 10));
  const [month, setMonth] = useState(() => parseInt(initDate.slice(5, 7), 10) - 1);

  const weeks = useMemo(() => calendarWeeks(year, month), [year, month]);

  const fmt = useCallback(
    (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
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
                disabled={disabled}
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

// ─── SegmentedControl ─────────────────────────────────────────────────────────

export function SegmentedControl({ options, value, onChange }) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.segmentActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.segmentCode, active && styles.segmentCodeActive]}>
              {opt.code}
            </Text>
            <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: {
    borderColor: colors.danger,
  },
  dateBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateBtnValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  dateBtnPlaceholder: {
    color: colors.muted,
    fontSize: 15,
  },

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

  segmented: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    padding: spacing.sm,
  },
  segmentActive: {
    backgroundColor: colors.primarySoft,
  },
  segmentCode: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  segmentCodeActive: {
    color: colors.primaryText,
  },
  segmentLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  segmentLabelActive: {
    color: colors.primaryText,
  },
});

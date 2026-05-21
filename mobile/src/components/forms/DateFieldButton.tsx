import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

interface DateFieldButtonProps {
  value?: string;
  placeholder?: string;
  onPress: () => void;
  error?: boolean;
}

// ─── DateFieldButton ─────────────────────────────────────────────────────────
// Pressable that looks like an input, shows formatted date or placeholder.

export function DateFieldButton({ value, placeholder = 'Select date', onPress, error }: DateFieldButtonProps): React.ReactElement {
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

const styles = StyleSheet.create({
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
});

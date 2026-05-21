import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { colors, radius, spacing } from '../../theme';

interface TextFieldInputProps extends TextInputProps {
  error?: string | null;
}

// ─── TextFieldInput ───────────────────────────────────────────────────────────

export function TextFieldInput({ error, ...props }: TextFieldInputProps): React.ReactElement {
  return (
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholderTextColor={colors.muted}
      {...props}
    />
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
});

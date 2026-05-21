import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';
import type { ButtonVariant, ButtonSize } from '../../types';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

export function Button({
  children, onPress, variant = 'primary', disabled = false,
  style, size = 'md', leftIcon, rightIcon, loading = false,
}: ButtonProps): React.ReactElement {
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  const isSuccess = variant === 'success';

  const iconColor = (isSecondary || isGhost) ? colors.primary
    : isDanger ? colors.danger
    : colors.white;

  const textStyle = [
    styles.buttonText,
    size === 'sm' && styles.buttonSmText,
    isSecondary && styles.buttonSecondaryText,
    isGhost && styles.buttonGhostText,
    isDanger && styles.buttonDangerText,
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        isSecondary && styles.buttonSecondary,
        isGhost && styles.buttonGhost,
        isDanger && styles.buttonDanger,
        isSuccess && styles.buttonSuccess,
        (disabled || loading) && styles.disabled,
        pressed && !(disabled || loading) && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.buttonInner}>
          <ActivityIndicator size="small" color={iconColor} />
          <Text style={textStyle}>Loading…</Text>
        </View>
      ) : (leftIcon || rightIcon) ? (
        <View style={styles.buttonInner}>
          {leftIcon}
          <Text style={textStyle}>{children}</Text>
          {rightIcon}
        </View>
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  buttonSm: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonDanger: { backgroundColor: colors.dangerSoft },
  buttonSuccess: { backgroundColor: colors.success },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.972 }] },

  buttonText: {
    color: colors.white,
    fontSize: font.md,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  buttonSmText: { fontSize: font.sm },
  buttonSecondaryText: { color: colors.text },
  buttonGhostText: { color: colors.primary },
  buttonDangerText: { color: colors.danger },
  buttonInner: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
});

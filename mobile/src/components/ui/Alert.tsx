import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Row } from './Row';
import { colors, font, radius, spacing } from '../../theme';
import type { Tone } from '../../types';

interface AlertBannerProps {
  message: string;
  tone?: Tone;
  icon?: string;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

const ALERT_CFG: Record<string, { bg: string; fg: string; icon: string }> = {
  info:    { bg: colors.infoSoft,    fg: colors.info,    icon: 'information-circle-outline' },
  success: { bg: colors.successSoft, fg: colors.success, icon: 'checkmark-circle-outline' },
  warning: { bg: colors.warningSoft, fg: colors.warning, icon: 'warning-outline' },
  danger:  { bg: colors.dangerSoft,  fg: colors.danger,  icon: 'alert-circle-outline' },
};

export function AlertBanner({ message, tone = 'info', icon, onDismiss, style }: AlertBannerProps): React.ReactElement {
  const cfg = ALERT_CFG[tone] || ALERT_CFG.info;
  return (
    <Row style={[styles.alert, { backgroundColor: cfg.bg, borderLeftColor: cfg.fg }, style]}>
      <Ionicons name={(icon || cfg.icon) as any} size={15} color={cfg.fg} />
      <Text style={[styles.alertText, { color: cfg.fg }]}>{message}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Ionicons name="close" size={14} color={cfg.fg} />
        </Pressable>
      ) : null}
    </Row>
  );
}

const styles = StyleSheet.create({
  alert: {
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  alertText: { flex: 1, fontSize: font.sm, lineHeight: 18 },
});

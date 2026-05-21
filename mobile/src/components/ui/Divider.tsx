import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Row } from './Row';
import { colors, font, hairline, spacing } from '../../theme';

interface DividerProps {
  style?: StyleProp<ViewStyle>;
  label?: string;
}

export function Divider({ style, label }: DividerProps): React.ReactElement {
  if (label) {
    return (
      <Row style={[styles.dividerLabelRow, style]}>
        <View style={[styles.divider, styles.flex]} />
        <Text style={styles.dividerLabel}>{label}</Text>
        <View style={[styles.divider, styles.flex]} />
      </Row>
    );
  }
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.border,
    height: hairline,
    marginVertical: spacing.md,
  },
  flex: { flex: 1 },
  dividerLabelRow: { alignItems: 'center', gap: spacing.md, marginVertical: spacing.md },
  dividerLabel: { color: colors.muted, fontSize: font.xs, fontWeight: '600' },
});

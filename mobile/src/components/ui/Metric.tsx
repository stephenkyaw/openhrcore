import React from 'react';
import { StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Card } from './Card';
import { colors, font, spacing } from '../../theme';
import type { Tone } from '../../types';

interface MetricProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}

export function Metric({ label, value, sub, tone, style }: MetricProps): React.ReactElement {
  return (
    <Card style={[styles.metric, style]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[
        styles.metricValue,
        tone === 'warning' && styles.metricWarn,
        tone === 'success' && styles.metricSuccess,
        tone === 'primary' && styles.metricPrimary,
        tone === 'danger' && styles.metricDanger,
      ]}>
        {value}
      </Text>
      {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  metric: { flex: 1 },
  metricLabel: {
    color: colors.muted,
    fontSize: font.xs,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: spacing.xs,
  },
  metricWarn: { color: colors.warning },
  metricSuccess: { color: colors.success },
  metricPrimary: { color: colors.primary },
  metricDanger: { color: colors.danger },
  metricSub: {
    color: colors.muted,
    fontSize: font.xs,
    lineHeight: 16,
    marginTop: 2,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Row } from './Row';
import { colors, font, hairline, spacing } from '../../theme';
import type { Tone } from '../../types';

interface StatItem {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
}

interface StatRowProps {
  items: StatItem[];
  style?: StyleProp<ViewStyle>;
}

export function StatRow({ items, style }: StatRowProps): React.ReactElement {
  return (
    <Row style={[styles.statRow, style]}>
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <View style={styles.statDivider} />}
          <View style={styles.statItem}>
            <Text style={[
              styles.statNum,
              item.tone === 'warning' && styles.metricWarn,
              item.tone === 'danger' && styles.metricDanger,
              item.tone === 'success' && styles.metricSuccess,
              item.tone === 'primary' && styles.metricPrimary,
            ]}>
              {item.value}
            </Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </Row>
  );
}

const styles = StyleSheet.create({
  statRow: { justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 2 },
  statNum: { color: colors.text, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: font.xs, letterSpacing: 0.2 },
  statDivider: { backgroundColor: colors.border, height: 28, width: hairline },
  metricWarn: { color: colors.warning },
  metricSuccess: { color: colors.success },
  metricPrimary: { color: colors.primary },
  metricDanger: { color: colors.danger },
});

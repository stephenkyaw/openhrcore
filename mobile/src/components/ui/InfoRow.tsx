import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Row } from './Row';
import { colors, font, hairline, spacing } from '../../theme';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}

export function InfoRow({ label, value, last }: InfoRowProps): React.ReactElement {
  return (
    <Row style={[styles.infoRow, !last ? styles.infoRowBorder : undefined]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  infoRow: { paddingVertical: spacing.md, alignItems: 'flex-start' },
  infoRowBorder: { borderBottomColor: colors.borderLight, borderBottomWidth: hairline },
  infoLabel: { color: colors.muted, fontSize: font.sm, width: 120 },
  infoValue: {
    color: colors.text,
    flex: 1,
    fontSize: font.sm,
    fontWeight: '600',
    textAlign: 'right',
  },
});

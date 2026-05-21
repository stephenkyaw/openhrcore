import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Row } from './Row';
import { colors, font, spacing } from '../../theme';

interface SectionTitleProps {
  title: string;
  action?: React.ReactNode;
}

export function SectionTitle({ title, action }: SectionTitleProps): React.ReactElement {
  return (
    <Row style={styles.sectionTitle}>
      <Text style={styles.sectionText}>{title}</Text>
      {action}
    </Row>
  );
}

const styles = StyleSheet.create({
  // SectionTitle — small uppercase label, no icon
  sectionTitle: { marginTop: spacing.xs },
  sectionText: {
    color: colors.muted,
    fontSize: font.xs,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
});

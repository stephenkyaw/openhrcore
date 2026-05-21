import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';

interface TagProps {
  label: string;
  color?: string;
  bg?: string;
}

export function Tag({ label, color, bg }: TagProps): React.ReactElement {
  return (
    <View style={[styles.tag, { backgroundColor: bg || colors.surfaceAlt }]}>
      <Text style={[styles.tagText, { color: color || colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  tagText: { fontSize: font.xs, fontWeight: '700' },
});

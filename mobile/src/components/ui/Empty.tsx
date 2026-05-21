import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, hairline, radius, spacing } from '../../theme';

interface EmptyProps {
  message?: string;
  icon?: string;
}

export function Empty({ message, icon }: EmptyProps): React.ReactElement {
  return (
    <View style={styles.empty}>
      {icon ? (
        <View style={styles.emptyIconWrap}>
          <Ionicons name={icon as any} size={28} color={colors.border} />
        </View>
      ) : null}
      <Text style={styles.emptyText}>{message || 'Nothing here yet.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: hairline,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  emptyText: { color: colors.muted, fontSize: font.sm, textAlign: 'center', lineHeight: 20 },
});

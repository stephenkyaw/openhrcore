import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress: () => void;
  count?: number;
}

export function Chip({ label, active, onPress, count }: ChipProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && !active && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      {count != null && count > 0 ? (
        <View style={[styles.chipBadge, active && styles.chipBadgeActive]}>
          <Text style={[styles.chipBadgeText, active && styles.chipBadgeTextActive]}>
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Chip — active = solid primary, white text
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.muted, fontSize: font.sm, fontWeight: '600' },
  chipTextActive: { color: colors.white, fontWeight: '700' },
  chipBadge: {
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.full,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 3,
  },
  chipBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  chipBadgeText: { color: colors.muted, fontSize: 9, fontWeight: '800' },
  chipBadgeTextActive: { color: colors.white },
});

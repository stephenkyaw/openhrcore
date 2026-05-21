import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../../theme';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  sub?: string;
}

export function Toggle({ value, onChange, label, sub }: ToggleProps): React.ReactElement {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={styles.toggleRow}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View style={styles.toggleLabelWrap}>
        {label ? <Text style={styles.toggleLabel}>{label}</Text> : null}
        {sub ? <Text style={styles.toggleSub}>{sub}</Text> : null}
      </View>
      <View style={[styles.toggleTrack, value && styles.toggleTrackOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  toggleLabelWrap: { flex: 1 },
  toggleLabel: { color: colors.text, fontSize: font.md, fontWeight: '600' },
  toggleSub: { color: colors.muted, fontSize: font.sm, marginTop: 1 },
  toggleTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.full,
    height: 28,
    justifyContent: 'center',
    padding: 3,
    width: 50,
  },
  toggleTrackOn: { backgroundColor: colors.primary },
  toggleThumb: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    height: 22,
    width: 22,
    ...shadow,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
});

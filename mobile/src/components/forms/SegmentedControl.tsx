import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

interface SegmentOption {
  value: string;
  code: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (v: string) => void;
}

// ─── SegmentedControl ─────────────────────────────────────────────────────────

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps): React.ReactElement {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.segmentActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.segmentCode, active && styles.segmentCodeActive]}>
              {opt.code}
            </Text>
            <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    padding: spacing.sm,
  },
  segmentActive: {
    backgroundColor: colors.primarySoft,
  },
  segmentCode: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  segmentCodeActive: {
    color: colors.primaryText,
  },
  segmentLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  segmentLabelActive: {
    color: colors.primaryText,
  },
});

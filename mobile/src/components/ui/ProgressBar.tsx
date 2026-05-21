import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

interface ProgressBarProps {
  value?: number;
  color?: string;
  style?: ViewStyle | ViewStyle[];
  height?: number;
}

export function ProgressBar({ value = 0, color, style, height = 5 }: ProgressBarProps): React.ReactElement {
  const pct = Math.min(Math.max(value, 0), 1);
  return (
    <View style={[styles.progressTrack, { height }, style]}>
      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color || colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: { borderRadius: radius.full, height: '100%' },
});

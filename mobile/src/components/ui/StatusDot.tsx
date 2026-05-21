import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';
import type { Tone } from '../../types';

interface StatusDotProps {
  tone?: Tone;
  size?: number;
  pulse?: boolean;
}

export function StatusDot({ tone = 'neutral', size = 8, pulse }: StatusDotProps): React.ReactElement {
  const bg = tone === 'success' ? colors.success
    : tone === 'warning' ? colors.warning
    : tone === 'danger' ? colors.danger
    : tone === 'primary' ? colors.primary
    : colors.border;
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg }} />;
}

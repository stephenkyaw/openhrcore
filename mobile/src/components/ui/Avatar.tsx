import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme';

interface AvatarProps {
  initials: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ initials, size = 48, color, style }: AvatarProps): React.ReactElement {
  return (
    <View style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: color || colors.primary },
      style,
    ]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '800' },
});

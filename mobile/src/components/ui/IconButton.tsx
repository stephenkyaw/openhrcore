import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../theme';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  color?: string;
  bg?: string;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({ icon, onPress, size = 36, color, bg, style }: IconButtonProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.iconBtn,
        { width: size, height: size, borderRadius: bg ? size / 2 : radius.md, backgroundColor: bg || 'transparent' },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Ionicons name={icon as any} size={size * 0.52} color={color || colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconBtn: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.972 }] },
});

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, hairline, radius, shadow, shadowMd, spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  onPress?: () => void;
  accent?: string;
}

export function Card({ children, style, elevated, onPress, accent }: CardProps): React.ReactElement {
  const baseStyle: StyleProp<ViewStyle> = [
    styles.card,
    elevated ? styles.cardElevated : undefined,
    accent ? { borderLeftColor: accent, borderLeftWidth: 3 } : undefined,
    style,
  ];
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [baseStyle, pressed ? styles.cardPressed : undefined]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={baseStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: hairline,
    padding: spacing.lg,
    ...shadow,
  },
  cardElevated: { ...shadowMd },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.987 }] },
});

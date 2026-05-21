import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Row } from './Row';
import { colors, font, radius, spacing } from '../../theme';

interface ListItemProps {
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ListItem({ icon, iconColor, iconBg, title, subtitle, right, onPress, showArrow = false, style }: ListItemProps): React.ReactElement {
  const inner = (
    <Row style={[styles.listItem, style]}>
      {icon ? (
        <View style={[styles.listIconWrap, { backgroundColor: iconBg || colors.surfaceAlt }]}>
          <Ionicons name={icon as any} size={18} color={iconColor || colors.muted} />
        </View>
      ) : null}
      <View style={styles.listContent}>
        <Text style={styles.listTitle}>{title}</Text>
        {subtitle ? <Text style={styles.listSub}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
      {showArrow ? <Ionicons name={'chevron-forward' as any} size={16} color={colors.border} style={styles.listArrow} /> : null}
    </Row>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && { opacity: 0.7 }}
        accessibilityRole="button"
      >
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  listItem: { gap: spacing.md, justifyContent: 'flex-start', paddingVertical: spacing.md },
  listIconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  listContent: { flex: 1 },
  listTitle: { color: colors.text, fontSize: font.md, fontWeight: '600' },
  listSub: { color: colors.muted, fontSize: font.sm, marginTop: 1 },
  listArrow: { marginLeft: spacing.xs },
});

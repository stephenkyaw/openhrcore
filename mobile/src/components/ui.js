import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, shadowMd, spacing } from '../theme';

export function Card({ children, style, elevated }) {
  return (
    <View style={[styles.card, elevated && styles.cardElevated, style]}>
      {children}
    </View>
  );
}

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Row({ children, style }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Button({ children, onPress, variant = 'primary', disabled = false, style, size = 'md', leftIcon }) {
  const textStyle = [
    styles.buttonText,
    size === 'sm' && styles.buttonSmText,
    variant === 'secondary' && styles.buttonSecondaryText,
    variant === 'ghost' && styles.buttonGhostText,
    variant === 'danger' && styles.buttonDangerText,
  ];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {leftIcon ? (
        <View style={styles.buttonInner}>
          {leftIcon}
          <Text style={textStyle}>{children}</Text>
        </View>
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </Pressable>
  );
}

export function IconButton({ icon, onPress, size = 36, color, style }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.iconBtn, { width: size, height: size }, pressed && styles.pressed, style]}
    >
      <Ionicons name={icon} size={size * 0.55} color={color || colors.primary} />
    </Pressable>
  );
}

export function Badge({ children, tone = 'neutral' }) {
  return (
    <View style={[styles.badge, badgeTone[tone] || badgeTone.neutral]}>
      <Text style={[styles.badgeText, badgeTextTone[tone] || badgeTextTone.neutral]}>
        {String(children).toUpperCase()}
      </Text>
    </View>
  );
}

export function Metric({ label, value, sub, tone, style }) {
  return (
    <Card style={[styles.metric, style]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, tone === 'warning' && styles.metricWarn, tone === 'success' && styles.metricSuccess, tone === 'primary' && styles.metricPrimary]}>
        {value}
      </Text>
      {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
    </Card>
  );
}

export function SectionTitle({ title, action }) {
  return (
    <Row style={styles.sectionTitle}>
      <Text style={styles.sectionText}>{title}</Text>
      {action}
    </Row>
  );
}

export function ProgressBar({ value = 0, color, style }) {
  const pct = Math.min(Math.max(value, 0), 1);
  return (
    <View style={[styles.progressTrack, style]}>
      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color || colors.primary }]} />
    </View>
  );
}

export function Toggle({ value, onChange, label }) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={styles.toggleRow}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      {label ? <Text style={styles.toggleLabel}>{label}</Text> : null}
      <View style={[styles.toggleTrack, value && styles.toggleTrackOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </Pressable>
  );
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

export function Avatar({ initials, size = 48, color }) {
  const bg = color || colors.primarySoft;
  const textColor = color ? '#fff' : colors.primary;
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.35, color: textColor }]}>{initials}</Text>
    </View>
  );
}

export function InfoRow({ label, value, last }) {
  return (
    <Row style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </Row>
  );
}

export function Empty({ message, icon }) {
  return (
    <View style={styles.empty}>
      {icon ? <Ionicons name={icon} size={32} color={colors.border} style={styles.emptyIcon} /> : null}
      <Text style={styles.emptyText}>{message || 'Nothing here yet.'}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function StatusDot({ tone = 'neutral', size = 8 }) {
  const bg = tone === 'success' ? colors.success
    : tone === 'warning' ? colors.warning
    : tone === 'danger' ? colors.danger
    : tone === 'primary' ? colors.primary
    : colors.border;
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg }} />;
}

const badgeTone = {
  neutral: { backgroundColor: colors.surfaceAlt },
  success: { backgroundColor: colors.successSoft },
  warning: { backgroundColor: colors.warningSoft },
  danger: { backgroundColor: colors.dangerSoft },
  primary: { backgroundColor: colors.primarySoft },
  info: { backgroundColor: colors.infoSoft },
};

const badgeTextTone = {
  neutral: { color: colors.muted },
  success: { color: colors.success },
  warning: { color: colors.warning },
  danger: { color: colors.danger },
  primary: { color: colors.primaryText },
  info: { color: colors.info },
};

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadow,
  },
  cardElevated: {
    ...shadowMd,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonSm: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: colors.dangerSoft,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonSmText: {
    fontSize: 13,
  },
  buttonSecondaryText: {
    color: colors.text,
  },
  buttonGhostText: {
    color: colors.primary,
  },
  buttonDangerText: {
    color: colors.danger,
  },
  buttonInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metric: {
    flex: 1,
    minHeight: 96,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: spacing.xs,
    letterSpacing: -1,
  },
  metricWarn: {
    color: colors.warning,
  },
  metricSuccess: {
    color: colors.success,
  },
  metricPrimary: {
    color: colors.primary,
  },
  metricSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    marginTop: spacing.xs,
  },
  sectionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  progressTrack: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.full,
    height: '100%',
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.full,
    height: 28,
    justifyContent: 'center',
    padding: 3,
    width: 50,
  },
  toggleTrackOn: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    backgroundColor: '#fff',
    borderRadius: radius.full,
    height: 22,
    width: 22,
    ...shadow,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '800',
  },
  infoRow: {
    paddingVertical: spacing.md,
    alignItems: 'flex-start',
  },
  infoRowBorder: {
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 13,
    width: 120,
  },
  infoValue: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.primaryText,
  },
});

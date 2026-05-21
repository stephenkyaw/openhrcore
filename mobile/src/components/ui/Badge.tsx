import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius } from '../../theme';
import type { Tone } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  tone?: Tone;
}

export function Badge({ children, tone = 'neutral' }: BadgeProps): React.ReactElement {
  const raw = String(children);
  const label = raw.charAt(0).toUpperCase() + raw.slice(1);
  return (
    <View style={[styles.badge, badgeTone[tone] || badgeTone.neutral]}>
      <Text style={[styles.badgeText, badgeTextTone[tone] || badgeTextTone.neutral]}>
        {label}
      </Text>
    </View>
  );
}

const badgeTone: Record<Tone, object> = {
  neutral: { backgroundColor: colors.surfaceAlt },
  success: { backgroundColor: colors.successSoft },
  warning: { backgroundColor: colors.warningSoft },
  danger:  { backgroundColor: colors.dangerSoft  },
  primary: { backgroundColor: colors.primarySoft },
  info:    { backgroundColor: colors.infoSoft    },
};

const badgeTextTone: Record<Tone, object> = {
  neutral: { color: colors.muted      },
  success: { color: colors.success    },
  warning: { color: colors.warning    },
  danger:  { color: colors.danger     },
  primary: { color: colors.primaryText },
  info:    { color: colors.info       },
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: font.xs,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

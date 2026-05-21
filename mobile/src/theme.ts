import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#f5f7fc', surface: '#ffffff', surfaceAlt: '#eef2f9', surfaceHover: '#f8fafd',
  text: '#0d1b2a', textSecondary: '#3c4f65', muted: '#6b7c93',
  border: '#e4ecf5', borderLight: '#eef2f9',
  primary: '#2563eb', primaryDark: '#1d4ed8', primaryLight: '#3b82f6', primarySoft: '#dbeafe', primaryText: '#1e40af',
  success: '#059669', successDark: '#047857', successSoft: '#d1fae5',
  warning: '#d97706', warningSoft: '#fef3c7',
  danger: '#dc2626', dangerSoft: '#fee2e2',
  info: '#0891b2', infoSoft: '#cffafe',
  purple: '#7c3aed', purpleSoft: '#ede9fe',
  orange: '#ea580c', orangeSoft: '#ffedd5',
  white: '#ffffff',
} as const;
export const font = { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26, xxxl: 34 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 28, full: 999 };
export const shadow = { shadowColor: '#1a2e4a', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 2 };
export const shadowMd = { shadowColor: '#1a2e4a', shadowOpacity: 0.09, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 5 };
export const shadowLg = { shadowColor: '#1a2e4a', shadowOpacity: 0.13, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 8 };
export const hairline = StyleSheet.hairlineWidth;

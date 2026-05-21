import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { EssProvider, useEss } from './src/store/EssStore';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LeaveScreen } from './src/screens/LeaveScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { PayScreen } from './src/screens/PayScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { colors, font, hairline, radius, shadowMd, spacing } from './src/theme';
import type { Employee } from './src/types';

interface Tab {
  id: string;
  label: string;
  icon: string;
  iconActive: string;
}

const TABS: Tab[] = [
  { id: 'home',       label: 'Home',   icon: 'home-outline',       iconActive: 'home'       },
  { id: 'leave',      label: 'Leave',  icon: 'calendar-outline',   iconActive: 'calendar'   },
  { id: 'attendance', label: 'Time',   icon: 'time-outline',       iconActive: 'time'       },
  { id: 'pay',        label: 'Pay',    icon: 'wallet-outline',     iconActive: 'wallet'     },
  { id: 'profile',    label: 'Me',     icon: 'person-outline',     iconActive: 'person'     },
  { id: 'chat',       label: 'AI',     icon: 'sparkles-outline',   iconActive: 'sparkles'   },
];

const TAB_TITLES: Record<string, string> = {
  home: 'Home',
  leave: 'Leave',
  attendance: 'Attendance',
  pay: 'Pay & Expenses',
  profile: 'My Profile',
  chat: 'AI Assistant',
};

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({ active, onChange, pendingApprovals, unread }: { active: string; onChange: (id: string) => void; pendingApprovals: number; unread: number }): React.ReactElement {
  return (
    <View style={styles.tabbar}>
      {TABS.map((tab) => {
        const selected = active === tab.id;
        const badge = tab.id === 'leave' ? pendingApprovals
          : tab.id === 'profile' ? unread : 0;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
          >
            <View style={[styles.tabIconWrap, selected && styles.tabIconWrapActive]}>
              <Ionicons
                name={(selected ? tab.iconActive : tab.icon) as any}
                size={20}
                color={selected ? colors.white : colors.muted}
              />
              {badge > 0 && !selected && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{badge > 9 ? '9+' : badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function AppHeader({ employee, tab, unread, onNotifications, onProfile }: { employee: Employee; tab: string; unread: number; onNotifications: () => void; onProfile: () => void }): React.ReactElement {
  const isChat = tab === 'chat';
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerApp}>OpenHRCore</Text>
        <Text style={styles.headerTitle}>{TAB_TITLES[tab] || 'Home'}</Text>
      </View>

      <View style={styles.headerActions}>
        {!isChat && (
          <Pressable
            onPress={onNotifications}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel={unread > 0 ? `${unread} notifications` : 'Notifications'}
          >
            <Ionicons
              name={unread > 0 ? 'notifications' : 'notifications-outline'}
              size={22}
              color={unread > 0 ? colors.primary : colors.muted}
            />
            {unread > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </Pressable>
        )}

        <Pressable onPress={onProfile} accessibilityRole="button" accessibilityLabel="Profile">
          <View style={[styles.headerAvatar, isChat && styles.headerAvatarAI]}>
            {isChat
              ? <Ionicons name="sparkles" size={17} color={colors.white} />
              : <Text style={styles.headerAvatarText}>{employee.first[0]}{employee.last[0]}</Text>
            }
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function ToastOverlay({ message }: { message: string | null }): React.ReactElement | null {
  if (!message) return null;
  return (
    <View style={styles.toastWrap} pointerEvents="none">
      <View style={styles.toast}>
        <Ionicons name="checkmark-circle" size={15} color={colors.success} />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
}

// ─── App content ──────────────────────────────────────────────────────────────

function AppContent({ onLogout }: { onLogout: () => void }): React.ReactElement {
  const [tab, setTab] = useState('home');
  const { employee, notifications, pendingApprovals, toast } = useEss();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <AppHeader
          employee={employee}
          tab={tab}
          unread={unread}
          onNotifications={() => setTab('profile')}
          onProfile={() => setTab('profile')}
        />

        {tab === 'chat' ? (
          <ChatScreen />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {tab === 'home'       && <HomeScreen setTab={setTab} />}
            {tab === 'leave'      && <LeaveScreen />}
            {tab === 'attendance' && <AttendanceScreen />}
            {tab === 'pay'        && <PayScreen />}
            {tab === 'profile'    && <ProfileScreen onLogout={onLogout} />}
          </ScrollView>
        )}

        <ToastOverlay message={toast} />

        <TabBar
          active={tab}
          onChange={setTab}
          pendingApprovals={pendingApprovals.length}
          unread={unread}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App(): React.ReactElement {
  const [loggedIn, setLoggedIn] = useState(false);
  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      </SafeAreaView>
    );
  }
  return (
    <EssProvider>
      <AppContent onLogout={() => setLoggedIn(false)} />
    </EssProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  // Header
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: hairline,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: { flex: 1 },
  headerApp: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: colors.text,
    fontSize: font.xl,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 1,
  },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  headerBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: 40,
  },
  headerBadge: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 17,
    justifyContent: 'center',
    minWidth: 17,
    paddingHorizontal: 2,
    position: 'absolute',
    right: 3,
    top: 3,
  },
  headerBadgeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
  headerAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  headerAvatarAI: { backgroundColor: colors.primaryDark },
  headerAvatarText: { color: colors.white, fontSize: font.sm, fontWeight: '800' },

  // Tab bar
  tabbar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: hairline,
    bottom: spacing.lg,
    flexDirection: 'row',
    left: spacing.lg,
    padding: spacing.sm,
    position: 'absolute',
    right: spacing.lg,
    ...shadowMd,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  tabIconWrap: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 34,
    justifyContent: 'center',
    position: 'relative',
    width: 34,
  },
  tabIconWrapActive: { backgroundColor: colors.primary },
  tabLabel: { color: colors.muted, fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
  tabLabelActive: { color: colors.primary, fontWeight: '700' },
  tabBadge: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 14,
    justifyContent: 'center',
    minWidth: 14,
    position: 'absolute',
    right: -3,
    top: -3,
  },
  tabBadgeText: { color: colors.white, fontSize: 7, fontWeight: '800' },

  // Toast
  toastWrap: { alignSelf: 'center', bottom: 100, position: 'absolute' },
  toast: {
    alignItems: 'center',
    backgroundColor: colors.text,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadowMd,
  },
  toastText: { color: colors.white, fontSize: font.sm, fontWeight: '600' },
});

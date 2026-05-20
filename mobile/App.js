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
import { colors, radius, shadow, spacing } from './src/theme';

const TABS = [
  { id: 'home',       label: 'Home',   icon: 'home-outline',        iconActive: 'home'        },
  { id: 'leave',      label: 'Leave',  icon: 'calendar-outline',    iconActive: 'calendar'    },
  { id: 'attendance', label: 'Time',   icon: 'time-outline',        iconActive: 'time'        },
  { id: 'pay',        label: 'Pay',    icon: 'wallet-outline',      iconActive: 'wallet'      },
  { id: 'profile',    label: 'Me',     icon: 'person-outline',      iconActive: 'person'      },
  { id: 'chat',       label: 'AI',     icon: 'chatbubble-outline',  iconActive: 'chatbubble'  },
];

function TabBar({ active, onChange, pendingApprovals, unread }) {
  return (
    <View style={styles.tabbar}>
      {TABS.map((tab) => {
        const selected = active === tab.id;
        const hasBadge =
          (tab.id === 'leave' && pendingApprovals > 0) ||
          (tab.id === 'profile' && unread > 0);
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
                name={selected ? tab.iconActive : tab.icon}
                size={20}
                color={selected ? '#fff' : colors.muted}
              />
              {hasBadge && !selected && <View style={styles.badge} />}
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

function AppHeader({ employee, tab }) {
  const TITLES = {
    home: 'Home',
    leave: 'Leave',
    attendance: 'Attendance',
    pay: 'Pay & Expenses',
    profile: 'My Profile',
    chat: 'AI Assistant',
  };
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerApp}>OpenHRCore ESS</Text>
        <Text style={styles.headerTitle}>{TITLES[tab] || 'Home'}</Text>
      </View>
      {tab === 'chat' ? (
        <View style={[styles.headerAvatar, styles.headerAvatarAI]}>
          <Ionicons name="sparkles" size={20} color="#fff" />
        </View>
      ) : (
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {employee.first[0]}{employee.last[0]}
          </Text>
        </View>
      )}
    </View>
  );
}

function ToastOverlay({ message }) {
  if (!message) return null;
  return (
    <View style={styles.toast} pointerEvents="none">
      <Ionicons name="checkmark-circle" size={14} color="#fff" />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

function AppContent({ onLogout }) {
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
        <AppHeader employee={employee} tab={tab} />

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

export default function App() {
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

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerApp: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 1,
  },
  headerAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerAvatarAI: {
    backgroundColor: colors.primaryDark,
  },
  headerAvatarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  tabbar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    bottom: spacing.lg,
    flexDirection: 'row',
    left: spacing.lg,
    padding: spacing.sm,
    position: 'absolute',
    right: spacing.lg,
    ...shadow,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 52,
  },
  tabIconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
    width: 32,
  },
  tabIconWrapActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  badge: {
    backgroundColor: colors.danger,
    borderColor: colors.surface,
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    position: 'absolute',
    right: -1,
    top: -1,
    width: 10,
  },

  toast: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.text,
    borderRadius: radius.full,
    bottom: 96,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    position: 'absolute',
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});

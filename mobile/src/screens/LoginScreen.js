import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui';
import { colors, radius, shadow, shadowMd, spacing } from '../theme';

export function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('saki@mercury.co');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = useCallback(() => {
    if (!email.trim()) { setError('Enter your work email'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => {
      onLogin({ email: email.trim() });
      setLoading(false);
    }, 700);
  }, [email, onLogin]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetters}>HR</Text>
          </View>
          <Text style={styles.appName}>OpenHRCore</Text>
          <Text style={styles.tagline}>Employee Self Service</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in to your account</Text>

          <Text style={styles.label}>Work email</Text>
          <TextInput
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
            placeholder="you@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.pwWrap}>
            <TextInput
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
              placeholder="••••••••"
              secureTextEntry={!showPw}
              style={[styles.input, styles.pwInput]}
              placeholderTextColor={colors.muted}
            />
            <Pressable
              style={styles.pwEye}
              onPress={() => setShowPw((v) => !v)}
              accessibilityLabel={showPw ? 'Hide password' : 'Show password'}
            >
              <Ionicons
                name={showPw ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.muted}
              />
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button onPress={submit} style={styles.loginBtn}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <Pressable style={styles.forgotRow}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>
          Demo: email is pre-filled · leave password empty
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>OpenHRCore · Open Source HRMS</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 72,
    paddingBottom: spacing.xxl,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 72,
    ...shadowMd,
  },
  logoLetters: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -1,
  },
  appName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    color: colors.muted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    width: '100%',
    ...shadowMd,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  loginBtn: {
    marginTop: spacing.xl,
  },
  forgotRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  forgotLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  pwWrap: {
    position: 'relative',
  },
  pwInput: {
    paddingRight: 48,
  },
  pwEye: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 48,
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  footer: {
    marginTop: spacing.xxl,
  },
  footerText: {
    color: colors.border,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

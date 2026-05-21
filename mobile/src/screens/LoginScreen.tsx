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
import { colors, font, hairline, radius, shadowLg, shadowMd, spacing } from '../theme';

export function LoginScreen({ onLogin }: { onLogin: (args: { email: string }) => void }): React.ReactElement {
  const [email, setEmail] = useState('saki@mercury.co');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const submit = useCallback(() => {
    if (!email.trim()) { setError('Enter your work email'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => { onLogin({ email: email.trim() }); setLoading(false); }, 700);
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
        {/* Logo mark */}
        <View style={styles.logoWrap}>
          <View style={styles.logoRing}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>HR</Text>
            </View>
          </View>
          <Text style={styles.appName}>OpenHRCore</Text>
          <Text style={styles.tagline}>Employee Self Service</Text>
        </View>

        {/* Sign-in form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Sign in</Text>
          <Text style={styles.formSub}>Use your work email to continue</Text>

          {/* Email field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Work email</Text>
            <View style={[styles.fieldWrap, emailFocused && styles.fieldFocused, !!error && styles.fieldError]}>
              <Ionicons
                name="mail-outline"
                size={17}
                color={emailFocused ? colors.primary : colors.muted}
                style={styles.fieldIcon}
              />
              <TextInput
                value={email}
                onChangeText={(v) => { setEmail(v); setError(''); }}
                placeholder="you@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.fieldInput}
                placeholderTextColor={colors.muted}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password field */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>Password</Text>
              <Pressable hitSlop={8} accessibilityRole="button">
                <Text style={styles.forgotText}>Forgot?</Text>
              </Pressable>
            </View>
            <View style={[styles.fieldWrap, pwFocused && styles.fieldFocused]}>
              <Ionicons
                name="lock-closed-outline"
                size={17}
                color={pwFocused ? colors.primary : colors.muted}
                style={styles.fieldIcon}
              />
              <TextInput
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                placeholder="••••••••"
                secureTextEntry={!showPw}
                style={[styles.fieldInput, styles.fieldInputPw]}
                placeholderTextColor={colors.muted}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
              />
              <Pressable onPress={() => setShowPw((v) => !v)} style={styles.eyeBtn} hitSlop={8}>
                <Ionicons
                  name={showPw ? 'eye-off-outline' : 'eye-outline'}
                  size={17}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={13} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button onPress={submit} style={styles.signInBtn} loading={loading}>
            Sign in
          </Button>
        </View>

        {/* Demo notice */}
        <View style={styles.demoRow}>
          <Ionicons name="information-circle-outline" size={14} color={colors.muted} />
          <Text style={styles.demoText}>Demo — email pre-filled, leave password empty</Text>
        </View>

        <Text style={styles.footer}>OpenHRCore · Open Source HRMS</Text>
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
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: 56,
  },

  // Logo
  logoWrap: { alignItems: 'center', gap: spacing.md },
  logoRing: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.xxl,
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    height: 72,
    justifyContent: 'center',
    width: 72,
    ...shadowMd,
  },
  logoText: { color: colors.white, fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  appName: { color: colors.text, fontSize: font.xxl, fontWeight: '900', letterSpacing: -0.5 },
  tagline: { color: colors.muted, fontSize: font.sm, letterSpacing: 0.3 },

  // Form card
  form: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: hairline,
    gap: 0,
    padding: spacing.xl,
    width: '100%',
    ...shadowLg,
  },
  formTitle: {
    color: colors.text,
    fontSize: font.xl,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  formSub: {
    color: colors.muted,
    fontSize: font.sm,
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },

  // Fields
  fieldGroup: { gap: spacing.xs, marginBottom: spacing.md },
  fieldLabelRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  fieldLabel: {
    color: colors.muted,
    fontSize: font.xs,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  forgotText: { color: colors.primary, fontSize: font.xs, fontWeight: '700' },
  fieldWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  fieldFocused: { borderColor: colors.primary, backgroundColor: colors.surface },
  fieldError: { borderColor: colors.danger },
  fieldIcon: { marginRight: spacing.sm },
  fieldInput: { color: colors.text, flex: 1, fontSize: font.md, paddingVertical: spacing.md },
  fieldInputPw: { paddingRight: 40 },
  eyeBtn: { height: 44, width: 44, alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 0 },

  errorRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm, marginTop: -spacing.xs },
  errorText: { color: colors.danger, fontSize: font.sm },

  signInBtn: { marginTop: spacing.sm },

  // Footer
  demoRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
  },
  demoText: { color: colors.muted, flex: 1, fontSize: font.xs },
  footer: { color: colors.border, fontSize: font.xs, fontWeight: '600', letterSpacing: 0.3 },
});

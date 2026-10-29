import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config/constants';

const LoginScreen = ({ navigation }) => {
  const { login, register, loginWithDemo, serverOnline, serverUrl } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter your college email and password.');
      return;
    }

    if (isSignUp && (!fullName.trim() || !studentId.trim())) {
      Alert.alert('Required', 'Please enter your full name and student ID.');
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await register(email.trim(), password, fullName.trim(), studentId.trim());
        Alert.alert(
          '🎉 Account Created!',
          'Your account has been registered. You are now logged in!'
        );
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      Alert.alert(isSignUp ? 'Registration Error' : 'Login Failed', err.message || 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (role) => {
    try {
      setLoading(true);
      await loginWithDemo(role);
    } catch (e) {
      Alert.alert('Error', 'Failed to load demo profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={[styles.logoIcon, shadows.md]}>
              <Ionicons name="sparkles" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>CampusCoins</Text>
            <Text style={styles.tagline}>
              Report Campus Issues • Earn Coins • Win Rewards
            </Text>

            {/* Server Connection Badge */}
            <View
              style={[
                styles.serverBadge,
                { backgroundColor: serverOnline ? '#EAF6EE' : '#FEF3C7' },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: serverOnline ? '#168451' : '#F59E0B' },
                ]}
              />
              <Text
                style={[
                  styles.serverText,
                  { color: serverOnline ? '#168451' : '#B45309' },
                ]}
              >
                {serverOnline ? 'Backend Online' : 'Offline Demo Mode'}
              </Text>
            </View>
          </View>

          {/* Login / Register Card */}
          <View style={[styles.card, shadows.md]}>
            <Text style={styles.cardTitle}>
              {isSignUp ? 'Create Student Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isSignUp
                ? 'Join CampusCoins to report issues and earn rewards'
                : 'Log in with your college account to continue'}
            </Text>

            {/* Full Name Field (Sign Up only) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Alex Rivera"
                    placeholderTextColor={colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>
            )}

            {/* Student ID Field (Sign Up only) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Student ID / Roll No</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="school-outline"
                    size={18}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. STU-2024-8842"
                    placeholderTextColor={colors.textMuted}
                    value={studentId}
                    onChangeText={setStudentId}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>College Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. alex.rivera@campus.edu"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={isSignUp ? 'Create password (min 8 chars)' : 'Enter your password'}
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Sign In / Sign Up */}
            <TouchableOpacity
              style={styles.switchAuthBtn}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchAuthText}>
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <Text style={styles.switchAuthTextBold}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR QUICK DEMO LOGIN</Text>
              <View style={styles.divider} />
            </View>

            {/* Quick Demo Switchers */}
            <View style={styles.demoButtonsContainer}>
              <TouchableOpacity
                style={[styles.demoButton, { borderColor: colors.primary }]}
                onPress={() => handleDemoSelect(ROLES.STUDENT)}
                disabled={loading}
              >
                <Ionicons name="school" size={16} color={colors.primary} />
                <View style={styles.demoTextCol}>
                  <Text style={[styles.demoRoleTitle, { color: colors.primary }]}>
                    Student
                  </Text>
                  <Text style={styles.demoName}>Alex Rivera</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoButton, { borderColor: '#2563EB' }]}
                onPress={() => handleDemoSelect(ROLES.STAFF)}
                disabled={loading}
              >
                <Ionicons name="construct" size={16} color="#2563EB" />
                <View style={styles.demoTextCol}>
                  <Text style={[styles.demoRoleTitle, { color: '#2563EB' }]}>
                    Staff
                  </Text>
                  <Text style={styles.demoName}>David Vance</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoButton, { borderColor: '#7C3AED' }]}
                onPress={() => handleDemoSelect(ROLES.ADMIN)}
                disabled={loading}
              >
                <Ionicons name="shield-checkmark" size={16} color="#7C3AED" />
                <View style={styles.demoTextCol}>
                  <Text style={[styles.demoRoleTitle, { color: '#7C3AED' }]}>
                    Admin
                  </Text>
                  <Text style={styles.demoName}>Dr. Eleanor</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  serverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  serverText: {
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  eyeIcon: {
    padding: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  switchAuthBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  switchAuthText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  switchAuthTextBold: {
    color: colors.primary,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  demoButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  demoButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  demoTextCol: {
    alignItems: 'center',
    marginTop: 4,
  },
  demoRoleTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  demoName: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default LoginScreen;

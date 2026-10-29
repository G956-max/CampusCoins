import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config/constants';

const ProfileScreen = ({ navigation }) => {
  const {
    profile,
    wallet,
    serverOnline,
    serverUrl,
    updateServerUrl,
    loginWithDemo,
    logout,
  } = useAuth();

  const [customIp, setCustomIp] = useState(serverUrl);
  const [editingServer, setEditingServer] = useState(false);

  useEffect(() => {
    if (serverUrl) setCustomIp(serverUrl);
  }, [serverUrl]);

  const displayName = profile?.full_name || 'Alex Rivera';
  const email = profile?.email || 'alex.rivera@campus.edu';
  const role = profile?.role || 'student';
  const studentId = profile?.student_id || profile?.studentId || 'STU-2024-8842';
  const department = profile?.department || 'Computer Science & Engineering';

  const handleSaveServer = async () => {
    if (!customIp.trim()) return;
    const ok = await updateServerUrl(customIp);
    if (ok) {
      Alert.alert('Connected', 'Server connection verified successfully!');
      setEditingServer(false);
    } else {
      Alert.alert('Notice', 'Could not reach server at this address. Check if backend is running.');
      setEditingServer(false);
    }
  };

  const handleRoleSwitch = async (targetRole) => {
    await loginWithDemo(targetRole);
    Alert.alert('Role Switched', `Logged in as ${targetRole.toUpperCase()}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Student ID Card */}
        <View style={[styles.idCard, shadows.md]}>
          <View style={styles.idCardHeader}>
            <View style={styles.idCardBrand}>
              <Ionicons name="sparkles" size={14} color="#FFF" />
              <Text style={styles.idCardBrandText}>CAMPUSCOINS STUDENT ID</Text>
            </View>
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>ACTIVE</Text>
            </View>
          </View>

          <View style={styles.idCardBody}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.idCardInfo}>
              <Text style={styles.idName}>{displayName}</Text>
              <Text style={styles.idEmail}>{email}</Text>
              <View style={styles.idBadgeRow}>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>{studentId}</Text>
                </View>
                <View style={[styles.idBadge, { backgroundColor: '#E0E7FF' }]}>
                  <Text style={[styles.idBadgeText, { color: '#4338CA' }]}>
                    {role.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.idCardFooter}>
            <View>
              <Text style={styles.footerLabel}>DEPARTMENT</Text>
              <Text style={styles.footerVal}>{department}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>COIN BALANCE</Text>
              <Text style={styles.footerVal}>{wallet?.balance ?? 480} CC</Text>
            </View>
          </View>
        </View>

        {/* Quick Nav Rows */}
        <View style={[styles.menuCard, shadows.sm]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Wallet')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="wallet-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Wallet & Transactions</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Missions')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="checkbox-outline" size={18} color="#DB2777" />
            </View>
            <Text style={styles.menuText}>Missions & Achievements</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="trophy-outline" size={18} color={colors.coin} />
            </View>
            <Text style={styles.menuText}>Campus Leaderboard</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Switch Demo Role */}
        <Text style={styles.sectionHeading}>Switch Role (Demo Mode)</Text>
        <View style={styles.demoRoleRow}>
          <TouchableOpacity
            style={[
              styles.demoRoleBtn,
              role === 'student' && styles.demoRoleBtnActive,
            ]}
            onPress={() => handleRoleSwitch(ROLES.STUDENT)}
          >
            <Ionicons name="school" size={18} color={role === 'student' ? '#FFF' : colors.primary} />
            <Text style={[styles.demoRoleText, role === 'student' && styles.demoRoleTextActive]}>
              Student
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.demoRoleBtn,
              role === 'staff' && styles.demoRoleBtnActive,
            ]}
            onPress={() => handleRoleSwitch(ROLES.STAFF)}
          >
            <Ionicons name="construct" size={18} color={role === 'staff' ? '#FFF' : '#2563EB'} />
            <Text style={[styles.demoRoleText, role === 'staff' && styles.demoRoleTextActive]}>
              Staff
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.demoRoleBtn,
              role === 'admin' && styles.demoRoleBtnActive,
            ]}
            onPress={() => handleRoleSwitch(ROLES.ADMIN)}
          >
            <Ionicons name="shield-checkmark" size={18} color={role === 'admin' ? '#FFF' : '#7C3AED'} />
            <Text style={[styles.demoRoleText, role === 'admin' && styles.demoRoleTextActive]}>
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Server IP Config (Crucial for testing on mobile device over Wi-Fi) */}
        <Text style={styles.sectionHeading}>Server Connection</Text>
        <View style={[styles.serverCard, shadows.sm]}>
          <View style={styles.serverRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: serverOnline ? '#168451' : '#F59E0B' },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.serverStatusText}>
                {serverOnline ? 'Connected to Backend' : 'Offline Mode (Local Fallback)'}
              </Text>
              <Text style={styles.serverUrlText}>{serverUrl}</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setEditingServer(!editingServer)}
            >
              <Ionicons name="settings-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {editingServer && (
            <View style={styles.editServerBox}>
              <Text style={styles.editServerHint}>
                If running Expo Go on your physical phone, enter your computer&apos;s Wi-Fi IP (e.g. http://192.168.1.5:5000):
              </Text>
              <TextInput
                style={styles.serverInput}
                value={customIp}
                onChangeText={setCustomIp}
                placeholder="http://192.168.x.x:5000"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.saveServerBtn} onPress={handleSaveServer}>
                <Text style={styles.saveServerBtnText}>Test & Save Connection</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  idCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  idCardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  idCardBrandText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  activeTag: {
    backgroundColor: '#168451',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  idCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  idCardInfo: {
    flex: 1,
  },
  idName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  idEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  idBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  idBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  footerLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },
  footerVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 14,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  demoRoleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  demoRoleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 12,
  },
  demoRoleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  demoRoleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  demoRoleTextActive: {
    color: '#FFFFFF',
  },
  serverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  serverStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  serverUrlText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    padding: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  editServerBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  editServerHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  serverInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: colors.text,
    marginBottom: 8,
  },
  saveServerBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveServerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    height: 48,
    marginTop: 4,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProfileScreen;


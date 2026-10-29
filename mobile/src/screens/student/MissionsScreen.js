import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import Header from '../../components/common/Header';
import { gamificationApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_MISSIONS = [
  {
    id: 'm1',
    title: 'Report Your First Issue of the Week',
    reward: 50,
    progress: 1,
    target: 1,
    claimed: false,
    icon: 'camera',
  },
  {
    id: 'm2',
    title: 'Upvote 3 Verified Campus Issues',
    reward: 20,
    progress: 3,
    target: 3,
    claimed: true,
    icon: 'arrow-up-circle',
  },
  {
    id: 'm3',
    title: 'Confirm Resolution for a Fixed Issue',
    reward: 30,
    progress: 0,
    target: 1,
    claimed: false,
    icon: 'checkmark-done-circle',
  },
  {
    id: 'm4',
    title: 'Maintain 3-Day CampusCoins Streak',
    reward: 40,
    progress: 2,
    target: 3,
    claimed: false,
    icon: 'flame',
  },
];

const DEFAULT_BADGES = [
  { id: 'b1', name: 'Campus Pioneer', desc: 'First reported issue', unlocked: true, icon: 'shield-checkmark' },
  { id: 'b2', name: 'Eagle Eye', desc: 'Report 5 electrical issues', unlocked: true, icon: 'flash' },
  { id: 'b3', name: 'Green Sentinel', desc: 'Report 5 sanitation issues', unlocked: true, icon: 'leaf' },
  { id: 'b4', name: 'Campus Hero', desc: 'Reach 1000 CampusCoins', unlocked: false, icon: 'trophy' },
];

const MissionsScreen = ({ navigation }) => {
  const { refreshWallet } = useAuth();
  const [missions, setMissions] = useState(DEFAULT_MISSIONS);
  const [badges, setBadges] = useState(DEFAULT_BADGES);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const res = await gamificationApi.getMissions();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) {
        setMissions(
          list.map((m) => ({
            id: m.id,
            title: m.title || m.name || 'Campus Quest',
            reward: m.reward_coins || m.reward || 30,
            progress: m.progress ?? m.current_count ?? 1,
            target: m.target ?? m.target_count ?? 1,
            claimed: Boolean(m.claimed || m.is_claimed),
            icon: m.icon || 'checkbox',
          }))
        );
      }

      // Also load badges
      const badgeRes = await gamificationApi.getBadges();
      const badgeList = Array.isArray(badgeRes?.data) ? badgeRes.data : Array.isArray(badgeRes) ? badgeRes : [];
      if (badgeList.length > 0) {
        setBadges(
          badgeList.map((b) => ({
            id: b.id,
            name: b.name || b.title,
            desc: b.description || b.desc,
            unlocked: Boolean(b.unlocked || b.is_unlocked),
            icon: b.icon || 'trophy',
          }))
        );
      }
    } catch (e) {
      // Use defaults
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMissions();
    setRefreshing(false);
  };

  const handleClaim = async (mission) => {
    if (mission.claimed) return;
    if (mission.progress < mission.target) {
      Alert.alert('Incomplete', 'Complete the task first to claim your coin reward!');
      return;
    }

    try {
      await gamificationApi.claimMission(mission.id);
    } catch (e) {}

    setMissions((prev) =>
      prev.map((m) => (m.id === mission.id ? { ...m, claimed: true } : m))
    );

    await refreshWallet();

    Alert.alert(
      '🎉 Reward Claimed!',
      `You earned +${mission.reward} CampusCoins for completing "${mission.title}"!`
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        showBack
        onBack={() => navigation.goBack()}
        title="Missions & Badges"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Streak Banner */}
        <View style={[styles.streakCard, shadows.sm]}>
          <View style={styles.streakIconCircle}>
            <Ionicons name="flame" size={26} color="#EA580C" />
          </View>
          <View style={styles.streakTextCol}>
            <Text style={styles.streakTitle}>3-Day Active Streak 🔥</Text>
            <Text style={styles.streakSubtitle}>
              Log in daily and contribute to campus upkeep to earn bonus coins!
            </Text>
          </View>
        </View>

        {/* Section: Missions */}
        <Text style={styles.sectionTitle}>Weekly Quests & Missions</Text>

        {missions.map((m) => {
          const isComplete = m.progress >= m.target;
          return (
            <View key={m.id} style={[styles.missionCard, shadows.sm]}>
              <View style={styles.missionTop}>
                <View style={styles.missionIcon}>
                  <Ionicons name={m.icon || 'checkbox'} size={20} color={colors.primary} />
                </View>
                <View style={styles.missionDetails}>
                  <Text style={styles.missionTitle}>{m.title}</Text>
                  <View style={styles.progressRow}>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(100, (m.progress / m.target) * 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressCount}>
                      {m.progress}/{m.target}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.claimBtn,
                    m.claimed
                      ? styles.claimBtnClaimed
                      : isComplete
                      ? styles.claimBtnReady
                      : styles.claimBtnLocked,
                  ]}
                  onPress={() => handleClaim(m)}
                  disabled={m.claimed}
                >
                  <Text
                    style={[
                      styles.claimBtnText,
                      m.claimed && styles.claimBtnTextClaimed,
                    ]}
                  >
                    {m.claimed ? 'Claimed' : `+${m.reward} CC`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Section: Badges */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>My Campus Badges</Text>
        <View style={styles.badgesGrid}>
          {badges.map((b) => (
            <View
              key={b.id}
              style={[
                styles.badgeCard,
                shadows.sm,
                !b.unlocked && styles.badgeCardLocked,
              ]}
            >
              <View
                style={[
                  styles.badgeIconWrapper,
                  !b.unlocked && { backgroundColor: '#F1F5F9' },
                ]}
              >
                <Ionicons
                  name={b.icon}
                  size={24}
                  color={b.unlocked ? colors.primary : colors.textMuted}
                />
              </View>
              <Text style={styles.badgeName}>{b.name}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
              {b.unlocked ? (
                <View style={styles.unlockedTag}>
                  <Text style={styles.unlockedText}>Unlocked</Text>
                </View>
              ) : (
                <View style={styles.lockedTag}>
                  <Text style={styles.lockedText}>Locked</Text>
                </View>
              )}
            </View>
          ))}
        </View>
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
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  streakIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTextCol: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
  },
  streakSubtitle: {
    fontSize: 11,
    color: '#C2410C',
    marginTop: 2,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  missionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  missionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionDetails: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  claimBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  claimBtnReady: {
    backgroundColor: colors.primary,
  },
  claimBtnLocked: {
    backgroundColor: '#F1F5F9',
  },
  claimBtnClaimed: {
    backgroundColor: '#E2E8F0',
  },
  claimBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  claimBtnTextClaimed: {
    color: '#94A3B8',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  unlockedTag: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unlockedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  lockedTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
});

export default MissionsScreen;


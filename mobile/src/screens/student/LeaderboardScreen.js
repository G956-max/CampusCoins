import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import Header from '../../components/common/Header';
import { gamificationApi } from '../../api';

const DEFAULT_LEADERBOARD = [
  {
    rank: 1,
    name: 'Priya Sundaram',
    department: 'Electrical & Electronics',
    coins: 1250,
    resolved: 24,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  {
    rank: 2,
    name: 'Rahul Verma',
    department: 'Mechanical Engineering',
    coins: 980,
    resolved: 19,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    rank: 3,
    name: 'Ananya Iyer',
    department: 'Civil Engineering',
    coins: 740,
    resolved: 15,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    rank: 4,
    name: 'Alex Rivera (You)',
    department: 'Computer Science',
    coins: 480,
    resolved: 12,
    isCurrent: true,
  },
  {
    rank: 5,
    name: 'Karthik Raja',
    department: 'Information Tech',
    coins: 420,
    resolved: 10,
  },
  {
    rank: 6,
    name: 'Sneha Mohan',
    department: 'Biotechnology',
    coins: 360,
    resolved: 8,
  },
  {
    rank: 7,
    name: 'Vikram Seth',
    department: 'Chemical Eng',
    coins: 290,
    resolved: 6,
  },
];

const LeaderboardScreen = ({ navigation }) => {
  const [leaderboard, setLeaderboard] = useState(DEFAULT_LEADERBOARD);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await gamificationApi.getLeaderboard();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) {
        setLeaderboard(
          list.map((item, idx) => ({
            rank: item.rank || idx + 1,
            name: item.displayName || item.full_name || item.name || `Student ${idx + 1}`,
            department: item.department || item.departments?.name || 'Engineering',
            coins: item.impactScore || item.coins || item.balance || 0,
            resolved: item.resolved || item.complaints_resolved || item.level || 0,
            isCurrent: Boolean(item.isCurrent),
          }))
        );
      }
    } catch (e) {
      // Use defaults
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        showBack
        onBack={() => navigation.goBack()}
        title="Campus Leaderboard"
      />

      <FlatList
        data={remaining}
        keyExtractor={(item) => String(item.rank)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Header info */}
            <View style={styles.podiumBanner}>
              <Text style={styles.podiumSubtitle}>TOP CAMPUS REPORTERS</Text>
              <Text style={styles.podiumTitle}>Honor Roll of Problem Solvers</Text>
            </View>

            {/* Top 3 Podium */}
            <View style={styles.podiumContainer}>
              {/* Rank 2 (Left) */}
              {top3[1] && (
                <View style={[styles.podiumCol, { marginTop: 24 }]}>
                  <View style={[styles.avatarCircle, { borderColor: '#94A3B8' }]}>
                    <Text style={styles.avatarInitials}>
                      {top3[1].name.charAt(0)}
                    </Text>
                    <View style={[styles.rankMedal, { backgroundColor: '#94A3B8' }]}>
                      <Text style={styles.rankMedalText}>2</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3[1].name}
                  </Text>
                  <Text style={styles.podiumCoins}>{top3[1].coins} CC</Text>
                </View>
              )}

              {/* Rank 1 (Center) */}
              {top3[0] && (
                <View style={styles.podiumCol}>
                  <Ionicons name="crown" size={24} color="#F59E0B" style={{ marginBottom: 4 }} />
                  <View style={[styles.avatarCircle, styles.avatarCircleGold]}>
                    <Text style={styles.avatarInitials}>
                      {top3[0].name.charAt(0)}
                    </Text>
                    <View style={[styles.rankMedal, { backgroundColor: '#F59E0B' }]}>
                      <Text style={styles.rankMedalText}>1</Text>
                    </View>
                  </View>
                  <Text style={[styles.podiumName, { fontWeight: '800' }]} numberOfLines={1}>
                    {top3[0].name}
                  </Text>
                  <Text style={[styles.podiumCoins, { color: colors.coin }]}>
                    {top3[0].coins} CC
                  </Text>
                </View>
              )}

              {/* Rank 3 (Right) */}
              {top3[2] && (
                <View style={[styles.podiumCol, { marginTop: 32 }]}>
                  <View style={[styles.avatarCircle, { borderColor: '#D97706' }]}>
                    <Text style={styles.avatarInitials}>
                      {top3[2].name.charAt(0)}
                    </Text>
                    <View style={[styles.rankMedal, { backgroundColor: '#D97706' }]}>
                      <Text style={styles.rankMedalText}>3</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3[2].name}
                  </Text>
                  <Text style={styles.podiumCoins}>{top3[2].coins} CC</Text>
                </View>
              )}
            </View>

            <Text style={styles.ranksHeader}>Campus Rankings</Text>
          </>
        }
        renderItem={({ item }) => {
          const isMe = item.isCurrent || item.name.includes('You');
          return (
            <View
              style={[
                styles.rankItem,
                shadows.sm,
                isMe && styles.rankItemHighlight,
              ]}
            >
              <View style={styles.rankNumWrapper}>
                <Text style={[styles.rankNumText, isMe && { color: colors.primary }]}>
                  #{item.rank}
                </Text>
              </View>

              <View style={styles.userCol}>
                <Text style={[styles.userName, isMe && { color: colors.primary }]}>
                  {item.name}
                </Text>
                <Text style={styles.userDept}>{item.department}</Text>
              </View>

              <View style={styles.coinCol}>
                <View style={styles.coinPill}>
                  <Ionicons name="sparkles" size={12} color={colors.coin} />
                  <Text style={styles.coinCount}>{item.coins}</Text>
                </View>
                <Text style={styles.resolvedCount}>
                  {item.resolved} resolved
                </Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  podiumBanner: {
    alignItems: 'center',
    marginBottom: 16,
  },
  podiumSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  podiumTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  podiumCol: {
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircleGold: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  rankMedal: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankMedalText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  podiumCoins: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    marginTop: 2,
  },
  ranksHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankItemHighlight: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  rankNumWrapper: {
    width: 32,
    alignItems: 'center',
  },
  rankNumText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  userCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  userDept: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  coinCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.coinBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  coinCount: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.coin,
  },
  resolvedCount: {
    fontSize: 10,
    color: colors.textMuted,
  },
});

export default LeaderboardScreen;


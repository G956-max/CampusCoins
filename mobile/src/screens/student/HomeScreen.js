import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { complaintsApi, gamificationApi } from '../../api';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import StatCard from '../../components/common/StatCard';
import { MOCK_STUDENT_DATA } from '../../constants/mockData';

const HomeScreen = ({ navigation }) => {
  const { profile, wallet, refreshWallet } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentComplaints, setRecentComplaints] = useState(
    MOCK_STUDENT_DATA.recentComplaints || []
  );

  const role = profile?.role || 'student';
  const isStaff = role === 'staff';
  const isAdmin = role === 'admin';
  const displayName = profile?.full_name || (isStaff ? 'David Vance' : isAdmin ? 'Dr. Eleanor Vance' : 'Alex Rivera');
  const department = profile?.department || 'Computer Science & Engineering';
  const coinBalance = wallet?.balance ?? 480;

  const loadData = useCallback(async () => {
    try {
      refreshWallet();
      const res = await complaintsApi.getMyComplaints({ limit: 5 });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) {
        setRecentComplaints(list);
      }
    } catch (e) {
      // Keep mock complaints as fallback
    }
  }, [refreshWallet]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => navigation.navigate('ProfileTab')}
          activeOpacity={0.8}
        >
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarLetter}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.greetingText}>Welcome back 👋</Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.coinPill}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Ionicons name="sparkles" size={14} color={colors.coin} />
          <Text style={styles.coinAmount}>{coinBalance}</Text>
          <Text style={styles.coinUnit}>Coins</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Quick Report Banner */}
        <View style={[styles.heroCard, shadows.md]}>
          <View style={styles.heroContent}>
            <View style={styles.heroTextCol}>
              <View style={styles.heroBadge}>
                <Ionicons name={isStaff ? 'construct' : isAdmin ? 'shield-checkmark' : 'flash'} size={12} color="#FFFFFF" />
                <Text style={styles.heroBadgeText}>
                  {isStaff ? 'STAFF CONSOLE' : isAdmin ? 'ADMIN OVERSIGHT' : 'EARN REWARDS'}
                </Text>
              </View>
              <Text style={styles.heroTitle}>
                {isStaff
                  ? 'Maintenance Task Queue'
                  : isAdmin
                  ? 'Campus Infrastructure Pulse'
                  : 'See an issue on campus?'}
              </Text>
              <Text style={styles.heroSubtitle}>
                {isStaff
                  ? 'Review, start work, and post updates on assigned facility tickets'
                  : isAdmin
                  ? 'Real-time university maintenance, response SLAs & audit tracking'
                  : 'Snap a photo, report broken items & earn up to 50 CampusCoins!'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.reportActionButton}
            activeOpacity={0.85}
            onPress={() => (isStaff || isAdmin ? navigation.navigate('ComplaintsTab') : navigation.navigate('ReportTab'))}
          >
            <Ionicons name={isStaff || isAdmin ? 'list' : 'add-circle'} size={18} color={colors.primary} />
            <Text style={styles.reportActionText}>
              {isStaff ? 'Review Maintenance Queue' : isAdmin ? 'View All Complaints' : 'Report New Issue'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ComplaintsTab')}
          >
            <StatCard
              title="My Reports"
              value={String(recentComplaints.length || 12)}
              icon="document-text"
              color={colors.primary}
              bgColor={colors.primaryLight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ComplaintsTab')}
          >
            <StatCard
              title="Resolved"
              value={String(recentComplaints.filter(c => (c.status || '').toLowerCase() === 'resolved').length || 9)}
              icon="checkmark-circle"
              color="#2563EB"
              bgColor="#DBEAFE"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <StatCard
              title="Campus Rank"
              value="#4"
              icon="trophy"
              color={colors.coin}
              bgColor={colors.coinBg}
            />
          </TouchableOpacity>
        </View>

        {/* Action Shortcuts */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('RewardsTab')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="gift" size={20} color={colors.coin} />
            </View>
            <Text style={styles.shortcutText}>Store</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="podium" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.shortcutText}>Ranks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('Missions')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="checkbox" size={20} color="#DB2777" />
            </View>
            <Text style={styles.shortcutText}>Missions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('Wallet')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="wallet" size={20} color={colors.primary} />
            </View>
            <Text style={styles.shortcutText}>Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Recent Complaints */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recent Campus Activity</Text>
            <Text style={styles.sectionSubtitle}>
              Live updates on reported maintenance & facilities
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ComplaintsTab')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentComplaints.map((item, index) => (
          <ComplaintCard
            key={item.id || index}
            complaint={item}
            onPress={() =>
              navigation.navigate('ComplaintDetail', {
                complaintId: item.id,
                complaint: item,
              })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  greetingText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.coinBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.coinBorder,
  },
  coinAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.coin,
  },
  coinUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.coin,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  heroContent: {
    marginBottom: 14,
  },
  heroTextCol: {
    gap: 4,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    lineHeight: 16,
  },
  reportActionButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  reportActionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutBtn: {
    alignItems: 'center',
    gap: 6,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default HomeScreen;

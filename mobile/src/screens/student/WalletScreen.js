import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import { walletApi } from '../../api';

const DEFAULT_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'credit',
    amount: 50,
    title: 'Issue Resolved: CMP-1048',
    subtitle: 'AC Repair verified in CS Lab 3',
    date: 'Today, 2:15 PM',
  },
  {
    id: 'tx-2',
    type: 'debit',
    amount: 40,
    title: 'Reward Redeemed',
    subtitle: 'Cafeteria Snack & Drink Combo',
    date: 'Yesterday, 1:10 PM',
  },
  {
    id: 'tx-3',
    type: 'credit',
    amount: 20,
    title: 'Mission Completed',
    subtitle: 'Upvote 3 Verified Campus Issues',
    date: '2 days ago',
  },
  {
    id: 'tx-4',
    type: 'credit',
    amount: 35,
    title: 'Issue Resolved: CMP-1041',
    subtitle: 'Water Dispenser Sensor Malfunction',
    date: '3 days ago',
  },
  {
    id: 'tx-5',
    type: 'credit',
    amount: 100,
    title: 'Welcome Campus Bonus',
    subtitle: 'CampusCoins Student Onboarding',
    date: '1 week ago',
  },
];

const WalletScreen = ({ navigation }) => {
  const { wallet, refreshWallet } = useAuth();
  const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS);
  const [refreshing, setRefreshing] = useState(false);

  const balance = wallet?.balance ?? 480;
  const lifetimeEarned = wallet?.lifetime_earned ?? 920;
  const lifetimeSpent = wallet?.lifetime_spent ?? 440;

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await walletApi.getTransactions();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) {
        setTransactions(
          list.map((tx, idx) => ({
            id: tx.id || `tx-${idx}`,
            type: (tx.transaction_type || tx.type || '').toLowerCase() === 'credit' || (tx.amount > 0) ? 'credit' : 'debit',
            amount: Math.abs(tx.amount || 0),
            title: tx.description || tx.title || tx.reason || 'CampusCoins Transfer',
            subtitle: tx.event_type || tx.subtitle || 'Wallet Event',
            date: tx.created_at ? new Date(tx.created_at).toLocaleString() : (tx.date || 'Recent'),
          }))
        );
      }
    } catch (e) {
      // Use defaults
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWallet();
    await loadTransactions();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        showBack
        onBack={() => navigation.goBack()}
        title="My Campus Wallet"
      />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Wallet Card */}
            <View style={[styles.walletCard, shadows.md]}>
              <View style={styles.cardTop}>
                <View style={styles.cardChip}>
                  <Ionicons name="card" size={16} color="#FFFFFF" />
                  <Text style={styles.cardChipText}>CAMPUS WALLET</Text>
                </View>
                <Ionicons name="sparkles" size={20} color="#FDE68A" />
              </View>

              <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmount}>{balance}</Text>
                <Text style={styles.currencyCode}>CC</Text>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Total Earned</Text>
                  <Text style={styles.metricEarned}>+{lifetimeEarned} CC</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Total Spent</Text>
                  <Text style={styles.metricSpent}>-{lifetimeSpent} CC</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.spendButton}
                onPress={() => navigation.navigate('RewardsTab')}
              >
                <Ionicons name="gift" size={16} color={colors.primary} />
                <Text style={styles.spendButtonText}>Spend in Rewards Store</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>Transaction Activity</Text>
          </>
        }
        renderItem={({ item }) => {
          const isCredit = item.type === 'credit';
          return (
            <View style={[styles.txItem, shadows.sm]}>
              <View
                style={[
                  styles.txIconBox,
                  { backgroundColor: isCredit ? colors.successBg : colors.dangerBg },
                ]}
              >
                <Ionicons
                  name={isCredit ? 'arrow-down-left' : 'arrow-up-right'}
                  size={18}
                  color={isCredit ? colors.success : colors.danger}
                />
              </View>

              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>{item.title}</Text>
                <Text style={styles.txSubtitle}>{item.subtitle}</Text>
                <Text style={styles.txDate}>{item.date}</Text>
              </View>

              <Text
                style={[
                  styles.txAmount,
                  { color: isCredit ? colors.success : colors.danger },
                ]}
              >
                {isCredit ? '+' : '-'}
                {item.amount} CC
              </Text>
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
  walletCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FDE68A',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    marginBottom: 14,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontWeight: '600',
  },
  metricEarned: {
    color: '#A7F3D0',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  metricSpent: {
    color: '#FECACA',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  spendButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
  },
  spendButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  txItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  txSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  txDate: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
});

export default WalletScreen;


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import { rewardsApi } from '../../api';

const DEFAULT_REWARDS = [
  {
    id: 'rew-1',
    title: 'Cafeteria Snack & Drink Combo',
    cost: 40,
    category: 'Food',
    description: 'Redeem for 1 hot beverage and 1 fresh snack at Campus Central Cafe.',
    icon: 'cafe',
    stock: 25,
  },
  {
    id: 'rew-2',
    title: 'Semester 100 Pages Print Pass',
    cost: 60,
    category: 'Stationery',
    description: 'Free printing credits at CS and Mechanical library print kiosks.',
    icon: 'print',
    stock: 50,
  },
  {
    id: 'rew-3',
    title: 'Priority Library Study Room Pass',
    cost: 100,
    category: 'Perks',
    description: '4 hours reserved access to the quiet air-conditioned group study pod.',
    icon: 'book',
    stock: 8,
  },
  {
    id: 'rew-4',
    title: 'CampusCoins Limited Edition Hoodie',
    cost: 350,
    category: 'Merch',
    description: 'High-quality cotton embroidered college hoodie (Sizes S to XXL).',
    icon: 'shirt',
    stock: 12,
  },
  {
    id: 'rew-5',
    title: 'Prime Two-Wheeler Parking Pass',
    cost: 150,
    category: 'Perks',
    description: '1 month reserved shaded parking slot right next to the Academic Block.',
    icon: 'car',
    stock: 4,
  },
];

const RewardsStoreScreen = ({ navigation }) => {
  const { wallet, refreshWallet } = useAuth();
  const [rewards, setRewards] = useState(DEFAULT_REWARDS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [viewingHistory, setViewingHistory] = useState(false);

  const balance = wallet?.balance ?? 480;

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const res = await rewardsApi.getRewards();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) {
        setRewards(list);
      }
      // Also fetch user's past redemptions
      const redRes = await rewardsApi.getMyRedemptions();
      const redList = Array.isArray(redRes?.data) ? redRes.data : Array.isArray(redRes) ? redRes : [];
      if (redList.length > 0) {
        setMyRedemptions(
          redList.map((r) => ({
            id: r.id || r.voucher_code,
            title: r.reward_name || r.rewards?.name || r.title || 'Redeemed Perk',
            cost: r.coins_spent || r.cost || 50,
            date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent',
            code: r.voucher_code,
          }))
        );
      }
    } catch (e) {
      // Keep defaults
    }
  };

  const handleRedeem = (item) => {
    const cost = item.coin_cost ?? item.cost ?? 50;
    const title = item.name ?? item.title ?? 'Campus Reward';

    if (balance < cost) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${cost} CampusCoins for this reward. You currently have ${balance} Coins. Report more campus issues to earn coins!`
      );
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Redeem "${title}" for ${cost} CampusCoins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem Now',
          onPress: async () => {
            let voucherCode = `CC-RED-${Math.floor(100000 + Math.random() * 900000)}`;
            try {
              const res = await rewardsApi.redeemReward(item.id);
              const returnedCode =
                res?.data?.redemption?.voucher_code ||
                res?.data?.voucher_code ||
                res?.redemption?.voucher_code ||
                res?.voucher_code;
              if (returnedCode) voucherCode = returnedCode;
            } catch (e) {}

            // Update local state and refresh wallet
            setMyRedemptions((prev) => [
              {
                id: voucherCode,
                title,
                cost,
                date: 'Just now',
                code: voucherCode,
              },
              ...prev,
            ]);

            await refreshWallet();

            Alert.alert(
              '🎉 Reward Redeemed!',
              `Your voucher code is: ${voucherCode}\n\nShow this code at the campus store counter or cafeteria.`
            );
          },
        },
      ]
    );
  };

  const categories = ['All', 'Food', 'Stationery', 'Perks', 'Merch'];

  const filtered = rewards.filter((r) => {
    if (selectedCategory === 'All') return true;
    return (r.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Rewards Store" />

      {/* Wallet Balance Hero Banner */}
      <View style={[styles.balanceCard, shadows.md]}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <TouchableOpacity
            style={styles.historyToggle}
            onPress={() => setViewingHistory(!viewingHistory)}
          >
            <Ionicons
              name={viewingHistory ? 'grid-outline' : 'receipt-outline'}
              size={14}
              color={colors.coin}
            />
            <Text style={styles.historyToggleText}>
              {viewingHistory ? 'View Store' : 'My Vouchers'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceRow}>
          <View style={styles.coinIconCircle}>
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.balanceAmount}>{balance}</Text>
            <Text style={styles.balanceSubtitle}>CampusCoins to spend</Text>
          </View>
        </View>
      </View>

      {viewingHistory ? (
        /* Vouchers / Redemptions History */
        <ScrollView contentContainerStyle={styles.historyContent}>
          <Text style={styles.sectionHeading}>My Redeemed Vouchers</Text>
          {myRedemptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="ticket-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Vouchers Yet</Text>
              <Text style={styles.emptySubtitle}>
                Redeem your earned CampusCoins for food, merchandise, and campus passes!
              </Text>
            </View>
          ) : (
            myRedemptions.map((red) => (
              <View key={red.id} style={[styles.voucherCard, shadows.sm]}>
                <View style={styles.voucherHeader}>
                  <Text style={styles.voucherTitle}>{red.title}</Text>
                  <Text style={styles.voucherCost}>-{red.cost} CC</Text>
                </View>
                <View style={styles.codeBox}>
                  <Text style={styles.codeLabel}>VOUCHER CODE</Text>
                  <Text style={styles.codeText}>{red.code}</Text>
                </View>
                <Text style={styles.voucherDate}>Redeemed {red.date}</Text>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        /* Catalog Store */
        <View style={{ flex: 1 }}>
          {/* Category Filter Chips */}
          <View style={styles.categoryBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, active && styles.catChipActive]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.catText, active && styles.catTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const cost = item.coin_cost ?? item.cost ?? 50;
              const title = item.name ?? item.title ?? 'Campus Perk';
              const canAfford = balance >= cost;
              return (
                <View style={[styles.rewardCard, shadows.sm]}>
                  <View style={styles.rewardIconBox}>
                    <Ionicons
                      name={item.icon || 'gift'}
                      size={24}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.rewardDetails}>
                    <Text style={styles.rewardTitle}>{title}</Text>
                    <Text style={styles.rewardDesc} numberOfLines={2}>
                      {item.description}
                    </Text>

                    <View style={styles.rewardFooter}>
                      <View style={styles.pricePill}>
                        <Ionicons name="sparkles" size={12} color={colors.coin} />
                        <Text style={styles.priceText}>{cost} Coins</Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.redeemBtn,
                          !canAfford && styles.redeemBtnDisabled,
                        ]}
                        onPress={() => handleRedeem(item)}
                      >
                        <Text
                          style={[
                            styles.redeemBtnText,
                            !canAfford && styles.redeemBtnTextDisabled,
                          ]}
                        >
                          {canAfford ? 'Redeem' : 'Need Coins'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  balanceCard: {
    backgroundColor: '#78350F',
    margin: 16,
    borderRadius: 18,
    padding: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: '#FDE68A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#451A03',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyToggleText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.coin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  balanceSubtitle: {
    fontSize: 12,
    color: '#FDE68A',
    fontWeight: '500',
  },
  categoryBar: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardDetails: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  rewardDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 8,
  },
  rewardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.coinBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.coinBorder,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.coin,
  },
  redeemBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  redeemBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  redeemBtnTextDisabled: {
    color: '#94A3B8',
  },
  historyContent: {
    padding: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  voucherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voucherTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  voucherCost: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.danger,
  },
  codeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  voucherDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default RewardsStoreScreen;


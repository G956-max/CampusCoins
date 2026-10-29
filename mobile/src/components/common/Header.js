import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

const Header = ({ title, showBack = false, onBack, rightAction }) => {
  const navigation = useNavigation();
  const { wallet, profile } = useAuth();
  const coinBalance = wallet?.balance ?? 480;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoRow}>
            <View style={styles.coinIconWrapper}>
              <Ionicons name="sparkles" size={16} color="#FFF" />
            </View>
            <Text style={styles.brandTitle}>CampusCoins</Text>
          </View>
        )}
        {title && <Text style={styles.screenTitle}>{title}</Text>}
      </View>

      <View style={styles.rightRow}>
        {rightAction ? (
          rightAction
        ) : (
          <TouchableOpacity
            style={styles.walletPill}
            onPress={() => navigation.navigate('Wallet')}
            activeOpacity={0.8}
          >
            <Ionicons name="wallet-outline" size={14} color={colors.primary} />
            <Text style={styles.walletText}>{coinBalance}</Text>
            <Text style={styles.coinUnit}>CC</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  backButton: {
    padding: 6,
    marginRight: 4,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  walletText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  coinUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default Header;


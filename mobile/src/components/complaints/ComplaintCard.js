import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import Badge from '../common/Badge';

const getCategoryIcon = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('electric')) return 'flash';
  if (cat.includes('sanitat') || cat.includes('water')) return 'water';
  if (cat.includes('lab')) return 'hardware-chip';
  if (cat.includes('wifi') || cat.includes('net')) return 'wifi';
  if (cat.includes('infrastruct') || cat.includes('build')) return 'business';
  if (cat.includes('furnitur') || cat.includes('class')) return 'school';
  if (cat.includes('clean') || cat.includes('trash')) return 'trash-bin';
  if (cat.includes('plumb')) return 'water';
  if (cat.includes('safe')) return 'shield-alert';
  return 'alert-circle';
};

const ComplaintCard = ({ complaint, onPress, onUpvote }) => {
  const [upvoted, setUpvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(complaint.upvotes_count || complaint.upvotes || 0);

  useEffect(() => {
    setUpvotesCount(complaint.upvotes_count || complaint.upvotes || 0);
  }, [complaint.upvotes_count, complaint.upvotes]);

  const handleUpvote = (e) => {
    e?.stopPropagation?.();
    if (upvoted) {
      setUpvoted(false);
      setUpvotesCount((prev) => Math.max(0, prev - 1));
    } else {
      setUpvoted(true);
      setUpvotesCount((prev) => prev + 1);
    }
    if (onUpvote) onUpvote(complaint.id);
  };

  const status = complaint.status || 'submitted';
  const category = complaint.category || 'Infrastructure';
  const locationText =
    complaint.location_name ||
    complaint.location ||
    [complaint.building?.name, complaint.floor?.name, complaint.room?.name]
      .filter(Boolean)
      .join(', ') ||
    'Campus Grounds';

  const coins = complaint.bounty_coins || complaint.coinsAwarded || 30;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.card, shadows.sm]}
    >
      <View style={styles.topRow}>
        <View style={styles.categoryPill}>
          <Ionicons
            name={getCategoryIcon(category)}
            size={13}
            color={colors.primary}
          />
          <Text style={styles.categoryText}>{category}</Text>
        </View>

        <View style={styles.topRightRow}>
          <Badge status={status} />
          {coins > 0 && (
            <View style={styles.coinsBadge}>
              <Ionicons name="sparkles" size={11} color={colors.coin} />
              <Text style={styles.coinsText}>+{coins}</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {complaint.title}
      </Text>

      {complaint.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {complaint.description}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationText}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.upvoteButton, upvoted && styles.upvoteButtonActive]}
          onPress={handleUpvote}
        >
          <Ionicons
            name={upvoted ? 'arrow-up' : 'arrow-up-outline'}
            size={14}
            color={upvoted ? '#FFFFFF' : colors.textSecondary}
          />
          <Text
            style={[
              styles.upvoteText,
              upvoted && styles.upvoteTextActive,
            ]}
          >
            {upvotesCount}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.coinBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.coinBorder,
  },
  coinsText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.coin,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upvoteButtonActive: {
    backgroundColor: colors.primary,
  },
  upvoteText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  upvoteTextActive: {
    color: '#FFFFFF',
  },
});

export default ComplaintCard;


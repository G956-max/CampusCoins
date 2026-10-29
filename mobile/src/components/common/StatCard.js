import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';

const StatCard = ({ title, value, icon, color = colors.primary, bgColor = colors.primaryLight }) => {
  return (
    <View style={[styles.card, shadows.sm]}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  title: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
});

export default StatCard;


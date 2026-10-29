import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_MAP } from '../../config/constants';
import { colors } from '../../theme/colors';

const Badge = ({ status, variant, label }) => {
  let text = label;
  let bg = '#F1F5F9';
  let textColor = '#64748B';

  if (status) {
    const key = status.toLowerCase().replace(/\s+/g, '_');
    const mapped = STATUS_MAP[key] || {
      label: status,
      color: colors.primary,
      bg: colors.primaryLight,
    };
    text = text || mapped.label;
    bg = mapped.bg;
    textColor = mapped.color;
  } else if (variant === 'success') {
    bg = colors.successBg;
    textColor = colors.success;
  } else if (variant === 'warning') {
    bg = colors.warningBg;
    textColor = colors.warning;
  } else if (variant === 'danger') {
    bg = colors.dangerBg;
    textColor = colors.danger;
  } else if (variant === 'info') {
    bg = colors.infoBg;
    textColor = colors.info;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});

export default Badge;


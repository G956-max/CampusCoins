import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import Header from '../../components/common/Header';
import { CATEGORIES, PRIORITIES } from '../../config/constants';
import { complaintsApi, locationsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_BUILDINGS = [
  { id: 'b1', name: 'Academic Block A' },
  { id: 'b2', name: 'Academic Block B' },
  { id: 'b3', name: 'Central Library' },
  { id: 'b4', name: 'Science & Lab Complex' },
  { id: 'b5', name: 'Student Cafeteria' },
];

const FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];

const ReportIssueScreen = ({ navigation }) => {
  const { refreshWallet } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [priority, setPriority] = useState('medium');
  const [selectedBuilding, setSelectedBuilding] = useState(DEFAULT_BUILDINGS[0].name);
  const [selectedFloor, setSelectedFloor] = useState(FLOORS[1]);
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState(DEFAULT_BUILDINGS);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const res = await locationsApi.getBuildings();
      if (res?.data && res.data.length > 0) {
        setBuildings(res.data);
        setSelectedBuilding(res.data[0].name);
      }
    } catch (e) {
      // Keep defaults
    }
  };

  const handleSubmit = async () => {
    if (title.trim().length < 2) {
      Alert.alert('Title Required', 'Please enter a clear title (at least 2 characters).');
      return;
    }
    if (description.trim().length < 20) {
      Alert.alert(
        'Description Too Short',
        'Please write at least 20 characters describing the issue so campus maintenance can identify and fix it quickly.'
      );
      return;
    }

    try {
      setLoading(true);
      const generalLocation = `${selectedBuilding}, ${selectedFloor}${room.trim() ? ` - ${room.trim()}` : ''}`;
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        general_location: generalLocation,
        location_name: generalLocation,
      };

      await complaintsApi.createComplaint(payload);

      // Refresh student's wallet balance
      await refreshWallet();

      Alert.alert(
        '🎉 Issue Reported Successfully!',
        'Thank you for making our campus better! You earned +50 CampusCoins once verified.',
        [
          {
            text: 'View My Issues',
            onPress: () => {
              setTitle('');
              setDescription('');
              setRoom('');
              setHasPhoto(false);
              navigation.navigate('ComplaintsTab');
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not submit issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Report Campus Issue" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Coin Bounty Banner */}
        <View style={styles.bountyBanner}>
          <View style={styles.bountyIconWrapper}>
            <Ionicons name="sparkles" size={18} color={colors.coin} />
          </View>
          <View style={styles.bountyTextCol}>
            <Text style={styles.bountyTitle}>Earn CampusCoins Reward</Text>
            <Text style={styles.bountyDesc}>
              Reporting genuine maintenance issues earns you coins for cafeteria snacks, library passes & college gear.
            </Text>
          </View>
        </View>

        {/* 1. Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Issue Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Water leakage near 2nd floor restroom"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* 2. Category Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon}
                    size={15}
                    color={active ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Priority Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Urgency / Priority *</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => {
              const active = priority === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.priorityChip,
                    active && { backgroundColor: p.color, borderColor: p.color },
                  ]}
                  onPress={() => setPriority(p.id)}
                >
                  <Text style={[styles.priorityText, active && styles.priorityTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. Location Details */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location / Building *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {buildings.map((b) => {
              const active = selectedBuilding === b.name;
              return (
                <TouchableOpacity
                  key={b.id || b.name}
                  style={[styles.locationChip, active && styles.locationChipActive]}
                  onPress={() => setSelectedBuilding(b.name)}
                >
                  <Ionicons
                    name="business"
                    size={14}
                    color={active ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text style={[styles.locationChipText, active && styles.locationChipTextActive]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.floorRow}>
            {FLOORS.map((floor) => {
              const active = selectedFloor === floor;
              return (
                <TouchableOpacity
                  key={floor}
                  style={[styles.floorChip, active && styles.floorChipActive]}
                  onPress={() => setSelectedFloor(floor)}
                >
                  <Text style={[styles.floorText, active && styles.floorTextActive]}>
                    {floor}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={[styles.textInput, { marginTop: 8 }]}
            placeholder="Room number / Landmark (e.g. Lab 3, opposite water cooler)"
            placeholderTextColor={colors.textMuted}
            value={room}
            onChangeText={setRoom}
          />
        </View>

        {/* 5. Description */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={styles.sectionLabel}>Description *</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: description.trim().length >= 20 ? colors.primary : colors.textMuted }}>
              {description.trim().length}/20 chars min
            </Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Explain what is broken, hazardous, or needs repair (minimum 20 characters)..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 6. Photo Attachment */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Evidence Photo (Optional)</Text>
          <TouchableOpacity
            style={[styles.uploadBox, hasPhoto && styles.uploadBoxAttached]}
            onPress={() => setHasPhoto(!hasPhoto)}
          >
            <Ionicons
              name={hasPhoto ? 'checkmark-circle' : 'camera'}
              size={24}
              color={hasPhoto ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.uploadText, hasPhoto && styles.uploadTextAttached]}>
              {hasPhoto ? 'Photo Attached (Tap to remove)' : 'Tap to Take or Upload Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Issue & Earn Coins</Text>
            </>
          )}
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
  bountyBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.coinBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.coinBorder,
    marginBottom: 16,
  },
  bountyIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bountyTextCol: {
    flex: 1,
  },
  bountyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.coin,
  },
  bountyDesc: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 15,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: colors.text,
  },
  textArea: {
    height: 90,
    paddingTop: 10,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  priorityTextActive: {
    color: '#FFFFFF',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  locationChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  locationChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  locationChipTextActive: {
    color: '#FFFFFF',
  },
  floorRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  floorChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  floorChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  floorText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  floorTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  uploadBoxAttached: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    borderStyle: 'solid',
  },
  uploadText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  uploadTextAttached: {
    color: colors.primary,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ReportIssueScreen;


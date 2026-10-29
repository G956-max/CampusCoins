import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import { complaintsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ComplaintDetailScreen = ({ route, navigation }) => {
  const { complaintId, complaint: initialComplaint } = route.params || {};
  const { refreshWallet } = useAuth();
  const [complaint, setComplaint] = useState(initialComplaint || {});
  const [upvoted, setUpvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(
    initialComplaint?.upvotes_count || initialComplaint?.upvotes || 4
  );

  useEffect(() => {
    if (complaintId) {
      loadDetails();
    }
  }, [complaintId]);

  const loadDetails = async () => {
    try {
      const res = await complaintsApi.getComplaintDetails(complaintId);
      const data = res?.data || res;
      if (data && typeof data === 'object') {
        setComplaint(data);
        if (data.upvotes_count !== undefined) {
          setUpvotesCount(data.upvotes_count);
        }
      }
    } catch (e) {
      // Use route passed complaint
    }
  };

  const handleUpvote = async () => {
    if (upvoted) {
      setUpvoted(false);
      setUpvotesCount((c) => Math.max(0, c - 1));
    } else {
      setUpvoted(true);
      setUpvotesCount((c) => c + 1);
      try {
        await complaintsApi.upvoteComplaint(complaint.id || complaintId);
      } catch (e) {}
    }
  };

  const handleVerify = async () => {
    try {
      await complaintsApi.verifyResolution(complaint.id || complaintId);
      await refreshWallet();
      Alert.alert('Verified!', 'Thank you for confirming the resolution.');
      loadDetails();
    } catch (e) {
      Alert.alert('Notice', 'Issue marked as verified.');
    }
  };

  const status = complaint.status || 'in_progress';
  const category = complaint.category || 'Infrastructure';
  const priority = complaint.priority || 'High';
  const coins = complaint.bounty_coins || complaint.coinsAwarded || 50;
  const isResolved = status.toLowerCase() === 'resolved';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        showBack
        onBack={() => navigation.goBack()}
        title={complaint.id || 'Issue Details'}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Header Card */}
        <View style={[styles.mainCard, shadows.sm]}>
          <View style={styles.tagRow}>
            <View style={styles.categoryPill}>
              <Ionicons name="construct" size={13} color={colors.primary} />
              <Text style={styles.categoryText}>{category}</Text>
            </View>
            <Badge status={status} />
            <View style={styles.priorityPill}>
              <Text style={styles.priorityText}>{priority} Priority</Text>
            </View>
          </View>

          <Text style={styles.title}>{complaint.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {complaint.location_name || complaint.location || 'Academic Block B, Floor 2'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              Reported on {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'Today'}
            </Text>
          </View>

          {/* Upvote & Bounty bar */}
          <View style={styles.actionBanner}>
            <TouchableOpacity
              style={[styles.upvoteBtn, upvoted && styles.upvoteBtnActive]}
              onPress={handleUpvote}
            >
              <Ionicons
                name={upvoted ? 'arrow-up' : 'arrow-up-outline'}
                size={18}
                color={upvoted ? '#FFFFFF' : colors.primary}
              />
              <Text style={[styles.upvoteText, upvoted && styles.upvoteTextActive]}>
                {upvotesCount} Student Upvotes
              </Text>
            </TouchableOpacity>

            <View style={styles.bountyPill}>
              <Ionicons name="sparkles" size={14} color={colors.coin} />
              <Text style={styles.bountyText}>+{coins} CC Bounty</Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={[styles.sectionCard, shadows.sm]}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {complaint.description ||
              'AC unit in CS Lab 3 stopped blowing cool air and produces a vibrating noise. Temperature in lab exceeds 32°C during practical sessions.'}
          </Text>
        </View>

        {/* Resolution Progress Timeline */}
        <View style={[styles.sectionCard, shadows.sm]}>
          <Text style={styles.sectionTitle}>Resolution Status & Timeline</Text>

          <View style={styles.timeline}>
            {/* Step 1: Submitted */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineDot, styles.timelineDotActive]}>
                <Ionicons name="checkmark" size={12} color="#FFF" />
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Issue Submitted</Text>
                <Text style={styles.timelineDesc}>Logged into campus maintenance system</Text>
              </View>
            </View>

            {/* Step 2: Under Review */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineDot, styles.timelineDotActive]}>
                <Ionicons name="checkmark" size={12} color="#FFF" />
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Assigned to Facilities</Text>
                <Text style={styles.timelineDesc}>
                  Assigned to {complaint.assignedDept || 'HVAC & Maintenance Unit'}
                </Text>
              </View>
            </View>

            {/* Step 3: In Progress */}
            <View style={styles.timelineStep}>
              <View
                style={[
                  styles.timelineDot,
                  status !== 'submitted' ? styles.timelineDotActive : styles.timelineDotPending,
                ]}
              >
                <Ionicons name="refresh" size={12} color="#FFF" />
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Technician Dispatched</Text>
                <Text style={styles.timelineDesc}>Staff inspecting on-site</Text>
              </View>
            </View>

            {/* Step 4: Resolved */}
            <View style={styles.timelineStep}>
              <View
                style={[
                  styles.timelineDot,
                  isResolved ? styles.timelineDotActive : styles.timelineDotPending,
                ]}
              >
                <Ionicons name="ribbon" size={12} color="#FFF" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Resolved & Verified</Text>
                <Text style={styles.timelineDesc}>
                  {isResolved
                    ? 'Maintenance completed & tested'
                    : 'Awaiting completion from department'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Verification Action if Resolved */}
        {isResolved && (
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
            <Ionicons name="checkbox" size={20} color="#FFFFFF" />
            <Text style={styles.verifyButtonText}>Confirm Issue is Resolved</Text>
          </TouchableOpacity>
        )}
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
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
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
  priorityPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 24,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  upvoteBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  upvoteText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  upvoteTextActive: {
    color: '#FFFFFF',
  },
  bountyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.coinBg,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.coinBorder,
  },
  bountyText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.coin,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
  timeline: {
    gap: 16,
  },
  timelineStep: {
    flexDirection: 'row',
    position: 'relative',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    zIndex: 2,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
  },
  timelineDotPending: {
    backgroundColor: '#CBD5E1',
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: -16,
    width: 2,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  timelineDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ComplaintDetailScreen;


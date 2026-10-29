import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import Header from '../../components/common/Header';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import { complaintsApi } from '../../api';
import { MOCK_STUDENT_DATA } from '../../constants/mockData';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'resolved', label: 'Resolved' },
];

const ComplaintsListScreen = ({ navigation }) => {
  const [complaints, setComplaints] = useState(MOCK_STUDENT_DATA.recentComplaints || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complaintsApi.getMyComplaints();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) {
        setComplaints(list);
      }
    } catch (e) {
      // Fallback to mock complaints
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location || item.location_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    const statusKey = (item.status || '').toLowerCase().replace(/\s+/g, '_');
    return statusKey === activeTab;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Campus Issues" />

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, location or category..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Filters */}
        <View style={styles.tabContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={TABS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.tabsList}
            renderItem={({ item }) => {
              const active = activeTab === item.id;
              return (
                <TouchableOpacity
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                  onPress={() => setActiveTab(item.id)}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      {/* Main List */}
      <FlatList
        data={filteredComplaints}
        keyExtractor={(item, index) => item.id || String(index)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <ComplaintCard
            complaint={item}
            onPress={() =>
              navigation.navigate('ComplaintDetail', {
                complaintId: item.id,
                complaint: item,
              })
            }
          />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle" size={54} color={colors.primary} />
              <Text style={styles.emptyTitle}>No Issues Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try searching for something else'
                  : 'Great news! No pending issues reported in this filter.'}
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => navigation.navigate('ReportTab')}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.emptyActionText}>Report New Issue</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  tabContainer: {
    marginTop: 10,
    marginBottom: 8,
  },
  tabsList: {
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    paddingHorizontal: 24,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 12,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default ComplaintsListScreen;

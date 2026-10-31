import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Paperclip,
  RefreshCw,
  Clock,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import complaintApi from '../../services/complaintApi';
import { supabase } from '../../config/supabase';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } from '../../constants/complaints';

const StudentComplaintsPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      let list = [];

      // 1. Fetch directly from Supabase first (real-time source of truth)
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data, error: supaErr } = await supabase
              .from('complaints')
              .select(`
                *,
                building:buildings (name, code),
                floor:floors (floor_name),
                room:rooms (room_number)
              `)
              .eq('student_id', user.id)
              .order('created_at', { ascending: false });

            if (!supaErr && Array.isArray(data) && data.length > 0) {
              list = data;
            } else {
              const { data: simpleData } = await supabase
                .from('complaints')
                .select('*')
                .eq('student_id', user.id)
                .order('created_at', { ascending: false });
              if (Array.isArray(simpleData) && simpleData.length > 0) {
                list = simpleData;
              }
            }
          }
        } catch (supaErr) {
          console.warn('Supabase fetch notice:', supaErr);
        }
      }

      // 2. Fetch from Backend API if list is empty
      if (list.length === 0) {
        try {
          const res = await complaintApi.getMyComplaints();
          const apiList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
          if (apiList.length > 0) list = apiList;
        } catch (apiErr) {
          console.warn('Backend API get complaints notice:', apiErr);
        }
      }

      setComplaints(list);
    } catch (err) {
      console.error('Error fetching student complaints:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filtered and Sorted Complaints
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((item) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchCode = item.tracking_code?.toLowerCase().includes(q);
          const matchCategory = item.category?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCode && !matchCategory) return false;
        }

        // Status
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;

        // Category
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

        // Priority
        if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
        if (sortBy === 'priority') {
          const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        }
        return 0;
      });
  }, [complaints, searchQuery, statusFilter, categoryFilter, priorityFilter, sortBy]);

  // Metric counts
  const stats = useMemo(() => {
    const total = complaints.length;
    const pendingReview = complaints.filter((c) =>
      [COMPLAINT_STATUSES.SUBMITTED, COMPLAINT_STATUSES.UNDER_REVIEW].includes(c.status)
    ).length;
    const inProgress = complaints.filter((c) =>
      [COMPLAINT_STATUSES.ASSIGNED, COMPLAINT_STATUSES.IN_PROGRESS].includes(c.status)
    ).length;
    const awaitingVerification = complaints.filter(
      (c) => c.status === COMPLAINT_STATUSES.RESOLVED
    ).length;
    const closed = complaints.filter(
      (c) => c.status === COMPLAINT_STATUSES.VERIFIED
    ).length;

    return { total, pendingReview, inProgress, awaitingVerification, closed };
  }, [complaints]);

  const getLocationString = (c) => {
    if (c.general_location) return c.general_location;
    const parts = [];
    if (c.building?.name) parts.push(c.building.name);
    if (c.floor?.name) parts.push(c.floor.name);
    if (c.room?.room_number) parts.push(`Room ${c.room.room_number}`);
    return parts.length > 0 ? parts.join(' • ') : 'Campus Premises';
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="My Reported Issues"
        subtitle="Track, manage, and verify status updates on all campus issues you have raised."
        badge={
          <Badge variant="success" size="sm" withDot>
            Lifecycle Live
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
              onClick={fetchComplaints}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate('/student/complaints/new')}
            >
              Report New Issue
            </Button>
          </div>
        }
      />

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'all'
              ? 'bg-[#EAF6EE] border-[#168451] text-[#168451]'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-[#168451]/40'
          }`}
        >
          <div className="text-xs text-[#647168] font-medium">Total Reported</div>
          <div className="text-xl font-black mt-1">{stats.total}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.UNDER_REVIEW)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === COMPLAINT_STATUSES.UNDER_REVIEW
              ? 'bg-sky-50 border-sky-600 text-sky-800'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-sky-300'
          }`}
        >
          <div className="text-xs text-[#647168] font-medium">Under Review</div>
          <div className="text-xl font-black mt-1 text-sky-700">{stats.pendingReview}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.IN_PROGRESS)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === COMPLAINT_STATUSES.IN_PROGRESS
              ? 'bg-amber-50 border-amber-600 text-amber-800'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-amber-300'
          }`}
        >
          <div className="text-xs text-[#647168] font-medium">In Progress</div>
          <div className="text-xl font-black mt-1 text-amber-700">{stats.inProgress}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.RESOLVED)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === COMPLAINT_STATUSES.RESOLVED
              ? 'bg-[#EAF6EE] border-[#168451] text-[#168451]'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-[#168451]/40'
          }`}
        >
          <div className="text-xs text-[#168451] flex items-center gap-1 font-bold">
            <span>Needs Verification</span>
            {stats.awaitingVerification > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#168451] animate-ping" />
            )}
          </div>
          <div className="text-xl font-black text-[#168451] mt-1">{stats.awaitingVerification}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.VERIFIED)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === COMPLAINT_STATUSES.VERIFIED
              ? 'bg-[#EAF6EE] border-[#168451] text-[#168451]'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-[#168451]/40'
          }`}
        >
          <div className="text-xs text-[#647168] font-medium">Closed & Verified</div>
          <div className="text-xl font-black text-[#17211B] mt-1">{stats.closed}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E1E9E2] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#647168]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, tracking code, description..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E1E9E2] rounded-xl text-sm text-[#17211B] placeholder-[#647168] focus:outline-none focus:border-[#168451] focus:ring-1 focus:ring-[#168451] transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved (Action Required)</option>
              <option value="verified">Verified & Closed</option>
              <option value="reopened">Reopened</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
            >
              <option value="all">All Categories</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
            >
              <option value="all">All Priorities</option>
              {COMPLAINT_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchComplaints}>
            Retry
          </Button>
        </div>
      )}

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-28 rounded-2xl bg-white border border-[#E1E9E2] animate-pulse"
            />
          ))}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E1E9E2] shadow-xs space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17211B]">No issues found</h3>
            <p className="text-xs text-[#647168] mt-1 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                ? 'No reported issues match your active search and filter options.'
                : "You haven't reported any campus issues yet. Found something broken? Let the administration know."}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/student/complaints/new')}
          >
            Report Your First Issue
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((item) => {
            const isAwaitingVerification = item.status === COMPLAINT_STATUSES.RESOLVED;

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/student/complaints/${item.id}`)}
                className={`group p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  isAwaitingVerification
                    ? 'bg-[#EAF6EE] border-[#168451] hover:border-[#116B42]'
                    : 'bg-white border-[#E1E9E2] hover:border-[#168451]/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left Badges & Title */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#647168] bg-[#F7FAF7] px-2 py-0.5 rounded border border-[#E1E9E2]">
                        {item.tracking_code || item.id?.slice(0, 8)}
                      </span>
                      <span className="text-xs font-medium text-[#17211B] bg-white border border-[#E1E9E2] px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <PriorityBadge priority={item.priority} size="sm" />
                      <ComplaintStatusBadge status={item.status} size="sm" />

                      {isAwaitingVerification && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#168451] bg-white border border-[#CBE7D4] px-2 py-0.5 rounded-full shadow-xs">
                          <CheckCircle2 size={12} />
                          Action Required: Verify Resolution
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#17211B] group-hover:text-[#168451] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#647168] line-clamp-2 max-w-3xl leading-relaxed">
                      {item.description}
                    </p>

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#647168] pt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#168451]" />
                        <span>{getLocationString(item)}</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#647168]" />
                        <span>Reported {formatDate(item.created_at)}</span>
                      </span>

                      {item.evidence && item.evidence.length > 0 && (
                        <span className="flex items-center gap-1 text-[#168451] font-medium">
                          <Paperclip size={13} />
                          <span>{item.evidence.length} attachment{item.evidence.length > 1 ? 's' : ''}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right View Arrow */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-xs font-bold text-[#168451] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View Details
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentComplaintsPage;

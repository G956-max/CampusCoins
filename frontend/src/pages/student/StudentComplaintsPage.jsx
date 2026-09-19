import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Paperclip,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { Card, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import complaintApi from '../../services/complaintApi';
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
      const res = await complaintApi.getMyComplaints();
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Error fetching student complaints:', err);
      setError(err.response?.data?.message || 'Failed to load complaints. Please try again.');
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
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="My Reported Issues"
        subtitle="Track, manage, and verify status updates on all campus issues you have raised."
        badge={
          <Badge variant="info" size="sm" withDot>
            Complaint Lifecycle Live
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3">
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
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 border-campus-500/50 shadow-md shadow-campus-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-slate-400">Total Reported</div>
          <div className="text-xl font-bold text-white mt-1">{stats.total}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.UNDER_REVIEW)}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === COMPLAINT_STATUSES.UNDER_REVIEW
              ? 'bg-slate-900 border-sky-500/50 shadow-md shadow-sky-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-slate-400">Under Review</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{stats.pendingReview}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.IN_PROGRESS)}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === COMPLAINT_STATUSES.IN_PROGRESS
              ? 'bg-slate-900 border-amber-500/50 shadow-md shadow-amber-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-slate-400">In Progress</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{stats.inProgress}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.RESOLVED)}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === COMPLAINT_STATUSES.RESOLVED
              ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <span>Needs Verification</span>
            {stats.awaitingVerification > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{stats.awaitingVerification}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.VERIFIED)}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === COMPLAINT_STATUSES.VERIFIED
              ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-slate-400">Closed & Verified</div>
          <div className="text-xl font-bold text-slate-300 mt-1">{stats.closed}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, tracking code, description..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-campus-500 focus:ring-1 focus:ring-campus-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-campus-500"
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
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-campus-500"
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
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-campus-500"
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
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-campus-500"
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
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} />
            <span className="text-sm">{error}</span>
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
              className="h-28 rounded-2xl bg-slate-900/50 border border-slate-800/80 animate-pulse"
            />
          ))}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-200">No issues found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
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
                className={`group p-5 rounded-2xl border transition-all cursor-pointer ${
                  isAwaitingVerification
                    ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/80 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left Badges & Title */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {item.tracking_code || item.id?.slice(0, 8)}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <PriorityBadge priority={item.priority} size="sm" />
                      <ComplaintStatusBadge status={item.status} size="sm" />

                      {isAwaitingVerification && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                          <CheckCircle2 size={12} />
                          Action Required: Verify Resolution
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-slate-100 group-hover:text-campus-400 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl leading-relaxed">
                      {item.description}
                    </p>

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-500" />
                        <span>{getLocationString(item)}</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-500" />
                        <span>Reported {formatDate(item.created_at)}</span>
                      </span>

                      {item.evidence && item.evidence.length > 0 && (
                        <span className="flex items-center gap-1 text-campus-400">
                          <Paperclip size={13} />
                          <span>{item.evidence.length} attachment{item.evidence.length > 1 ? 's' : ''}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right View Arrow */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-xs font-semibold text-campus-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
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

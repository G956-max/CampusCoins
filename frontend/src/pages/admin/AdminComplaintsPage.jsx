import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  ChevronRight,
  MapPin,
  RefreshCw,
  AlertTriangle,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import complaintApi from '../../services/complaintApi';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
} from '../../constants/complaints';

const AdminComplaintsPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all'); // 'all' | 'assigned' | 'unassigned'

  const fetchAdminComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintApi.getAllComplaints();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setComplaints(list);
    } catch (err) {
      console.error('Failed to load admin complaints:', err);
      setError(err.response?.data?.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminComplaints();
  }, []);

  // Filtered dataset
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchCode = item.tracking_code?.toLowerCase().includes(q);
        const matchStudent = item.student?.full_name?.toLowerCase().includes(q);
        const matchStaff = item.assigned_staff?.full_name?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCode && !matchStudent && !matchStaff) return false;
      }

      // Status
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Category
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      // Priority
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

      // Assignment
      if (assignedFilter === 'assigned' && !item.assigned_to) return false;
      if (assignedFilter === 'unassigned' && item.assigned_to) return false;

      return true;
    });
  }, [complaints, searchQuery, statusFilter, categoryFilter, priorityFilter, assignedFilter]);

  // High-level statistics
  const stats = useMemo(() => {
    const total = complaints.length;
    const pendingReview = complaints.filter((c) =>
      [COMPLAINT_STATUSES.SUBMITTED, COMPLAINT_STATUSES.UNDER_REVIEW].includes(c.status)
    ).length;
    const inProgress = complaints.filter((c) =>
      [COMPLAINT_STATUSES.ASSIGNED, COMPLAINT_STATUSES.IN_PROGRESS].includes(c.status)
    ).length;
    const resolved = complaints.filter((c) =>
      [COMPLAINT_STATUSES.RESOLVED, COMPLAINT_STATUSES.VERIFIED].includes(c.status)
    ).length;
    const rejected = complaints.filter((c) => c.status === COMPLAINT_STATUSES.REJECTED).length;

    return { total, pendingReview, inProgress, resolved, rejected };
  }, [complaints]);

  const getLocationString = (c) => {
    if (!c) return '—';
    if (c.general_location) return c.general_location;
    const parts = [];
    if (c.building?.name) parts.push(c.building.name);
    if (c.floor?.name) parts.push(c.floor.name);
    if (c.room?.room_number) parts.push(`Room ${c.room.room_number}`);
    return parts.length > 0 ? parts.join(' • ') : 'Campus';
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
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
      {/* Header */}
      <PageHeader
        title="Complaints Management & Dispatch"
        subtitle="Review, prioritize, dispatch technicians, and audit all university facilities tickets."
        badge={
          <Badge variant="success" size="sm" withDot>
            Central Dispatch Live
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
            onClick={fetchAdminComplaints}
            disabled={loading}
          >
            Refresh Data
          </Button>
        }
      />

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'all'
              ? 'bg-[#EAF6EE] border-[#168451] text-[#168451]'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-[#168451]/40'
          }`}
        >
          <div className="text-xs text-[#647168] font-medium">Total System Tickets</div>
          <div className="text-xl font-black mt-1">{stats.total}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.SUBMITTED)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === COMPLAINT_STATUSES.SUBMITTED
              ? 'bg-sky-50 border-sky-600 text-sky-800'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-sky-300'
          }`}
        >
          <div className="text-xs text-sky-700 font-bold">Needs Review</div>
          <div className="text-xl font-black text-sky-700 mt-1">{stats.pendingReview}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.IN_PROGRESS)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === COMPLAINT_STATUSES.IN_PROGRESS
              ? 'bg-amber-50 border-amber-600 text-amber-800'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-amber-300'
          }`}
        >
          <div className="text-xs text-amber-700 font-bold">In Progress</div>
          <div className="text-xl font-black text-amber-700 mt-1">{stats.inProgress}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.RESOLVED)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === COMPLAINT_STATUSES.RESOLVED
              ? 'bg-[#EAF6EE] border-[#168451] text-[#168451]'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-[#168451]/40'
          }`}
        >
          <div className="text-xs text-[#168451] font-bold">Resolved / Closed</div>
          <div className="text-xl font-black text-[#168451] mt-1">{stats.resolved}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.REJECTED)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === COMPLAINT_STATUSES.REJECTED
              ? 'bg-rose-50 border-rose-600 text-rose-800'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-rose-300'
          }`}
        >
          <div className="text-xs text-rose-700 font-bold">Rejected</div>
          <div className="text-xl font-black text-rose-700 mt-1">{stats.rejected}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E1E9E2] shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#647168]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, student, technician..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] placeholder-[#647168] focus:outline-none focus:border-[#168451]"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
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
              <option value="resolved">Resolved</option>
              <option value="verified">Verified & Closed</option>
              <option value="reopened">Reopened</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
            >
              <option value="all">All Priorities</option>
              {COMPLAINT_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label} Priority
                </option>
              ))}
            </select>

            {/* Category */}
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

            {/* Technician Assignment */}
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
            >
              <option value="all">Assignment: All</option>
              <option value="assigned">Technician Assigned</option>
              <option value="unassigned">Unassigned Only</option>
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
          <Button variant="outline" size="sm" onClick={fetchAdminComplaints}>
            Retry
          </Button>
        </div>
      )}

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-28 rounded-2xl bg-white border border-[#E1E9E2] animate-pulse"
            />
          ))}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E1E9E2] shadow-xs space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17211B]">No matching tickets</h3>
            <p className="text-xs text-[#647168] mt-1 max-w-md mx-auto">
              No campus complaints match your active search and filter settings.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((item) => {
            const isUnassigned = !item.assigned_to;
            const isSubmitted = item.status === COMPLAINT_STATUSES.SUBMITTED;

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/admin/complaints/${item.id}`)}
                className={`group p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  isSubmitted
                    ? 'bg-sky-50/40 border-sky-200 hover:border-sky-400'
                    : 'bg-white border-[#E1E9E2] hover:border-[#168451]/50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

                      {isUnassigned && !['resolved', 'verified', 'rejected'].includes(item.status) && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Unassigned
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
                        <User size={13} className="text-[#168451]" />
                        <span>Student: {item.student?.full_name || 'Anonymous Student'}</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#168451]" />
                        <span>{getLocationString(item)}</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#647168]" />
                        <span>Reported {formatDate(item.created_at)}</span>
                      </span>

                      {item.assigned_staff && (
                        <span className="flex items-center gap-1.5 text-sky-800 font-bold">
                          <UserCheck size={13} />
                          <span>Tech: {item.assigned_staff.full_name}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right View Arrow */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <span className="text-xs font-bold text-[#168451] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Manage & Dispatch
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

export default AdminComplaintsPage;

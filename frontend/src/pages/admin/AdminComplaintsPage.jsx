import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  ChevronRight,
  MapPin,
  RefreshCw,
  Eye,
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
      setComplaints(res.data || []);
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
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Complaints Management & Dispatch"
        subtitle="Review, prioritize, dispatch technicians, and audit all university facilities tickets."
        badge={
          <Badge variant="indigo" size="sm" withDot>
            Admin Central Console
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
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 border-indigo-500/50 shadow-md shadow-indigo-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-slate-400">Total System Tickets</div>
          <div className="text-xl font-bold text-white mt-1">{stats.total}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.SUBMITTED)}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === COMPLAINT_STATUSES.SUBMITTED
              ? 'bg-slate-900 border-sky-500/50 shadow-md shadow-sky-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-sky-400">Needs Review</div>
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
          <div className="text-xs text-amber-400">In Progress</div>
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
          <div className="text-xs text-emerald-400">Resolved / Closed</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{stats.resolved}</div>
        </div>

        <div
          onClick={() => setStatusFilter(COMPLAINT_STATUSES.REJECTED)}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === COMPLAINT_STATUSES.REJECTED
              ? 'bg-slate-900 border-rose-500/50 shadow-md shadow-rose-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-rose-400">Rejected</div>
          <div className="text-xl font-bold text-rose-400 mt-1">{stats.rejected}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, student, technician..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
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
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              {COMPLAINT_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Assignment */}
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Assignment States</option>
              <option value="unassigned">Unassigned Only</option>
              <option value="assigned">Assigned Only</option>
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
          <Button variant="outline" size="sm" onClick={fetchAdminComplaints}>
            Retry
          </Button>
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-16 rounded-xl bg-slate-900/50 border border-slate-800/80 animate-pulse"
            />
          ))}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <ShieldAlert size={28} className="text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No Complaints Match</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or filter selectors above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Issue & Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredComplaints.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/admin/complaints/${item.id}`)}
                >
                  {/* Tracking Code */}
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                    {item.tracking_code || item.id?.slice(0, 8)}
                  </td>

                  {/* Title & Category */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-semibold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </div>
                    <span className="text-[11px] text-slate-400">{item.category}</span>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <PriorityBadge priority={item.priority} size="sm" />
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 max-w-[180px] truncate text-slate-400">
                    {getLocationString(item)}
                  </td>

                  {/* Student */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-200">
                      {item.student?.full_name || 'Student'}
                    </div>
                  </td>

                  {/* Technician */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {item.assigned_staff?.full_name ? (
                      <span className="text-slate-300 font-medium">
                        {item.assigned_staff.full_name}
                      </span>
                    ) : (
                      <span className="text-amber-400/80 font-medium italic">Unassigned</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <ComplaintStatusBadge status={item.status} size="sm" />
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {formatDate(item.created_at)}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/complaints/${item.id}`);
                      }}
                      className="text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10"
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminComplaintsPage;

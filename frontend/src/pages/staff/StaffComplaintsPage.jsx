import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  MapPin,
  RefreshCw,
  Filter,
  ShieldAlert,
  ArrowUpDown,
  Paperclip,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import complaintApi from '../../services/complaintApi';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '../../constants/complaints';

const StaffComplaintsPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'in_progress' | 'resolved' | 'critical'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchStaffComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintApi.getStaffComplaints();
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Failed to load staff complaints:', err);
      setError(err.response?.data?.message || 'Failed to load assigned work orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffComplaints();
  }, []);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // Tab filter
      if (activeTab === 'in_progress') {
        if (item.status !== COMPLAINT_STATUSES.IN_PROGRESS) return false;
      } else if (activeTab === 'resolved') {
        if (![COMPLAINT_STATUSES.RESOLVED, COMPLAINT_STATUSES.VERIFIED].includes(item.status)) return false;
      } else if (activeTab === 'critical') {
        if (!['critical', 'high'].includes(item.priority)) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchCode = item.tracking_code?.toLowerCase().includes(q);
        const matchStudent = item.student?.full_name?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCode && !matchStudent) return false;
      }

      return true;
    });
  }, [complaints, activeTab, categoryFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = complaints.length;
    const assignedNew = complaints.filter((c) => c.status === COMPLAINT_STATUSES.ASSIGNED).length;
    const inProgress = complaints.filter((c) => c.status === COMPLAINT_STATUSES.IN_PROGRESS).length;
    const critical = complaints.filter((c) => ['critical', 'high'].includes(c.priority)).length;
    const resolved = complaints.filter((c) =>
      [COMPLAINT_STATUSES.RESOLVED, COMPLAINT_STATUSES.VERIFIED].includes(c.status)
    ).length;

    return { total, assignedNew, inProgress, critical, resolved };
  }, [complaints]);

  const getLocationString = (c) => {
    if (!c) return '—';
    if (c.general_location) return c.general_location;
    const parts = [];
    if (c.building?.name) parts.push(c.building.name);
    if (c.floor?.name) parts.push(c.floor.name);
    if (c.room?.room_number) parts.push(`Room ${c.room.room_number}`);
    return parts.length > 0 ? parts.join(' • ') : 'Campus Location';
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
      {/* Page Header */}
      <PageHeader
        title="Assigned Work Orders"
        subtitle="Manage, service, and update complaints dispatched to your queue."
        badge={
          <Badge variant="info" size="sm" withDot>
            Technician Active Console
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
            onClick={fetchStaffComplaints}
            disabled={loading}
          >
            Refresh Work Orders
          </Button>
        }
      />

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setActiveTab('all')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 border-sky-500/50 shadow-md shadow-sky-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-slate-400">Total Work Orders</div>
          <div className="text-xl font-bold text-white mt-1">{stats.total}</div>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          className="p-3.5 rounded-xl border bg-slate-950/60 border-slate-800"
        >
          <div className="text-xs text-purple-400">New Dispatches</div>
          <div className="text-xl font-bold text-purple-300 mt-1">{stats.assignedNew}</div>
        </div>

        <div
          onClick={() => setActiveTab('in_progress')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'in_progress'
              ? 'bg-slate-900 border-amber-500/50 shadow-md shadow-amber-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-amber-400">In Progress</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{stats.inProgress}</div>
        </div>

        <div
          onClick={() => setActiveTab('critical')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'critical'
              ? 'bg-slate-900 border-rose-500/50 shadow-md shadow-rose-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-rose-400">Critical / High</div>
          <div className="text-xl font-bold text-rose-400 mt-1">{stats.critical}</div>
        </div>

        <div
          onClick={() => setActiveTab('resolved')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'resolved'
              ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-emerald-400">Resolved / Closed</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{stats.resolved}</div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'in_progress'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'critical'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Urgent Priority
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'resolved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolved
            </button>
          </div>

          {/* Search Box & Category Filter */}
          <div className="flex items-center gap-2 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, title, student..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 shrink-0"
            >
              <option value="all">All Categories</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
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
          <Button variant="outline" size="sm" onClick={fetchStaffComplaints}>
            Retry
          </Button>
        </div>
      )}

      {/* Complaint Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 rounded-2xl bg-slate-900/50 border border-slate-800/80 animate-pulse"
            />
          ))}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400">
            <Wrench size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No Assigned Work Orders</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You currently have no complaints matching the selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/staff/complaints/${item.id}`)}
              className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 hover:border-slate-700/80 transition-all cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  </div>

                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-sky-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-500" />
                      <span>{getLocationString(item)}</span>
                    </span>

                    {item.student?.full_name && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-500" />
                        <span>Reported by {item.student.full_name}</span>
                      </span>
                    )}

                    {item.evidence && item.evidence.length > 0 && (
                      <span className="flex items-center gap-1 text-sky-400">
                        <Paperclip size={13} />
                        <span>{item.evidence.length} file{item.evidence.length > 1 ? 's' : ''}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Update Ticket
                    <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffComplaintsPage;

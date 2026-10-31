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
  Paperclip,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import complaintApi from '../../services/complaintApi';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '../../constants/complaints';

const StaffComplaintsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      let list = [];
      try {
        const res = await complaintApi.getStaffComplaints();
        list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      } catch (apiErr) {
        console.warn('Backend API getStaffComplaints notice:', apiErr);
      }

      if (list.length === 0 && supabase) {
        const staffId = user?.id || 'b8000000-0000-0000-0000-000000000002';
        const { data: supaData } = await supabase
          .from('complaints')
          .select(`
            *,
            building:buildings(name, code),
            floor:floors(floor_name),
            room:rooms(room_number),
            student:profiles!student_id(full_name, email)
          `)
          .or(`assigned_staff_id.eq.${staffId},status.in.(assigned,in_progress,resolved)`)
          .order('created_at', { ascending: false });

        if (supaData && supaData.length > 0) {
          list = supaData;
        }
      }

      setComplaints(list);
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
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Assigned Work Orders"
        subtitle="Manage, service, and update complaints dispatched to your queue."
        badge={
          <Badge variant="success" size="sm" withDot>
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
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'all'
              ? 'bg-[#EAF6EE] border-[#168451] text-[#168451]'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-[#168451]/40'
          }`}
        >
          <div className="text-xs text-[#647168] font-medium">Total Work Orders</div>
          <div className="text-xl font-black mt-1">{stats.total}</div>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          className="p-3.5 rounded-2xl border bg-white border-[#E1E9E2] shadow-xs"
        >
          <div className="text-xs text-purple-700 font-bold">New Dispatches</div>
          <div className="text-xl font-black text-purple-800 mt-1">{stats.assignedNew}</div>
        </div>

        <div
          onClick={() => setActiveTab('in_progress')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'in_progress'
              ? 'bg-amber-50 border-amber-600 text-amber-800'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-amber-300'
          }`}
        >
          <div className="text-xs text-amber-700 font-bold">In Progress</div>
          <div className="text-xl font-black text-amber-700 mt-1">{stats.inProgress}</div>
        </div>

        <div
          onClick={() => setActiveTab('critical')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'critical'
              ? 'bg-rose-50 border-rose-600 text-rose-800'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-rose-300'
          }`}
        >
          <div className="text-xs text-rose-700 font-bold">Critical / High</div>
          <div className="text-xl font-black text-rose-700 mt-1">{stats.critical}</div>
        </div>

        <div
          onClick={() => setActiveTab('resolved')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'resolved'
              ? 'bg-[#EAF6EE] border-[#168451] text-[#168451]'
              : 'bg-white border-[#E1E9E2] text-[#17211B] hover:border-[#168451]/40'
          }`}
        >
          <div className="text-xs text-[#168451] font-bold">Resolved / Closed</div>
          <div className="text-xl font-black text-[#168451] mt-1">{stats.resolved}</div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="p-4 rounded-2xl bg-white border border-[#E1E9E2] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F7FAF7] p-1 rounded-xl border border-[#E1E9E2]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-[#17211B] shadow-xs border border-[#E1E9E2]'
                  : 'text-[#647168] hover:text-[#17211B]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'in_progress'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs'
                  : 'text-[#647168] hover:text-[#17211B]'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'critical'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-xs'
                  : 'text-[#647168] hover:text-[#17211B]'
              }`}
            >
              Urgent Priority
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'resolved'
                  ? 'bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] shadow-xs'
                  : 'text-[#647168] hover:text-[#17211B]'
              }`}
            >
              Resolved
            </button>
          </div>

          {/* Search Box & Category Filter */}
          <div className="flex items-center gap-2 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#647168]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, title, student..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] placeholder-[#647168] focus:outline-none focus:border-[#168451]"
              />
            </div>

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
          <Button variant="outline" size="sm" onClick={fetchStaffComplaints}>
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
            <Wrench size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17211B]">No work orders in queue</h3>
            <p className="text-xs text-[#647168] mt-1 max-w-md mx-auto">
              There are no matching complaints currently assigned to you for the active filter.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((item) => {
            const isAssignedNew = item.status === COMPLAINT_STATUSES.ASSIGNED;

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/staff/complaints/${item.id}`)}
                className={`group p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  isAssignedNew
                    ? 'bg-[#EAF6EE]/30 border-[#CBE7D4] hover:border-[#168451]'
                    : 'bg-white border-[#E1E9E2] hover:border-[#168451]/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

                      {isAssignedNew && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#168451] bg-white border border-[#CBE7D4] px-2 py-0.5 rounded-full shadow-xs">
                          Action Required: Start Work
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#17211B] group-hover:text-[#168451] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#647168] line-clamp-2 max-w-3xl leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#647168] pt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#168451]" />
                        <span>{getLocationString(item)}</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#647168]" />
                        <span>Assigned {formatDate(item.created_at)}</span>
                      </span>

                      {item.evidence && item.evidence.length > 0 && (
                        <span className="flex items-center gap-1 text-[#168451] font-semibold">
                          <Paperclip size={13} />
                          <span>{item.evidence.length} photo{item.evidence.length > 1 ? 's' : ''}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-xs font-bold text-[#168451] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Open Work Order
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

export default StaffComplaintsPage;

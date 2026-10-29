import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  ArrowLeft,
  CheckCircle2,
  PackageCheck,
  XCircle,
  Clock,
  Gift,
  RefreshCw,
  Filter,
} from 'lucide-react';
import {
  adminGetAllRedemptions,
  adminApproveRedemption,
  adminFulfillRedemption,
  adminCancelRedemption,
} from '../../services/gamificationApi';

const AdminRedemptionsPage = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      const data = await adminGetAllRedemptions({
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      setRedemptions(data || []);
    } catch (err) {
      console.error('Failed to load redemptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, [filterStatus]);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await adminApproveRedemption(id);
      setFeedback({ type: 'success', message: 'Redemption approved successfully.' });
      await fetchRedemptions();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to approve.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleFulfill = async (id) => {
    try {
      setProcessingId(id);
      await adminFulfillRedemption(id);
      setFeedback({ type: 'success', message: 'Redemption marked as fulfilled.' });
      await fetchRedemptions();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fulfill.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelAndRefund = async (id) => {
    const reason = window.prompt(
      'Enter reason for cancelling this redemption (CampusCoins will be refunded automatically):',
      'Out of stock or unavailable'
    );
    if (!reason) return;

    try {
      setProcessingId(id);
      await adminCancelRedemption(id, reason);
      setFeedback({ type: 'success', message: 'Redemption cancelled and coins refunded.' });
      await fetchRedemptions();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to cancel.' });
    } finally {
      setProcessingId(null);
    }
  };

  const statuses = [
    { label: 'All Requests', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Fulfilled', value: 'fulfilled' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E9E2] pb-5">
        <div>
          <Link
            to="/admin/rewards"
            className="inline-flex items-center gap-1.5 text-xs text-[#647168] hover:text-[#168451] mb-2 font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Rewards Catalog</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[#17211B] flex items-center gap-2">
            <History className="w-6 h-6 text-[#168451]" />
            Reward Redemptions Queue
          </h1>
          <p className="text-[#647168] text-xs sm:text-sm mt-0.5">
            Review student voucher claims, approve collection, or cancel with automatic coin refunds.
          </p>
        </div>

        <button
          onClick={fetchRedemptions}
          className="self-start md:self-auto p-2.5 rounded-xl bg-white hover:bg-[#F7FAF7] text-[#17211B] border border-[#E1E9E2] transition-colors shadow-xs"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold shadow-xs ${
            feedback.type === 'success'
              ? 'bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451]'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white border border-[#E1E9E2] p-2.5 sm:p-3 rounded-2xl shadow-xs">
        <Filter className="w-4 h-4 text-[#647168] shrink-0 ml-1" />
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              filterStatus === s.value
                ? 'bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4]'
                : 'text-[#647168] hover:bg-[#F7FAF7]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Redemptions Table */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#E1E9E2] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm text-[#17211B]">
            <thead className="bg-[#F7FAF7] text-[11px] sm:text-xs uppercase font-bold text-[#647168] border-b border-[#E1E9E2]">
              <tr>
                <th className="px-5 py-3.5">Student / Time</th>
                <th className="px-5 py-3.5">Reward Item</th>
                <th className="px-5 py-3.5">Cost</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E9E2] font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-[#647168]">
                    Loading redemption claims...
                  </td>
                </tr>
              ) : redemptions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-[#647168]">
                    No redemption requests found for this filter.
                  </td>
                </tr>
              ) : (
                redemptions.map((r) => {
                  const isProcessing = processingId === r.id;
                  return (
                    <tr key={r.id} className="hover:bg-[#F7FAF7] transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#17211B]">
                          {r.user?.full_name || r.user_id?.slice(0, 8)}
                        </div>
                        <div className="text-xs text-[#647168] mt-0.5">
                          {new Date(r.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-[#17211B] flex items-center gap-1.5">
                          <Gift className="w-4 h-4 text-[#168451] shrink-0" />
                          <span>{r.reward?.name || 'Campus Reward'}</span>
                        </div>
                        {r.cancellation_reason && (
                          <div className="text-xs text-rose-600 mt-0.5">
                            Cancelled: {r.cancellation_reason}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-bold text-[#168451]">
                        {r.coins_spent} CC
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full capitalize font-bold border ${
                            r.status === 'fulfilled'
                              ? 'bg-[#EAF6EE] text-[#168451] border-[#CBE7D4]'
                              : r.status === 'approved'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : r.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === 'pending' && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleApprove(r.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#EAF6EE] hover:bg-[#CBE7D4] text-[#168451] border border-[#CBE7D4] text-xs font-bold transition-all"
                            >
                              Approve
                            </button>
                          )}
                          {r.status === 'approved' && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleFulfill(r.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#168451] hover:bg-[#116B42] text-white text-xs font-bold transition-all"
                            >
                              Fulfill
                            </button>
                          )}
                          {(r.status === 'pending' || r.status === 'approved') && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleCancelAndRefund(r.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
                            >
                              Cancel & Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRedemptionsPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  ArrowLeft,
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';
import { getMyRedemptions } from '../../services/gamificationApi';

const RedemptionHistoryPage = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      const data = await getMyRedemptions();
      setRedemptions(data || []);
    } catch (err) {
      console.error('Failed to load redemptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'fulfilled':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] font-bold">
            <PackageCheck className="w-3.5 h-3.5" /> Fulfilled
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold">
            <XCircle className="w-3.5 h-3.5" /> Cancelled & Refunded
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E9E2] pb-5">
        <div>
          <Link
            to="/student/rewards"
            className="inline-flex items-center gap-1.5 text-xs text-[#647168] hover:text-[#168451] mb-2 font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Reward Store</span>
          </Link>
          <h1 className="text-2xl font-black text-[#17211B] flex items-center gap-2">
            <History className="w-6 h-6 text-[#168451]" />
            Redemption History
          </h1>
          <p className="text-[#647168] text-sm mt-0.5">
            Track status of your requested canteen coupons, printing credits, and campus benefits.
          </p>
        </div>

        <button
          onClick={fetchRedemptions}
          className="self-start md:self-auto p-2.5 rounded-xl bg-white hover:bg-[#F7FAF7] text-[#17211B] border border-[#E1E9E2] transition-colors shadow-xs"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="rounded-3xl bg-white border border-[#E1E9E2] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#17211B]">
            <thead className="bg-[#F7FAF7] text-xs uppercase font-bold text-[#647168] border-b border-[#E1E9E2]">
              <tr>
                <th className="px-5 py-3.5">Requested At</th>
                <th className="px-5 py-3.5">Reward Item</th>
                <th className="px-5 py-3.5">Cost</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Redemption Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E9E2] font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-[#647168]">
                    Loading redemption history...
                  </td>
                </tr>
              ) : redemptions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-[#647168]">
                    You haven't redeemed any rewards yet. Visit the{' '}
                    <Link to="/student/rewards" className="text-[#168451] font-bold underline">
                      Reward Store
                    </Link>{' '}
                    to redeem your CampusCoins.
                  </td>
                </tr>
              ) : (
                redemptions.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7FAF7] transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-[#647168]">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {' '}
                      <span className="text-[#647168]/70">
                        {new Date(item.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-[#17211B] flex items-center gap-2">
                        <Gift className="w-4 h-4 text-[#168451] shrink-0" />
                        <span>{item.reward_name || item.reward?.name || 'Campus Reward'}</span>
                      </div>
                      {item.cancellation_reason && (
                        <p className="text-xs text-rose-600 mt-1">
                          Reason: {item.cancellation_reason}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap font-bold text-[#168451]">
                      {item.coins_spent} CC
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-[#647168]">
                      {item.voucher_code || item.id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RedemptionHistoryPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  ArrowLeft,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { getTransactions } from '../../services/gamificationApi';

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getTransactions({
        page,
        limit: 10,
        type: filterType === 'all' ? undefined : filterType,
        search: searchTerm.trim() || undefined,
      });

      setTransactions(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [filterType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory(1);
  };

  const transactionTypes = [
    { label: 'All Transactions', value: 'all' },
    { label: 'Earned', value: 'earned' },
    { label: 'Spent', value: 'spent' },
    { label: 'Bonus', value: 'bonus' },
    { label: 'Penalty', value: 'penalty' },
    { label: 'Refund', value: 'refund' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E9E2] pb-5">
        <div>
          <Link
            to="/student/wallet"
            className="inline-flex items-center gap-1.5 text-xs text-[#647168] hover:text-[#168451] mb-2 font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wallet</span>
          </Link>
          <h1 className="text-2xl font-black text-[#17211B] flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#168451]" />
            Transaction History
          </h1>
          <p className="text-[#647168] text-sm mt-0.5">
            Full immutable ledger of all CampusCoins credited, debited, and refunded.
          </p>
        </div>

        <button
          onClick={() => fetchHistory(pagination.page)}
          className="self-start md:self-auto p-2.5 rounded-xl bg-white hover:bg-[#F7FAF7] text-[#17211B] border border-[#E1E9E2] transition-colors shadow-xs"
          title="Refresh Ledger"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white border border-[#E1E9E2] p-4 rounded-2xl shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-[#647168] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E1E9E2] rounded-xl text-sm text-[#17211B] placeholder-[#647168] focus:outline-none focus:border-[#168451]"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-[#647168] shrink-0" />
          {transactionTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                filterType === t.value
                  ? 'bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4]'
                  : 'bg-white text-[#647168] hover:bg-[#F7FAF7] border border-[#E1E9E2]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-3xl bg-white border border-[#E1E9E2] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#17211B]">
            <thead className="bg-[#F7FAF7] text-xs uppercase font-bold text-[#647168] border-b border-[#E1E9E2]">
              <tr>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E9E2] font-medium">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-[#647168]">
                    Loading ledger records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-[#647168]">
                    No transactions found for the selected criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-[#F7FAF7] transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-[#647168]">
                        {new Date(tx.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {' '}
                        <span className="text-[#647168]/70">
                          {new Date(tx.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-[#17211B]">{tx.description}</div>
                        <div className="text-xs text-[#647168] mt-0.5 font-mono">
                          Event: {tx.event_type}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full capitalize font-bold border ${
                            tx.transaction_type === 'earned'
                              ? 'bg-[#EAF6EE] text-[#168451] border-[#CBE7D4]'
                              : tx.transaction_type === 'spent'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : tx.transaction_type === 'penalty'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : tx.transaction_type === 'refund'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {tx.transaction_type}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right font-bold">
                        <span
                          className={`inline-flex items-center gap-1 text-sm ${
                            isPositive ? 'text-[#168451]' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {isPositive ? `+${tx.amount}` : tx.amount} CC
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#E1E9E2] flex items-center justify-between text-xs text-[#647168]">
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchHistory(pagination.page - 1)}
                className="p-1.5 rounded-lg bg-white border border-[#E1E9E2] hover:bg-[#F7FAF7] disabled:opacity-40 disabled:cursor-not-allowed text-[#17211B]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-[#17211B]">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchHistory(pagination.page + 1)}
                className="p-1.5 rounded-lg bg-white border border-[#E1E9E2] hover:bg-[#F7FAF7] disabled:opacity-40 disabled:cursor-not-allowed text-[#17211B]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ShieldCheck,
  Eye,
  EyeOff,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  getLeaderboard,
  getLeaderboardVisibility,
  setLeaderboardVisibility,
} from '../../services/gamificationApi';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [board, visibility] = await Promise.all([
        getLeaderboard(),
        getLeaderboardVisibility().catch(() => ({ leaderboard_visible: true })),
      ]);
      setLeaderboard(board || []);
      setIsVisible(visibility?.leaderboard_visible !== false);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVisibility = async () => {
    try {
      setToggling(true);
      const nextVal = !isVisible;
      await setLeaderboardVisibility(nextVal);
      setIsVisible(nextVal);
      // Reload leaderboard to reflect visibility changes
      const updatedBoard = await getLeaderboard();
      setLeaderboard(updatedBoard || []);
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    } finally {
      setToggling(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] font-black text-sm">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-black text-sm">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-black text-sm">
          🥉
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F7FAF7] text-[#647168] border border-[#E1E9E2] text-xs font-bold">
        #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E9E2] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451]">
              <Trophy className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#17211B] tracking-tight">
              Campus Impact Leaderboard
            </h1>
          </div>
          <p className="text-[#647168] mt-1 text-xs sm:text-sm">
            Ranked by civic impact score from verified reports and confirmed resolutions.
          </p>
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E1E9E2] shadow-xs">
          <div className="text-right">
            <span className="text-xs font-bold text-[#17211B] block">
              {isVisible ? 'Publicly Visible' : 'Anonymous Mode'}
            </span>
            <span className="text-[11px] text-[#647168]">
              {isVisible ? 'Appears on leaderboard' : 'Hidden from public rank'}
            </span>
          </div>

          <button
            type="button"
            disabled={toggling}
            onClick={handleToggleVisibility}
            className={`p-2.5 rounded-xl border transition-all ${
              isVisible
                ? 'bg-[#EAF6EE] text-[#168451] border-[#CBE7D4] hover:bg-[#EAF6EE]/80'
                : 'bg-[#F7FAF7] text-[#647168] border-[#E1E9E2] hover:text-[#17211B]'
            }`}
            title={isVisible ? 'Make my profile anonymous' : 'Make my profile visible'}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Philosophy Callout */}
      <div className="p-4 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] text-xs flex items-center gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 shrink-0 text-[#168451]" />
        <span>
          <strong>Quality over Quantity:</strong> This leaderboard strictly ranks verified civic contributions and problem resolution confirmations rather than total complaints submitted. Privacy-friendly names are used by default.
        </span>
      </div>

      {/* Leaderboard Table / Card List */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#E1E9E2] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm text-[#17211B]">
            <thead className="bg-[#F7FAF7] text-[11px] sm:text-xs uppercase font-bold text-[#647168] border-b border-[#E1E9E2]">
              <tr>
                <th className="px-3 sm:px-5 py-3.5 w-14 sm:w-16 text-center">Rank</th>
                <th className="px-3 sm:px-5 py-3.5">Contributor</th>
                <th className="px-3 sm:px-5 py-3.5">Rank Title</th>
                <th className="px-3 sm:px-5 py-3.5 text-right">Impact Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E9E2] font-medium">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-[#647168]">
                    Loading campus leaders...
                  </td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-[#647168]">
                    No contributors on the leaderboard yet.
                  </td>
                </tr>
              ) : (
                leaderboard.map((student) => (
                  <tr
                    key={student.rank}
                    className={`hover:bg-[#F7FAF7] transition-colors ${
                      student.rank <= 3 ? 'bg-[#EAF6EE]/30' : ''
                    }`}
                  >
                    <td className="px-3 sm:px-5 py-3.5 text-center">{getRankBadge(student.rank)}</td>

                    <td className="px-3 sm:px-5 py-3.5">
                      <div className="font-bold text-[#17211B] flex items-center gap-1.5 text-xs sm:text-sm">
                        <span>{student.displayName}</span>
                        {student.rank === 1 && (
                          <Sparkles className="w-3.5 h-3.5 text-[#168451]" />
                        )}
                      </div>
                      <div className="text-[11px] text-[#647168] mt-0.5">
                        Level {student.level} Contributor
                      </div>
                    </td>

                    <td className="px-3 sm:px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4]">
                        <Award className="w-3.5 h-3.5 text-[#168451]" />
                        {student.levelName || 'Campus Contributor'}
                      </span>
                    </td>

                    <td className="px-3 sm:px-5 py-3.5 whitespace-nowrap text-right">
                      <span className="text-sm sm:text-base font-black text-[#168451]">
                        {student.impactScore.toLocaleString()}
                      </span>
                      <span className="text-[10px] sm:text-xs text-[#647168] block font-normal">Impact Points</span>
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

export default LeaderboardPage;

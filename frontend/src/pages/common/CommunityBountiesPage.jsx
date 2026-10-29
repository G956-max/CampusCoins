import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  Coins,
  Clock,
  CheckCircle2,
  Users,
  Target,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CommunityBountiesPage = () => {
  const { user } = useAuth();
  const [bounties, setBounties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchBounties = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/bounties');
      if (res.data?.success) {
        setBounties(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching bounties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  const handleClaim = async (bountyId) => {
    setClaimingId(bountyId);
    setMessage(null);
    try {
      const res = await api.post(`/bounties/${bountyId}/claim`);
      if (res.data?.success) {
        setMessage({
          type: 'success',
          text: res.data.message || 'Bounty reward claimed successfully!',
        });
        fetchBounties();
      } else {
        setMessage({
          type: 'error',
          text: res.data.message || 'Unable to claim bounty at this time',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Verification requirement not met for this bounty',
      });
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Community Bounties & Campus Challenges"
        subtitle="Collaborate on verified infrastructure audits, energy conservation challenges, and campus improvement missions"
        badge={
          <Badge variant="success" size="sm" withDot>
            Civic Bounties Active
          </Badge>
        }
      />

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs animate-fadeIn ${
            message.type === 'success'
              ? 'bg-[#EAF6EE] border-[#CBE7D4] text-[#168451]'
              : 'bg-[#FDF2F2] border-[#F8D2D2] text-[#C43D3D]'
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="font-bold ml-4 hover:opacity-80"
          >
            &times;
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-[#E1E9E2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-xs text-[#647168] font-medium uppercase">Active Challenges</p>
              <h3 className="text-xl font-bold text-[#17211B]">{bounties.length} Available</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-[#E1E9E2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF9EE] text-[#B7791F] border border-[#F8E7C5] flex items-center justify-center">
              <Coins size={20} />
            </div>
            <div>
              <p className="text-xs text-[#647168] font-medium uppercase">Total Prize Pool</p>
              <h3 className="text-xl font-bold text-[#17211B]">
                {bounties.reduce((sum, b) => sum + (b.reward_coins || b.rewardCoins || 0), 0)} Coins
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-[#E1E9E2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F7FF] text-[#1E6091] border border-[#D0E5FA] flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs text-[#647168] font-medium uppercase">Verification Standard</p>
              <h3 className="text-xl font-bold text-[#17211B]">Audited Proof</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Bounties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 p-12 text-center text-xs text-[#647168]">
            Loading community challenges...
          </div>
        ) : bounties.length === 0 ? (
          <div className="col-span-2 p-12 text-center">
            <Trophy size={36} className="mx-auto text-[#647168]/40 mb-2" />
            <h4 className="text-sm font-semibold text-[#17211B]">No active community bounties</h4>
            <p className="text-xs text-[#647168] mt-1">Check back soon for new campus improvement initiatives.</p>
          </div>
        ) : (
          bounties.map((bounty) => {
            const reward = bounty.reward_coins || bounty.rewardCoins || 50;
            const requirement = bounty.requirement_count || bounty.requirementCount || 1;
            const progress = bounty.progress || 0;
            const isCompleted = progress >= requirement;

            return (
              <Card key={bounty.id} hover className="p-5 border-[#E1E9E2] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Badge variant="purple" size="sm">
                      {bounty.category || 'Campus Improvement'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#B7791F] bg-[#FEF9EE] border border-[#F8E7C5] px-2.5 py-0.5 rounded-full">
                      <Coins size={13} />
                      <span>+{reward} Coins</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#17211B] mt-1 mb-1.5">
                    {bounty.title}
                  </h3>
                  <p className="text-xs text-[#647168] leading-relaxed mb-4">
                    {bounty.description}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[11px] text-[#647168]">
                      <span>Community Progress</span>
                      <span className="font-semibold text-[#17211B]">{progress} / {requirement} verified</span>
                    </div>
                    <div className="w-full h-2 bg-[#F7FAF7] rounded-full overflow-hidden border border-[#E1E9E2]">
                      <div
                        className="h-full bg-[#168451] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round((progress / requirement) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E1E9E2] flex items-center justify-between">
                  <span className="text-[11px] text-[#647168] flex items-center gap-1">
                    <Clock size={12} />
                    Valid through semester end
                  </span>

                  <Button
                    size="sm"
                    variant={isCompleted ? 'primary' : 'outline'}
                    disabled={!isCompleted || claimingId === bounty.id}
                    isLoading={claimingId === bounty.id}
                    onClick={() => handleClaim(bounty.id)}
                  >
                    {isCompleted ? 'Claim Reward' : 'In Progress'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommunityBountiesPage;

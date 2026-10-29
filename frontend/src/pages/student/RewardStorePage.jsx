import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Coins,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  Sparkles,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getRewards, redeemReward, getWallet } from '../../services/gamificationApi';

const RewardStorePage = () => {
  const [rewards, setRewards] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [voucherModal, setVoucherModal] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rewardsData, walletData] = await Promise.all([
        getRewards(),
        getWallet(),
      ]);
      setRewards(rewardsData || []);
      setBalance(walletData?.balance || 0);
    } catch (err) {
      console.error('Failed to load reward store:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRedeemModal = (reward) => {
    setFeedback(null);
    setSelectedReward(reward);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;
    try {
      setRedeeming(true);
      const res = await redeemReward(selectedReward.id);
      const newBal = res.newBalance !== undefined ? res.newBalance : balance - selectedReward.coin_cost;
      setBalance(newBal);

      const voucherCode = res.redemption?.voucher_code || res.voucher_code || 'VCH-PENDING';
      const expiry = res.redemption?.expires_at || new Date(Date.now() + 7 * 86400000).toLocaleDateString();

      setVoucherModal({
        rewardName: selectedReward.name,
        voucherCode,
        expiry,
      });

      setSelectedReward(null);
      // Reload rewards to reflect decremented stock
      const updatedRewards = await getRewards();
      setRewards(updatedRewards || []);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Redemption request failed. Please check your balance.',
      });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-4 animate-fadeIn">
      {/* Top Banner */}
      <PageHeader
        title="CampusCoins Reward Store"
        subtitle="Redeem your verified civic coins for cafeteria meal vouchers, library printing credits, and campus merchandise"
        badge={
          <Badge variant="success" size="sm" withDot>
            Live Inventory
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451]">
              <Coins size={16} />
              <span className="text-xs text-[#647168]">Balance:</span>
              <span className="text-sm font-bold text-[#168451]">{balance.toLocaleString()} CC</span>
            </div>

            <Link to="/student/rewards/history">
              <Button variant="outline" size="sm" leftIcon={<History size={15} />}>
                My Redemptions
              </Button>
            </Link>
          </div>
        }
      />

      {/* Feedback Banner */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center justify-between text-xs animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451]'
              : 'bg-[#FDF2F2] border border-[#F8D2D2] text-[#C43D3D]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-80">
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#647168] text-xs">
            Loading reward store catalog...
          </div>
        ) : rewards.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Gift size={36} className="mx-auto text-[#647168]/40 mb-2" />
            <h4 className="text-sm font-semibold text-[#17211B]">No active rewards available</h4>
            <p className="text-xs text-[#647168] mt-1">Catalog items are configured and updated by campus administration.</p>
          </div>
        ) : (
          rewards.map((reward) => {
            const canAfford = balance >= reward.coin_cost;
            const inStock = reward.stock === null || reward.stock > 0;

            return (
              <Card
                key={reward.id}
                hover
                className="border-[#E1E9E2] overflow-hidden flex flex-col justify-between group bg-white"
              >
                <div>
                  {/* Image Container */}
                  <div className="h-44 w-full bg-[#F7FAF7] relative overflow-hidden border-b border-[#E1E9E2]">
                    <img
                      src={
                        reward.image_url ||
                        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60'
                      }
                      alt={reward.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#B7791F] border border-[#E1E9E2] flex items-center gap-1 shadow-sm">
                      <Coins size={13} />
                      {reward.coin_cost} CC
                    </span>

                    {reward.stock !== null && (
                      <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-xs font-semibold bg-white/90 text-[#17211B] border border-white flex items-center gap-1 shadow-xs">
                        <Package size={12} />
                        {reward.stock > 0 ? `${reward.stock} in stock` : 'Out of Stock'}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <span className="text-[11px] font-semibold text-[#647168] uppercase tracking-wider">
                      {reward.category || 'Campus Benefit'}
                    </span>
                    <h3 className="text-base font-bold text-[#17211B] mt-1 group-hover:text-[#168451] transition-colors">
                      {reward.name}
                    </h3>
                    <p className="text-xs text-[#647168] mt-1.5 leading-relaxed">
                      {reward.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    disabled={!canAfford || !inStock}
                    onClick={() => handleOpenRedeemModal(reward)}
                    variant={canAfford && inStock ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full justify-center"
                    rightIcon={<ArrowRight size={14} />}
                  >
                    {!inStock
                      ? 'Out of Stock'
                      : !canAfford
                      ? `Need ${reward.coin_cost - balance} more CC`
                      : 'Redeem Reward'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Redemption Confirmation Modal */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17211B]/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-2xl bg-white border border-[#E1E9E2] p-6 shadow-2xl text-[#17211B] relative"
            >
              <button
                onClick={() => setSelectedReward(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#647168] hover:text-[#17211B] hover:bg-[#F7FAF7]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4]">
                  <Gift size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Confirm Reward Redemption</h3>
                  <p className="text-xs text-[#647168]">Instant atomic coin transaction</p>
                </div>
              </div>

              <div className="rounded-xl bg-[#F7FAF7] border border-[#E1E9E2] p-4 space-y-2.5 text-xs my-4">
                <div className="flex justify-between items-center text-[#647168]">
                  <span>Item:</span>
                  <span className="font-bold text-[#17211B]">{selectedReward.name}</span>
                </div>
                <div className="flex justify-between items-center text-[#647168]">
                  <span>Cost:</span>
                  <span className="font-bold text-[#C43D3D]">-{selectedReward.coin_cost} CC</span>
                </div>
                <div className="flex justify-between items-center text-[#647168] pt-2 border-t border-[#E1E9E2]">
                  <span>Current Balance:</span>
                  <span className="font-semibold text-[#17211B]">{balance} CC</span>
                </div>
                <div className="flex justify-between items-center text-[#168451] font-bold pt-1">
                  <span>Balance After:</span>
                  <span>{balance - selectedReward.coin_cost} CC</span>
                </div>
              </div>

              <p className="text-xs text-[#647168] mb-5 leading-relaxed">
                A single-use QR voucher will be generated immediately for fulfillment at the campus facility.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => setSelectedReward(null)}
                  disabled={redeeming}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={handleConfirmRedeem}
                  isLoading={redeeming}
                >
                  Confirm & Deduct
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Single-Use QR Voucher Modal */}
      <AnimatePresence>
        {voucherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17211B]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white border border-[#E1E9E2] p-6 shadow-2xl text-center text-[#17211B] relative"
            >
              <button
                onClick={() => setVoucherModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#647168] hover:text-[#17211B]"
              >
                <X size={18} />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center mx-auto mb-3 shadow-sm">
                <QrCode size={28} />
              </div>

              <h3 className="text-base font-bold text-[#17211B]">Voucher Ready to Redeem!</h3>
              <p className="text-xs text-[#647168] mt-1">{voucherModal.rewardName}</p>

              <div className="my-5 p-4 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2]">
                <span className="text-[10px] uppercase font-semibold text-[#647168] tracking-wider block mb-1">
                  Single-Use Verification Code
                </span>
                <span className="font-mono text-lg font-extrabold text-[#168451] tracking-widest block">
                  {voucherModal.voucherCode}
                </span>
                <span className="text-[11px] text-[#647168] mt-2 flex items-center justify-center gap-1">
                  <Clock size={11} /> Valid for 7 days
                </span>
              </div>

              <p className="text-xs text-[#647168] leading-relaxed mb-5">
                Present this code or your mobile screen at the campus canteen/facility operator. Once verified, the voucher cannot be reused.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => setVoucherModal(null)}
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardStorePage;

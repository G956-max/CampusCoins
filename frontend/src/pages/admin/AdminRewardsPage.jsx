import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  Package,
  Coins,
  History,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  adminGetAllRewards,
  adminCreateReward,
  adminUpdateReward,
  adminDeleteReward,
} from '../../services/gamificationApi';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const AdminRewardsPage = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coin_cost: 100,
    stock: 50,
    category: 'Food & Dining',
    image_url: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const data = await adminGetAllRewards();
      setRewards(data || []);
    } catch (err) {
      console.error('Failed to load admin rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingReward(null);
    setFormData({
      name: '',
      description: '',
      coin_cost: 100,
      stock: 50,
      category: 'Food & Dining',
      image_url: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || '',
      coin_cost: reward.coin_cost,
      stock: reward.stock !== null ? reward.stock : '',
      category: reward.category || 'General',
      image_url: reward.image_url || '',
      is_active: Boolean(reward.is_active),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.coin_cost) {
      setFeedback({ type: 'error', message: 'Name and coin cost are required.' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        coin_cost: Number(formData.coin_cost),
        stock: formData.stock !== '' ? Number(formData.stock) : null,
      };

      if (editingReward) {
        await adminUpdateReward(editingReward.id, payload);
        setFeedback({ type: 'success', message: 'Reward updated successfully.' });
      } else {
        await adminCreateReward(payload);
        setFeedback({ type: 'success', message: 'New reward created successfully.' });
      }

      setModalOpen(false);
      await fetchRewards();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save reward.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this reward?')) return;
    try {
      await adminDeleteReward(id);
      setFeedback({ type: 'success', message: 'Reward removed.' });
      await fetchRewards();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to delete reward.' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E9E2] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451]">
              <Gift className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#17211B] tracking-tight">
              Reward Store Catalog Management
            </h1>
          </div>
          <p className="text-[#647168] mt-1 text-xs sm:text-sm">
            Configure redeemable campus perks, vouchers, canteen discounts, and stock levels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start md:self-auto">
          <Link
            to="/admin/redemptions"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-[#F7FAF7] text-[#17211B] border border-[#E1E9E2] font-bold text-xs sm:text-sm transition-colors shadow-xs"
          >
            <History className="w-4 h-4 text-[#168451]" />
            <span>Redemptions Queue</span>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
          >
            Add New Reward
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between shadow-xs ${
            feedback.type === 'success'
              ? 'bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] font-semibold'
              : 'bg-rose-50 border border-rose-200 text-rose-700 font-semibold'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#647168] text-sm">
            Loading catalog...
          </div>
        ) : rewards.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white border border-[#E1E9E2] shadow-xs">
            <p className="text-[#647168] text-sm">No reward items configured in the catalog.</p>
          </div>
        ) : (
          rewards.map((reward) => (
            <div
              key={reward.id}
              className="rounded-3xl bg-white border border-[#E1E9E2] p-5 flex flex-col justify-between shadow-xs hover:border-[#168451]/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#168451] block">
                      {reward.coin_cost} Coins
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                        reward.is_active
                          ? 'bg-[#EAF6EE] text-[#168451] border-[#CBE7D4]'
                          : 'bg-[#F7FAF7] text-[#647168] border-[#E1E9E2]'
                      }`}
                    >
                      {reward.is_active ? 'Active' : 'Archived'}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-[#17211B]">{reward.name}</h3>
                  <p className="text-xs text-[#647168] mt-1 leading-relaxed">
                    {reward.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E1E9E2] flex items-center justify-between text-xs">
                <span className="text-[#647168] flex items-center gap-1 font-medium">
                  <Package className="w-3.5 h-3.5" />
                  Stock: {reward.stock !== null ? reward.stock : 'Unlimited'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(reward)}
                    className="p-1.5 rounded-lg text-[#647168] hover:text-[#168451] hover:bg-[#EAF6EE] transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="p-1.5 rounded-lg text-[#647168] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Add / Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingReward ? 'Edit Reward Item' : 'Create New Reward Item'}
        description="Configure details, cost, stock, and status for the student reward store."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSubmit}>
              {editingReward ? 'Save Changes' : 'Create Reward'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Reward Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Campus Canteen 20% Discount Coupon"
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain what the student receives and terms of redemption..."
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#17211B] mb-1.5">
                Coin Cost <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.coin_cost}
                onChange={(e) => setFormData({ ...formData, coin_cost: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17211B] mb-1.5">
                Initial Stock (Blank = Unlimited)
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#17211B] mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
              >
                <option value="Food & Dining">Food & Dining</option>
                <option value="Academics">Academics & Printing</option>
                <option value="Events">Campus Events</option>
                <option value="Merchandise">Merchandise</option>
                <option value="Other">Other Benefits</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded bg-white border-[#E1E9E2] text-[#168451] focus:ring-0"
                />
                <span className="text-xs font-bold text-[#17211B]">Active in Store</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRewardsPage;

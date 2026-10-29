import React, { useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Gift,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';

const StaffVerifyVoucherPage = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentVerifications, setRecentVerifications] = useState([]);

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!voucherCode.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post('/rewards/verify-voucher', {
        voucher_code: voucherCode.trim().toUpperCase(),
      });

      if (res.data?.success) {
        const redemption = res.data.data?.redemption;
        setResult(redemption);
        setRecentVerifications((prev) => [
          {
            code: voucherCode.trim().toUpperCase(),
            reward: redemption.reward_title || 'Campus Reward',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            success: true,
          },
          ...prev.slice(0, 9),
        ]);
        setVoucherCode('');
      } else {
        setError(res.data?.message || 'Verification failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or already redeemed voucher code';
      setError(msg);
      setRecentVerifications((prev) => [
        {
          code: voucherCode.trim().toUpperCase(),
          reward: 'Verification Failed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          success: false,
          errorMsg: msg,
        },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Voucher Verification Console"
        subtitle="Validate and fulfill student CampusCoin QR vouchers at canteens, stationery stores, and campus facilities"
        badge={
          <Badge variant="success" size="sm" withDot>
            Voucher Scanner Ready
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Form Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-[#E1E9E2] p-6">
            <h3 className="text-base font-semibold text-[#17211B] flex items-center gap-2 mb-2">
              <QrCode size={20} className="text-[#168451]" />
              Enter Voucher Code
            </h3>
            <p className="text-xs text-[#647168] mb-6">
              Enter the unique 16-character voucher code presented by the student (e.g. VCH-ABCD-EFGH-1234) or scan the QR code.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="VCH-XXXX-XXXX-XXXX"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="font-mono uppercase text-base tracking-wider"
                    leftIcon={<QrCode size={18} />}
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  disabled={!voucherCode.trim()}
                  className="shrink-0"
                >
                  Verify & Fulfill
                </Button>
              </div>
            </form>

            {/* Error Banner */}
            {error && (
              <div className="mt-5 p-4 rounded-xl bg-[#FDF2F2] border border-[#F8D2D2] flex items-start gap-3 animate-fadeIn">
                <AlertCircle size={20} className="text-[#C43D3D] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#C43D3D]">Verification Rejected</h4>
                  <p className="text-xs text-[#647168] mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Success Result */}
            {result && (
              <div className="mt-5 p-5 rounded-xl bg-[#EAF6EE] border border-[#CBE7D4] space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-[#168451]">
                  <CheckCircle2 size={22} />
                  <h4 className="text-sm font-bold">Voucher Verified & Fulfilled!</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div>
                    <span className="text-[#647168] block">Reward Item:</span>
                    <span className="font-semibold text-[#17211B] text-sm">
                      {result.reward_title || 'Campus Store Benefit'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#647168] block">Student ID:</span>
                    <span className="font-mono font-semibold text-[#17211B]">
                      {result.user_id ? result.user_id.substring(0, 13) + '...' : 'Student User'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#647168] block">Status:</span>
                    <Badge variant="success" size="sm">
                      Fulfilled
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[#647168] block">Voucher Code:</span>
                    <span className="font-mono font-bold text-[#168451]">
                      {result.voucher_code}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#647168] block">Fulfilled At:</span>
                    <span className="font-semibold text-[#17211B]">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Quick instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 border-[#E1E9E2]">
              <div className="flex items-center gap-2.5 mb-1.5 text-xs font-semibold text-[#17211B]">
                <ShieldCheck size={16} className="text-[#168451]" />
                Anti-Fraud Safeguards
              </div>
              <p className="text-xs text-[#647168] leading-relaxed">
                Every voucher code is cryptographically unique and strictly single-use. Once verified, the database prevents duplicate fulfillment attempts automatically.
              </p>
            </Card>

            <Card className="p-4 border-[#E1E9E2]">
              <div className="flex items-center gap-2.5 mb-1.5 text-xs font-semibold text-[#17211B]">
                <Clock size={16} className="text-[#B7791F]" />
                Expiry Policies
              </div>
              <p className="text-xs text-[#647168] leading-relaxed">
                Vouchers have a 7-day validity window from redemption. Expired vouchers cannot be fulfilled and must be re-requested through student support.
              </p>
            </Card>
          </div>
        </div>

        {/* Recent Session Logs */}
        <div>
          <Card className="border-[#E1E9E2]">
            <CardHeader>
              <CardTitle>Session Verification Log</CardTitle>
              <p className="text-xs text-[#647168]">Recent codes processed on this terminal</p>
            </CardHeader>
            <CardContent className="p-0">
              {recentVerifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#647168]">
                  No vouchers scanned yet in this session.
                </div>
              ) : (
                <div className="divide-y divide-[#E1E9E2]">
                  {recentVerifications.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-[#17211B]">
                            {item.code}
                          </span>
                          <Badge variant={item.success ? 'success' : 'danger'} size="sm">
                            {item.success ? 'Valid' : 'Rejected'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[#647168] mt-0.5">{item.reward}</p>
                      </div>
                      <span className="text-[10px] text-[#647168] font-mono">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffVerifyVoucherPage;

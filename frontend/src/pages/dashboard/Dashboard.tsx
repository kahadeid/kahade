import { SkipToContent } from '@/lib/accessibility';
/*
 * KAHADE USER DASHBOARD - Clean Professional Design
 * 
 * Layout Structure (Mobile-First):
 * 1. Header: Logo (left), Support/Notification/Message icons (right)
 * 2. Greeting: "Hai, User! Selamat Sore!" with large friendly text
 * 3. Balance Card: Total Saldo with eye toggle (NO Topup/Withdraw buttons here)
 * 4. Statistics: Transaction stats in clean cards
 * 5. Promo Banner: Promotional content
 * 6. Recent Transactions: Latest orders
 * 
 * Design Notes:
 * - Background: var(--color-white) (white)
 * - No Create/New Order on home (already in navigation)
 * - No Topup/Withdraw on home (moved to Wallet page)
 * - No Notifications section (has dedicated page)
 * - Clean, minimal, professional design
 */

import { useEffect, useState, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Wallet, Clock, CheckCircle, Warning, ArrowRight, Spinner,
  Receipt, Eye, EyeSlash, Star, CaretRight, Package, 
  ArrowDownRight, ArrowUpRight, ChartLineUp, TrendUp,
  Headset, Bell, ChatCircle
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { walletApi, transactionApi, userApi } from '@/lib/api';

interface WalletBalance {
  available: number;
  locked: number;
  total: number;
  currency: string;
}

interface Transaction {
  id: string;
  orderNumber: string;
  title: string;
  amount: number;
  status: string;
  initiatorRole: string;
  counterparty?: { username: string };
  createdAt: string;
  category?: string;
  deliveryProof?: { id: string }; // Used to determine DELIVERED virtual status
}

interface UserStats {
  totalTransactions: number;
  completedTransactions: number;
  totalVolume: number;
  rating: number;
  ratingCount: number;
  kycStatus: string;
  memberSince: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  WAITING_COUNTERPARTY: { label: 'Menunggu', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Clock },
  PENDING_ACCEPT: { label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Clock },
  ACCEPTED: { label: 'Diterima', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: CheckCircle },
  PAID: { label: 'Dibayar', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: CheckCircle },
  DELIVERED: { label: 'Dikirim', color: 'text-indigo-600', bgColor: 'bg-indigo-50', icon: Package },
  COMPLETED: { label: 'Selesai', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: CheckCircle },
  DISPUTED: { label: 'Sengketa', color: 'text-red-600', bgColor: 'bg-red-50', icon: Warning },
  CANCELLED: { label: 'Dibatalkan', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: Warning },
  REFUNDED: { label: 'Dikembalikan', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: ArrowDownRight },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID');
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  // Calculate stats from transactions
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const txList = Array.isArray(transactions) ? transactions : [];
    
    const thisMonthTx = txList.filter(t => new Date(t.createdAt) >= monthStart);
    const inProgress = txList.filter(t => 
      ['PENDING_ACCEPT', 'ACCEPTED', 'PAID', 'DELIVERED', 'WAITING_COUNTERPARTY'].includes(t.status)
    ).length;
    const completedThisMonth = thisMonthTx.filter(t => t.status === 'COMPLETED').length;
    const volumeThisMonth = thisMonthTx.reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      total: txList.length,
      inProgress,
      completedThisMonth,
      volumeThisMonth,
    };
  }, [transactions]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [balanceRes, transactionsRes, statsRes] = await Promise.all([
          walletApi.getBalance().catch(() => ({ data: null })),
          transactionApi.list({ limit: 10 }).catch(() => ({ data: { data: [] } })),
          userApi.getStats().catch(() => ({ data: null })),
        ]);

        setBalance(balanceRes.data);
        
        const txData = transactionsRes.data.data || transactionsRes.data.transactions || transactionsRes.data;
        setTransactions(Array.isArray(txData) ? txData : []);

        if (statsRes.data) {
          setUserStats(statsRes.data);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner className="w-1 aria-hidden="true"0 h-10 animate-spin text-black mx-auto mb-4" weight="bold" aria-hidden="true" />
            <p className="text-neutral-600">Memuat dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-white min-h-screen">
        {/* ========== MOBILE HEADER ========== */}
        <div className="md:hidden sticky top-0 z-40 bg-white border-b border-neutral-100">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Logo */}
            <Link href="/">
              <img 
                src="/images/logo.svg" 
                alt="Kahade" 
                className="h-7 w-auto"
              />
            </Link>
            
            {/* Right Icons */}
            <div className="flex items-center gap-1">
              <Link href="/help">
                <button className="p-2.5 rounded-xl hover:bg-neutral-100 transition-colors">
                  <Headset className="w-6 aria-hidden="true" h-6 text-black" weight="regular" aria-hidden="true" />
                </button>
              </Link>
              <Link href="/notifications">
                <button className="relative p-2.5 rounded-xl hover:bg-neutral-100 transition-colors">
                  <Bell className="w-6 aria-hidden="true" h-6 text-black" weight="regular" aria-hidden="true" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </Link>
              <Link href="/messages">
                <button className="p-2.5 rounded-xl hover:bg-neutral-100 transition-colors">
                  <ChatCircle className="w-6 aria-hidden="true" h-6 text-black" weight="regular" aria-hidden="true" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-5">
          {/* ========== GREETING SECTION ========== */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Hai, {user?.username || 'User'}!
            </h1>
            <p className="text-lg md:text-xl text-foreground mt-1">
              {getGreeting()} 👋
            </p>
          </motion.div>

          {/* ========== BALANCE CARD ========== */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-4 border border-neutral-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 aria-hidden="true" h-5 text-neutral-600" weight="regular" aria-hidden="true" />
                <span className="text-sm font-medium text-neutral-600">Total Saldo</span>
              </div>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                {showBalance ? (
                  <Eye className="w-5 aria-hidden="true" h-5 text-neutral-600" weight="regular" aria-hidden="true" />
                ) : (
                  <EyeSlash className="w-5 aria-hidden="true" h-5 text-neutral-600" weight="regular" aria-hidden="true" />
                )}
              </button>
            </div>
            
            <div className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {showBalance ? formatCurrency(balance?.available || 0) : 'Rp ••••••••'}
            </div>
            
            {balance?.locked && balance.locked > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-neutral-600">
                <Clock className="w-4 aria-hidden="true" h-4" weight="regular" aria-hidden="true" />
                <span>{formatCurrency(balance.locked)} dalam escrow</span>
              </div>
            )}

            {/* Quick link to wallet */}
            <Link href="/wallet">
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200 hover:bg-neutral-100 -mx-5 px-5 py-2 transition-colors cursor-pointer">
                <span className="text-sm font-medium text-foreground">Kelola Saldo</span>
                <CaretRight className="w-5 aria-hidden="true" h-5 text-neutral-500" weight="regular" aria-hidden="true" />
              </div>
            </Link>
          </motion.div>

          {/* ========== STATISTICS CARDS ========== */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">Statistik</h2>
              <Link href="/activity">
                <span className="text-sm text-neutral-600 hover:text-foreground transition-colors">
                  Lihat Semua
                </span>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Total Transaksi */}
              <div className="bg-white rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-5 aria-hidden="true" h-5 text-neutral-600" weight="regular" aria-hidden="true" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-xs text-neutral-600 mt-1">Total Transaksi</div>
              </div>

              {/* Sedang Berjalan */}
              <div className="bg-white rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 aria-hidden="true" h-5 text-neutral-600" weight="regular" aria-hidden="true" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.inProgress}</div>
                <div className="text-xs text-neutral-600 mt-1">Sedang Berjalan</div>
              </div>

              {/* Selesai Bulan Ini */}
              <div className="bg-white rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 aria-hidden="true" h-5 text-neutral-600" weight="regular" aria-hidden="true" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.completedThisMonth}</div>
                <div className="text-xs text-neutral-600 mt-1">Selesai Bulan Ini</div>
              </div>

              {/* Rating */}
              <div className="bg-white rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 aria-hidden="true" h-5 text-neutral-600" weight="regular" aria-hidden="true" />
                </div>
                <div className="text-2xl font-bold text-foreground flex items-center gap-1">
                  {userStats?.rating?.toFixed(1) || '5.0'}
                  <span className="text-sm font-normal text-neutral-600">
                    ({userStats?.ratingCount || 0})
                  </span>
                </div>
                <div className="text-xs text-neutral-600 mt-1">Rating</div>
              </div>
            </div>
          </motion.div>

          {/* ========== PROMO BANNER ========== */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Link href="/referrals">
              <div className="bg-gradient-to-r from-[#0A0A0A] to-[#333333] rounded-2xl p-4 text-white relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5" aria-hidden="true">
                  <div className="absolute inset-0" aria-hidden="true" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Undang Teman, Dapat Bonus!</h3>
                      <p className="text-sm text-white/70 mb-3">
                        Dapatkan Rp 10.000 + 25% komisi untuk setiap teman yang bergabung
                      </p>
                      <div className="inline-flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 text-sm font-medium">
                        <TrendUp className="w-4 aria-hidden="true" h-4" weight="bold" aria-hidden="true" />
                        Mulai Undang
                      </div>
                    </div>
                    <CaretRight className="w-6 aria-hidden="true" h-6 text-white/50" weight="bold" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* ========== RECENT TRANSACTIONS ========== */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">Transaksi Terbaru</h2>
              <Link href="/transactions">
                <span className="text-sm text-neutral-600 hover:text-foreground transition-colors flex items-center gap-1">
                  Lihat Semua
                  <ArrowRight className="w-4 aria-hidden="true" h-4" weight="regular" aria-hidden="true" />
                </span>
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              {transactions.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-200 flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-7 aria-hidden="true" h-7 text-neutral-500" weight="regular" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Belum ada transaksi</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Mulai transaksi pertama Anda dengan aman
                  </p>
                  <Link href="/transactions/new">
                    <Button className="bg-black text-white hover:bg-black/90 rounded-xl">
                      Buat Transaksi
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {transactions.slice(0, 5).map((tx, index) => {
                    // Determine effective status - DELIVERED is virtual when PAID + has deliveryProof
                    const effectiveStatus = tx.status === 'PAID' && tx.deliveryProof ? 'DELIVERED' : tx.status;
                    const status = statusConfig[effectiveStatus] || statusConfig.PENDING_ACCEPT;
                    const isBuyer = tx.initiatorRole === 'BUYER';
                    const isLast = index === Math.min(transactions.length - 1, 4);
                    
                    return (
                      <Link key={tx.id} href={`/transactions/${tx.id}`}>
                        <motion.div 
                          whileTap={{ scale: 0.99 }}
                          className={`flex items-center gap-4 p-4 bg-white hover:bg-neutral-50 transition-colors cursor-pointer ${!isLast ? 'border-b border-neutral-200' : ''}`}
                        >
                          {/* Status Icon */}
                          <div className={`w-10 h-10 rounded-xl ${status.bgColor} flex items-center justify-center shrink-0`}>
                            <status.icon className={`w-5 h-5 ${status.color}`} weight="fill" />
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground text-sm truncate">{tx.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-600 mt-0.5">
                              <span>{isBuyer ? 'Beli dari' : 'Jual ke'} {tx.counterparty?.username || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(tx.createdAt)}</span>
                            </div>
                          </div>
                          
                          {/* Amount & Status */}
                          <div className="text-right shrink-0">
                            <div className={`font-semibold text-sm ${isBuyer ? 'text-red-600' : 'text-emerald-600'}`}>
                              {isBuyer ? '-' : '+'}{formatCurrency(tx.amount)}
                            </div>
                            <Badge className={`${status.bgColor} ${status.color} border-0 text-[10px] mt-1`}>
                              {status.label}
                            </Badge>
                          </div>
                          
                          {/* Arrow */}
                          <CaretRight className="w-4 aria-hidden="true" h-4 text-neutral-300 shrink-0" weight="regular" aria-hidden="true" />
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Bottom spacing for mobile navigation */}
          <div className="h-20 md:hidden" />
        </div>
      </div>
    </DashboardLayout>
  );
}

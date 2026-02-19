/**
 * KAHADE ADMIN DASHBOARD
 * Complete admin dashboard with stats, charts, alerts, and quick actions
 * Icons: Phosphor Icons only
 */

import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Users, ArrowsLeftRight, Wallet, Warning, ChartLineUp,
  ChartLineDown, Spinner, CaretRight, Eye, ShieldCheck,
  Clock, CheckCircle, Export, Funnel, ArrowDown, ArrowUp,
  IdentificationCard, CurrencyCircleDollar, Receipt, Bell,
  ArrowsClockwise, TrendUp, TrendDown, Calendar, ChartBar,
  UserPlus, Handshake, Lightning, Database, Pulse
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from '@/components/layout/AdminLayout';
import { adminApi } from '@/lib/api';

interface DashboardStats {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    activeTransactions: number;
    pendingWithdrawals: number;
    pendingDisputes: number;
    todayVolume: number;
    totalVolume: number;
  };
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  orderNumber: string;
  title: string;
  amount: number;
  status: string;
  initiator?: { id: string; username: string; email: string };
  counterparty?: { id: string; username: string; email: string };
  createdAt: string;
}

interface Dispute {
  id: string;
  order?: { orderNumber: string };
  reason: string;
  status: string;
  priority?: string;
  openedAt?: string;
  openedBy?: { username: string };
}

interface AnalyticsOverview {
  transactions: { today: number; week: number; month: number; change: string };
  volume: { today: number; week: number; month: number; change: string };
  users: { today: number; week: number; month: number };
  alerts: { disputes: number; pendingWithdrawals: number; pendingKYC: number };
}

interface ChartData {
  date: string;
  transactions: number;
  volume: number;
  revenue: number;
  users: number;
  deposits: number;
  withdrawals: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompact = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const statusConfig: Record<string, { color: string; bgColor: string }> = {
  PAID: { color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  FUNDED: { color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  PENDING: { color: 'text-amber-600', bgColor: 'bg-amber-100' },
  PENDING_ACCEPT: { color: 'text-amber-600', bgColor: 'bg-amber-100' },
  WAITING_COUNTERPARTY: { color: 'text-amber-600', bgColor: 'bg-amber-100' },
  AWAITING_PAYMENT: { color: 'text-amber-600', bgColor: 'bg-amber-100' },
  AWAITING_DELIVERY: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  DELIVERED: { color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  COMPLETED: { color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  DISPUTED: { color: 'text-red-600', bgColor: 'bg-red-100' },
  CANCELLED: { color: 'text-gray-600', bgColor: 'bg-gray-100' },
  EXPIRED: { color: 'text-gray-600', bgColor: 'bg-gray-100' },
  OPEN: { color: 'text-red-600', bgColor: 'bg-red-100' },
  UNDER_ARBITRATION: { color: 'text-amber-600', bgColor: 'bg-amber-100' },
  IN_REVIEW: { color: 'text-amber-600', bgColor: 'bg-amber-100' },
  RESOLVED: { color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentDisputes, setRecentDisputes] = useState<Dispute[]>([]);
  const [chartPeriod, setChartPeriod] = useState('7d');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [chartPeriod]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [dashboardRes, analyticsRes, disputesRes] = await Promise.all([
        adminApi.getDashboardStats().catch(() => ({ data: null })),
        adminApi.getAnalyticsOverview().catch(() => ({ data: null })),
        adminApi.getDisputes({ limit: 5, status: 'OPEN' }).catch(() => ({ data: { data: [] } })),
      ]);

      if (dashboardRes.data) {
        setStats(dashboardRes.data);
      }

      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }

      const disputeData = disputesRes.data?.data || [];
      setRecentDisputes(Array.isArray(disputeData) ? disputeData.slice(0, 5) : []);

    } catch (err: unknown) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await adminApi.getAnalyticsCharts(chartPeriod);
      if (response.data?.data) {
        setChartData(response.data.data);
      }
    } catch (err) {
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Platform Overview">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner className="w-10 h-10 animate-spin text-accent mx-auto mb-4" aria-hidden="true" weight="bold" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalAlerts = (analytics?.alerts.disputes || 0) + 
                      (analytics?.alerts.pendingWithdrawals || 0) + 
                      (analytics?.alerts.pendingKYC || 0);

  // Calculate max values for chart scaling
  const maxVolume = Math.max(...chartData.map(d => d.volume), 1);
  const maxTransactions = Math.max(...chartData.map(d => d.transactions), 1);

  return (
    <AdminLayout title="Dashboard" subtitle="Platform Overview">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-center gap-3">
            <Warning className="w-5 h-5" aria-hidden="true" weight="fill" />
            {error}
            <Button variant="ghost" size="sm" onClick={fetchDashboardData} className="ml-auto">
              <ArrowsClockwise className="w-4 h-4 mr-2" aria-hidden="true" />
              Retry
            </Button>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" aria-hidden="true" weight="duotone" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendUp className="w-3 h-3" aria-hidden="true" weight="bold" />
                +{analytics?.users.today || 0} today
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.stats.totalUsers?.toLocaleString() || 0}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats?.stats.activeUsers?.toLocaleString() || 0} active (30d)
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                <ArrowsLeftRight className="w-6 h-6 text-emerald-600" aria-hidden="true" weight="duotone" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${Number(analytics?.transactions.change || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {Number(analytics?.transactions.change || 0) >= 0 ? <TrendUp className="w-3 h-3" aria-hidden="true" weight="bold" /> : <TrendDown className="w-3 h-3" aria-hidden="true" weight="bold" />}
                {analytics?.transactions.change || 0}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{analytics?.transactions.month?.toLocaleString() || 0}</div>
            <div className="text-sm text-muted-foreground">Transactions (Month)</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats?.stats.activeTransactions || 0} active now
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/10 flex items-center justify-center">
                <CurrencyCircleDollar className="w-6 h-6 text-violet-600" aria-hidden="true" weight="duotone" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${Number(analytics?.volume.change || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {Number(analytics?.volume.change || 0) >= 0 ? <TrendUp className="w-3 h-3" aria-hidden="true" weight="bold" /> : <TrendDown className="w-3 h-3" aria-hidden="true" weight="bold" />}
                {analytics?.volume.change || 0}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{formatCompact(analytics?.volume.month || 0)}</div>
            <div className="text-sm text-muted-foreground">Volume (Month)</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {formatCompact(analytics?.volume.today || 0)} today
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-red-600" aria-hidden="true" weight="duotone" />
              </div>
              {totalAlerts > 0 && (
                <Badge className="bg-red-100 text-red-600 border-0">
                  {totalAlerts} pending
                </Badge>
              )}
            </div>
            <div className="text-3xl font-bold mb-1">{totalAlerts}</div>
            <div className="text-sm text-muted-foreground">Alerts</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Requires attention
            </div>
          </motion.div>
        </div>

        {/* Alerts Panel */}
        {totalAlerts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightning className="w-5 h-5 text-amber-500" aria-hidden="true" weight="fill" />
                Action Required
              </h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {(analytics?.alerts.disputes || 0) > 0 && (
                <Link href="/disputes">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <Warning className="w-5 h-5 text-red-600" aria-hidden="true" weight="fill" />
                    </div>
                    <div>
                      <div className="font-semibold text-red-700">{analytics?.alerts.disputes} Disputes</div>
                      <div className="text-sm text-red-600">Need resolution</div>
                    </div>
                    <CaretRight className="w-5 h-5 text-red-400 ml-auto" aria-hidden="true" />
                  </div>
                </Link>
              )}
              {(analytics?.alerts.pendingWithdrawals || 0) > 0 && (
                <Link href="/withdrawals">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <ArrowDown className="w-5 h-5 text-amber-600" aria-hidden="true" weight="bold" />
                    </div>
                    <div>
                      <div className="font-semibold text-amber-700">{analytics?.alerts.pendingWithdrawals} Withdrawals</div>
                      <div className="text-sm text-amber-600">Pending approval</div>
                    </div>
                    <CaretRight className="w-5 h-5 text-amber-400 ml-auto" aria-hidden="true" />
                  </div>
                </Link>
              )}
              {(analytics?.alerts.pendingKYC || 0) > 0 && (
                <Link href="/kyc">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <IdentificationCard className="w-5 h-5 text-blue-600" aria-hidden="true" weight="fill" />
                    </div>
                    <div>
                      <div className="font-semibold text-blue-700">{analytics?.alerts.pendingKYC} KYC</div>
                      <div className="text-sm text-blue-600">Pending review</div>
                    </div>
                    <CaretRight className="w-5 h-5 text-blue-400 ml-auto" aria-hidden="true" />
                  </div>
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Transaction Overview</h3>
            <Select value={chartPeriod} onValueChange={setChartPeriod}>
              <SelectTrigger className="w-32" aria-hidden="true">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end gap-1">
            {chartData.slice(-14).map((data, index) => (
              <div key={data.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5 h-[200px]">
                  {/* Volume bar */}
                  <div 
                    className="w-full bg-accent/20 rounded-t transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 hover:bg-accent/30"
                    style={{ height: `${(data.volume / maxVolume) * 100}%`, minHeight: data.volume > 0 ? '4px' : '0' }}
                    title={`Volume: ${formatCurrency(data.volume)}`}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground rotate-0 whitespace-nowrap">
                  {new Date(data.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-accent/30" />
              <span className="text-sm text-muted-foreground">Volume</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Total: {formatCurrency(chartData.reduce((sum, d) => sum + d.volume, 0))}
            </div>
            <div className="text-sm text-muted-foreground">
              Transactions: {chartData.reduce((sum, d) => sum + d.transactions, 0)}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="text-accent">
                  View All
                  <CaretRight className="w-4 h-4 ml-1" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {(!stats?.recentTransactions || stats.recentTransactions.length === 0) ? (
                <div className="text-center py-8">
                  <ArrowsLeftRight className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" aria-hidden="true" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                stats.recentTransactions.slice(0, 5).map((tx) => {
                  const status = statusConfig[tx.status] || { color: 'text-gray-600', bgColor: 'bg-gray-100' };
                  return (
                    <Link key={tx.id} href={`/transactions/${tx.id}`}>
                      <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Handshake className="w-5 h-5 text-muted-foreground" aria-hidden="true" weight="duotone" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{tx.orderNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              {tx.initiator?.username || 'Unknown'} → {tx.counterparty?.username || 'Pending'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">{formatCurrency(tx.amount)}</div>
                          <Badge variant="outline" className={`${status.bgColor} ${status.color} border-0 text-xs`}>
                            {tx.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Open Disputes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Open Disputes</h3>
              <Link href="/disputes">
                <Button variant="ghost" size="sm" className="text-accent">
                  View All
                  <CaretRight className="w-4 h-4 ml-1" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentDisputes.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-50" aria-hidden="true" />
                  <p className="text-muted-foreground">No open disputes</p>
                  <p className="text-sm text-muted-foreground">All disputes have been resolved</p>
                </div>
              ) : (
                recentDisputes.map((dispute) => {
                  const status = statusConfig[dispute.status] || { color: 'text-gray-600', bgColor: 'bg-gray-100' };
                  return (
                    <Link key={dispute.id} href={`/disputes/${dispute.id}`}>
                      <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <Warning className="w-5 h-5 text-red-600" aria-hidden="true" weight="fill" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{dispute.order?.orderNumber || dispute.id.slice(0, 8)}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {dispute.reason}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={`${status.bgColor} ${status.color} border-0 text-xs`}>
                            {dispute.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {dispute.openedAt ? formatDate(dispute.openedAt) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ArrowUp className="w-5 h-5 text-emerald-600" aria-hidden="true" weight="bold" />
              </div>
              <div>
                <div className="text-lg font-bold">{formatCompact(stats?.stats.todayVolume || 0)}</div>
                <div className="text-xs text-muted-foreground">Today's Volume</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" aria-hidden="true" weight="bold" />
              </div>
              <div>
                <div className="text-lg font-bold">{analytics?.users.week || 0}</div>
                <div className="text-xs text-muted-foreground">New Users (Week)</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" aria-hidden="true" weight="bold" />
              </div>
              <div>
                <div className="text-lg font-bold">{stats?.stats.pendingWithdrawals || 0}</div>
                <div className="text-xs text-muted-foreground">Pending Withdrawals</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-violet-600" aria-hidden="true" weight="bold" />
              </div>
              <div>
                <div className="text-lg font-bold">{formatCompact(stats?.stats.totalVolume || 0)}</div>
                <div className="text-xs text-muted-foreground">Total Volume</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

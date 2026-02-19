/**
 * KAHADE ADMIN REPORTS PAGE
 * Analytics and reporting dashboard with charts
 * Icons: Phosphor Icons only
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartLineUp, ChartBar, Users, ArrowsLeftRight, CurrencyDollar,
  TrendUp, TrendDown, Calendar, Export, Spinner, Funnel,
  ArrowUp, ArrowDown, Receipt, Wallet
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
import { toast } from 'sonner';
import AdminLayout from '@/components/layout/AdminLayout';
import { adminApi } from '@/lib/api';
import { UnderlineTabsSimple } from '@/components/ui/underline-tabs';

interface RevenueData {
  summary: {
    totalRevenue: number;
    totalVolume: number;
    totalTransactions: number;
    period: { start: string; end: string };
  };
  dailyData: Array<{
    date: string;
    revenue: number;
    volume: number;
    count: number;
  }>;
}

interface TransactionReport {
  byStatus: Array<{ status: string; count: number; volume: number }>;
  byCategory: Array<{ category: string; count: number; volume: number }>;
  dailyData: Array<{ date: string; total: number; [key: string]: string | number }>;
  period: { start: string; end: string };
}

interface UserReport {
  summary: {
    totalUsers: number;
    newUsers: number;
    verifiedUsers: number;
    activeUsers: number;
    verificationRate: string;
  };
  kycBreakdown: Array<{ status: string; count: number }>;
  dailyRegistrations: Array<{ date: string; count: number }>;
  period: { start: string; end: string };
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

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-emerald-500',
  PAID: 'bg-blue-500',
  PENDING_ACCEPT: 'bg-amber-500',
  DISPUTED: 'bg-red-500',
  CANCELLED: 'bg-gray-500',
  DELIVERED: 'bg-violet-500',
};

const kycColors: Record<string, string> = {
  VERIFIED: 'bg-emerald-500',
  PENDING: 'bg-amber-500',
  NONE: 'bg-gray-400',
  REJECTED: 'bg-red-500',
};

export default function AdminReports() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [transactionReport, setTransactionReport] = useState<TransactionReport | null>(null);
  const [userReport, setUserReport] = useState<UserReport | null>(null);
  const [activeTab, setActiveTab] = useState<'revenue' | 'transactions' | 'users'>('revenue');

  useEffect(() => {
    fetchReports();
  }, [period]);

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '365d':
        start.setDate(start.getDate() - 365);
        break;
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const dateRange = getDateRange();
      
      const [revenueRes, transactionRes, userRes] = await Promise.all([
        adminApi.getRevenueReport(dateRange).catch(() => ({ data: null })),
        adminApi.getTransactionReport(dateRange).catch(() => ({ data: null })),
        adminApi.getUserReport(dateRange).catch(() => ({ data: null })),
      ]);

      if (revenueRes.data) setRevenueData(revenueRes.data);
      if (transactionRes.data) setTransactionReport(transactionRes.data);
      if (userRes.data) setUserReport(userRes.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    // Simple CSV export
    let csv = '';
    
    if (activeTab === 'revenue' && revenueData) {
      csv = 'Date,Revenue,Volume,Transactions\n';
      revenueData.dailyData.forEach(d => {
        csv += `${d.date},${d.revenue},${d.volume},${d.count}\n`;
      });
    } else if (activeTab === 'transactions' && transactionReport) {
      csv = 'Status,Count,Volume\n';
      transactionReport.byStatus.forEach(s => {
        csv += `${s.status},${s.count},${s.volume}\n`;
      });
    } else if (activeTab === 'users' && userReport) {
      csv = 'Date,New Users\n';
      userReport.dailyRegistrations.forEach(d => {
        csv += `${d.date},${d.count}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-report-${period}.csv`;
    a.click();
    toast.success('Report exported');
  };

  if (isLoading) {
    return (
      <AdminLayout title="Reports & Analytics" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Spinner className="w-8 h-8 animate-spin text-accent" aria-hidden="true" weight="bold" />
        </div>
      </AdminLayout>
    );
  }

  // Calculate max values for chart scaling
  const maxVolume = Math.max(...(revenueData?.dailyData.map(d => d.volume) || [1]), 1);
  const maxUsers = Math.max(...(userReport?.dailyRegistrations.map(d => d.count) || [1]), 1);

  return (
    <AdminLayout title="Reports & Analytics" subtitle="Platform performance insights">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <UnderlineTabsSimple
            tabs={[
              { id: 'revenue', label: 'Revenue' },
              { id: 'transactions', label: 'Transactions' },
              { id: 'users', label: 'Users' }
            ]}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as 'revenue' | 'transactions' | 'users')}
          />
          
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40" aria-hidden="true">
                <Calendar className="w-4 h-4 mr-2" aria-hidden="true" weight="regular" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="365d">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Export className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Revenue Tab */}
        {activeTab === 'revenue' && revenueData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CurrencyDollar className="w-6 h-6 text-emerald-600" aria-hidden="true" weight="bold" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCompact(revenueData.summary.totalRevenue)}</div>
                <div className="text-sm text-muted-foreground">Total Revenue (Fees)</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-blue-600" aria-hidden="true" weight="bold" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCompact(revenueData.summary.totalVolume)}</div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-5"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-violet-600" aria-hidden="true" weight="bold" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{revenueData.summary.totalTransactions.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Completed Transactions</div>
              </motion.div>
            </div>

            {/* Volume Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-5"
            >
              <h3 className="text-lg font-semibold mb-4">Daily Volume</h3>
              <div className="h-64 flex items-end gap-1">
                {revenueData.dailyData.slice(-30).map((data, index) => (
                  <div key={data.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center h-[220px]">
                      <div 
                        className="w-full bg-accent/30 rounded-t transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 hover:bg-accent/50"
                        style={{ height: `${(data.volume / maxVolume) * 100}%`, minHeight: data.volume > 0 ? '4px' : '0' }}
                        title={`${data.date}: ${formatCurrency(data.volume)}`}
                      />
                    </div>
                    {index % 5 === 0 && (
                      <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(data.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && transactionReport && (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              {/* By Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5"
              >
                <h3 className="text-lg font-semibold mb-4">By Status</h3>
                <div className="space-y-3">
                  {transactionReport.byStatus.map((item) => {
                    const total = transactionReport.byStatus.reduce((sum, s) => sum + s.count, 0);
                    const percentage = total > 0 ? (item.count / total) * 100 : 0;
                    
                    return (
                      <div key={item.status} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${statusColors[item.status] || 'bg-gray-400'}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.status.replace('_', ' ')}</span>
                            <span className="text-sm text-muted-foreground">{item.count}</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${statusColors[item.status] || 'bg-gray-400'} transition-all`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground w-20 text-right">
                          {formatCompact(item.volume)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* By Category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-5"
              >
                <h3 className="text-lg font-semibold mb-4">By Category</h3>
                <div className="space-y-3">
                  {transactionReport.byCategory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No category data</p>
                  ) : (
                    transactionReport.byCategory.map((item, index) => {
                      const total = transactionReport.byCategory.reduce((sum, c) => sum + c.count, 0);
                      const percentage = total > 0 ? (item.count / total) * 100 : 0;
                      const colors = ['bg-accent', 'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500'];
                      
                      return (
                        <div key={item.category} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{item.category || 'Other'}</span>
                              <span className="text-sm text-muted-foreground">{item.count}</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${colors[index % colors.length]} transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground w-20 text-right">
                            {formatCompact(item.volume)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>

            {/* Daily Transactions Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-5"
            >
              <h3 className="text-lg font-semibold mb-4">Daily Transactions</h3>
              <div className="h-48 flex items-end gap-1">
                {transactionReport.dailyData.slice(-30).map((data, index) => {
                  const maxDaily = Math.max(...transactionReport.dailyData.map(d => d.total || 0), 1);
                  return (
                    <div key={data.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center h-[160px]">
                        <div 
                          className="w-full bg-blue-400/50 rounded-t transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 hover:bg-blue-400/70"
                          style={{ height: `${((data.total || 0) / maxDaily) * 100}%`, minHeight: (data.total || 0) > 0 ? '4px' : '0' }}
                          title={`${data.date}: ${data.total || 0} transactions`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && userReport && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4"
              >
                <div className="text-2xl font-bold">{userReport.summary.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-4"
              >
                <div className="text-2xl font-bold text-emerald-600">+{userReport.summary.newUsers}</div>
                <div className="text-sm text-muted-foreground">New Users</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-4"
              >
                <div className="text-2xl font-bold text-blue-600">{userReport.summary.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Active (7d)</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-4"
              >
                <div className="text-2xl font-bold text-violet-600">{userReport.summary.verificationRate}%</div>
                <div className="text-sm text-muted-foreground">Verification Rate</div>
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* KYC Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-5"
              >
                <h3 className="text-lg font-semibold mb-4">KYC Status Breakdown</h3>
                <div className="space-y-3">
                  {userReport.kycBreakdown.map((item) => {
                    const total = userReport.kycBreakdown.reduce((sum, k) => sum + k.count, 0);
                    const percentage = total > 0 ? (item.count / total) * 100 : 0;
                    
                    return (
                      <div key={item.status} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${kycColors[item.status] || 'bg-gray-400'}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.status}</span>
                            <span className="text-sm text-muted-foreground">{item.count}</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${kycColors[item.status] || 'bg-gray-400'} transition-all`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground w-16 text-right">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Daily Registrations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-5"
              >
                <h3 className="text-lg font-semibold mb-4">Daily Registrations</h3>
                <div className="h-48 flex items-end gap-1">
                  {userReport.dailyRegistrations.slice(-30).map((data, index) => (
                    <div key={data.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center h-[160px]">
                        <div 
                          className="w-full bg-emerald-400/50 rounded-t transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 hover:bg-emerald-400/70"
                          style={{ height: `${(data.count / maxUsers) * 100}%`, minHeight: data.count > 0 ? '4px' : '0' }}
                          title={`${data.date}: ${data.count} users`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

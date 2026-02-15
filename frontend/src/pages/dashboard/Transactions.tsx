import { SkipToContent } from '@/lib/accessibility';
/**
 * KAHADE TRANSACTIONS/ORDERS PAGE - Simplified Design
 * 
 * Design Philosophy:
 * - Clean search bar at top
 * - Tab-based status filtering
 * - Mobile-first responsive design
 */

import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass, ArrowUpRight, ArrowDownRight, Clock,
  CheckCircle, Warning, CaretRight, Spinner,
  X, Package, Wallet, XCircle
} from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { transactionApi } from '@/lib/api';
import { UnderlineTabsSimple } from '@/components/ui/underline-tabs';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  orderNumber: string;
  title: string;
  amount: number;
  status: string;
  initiatorRole: string;
  counterparty?: { username: string; email?: string };
  counterpartyId?: string;
  category: string;
  createdAt: string;
  updatedAt?: string;
  feePaidBy?: string;
  deliveryProof?: { id: string }; // Used to determine DELIVERED virtual status
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  WAITING_COUNTERPARTY: { 
    label: 'Waiting', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50', 
    icon: Clock
  },
  PENDING_ACCEPT: { 
    label: 'Pending', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50', 
    icon: Clock
  },
  ACCEPTED: { 
    label: 'Accepted', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    icon: CheckCircle
  },
  PAID: { 
    label: 'Paid', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50', 
    icon: Wallet
  },
  DELIVERED: { 
    label: 'Delivered', 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-50', 
    icon: Package
  },
  COMPLETED: { 
    label: 'Completed', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50', 
    icon: CheckCircle
  },
  DISPUTED: { 
    label: 'Disputed', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    icon: Warning
  },
  CANCELLED: { 
    label: 'Cancelled', 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100', 
    icon: XCircle
  },
  REFUNDED: { 
    label: 'Refunded', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50', 
    icon: Wallet
  },
};

// Tab configuration
const tabs = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'paid', label: 'Paid' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'disputes', label: 'Disputes' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'refunded', label: 'Refunded' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

export default function Transactions() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle refresh parameter from URL
  useEffect(() => {
    if (searchParams.includes('refresh=true')) {
      setRefreshKey(prev => prev + 1);
      setLocation('/transactions', { replace: true });
    }
  }, [searchParams, setLocation]);

  useEffect(() => {
    fetchTransactions();
  }, [activeTab, page, refreshKey]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      
      // Map tab to status filter
      if (activeTab === 'active') {
        params.status = 'WAITING_COUNTERPARTY,PENDING_ACCEPT,ACCEPTED,PAID,DELIVERED';
      } else if (activeTab === 'waiting') {
        params.status = 'WAITING_COUNTERPARTY,PENDING_ACCEPT';
      } else if (activeTab === 'accepted') {
        params.status = 'ACCEPTED';
      } else if (activeTab === 'paid') {
        params.status = 'PAID';
      } else if (activeTab === 'delivered') {
        params.status = 'DELIVERED';
      } else if (activeTab === 'disputes') {
        params.status = 'DISPUTED';
      } else if (activeTab === 'completed') {
        params.status = 'COMPLETED';
      } else if (activeTab === 'cancelled') {
        params.status = 'CANCELLED,REFUNDED';
      } else if (activeTab === 'refunded') {
        params.status = 'REFUNDED';
      }

      const response = await transactionApi.list(params);
      const responseData = response?.data;
      
      let txData: Transaction[] = [];
      let total = 0;
      let pages = 1;
      
      if (responseData) {
        if (Array.isArray(responseData.data)) {
          txData = responseData.data;
          total = responseData.meta?.total || responseData.total || txData.length;
          pages = responseData.meta?.totalPages || Math.ceil(total / 20) || 1;
        } else if (responseData.data && Array.isArray(responseData.data.data)) {
          txData = responseData.data.data;
          total = responseData.data.meta?.total || txData.length;
          pages = responseData.data.meta?.totalPages || Math.ceil(total / 20) || 1;
        } else if (Array.isArray(responseData.transactions)) {
          txData = responseData.transactions;
          total = responseData.total || txData.length;
          pages = Math.ceil(total / 20) || 1;
        } else if (Array.isArray(responseData)) {
          txData = responseData;
          total = txData.length;
          pages = 1;
        }
      }
      
      setTransactions(txData);
      setTotalPages(pages);
      setTotalCount(total);
    } catch (error: unknown) {
      if (error?.response?.status !== 401) {
        toast.error('Failed to load transactions');
      }
      setTransactions([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter transactions by search query
  const filteredTransactions = useMemo(() => {
    const txList = Array.isArray(transactions) ? transactions : [];
    if (!searchQuery) return txList;
    
    const query = searchQuery.toLowerCase();
    return txList.filter(tx =>
      tx.title?.toLowerCase().includes(query) ||
      tx.orderNumber?.toLowerCase().includes(query) ||
      tx.counterparty?.username?.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  if (isLoading && transactions.length === 0) {
    return (
      <DashboardLayout title="Orders" subtitle="Manage your transactions">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner className="w-1 aria-hidden="true"0 h-10 animate-spin text-black mx-auto mb-4" weight="bold" aria-hidden="true" />
            <p className="text-neutral-600">Loading your orders...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Orders" subtitle="Manage your transactions">
      <div className="space-y-4">
        {/* ========== SEARCH BAR ========== */}
        <div className="relative">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 aria-hidden="true" h-5 text-neutral-500" weight="regular" aria-hidden="true" />
          <Input
            placeholder="Search orders by title, order number, or counterparty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-10 h-12 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
            >
              <X className="w-5 h-5" weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ========== TAB NAVIGATION ========== */}
        <UnderlineTabsSimple
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => { setActiveTab(tabId); setPage(1); }}
        />

        {/* ========== TRANSACTIONS LIST ========== */}
        <div className="overflow-hidden">
          {filteredTransactions.length > 0 ? (
            <>
              {/* Desktop Table Header */}
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-neutral-50 border-y border-neutral-200 text-sm font-medium text-neutral-600">
                <div className="col-span-5">Order Details</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-right">Date</div>
                <div className="col-span-1"></div>
              </div>

              <div className="divide-y divide-neutral-200 border-b border-neutral-200">
                <AnimatePresence>
                  {filteredTransactions.map((tx, index) => {
                    // Determine effective status - DELIVERED is virtual when PAID + has deliveryProof
                    const effectiveStatus = tx.status === 'PAID' && tx.deliveryProof ? 'DELIVERED' : tx.status;
                    const status = statusConfig[effectiveStatus] || statusConfig.PENDING_ACCEPT;
                    const isBuyer = tx.initiatorRole === 'BUYER';
                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <Link href={`/transactions/${tx.id}`}>
                          <div className="p-4 md:px-6 hover:bg-neutral-50 transition-colors cursor-pointer group">
                            {/* Mobile Layout */}
                            <div className="lg:hidden">
                              <div className="flex items-start gap-3">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                                  isBuyer ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                  {isBuyer ? (
                                    <ArrowUpRight className="w-5 aria-hidden="true" h-5" weight="bold" aria-hidden="true" />
                                  ) : (
                                    <ArrowDownRight className="w-5 aria-hidden="true" h-5" weight="bold" aria-hidden="true" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-black truncate">{tx.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                                    <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded">{tx.orderNumber}</span>
                                    <span>•</span>
                                    <span>{isBuyer ? 'Buying' : 'Selling'}</span>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <Badge className={`${status.bgColor} ${status.color} border-0 text-xs`}>
                                      {status.label}
                                    </Badge>
                                    <span className={`font-semibold ${isBuyer ? 'text-red-600' : 'text-emerald-600'}`}>
                                      {isBuyer ? '-' : '+'}{formatCurrency(tx.amount)}
                                    </span>
                                  </div>
                                </div>
                                <CaretRight className="w-5 aria-hidden="true" h-5 text-neutral-300 group-hover:text-neutral-900 transition-colors shrink-0 mt-3" weight="bold" aria-hidden="true" />
                              </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                              <div className="col-span-5 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                  isBuyer ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                  {isBuyer ? (
                                    <ArrowUpRight className="w-6 aria-hidden="true" h-6" weight="bold" aria-hidden="true" />
                                  ) : (
                                    <ArrowDownRight className="w-6 aria-hidden="true" h-6" weight="bold" aria-hidden="true" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                                      {tx.orderNumber}
                                    </span>
                                    <Badge variant="outline" className={`text-xs ${isBuyer ? 'border-red-200 text-red-600' : 'border-emerald-200 text-emerald-600'}`}>
                                      {isBuyer ? 'Buyer' : 'Seller'}
                                    </Badge>
                                  </div>
                                  <div className="font-medium text-black truncate">{tx.title}</div>
                                  <div className="text-sm text-neutral-600">
                                    with {tx.counterparty?.username || 'Unknown'}
                                  </div>
                                </div>
                              </div>

                              <div className="col-span-2">
                                <Badge className={`${status.bgColor} ${status.color} border-0`}>
                                  <status.icon className="w-3 h-3 mr-1" weight="fill" />
                                  {status.label}
                                </Badge>
                              </div>

                              <div className="col-span-2 text-right">
                                <div className={`font-semibold ${isBuyer ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {isBuyer ? '-' : '+'}{formatCurrency(tx.amount)}
                                </div>
                              </div>

                              <div className="col-span-2 text-right">
                                <div className="text-sm text-neutral-600">{formatRelativeTime(tx.createdAt)}</div>
                              </div>

                              <div className="col-span-1 text-right">
                                <CaretRight className="w-5 aria-hidden="true" h-5 text-neutral-300 group-hover:text-neutral-900 transition-colors inline-block" weight="bold" aria-hidden="true" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-neutral-200">
                  <div className="text-sm text-neutral-600">
                    Page {page} of {totalPages} ({totalCount} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border-neutral-200"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-lg border-neutral-200"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 aria-hidden="true" h-8 text-neutral-500" weight="regular" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-black">No orders found</h3>
              <p className="text-neutral-600 mb-6 max-w-sm mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search to find what you\'re looking for'
                  : 'Create your first secure escrow transaction to get started'}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery('')} className="rounded-xl border-neutral-200">
                  Clear Search
                </Button>
              ) : (
                <Link href="/transactions/new">
                  <Button className="bg-black text-white hover:bg-black/90 rounded-xl">
                    Create Order
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

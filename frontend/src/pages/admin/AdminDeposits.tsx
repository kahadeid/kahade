/**
 * KAHADE ADMIN DEPOSITS PAGE
 * View and manage all deposit transactions
 * Icons: Phosphor Icons only
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUp, CheckCircle, XCircle, Clock, Spinner,
  User, MagnifyingGlass, Funnel, CurrencyDollar,
  CreditCard, QrCode, Bank, Eye, Copy
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Deposit {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  completedAt?: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  FAILED: { label: 'Failed', color: 'text-red-600', bgColor: 'bg-red-50' },
  EXPIRED: { label: 'Expired', color: 'text-gray-600', bgColor: 'bg-gray-50' },
};

const methodIcons: Record<string, typeof Bank> = {
  VIRTUAL_ACCOUNT: Bank,
  BANK_TRANSFER: Bank,
  QRIS: QrCode,
  EWALLET: CreditCard,
  CREDIT_CARD: CreditCard,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDeposits();
  }, [filter, page]);

  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (filter !== 'all') params.status = filter;
      
      const response = await adminApi.getDeposits(params);
      setDeposits(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      toast.error('Failed to load deposits');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDeposits = deposits.filter(d => 
    d.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
    d.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.reference?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: total,
    pending: deposits.filter(d => d.status === 'PENDING').length,
    completed: deposits.filter(d => d.status === 'COMPLETED').length,
    totalAmount: deposits.filter(d => d.status === 'COMPLETED').reduce((sum, d) => sum + d.amount, 0),
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading && deposits.length === 0) {
    return (
      <AdminLayout title="Deposits" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Spinner className="w-8 h-8 animate-spin text-accent" aria-hidden="true" weight="bold" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Deposits" subtitle="View all deposit transactions">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <ArrowUp className="w-5 h-5 text-accent" aria-hidden="true" weight="bold" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Deposits</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" aria-hidden="true" weight="bold" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" weight="bold" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <CurrencyDollar className="w-5 h-5 text-violet-600" aria-hidden="true" weight="bold" />
              </div>
              <div>
                <div className="text-lg font-bold text-violet-600">{formatCurrency(stats.totalAmount)}</div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" weight="regular" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username, email, or reference..."
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
            <SelectTrigger className="w-48" aria-hidden="true">
              <Funnel className="w-4 h-4 mr-2" aria-hidden="true" weight="regular" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deposits Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card overflow-hidden"
        >
          {filteredDeposits.length === 0 ? (
            <div className="text-center py-12">
              <ArrowUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" aria-hidden="true" weight="duotone" />
              <h4 className="text-lg font-semibold mb-2">No Deposits</h4>
              <p className="text-muted-foreground">No deposit transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold">User</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Method</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Reference</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDeposits.map((deposit) => {
                    const status = statusConfig[deposit.status] || statusConfig.PENDING;
                    const MethodIcon = methodIcons[deposit.method] || CreditCard;
                    
                    return (
                      <tr key={deposit.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                              <User className="w-4 h-4" aria-hidden="true" weight="regular" />
                            </div>
                            <div>
                              <div className="font-medium">{deposit.user?.username || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{deposit.user?.email || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-emerald-600">{formatCurrency(deposit.amount)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <MethodIcon className="w-4 h-4 text-muted-foreground" aria-hidden="true" weight="regular" />
                            <span className="text-sm">{deposit.method?.replace('_', ' ') || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{deposit.reference?.slice(0, 12) || '-'}...</span>
                            {deposit.reference && (
                              <button
                                onClick={() => copyToClipboard(deposit.reference)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Copy className="w-4 h-4" aria-hidden="true" weight="regular" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{formatDate(deposit.createdAt)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${status.bgColor} ${status.color} border-0`}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDeposit(deposit)}
                          >
                            <Eye className="w-4 h-4" aria-hidden="true" weight="regular" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Deposit Detail Dialog */}
      <Dialog open={!!selectedDeposit} onOpenChange={() => setSelectedDeposit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
          </DialogHeader>
          {selectedDeposit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-semibold text-lg text-emerald-600">
                    {formatCurrency(selectedDeposit.amount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={`${statusConfig[selectedDeposit.status]?.bgColor} ${statusConfig[selectedDeposit.status]?.color} border-0`}>
                    {statusConfig[selectedDeposit.status]?.label}
                  </Badge>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">User</div>
                <div className="font-medium">{selectedDeposit.user?.username}</div>
                <div className="text-sm text-muted-foreground">{selectedDeposit.user?.email}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Payment Method</div>
                <div className="font-medium">{selectedDeposit.method?.replace('_', ' ')}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Reference</div>
                <div className="font-mono text-sm break-all">{selectedDeposit.reference}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-sm">{formatDate(selectedDeposit.createdAt)}</div>
                </div>
                {selectedDeposit.completedAt && (
                  <div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                    <div className="text-sm">{formatDate(selectedDeposit.completedAt)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

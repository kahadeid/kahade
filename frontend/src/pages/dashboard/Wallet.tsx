import { SkipToContent } from '@/lib/accessibility';
/**
 * KAHADE WALLET PAGE - Professional Responsive Design
 * 
 * Design Philosophy:
 * - Mobile: Card-based layout with bottom sheet dialogs
 * - Tablet: 2-column grid with optimized spacing
 * - Desktop: Full layout with sidebar transaction history
 * - Consistent visual hierarchy across all breakpoints
 */

import { useEffect, useState, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  Spinner, Eye, EyeSlash, Info,
  Bank, Copy, Check,
  QrCode, ArrowsLeftRight,
  DeviceMobile, Storefront
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnderlineTabsSimple } from '@/components/ui/underline-tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { walletApi, bankAccountApi } from '@/lib/api';
import { toast } from 'sonner';

interface WalletBalance {
  available: number;
  locked: number;
  total: number;
  currency: string;
}

interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  reference?: string;
  referenceId?: string;
  createdAt: string;
  metadata?: {
    transactionId?: string;
    bankName?: string;
    accountNumber?: string;
  };
}

interface BankAccount {
  id: string;
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountNumberLast4: string;
  accountHolderName?: string;
  isDefault: boolean;
  isVerified: boolean;
}

interface Withdrawal {
  id: string;
  amount: number;
  netAmount: number;
  bankAccount: {
    id: string;
    bankName: string;
    accountNumberLast4: string;
  } | null;
  status: string;
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

const transactionTypeConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof ArrowUpRight }> = {
  TOPUP: { label: 'Top Up', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: ArrowDownRight },
  CREDIT: { label: 'Credit', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: ArrowDownRight },
  credit: { label: 'Credit', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: ArrowDownRight },
  deposit: { label: 'Deposit', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: ArrowDownRight },
  WITHDRAWAL: { label: 'Withdrawal', color: 'text-red-600', bgColor: 'bg-red-50', icon: ArrowUpRight },
  DEBIT: { label: 'Debit', color: 'text-red-600', bgColor: 'bg-red-50', icon: ArrowUpRight },
  debit: { label: 'Debit', color: 'text-red-600', bgColor: 'bg-red-50', icon: ArrowUpRight },
  withdrawal: { label: 'Withdrawal', color: 'text-red-600', bgColor: 'bg-red-50', icon: ArrowUpRight },
  ESCROW_LOCK: { label: 'Escrow Lock', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Clock },
  ESCROW_RELEASE: { label: 'Escrow Release', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: CheckCircle },
  ESCROW_REFUND: { label: 'Refund', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: ArrowDownRight },
  FEE: { label: 'Fee', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: ArrowUpRight },
  BONUS: { label: 'Bonus', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: ArrowDownRight },
  REFERRAL: { label: 'Referral', color: 'text-indigo-600', bgColor: 'bg-indigo-50', icon: ArrowsLeftRight },
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  PROCESSING: { label: 'Processing', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  SUCCESS: { label: 'Success', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  PAID: { label: 'Paid', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  FAILED: { label: 'Failed', color: 'text-red-600', bgColor: 'bg-red-100' },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  REJECTED: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
  EXPIRED: { label: 'Expired', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

const topUpAmounts = [50000, 100000, 250000, 500000, 1000000, 2500000];

const paymentMethods = {
  va: {
    label: 'Virtual Account',
    icon: Bank,
    description: 'Transfer via ATM, Mobile Banking, or Internet Banking',
    options: [
      { code: 'va_bca', name: 'BCA', color: 'bg-blue-600' },
      { code: 'va_bni', name: 'BNI', color: 'bg-orange-500' },
      { code: 'va_bri', name: 'BRI', color: 'bg-blue-800' },
      { code: 'va_mandiri', name: 'Mandiri', color: 'bg-blue-900' },
      { code: 'va_permata', name: 'Permata', color: 'bg-green-600' },
    ]
  },
  ewallet: {
    label: 'E-Wallet',
    icon: DeviceMobile,
    description: 'Pay instantly with your favorite e-wallet',
    options: [
      { code: 'ewallet_ovo', name: 'OVO', color: 'bg-purple-600' },
      { code: 'ewallet_gopay', name: 'GoPay', color: 'bg-green-500' },
      { code: 'ewallet_dana', name: 'DANA', color: 'bg-blue-500' },
      { code: 'ewallet_shopeepay', name: 'ShopeePay', color: 'bg-orange-500' },
    ]
  },
  qris: {
    label: 'QRIS',
    icon: QrCode,
    description: 'Scan QR code with any e-wallet or mobile banking app',
    options: [
      { code: 'qris', name: 'QRIS', color: 'bg-gradient-to-r from-red-500 to-blue-500' }
    ]
  },
  retail: {
    label: 'Retail Outlet',
    icon: Storefront,
    description: 'Pay at Alfamart, Indomaret, or other retail outlets',
    options: [
      { code: 'retail_alfamart', name: 'Alfamart', color: 'bg-red-600' },
      { code: 'retail_indomaret', name: 'Indomaret', color: 'bg-blue-600' },
    ]
  }
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export default function Wallet() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Top-up state
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpStep, setTopUpStep] = useState<'amount' | 'method' | 'payment'>('amount');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpCategory, setTopUpCategory] = useState<'va' | 'ewallet' | 'qris' | 'retail'>('va');
  const [topUpMethod, setTopUpMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    vaNumber?: string;
    paymentUrl?: string;
    qrString?: string;
    qrUrl?: string;
    invoiceId?: string;
    expiresAt?: string;
  } | null>(null);
  
  // Withdrawal state
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  
  // Cancel withdrawal state
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancellingWithdrawal, setCancellingWithdrawal] = useState<Withdrawal | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Copied state
  const [copiedText, setCopiedText] = useState('');

  // Stats calculation
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Ensure transactions and withdrawals are always arrays
    const txList = Array.isArray(transactions) ? transactions : [];
    const wdList = Array.isArray(withdrawals) ? withdrawals : [];
    
    const thisMonthTx = txList.filter(t => new Date(t.createdAt) >= monthStart);
    
    const totalIn = thisMonthTx
      .filter(t => ['TOPUP', 'CREDIT', 'credit', 'deposit', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'BONUS', 'REFERRAL'].includes(t.type) || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    
    const totalOut = thisMonthTx
      .filter(t => ['WITHDRAWAL', 'DEBIT', 'debit', 'withdrawal', 'ESCROW_LOCK', 'FEE'].includes(t.type) || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    
    const pendingWithdrawals = wdList
      .filter(w => w.status === 'PENDING')
      .reduce((sum, w) => sum + Math.abs(w.amount || 0), 0);

    return { totalIn, totalOut, pendingWithdrawals };
  }, [transactions, withdrawals]);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes, bankAccountsRes, withdrawalsRes] = await Promise.all([
        walletApi.getBalance(),
        walletApi.getTransactions({ limit: 20 }),
        bankAccountApi.list(),
        walletApi.getWithdrawals({ limit: 20 }),
      ]);

      setBalance(balanceRes?.data || null);
      
      // Safely extract transactions array
      const txData = transactionsRes?.data;
      let txList: WalletTransaction[] = [];
      if (txData) {
        if (Array.isArray(txData.data)) txList = txData.data;
        else if (Array.isArray(txData.transactions)) txList = txData.transactions;
        else if (Array.isArray(txData)) txList = txData;
      }
      setTransactions(txList);
      
      // Safely extract bank accounts array
      const accountsData = bankAccountsRes?.data;
      let accountsList: BankAccount[] = [];
      if (accountsData) {
        if (Array.isArray(accountsData.accounts)) accountsList = accountsData.accounts;
        else if (Array.isArray(accountsData.data)) accountsList = accountsData.data;
        else if (Array.isArray(accountsData)) accountsList = accountsData;
      }
      setBankAccounts(accountsList);
      
      // Safely extract withdrawals array
      const wdData = withdrawalsRes?.data;
      let wdList: Withdrawal[] = [];
      if (wdData) {
        if (Array.isArray(wdData.data)) wdList = wdData.data;
        else if (Array.isArray(wdData.withdrawals)) wdList = wdData.withdrawals;
        else if (Array.isArray(wdData)) wdList = wdData;
      }
      setWithdrawals(wdList);
      
      const defaultAccount = accountsList.find((a: BankAccount) => a.isDefault);
      if (defaultAccount) {
        setSelectedBankAccount(defaultAccount.id);
      }
    } catch (error: unknown) {
      // Don't show error toast for 401 (user will be redirected to login)
      if (error?.response?.status !== 401) {
        toast.error('Failed to load wallet data');
      }
      // Reset to empty arrays on error
      setTransactions([]);
      setBankAccounts([]);
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseInt(topUpAmount);
    if (!topUpAmount || amount < 10000) {
      toast.error('Minimum top up is Rp 10,000');
      return;
    }
    if (amount > 100000000) {
      toast.error('Maximum top up is Rp 100,000,000');
      return;
    }

    if (!topUpMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await walletApi.topUp({
        amount: parseInt(topUpAmount),
        method: topUpMethod,
      });

      const resolvedPaymentUrl =
        response.data.paymentUrl ||
        response.data.payment_url ||
        response.data.actions?.mobile_web_checkout_url ||
        response.data.actions?.desktop_web_checkout_url ||
        response.data.actions?.mobile_deeplink_checkout_url;

      setPaymentInfo({
        vaNumber: response.data.vaNumber || response.data.va_number,
        paymentUrl: resolvedPaymentUrl,
        qrString: response.data.qrString || response.data.qr_string,
        qrUrl: response.data.qrUrl || response.data.qr_url,
        invoiceId: response.data.invoiceId || response.data.invoice_id,
        expiresAt: response.data.expiresAt || response.data.expires_at,
      });

      setTopUpStep('payment');
      
      if (resolvedPaymentUrl && topUpCategory === 'ewallet') {
        window.location.assign(resolvedPaymentUrl);
      }

      toast.success('Top up initiated!');
      fetchWalletData();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to process top up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!withdrawAmount || amount < 50000) {
      toast.error('Minimum withdrawal is Rp 50,000');
      return;
    }
    if (amount > 50000000) {
      toast.error('Maximum withdrawal is Rp 50,000,000');
      return;
    }

    if (balance && amount > balance.available) {
      toast.error('Insufficient balance');
      return;
    }

    if (!mfaToken.trim()) {
      toast.error('MFA token is required to withdraw');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!selectedBankAccount) {
        toast.error('Please select a bank account');
        setIsSubmitting(false);
        return;
      }

      await walletApi.withdrawWithBankAccount({
        amountMinor: amount,
        bankAccountId: selectedBankAccount,
      }, { mfaToken: mfaToken.trim() });

      toast.success('Withdrawal requested!');
      setIsWithdrawOpen(false);
      setWithdrawAmount('');
      setMfaToken('');
      fetchWalletData();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to process withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelWithdrawal = async () => {
    if (!cancellingWithdrawal) return;
    
    setIsCancelling(true);
    try {
      await walletApi.cancelWithdrawal(cancellingWithdrawal.id);
      toast.success('Withdrawal cancelled successfully');
      setIsCancelOpen(false);
      setCancellingWithdrawal(null);
      fetchWalletData();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to cancel withdrawal');
    } finally {
      setIsCancelling(false);
    }
  };

  const resetTopUpDialog = () => {
    setTopUpStep('amount');
    setTopUpAmount('');
    setTopUpCategory('va');
    setTopUpMethod('');
    setPaymentInfo(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedText(''), 2000);
  };

  const filterTransactions = (type?: string) => {
    // Ensure transactions is always an array
    const txList = Array.isArray(transactions) ? transactions : [];
    if (!type || type === 'all') return txList;
    return txList.filter(tx => {
      if (type === 'credit') return ['TOPUP', 'CREDIT', 'credit', 'deposit', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'BONUS', 'REFERRAL'].includes(tx.type) || tx.amount > 0;
      if (type === 'debit') return ['WITHDRAWAL', 'DEBIT', 'debit', 'withdrawal', 'ESCROW_LOCK', 'FEE'].includes(tx.type) || tx.amount < 0;
      return true;
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Dompet" subtitle="Memuat...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner className="w-10 h-10 animate-spin text-black mx-auto mb-4" aria-hidden="true" weight="bold" aria-hidden="true" />
            <p className="text-neutral-600">Memuat data dompet...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dompet" subtitle="Kelola saldo dan transaksi Anda">
      <div className="space-y-6">
        {/* ========== BALANCE CARD ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black rounded-2xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
            <div className="absolute inset-0" aria-hidden="true" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Balance Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <WalletIcon className="w-5 h-5 text-white/60" aria-hidden="true" weight="duotone" aria-hidden="true" />
                  <span className="text-white/60 text-sm font-medium">Total Balance</span>
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-white/40 hover:text-white transition-colors ml-1"
                  >
                    {showBalance ? <Eye className="w-4 h-4" aria-hidden="true" /> : <EyeSlash className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                  {showBalance ? formatCurrency((balance?.available || 0) + (balance?.locked || 0)) : '••••••••'}
                </div>

                {/* Balance Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-4">
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                      <CheckCircle className="w-3 .5 h-3.5" aria-hidden="true" weight="fill" aria-hidden="true" />
                      Available
                    </div>
                    <div className="text-lg md:text-xl font-semibold">
                      {showBalance ? formatCurrency(balance?.available || 0) : '••••••'}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-4">
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                      <Clock className="w-3 .5 h-3.5" aria-hidden="true" weight="fill" aria-hidden="true" />
                      In Escrow
                    </div>
                    <div className="text-lg md:text-xl font-semibold">
                      {showBalance ? formatCurrency(balance?.locked || 0) : '••••••'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 lg:flex-col lg:min-w-[180px]">
                <Dialog open={isTopUpOpen} onOpenChange={(open) => {
                  setIsTopUpOpen(open);
                  if (!open) resetTopUpDialog();
                }}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 lg:w-full bg-white text-black hover:bg-white/90 h-11 rounded-xl font-semibold">
                      <ArrowDownRight className="w-5 h-5 mr-2" aria-hidden="true" weight="bold" aria-hidden="true" />
                      Top Up Instan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Isi Saldo Dompet</DialogTitle>
                      <DialogDescription>
                        {topUpStep === 'amount' && 'Masukkan nominal top up yang diinginkan'}
                        {topUpStep === 'method' && 'Pilih metode pembayaran yang tersedia'}
                        {topUpStep === 'payment' && 'Selesaikan pembayaran Anda'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {/* Step 1: Amount */}
                    {topUpStep === 'amount' && (
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-3 gap-2">
                          {topUpAmounts.map((amount) => (
                            <Button
                              key={amount}
                              variant={topUpAmount === amount.toString() ? 'default' : 'outline'}
                              className={`h-12 rounded-xl ${topUpAmount === amount.toString() ? 'bg-black text-white' : 'border-neutral-200'}`}
                              onClick={() => setTopUpAmount(amount.toString())}
                            >
                              {formatCurrency(amount)}
                            </Button>
                          ))}
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Nominal Kustom</Label>
                          <Input
                            type="text"
                            placeholder="Masukkan nominal"
                            value={topUpAmount ? formatCurrency(parseInt(topUpAmount)) : ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setTopUpAmount(value);
                            }}
                            className="mt-2 h-12 rounded-xl"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              if (!topUpAmount || parseInt(topUpAmount) < 10000) {
                                toast.error('Minimum top up is Rp 10,000');
                                return;
                              }
                              setTopUpStep('method');
                            }}
                            className="w-full bg-black text-white hover:bg-black/90 h-11 rounded-xl"
                          >
                            Continue
                          </Button>
                        </DialogFooter>
                      </div>
                    )}

                    {/* Step 2: Method */}
                    {topUpStep === 'method' && (
                      <div className="space-y-4 py-4">
                        <Tabs value={topUpCategory} onValueChange={(v) => setTopUpCategory(v as any)}>
                          <TabsList className="grid grid-cols-4 h-10 bg-neutral-100 rounded-xl p-1">
                            {Object.entries(paymentMethods).map(([key, method]) => (
                              <TabsTrigger 
                                key={key} 
                                value={key}
                                className="rounded-lg text-xs data-[state=active]:bg-white"
                              >
                                <method.icon className="w-4 h-4" weight="bold" />
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          
                          {Object.entries(paymentMethods).map(([key, method]) => (
                            <TabsContent key={key} value={key} className="mt-4">
                              <p className="text-sm text-neutral-600 mb-3">{method.description}</p>
                              <div className="grid grid-cols-2 gap-2">
                                {method.options.map((option) => (
                                  <Button
                                    key={option.code}
                                    variant={topUpMethod === option.code ? 'default' : 'outline'}
                                    className={`h-12 rounded-xl justify-start ${topUpMethod === option.code ? 'bg-black text-white' : 'border-neutral-200'}`}
                                    onClick={() => setTopUpMethod(option.code)}
                                  >
                                    <div className={`w-6 h-6 rounded ${option.color} flex items-center justify-center mr-2`}>
                                      <span className="text-white text-xs font-bold">{option.name.charAt(0)}</span>
                                    </div>
                                    {option.name}
                                  </Button>
                                ))}
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                        
                        <DialogFooter className="flex gap-2">
                          <Button variant="outline" onClick={() => setTopUpStep('amount')} className="flex-1 rounded-xl border-neutral-200">
                            Back
                          </Button>
                          <Button
                            onClick={handleTopUp}
                            disabled={isSubmitting || !topUpMethod}
                            className="flex-1 bg-black text-white hover:bg-black/90 rounded-xl"
                          >
                            {isSubmitting ? <Spinner className="w-4 h-4 animate-spin" aria-hidden="true" /> : 'Bayar Sekarang'}
                          </Button>
                        </DialogFooter>
                      </div>
                    )}

                    {/* Step 3: Payment */}
                    {topUpStep === 'payment' && paymentInfo && (
                      <div className="space-y-4 py-4">
                        <div className="bg-neutral-50 rounded-xl p-4 text-center">
                          <p className="text-sm text-neutral-600 mb-2">Total Pembayaran</p>
                          <p className="text-2xl font-bold text-black">{formatCurrency(parseInt(topUpAmount))}</p>
                        </div>
                        
                        {paymentInfo.vaNumber && (
                          <div className="bg-neutral-50 rounded-xl p-4">
                            <p className="text-sm text-neutral-600 mb-2">Nomor Virtual Account</p>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-mono font-bold text-black">{paymentInfo.vaNumber}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(paymentInfo.vaNumber!)}
                                className="h-8"
                              >
                                {copiedText === paymentInfo.vaNumber ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                              </Button>
                            </div>
                          </div>
                        )}

                        {topUpCategory === 'qris' && paymentInfo.qrUrl && (
                          <div className="bg-white rounded-xl p-4 border border-neutral-200 text-center">
                            <div className="mb-3">
                              <QrCode className="w-7 h-7 text-black mx-auto mb-1" aria-hidden="true" weight="bold" aria-hidden="true" />
                              <p className="text-sm text-neutral-600">Scan QR Code dengan aplikasi e-wallet atau mobile banking</p>
                            </div>
                            <img
                              src={paymentInfo.qrUrl}
                              alt="QR Code"
                              className="w-40 h-40 mx-auto border border-neutral-200 rounded-lg"
                            />
                          </div>
                        )}

                        {topUpCategory === 'ewallet' && paymentInfo.paymentUrl && (
                          <div className="space-y-3">
                            <div className="bg-orange-50 rounded-xl p-2 flex items-start gap-3">
                              <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" aria-hidden="true" />
                              <p className="text-sm text-orange-700">
                                Anda akan diarahkan ke aplikasi e-wallet untuk menyelesaikan pembayaran.
                              </p>
                            </div>
                            <Button
                              onClick={() => window.location.assign(paymentInfo.paymentUrl!)}
                              className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-semibold"
                            >
                              Buka E-Wallet
                            </Button>
                          </div>
                        )}

                        {topUpCategory === 'ewallet' && !paymentInfo.paymentUrl && (
                          <div className="bg-neutral-50 rounded-xl p-4 text-center text-sm text-neutral-600">
                            Silakan buka aplikasi e-wallet Anda dan cek notifikasi pembayaran.
                          </div>
                        )}

                        {paymentInfo.invoiceId && (
                          <div className="bg-neutral-50 rounded-xl p-4 text-sm text-neutral-600">
                            Invoice ID: <span className="font-mono text-black">{paymentInfo.invoiceId}</span>
                          </div>
                        )}

                        {paymentInfo.paymentUrl && topUpCategory !== 'ewallet' && (
                          <Button
                            onClick={() => window.open(paymentInfo.paymentUrl!, '_blank', 'noopener,noreferrer')}
                            className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-semibold"
                          >
                            Klik Bayar
                          </Button>
                        )}
                        
                        {paymentInfo.expiresAt && (
                          <p className="text-sm text-neutral-600 text-center">
                            Batas waktu: {formatDate(paymentInfo.expiresAt)}
                          </p>
                        )}
                        
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              setIsTopUpOpen(false);
                              resetTopUpDialog();
                            }}
                            className="w-full bg-black text-white hover:bg-black/90 rounded-xl"
                          >
                            Done
                          </Button>
                        </DialogFooter>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isWithdrawOpen}
                  onOpenChange={(open) => {
                    setIsWithdrawOpen(open);
                    if (!open) {
                      setWithdrawAmount('');
                      setMfaToken('');
                      setSelectedBankAccount('');
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="flex-1 lg:w-full bg-white/10 text-white hover:bg-white/20 border border-white/20 h-11 rounded-xl font-semibold">
                      <ArrowUpRight className="w-5 h-5 mr-2" aria-hidden="true" weight="bold" aria-hidden="true" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Withdraw Funds</DialogTitle>
                      <DialogDescription>
                        Pindahkan dana ke rekening bank Anda
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="bg-neutral-50 rounded-xl p-4">
                        <p className="text-sm text-neutral-600">Saldo Tersedia</p>
                        <p className="text-2xl font-bold text-black">{formatCurrency(balance?.available || 0)}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Nominal</Label>
                        <Input
                          type="text"
                          placeholder="Masukkan nominal"
                          value={withdrawAmount ? formatCurrency(parseInt(withdrawAmount)) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setWithdrawAmount(value);
                          }}
                          className="mt-2 h-12 rounded-xl"
                        />
                      </div>

                      {bankAccounts.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Rekening Bank</Label>
                          <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                            <SelectTrigger className="mt-2 h-12 rounded-xl">
                              <SelectValue placeholder="Pilih rekening bank" />
                            </SelectTrigger>
                            <SelectContent>
                              {(Array.isArray(bankAccounts) ? bankAccounts : []).map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.bankName} - ****{account.accountNumberLast4}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium">Token MFA</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Masukkan kode 6 digit"
                          value={mfaToken}
                          onChange={(e) => setMfaToken(e.target.value.replace(/\s/g, ''))}
                          className="mt-2 h-12 rounded-xl"
                        />
                        <p className="mt-2 text-xs text-neutral-600">
                          Wajib untuk penarikan. Gunakan authenticator atau backup code.
                        </p>
                      </div>
                      
                      <DialogFooter>
                        <Button
                          onClick={handleWithdraw}
                          disabled={isSubmitting || !withdrawAmount || !selectedBankAccount}
                          className="w-full bg-black text-white hover:bg-black/90 h-11 rounded-xl"
                        >
                          {isSubmitting ? <Spinner className="w-4 h-4 animate-spin" aria-hidden="true" /> : 'Tarik Dana'}
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-white/50 text-xs mb-1">Pemasukan</div>
                <div className="text-lg font-semibold text-emerald-400">+{formatCurrency(stats.totalIn)}</div>
              </div>
              <div className="text-center">
                <div className="text-white/50 text-xs mb-1">Pengeluaran</div>
                <div className="text-lg font-semibold text-red-400">-{formatCurrency(stats.totalOut)}</div>
              </div>
              <div className="text-center">
                <div className="text-white/50 text-xs mb-1">Menunggu</div>
                <div className="text-lg font-semibold text-amber-400">{formatCurrency(stats.pendingWithdrawals)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link href="/deposit" className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm font-medium hover:bg-white/20 transition-colors">
                Halaman Deposit
              </Link>
              <Link href="/bank-accounts" className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm font-medium hover:bg-white/20 transition-colors">
                Kelola Rekening
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ========== TRANSACTION HISTORY ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-black">Riwayat Transaksi</h2>
            </div>
            
            {/* Filter Tabs */}
            <UnderlineTabsSimple
              tabs={[
                { id: 'all', label: 'Semua' },
                { id: 'credit', label: 'Income' },
                { id: 'debit', label: 'Expense' },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="border-0"
            />
          </div>
          
          {/* Transaction List */}
          <div className="divide-y divide-neutral-200">
            {filterTransactions(activeTab).length > 0 ? (
              filterTransactions(activeTab).map((tx) => {
                const config = transactionTypeConfig[tx.type] || transactionTypeConfig.CREDIT;
                const isCredit = ['TOPUP', 'CREDIT', 'credit', 'deposit', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'BONUS', 'REFERRAL'].includes(tx.type) || tx.amount > 0;
                
                return (
                  <motion.div
                    key={tx.id}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-center gap-4 p-4 md:px-5 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center shrink-0`}>
                      <config.icon className={`w-5 h-5 ${config.color}`} weight="bold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-black text-sm">{config.label}</div>
                      <div className="text-xs text-neutral-600 truncate">{tx.description || tx.reference}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-semibold text-sm ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                      </div>
                      <div className="text-xs text-neutral-500">{formatRelativeTime(tx.createdAt)}</div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <WalletIcon className="w-7 h-7 text-neutral-500" aria-hidden="true" weight="regular" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-1 text-black">Belum ada transaksi</h3>
                <p className="text-sm text-neutral-600">Riwayat transaksi dompet akan tampil di sini</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ========== PENDING WITHDRAWALS ========== */}
        {(Array.isArray(withdrawals) ? withdrawals : []).filter(w => w.status === 'PENDING').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" aria-hidden="true" weight="fill" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-amber-900">Penarikan Menunggu</h3>
            </div>
            <div className="space-y-2">
              {(Array.isArray(withdrawals) ? withdrawals : []).filter(w => w.status === 'PENDING').map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-200">
                  <div>
                    <div className="font-medium text-black">{formatCurrency(withdrawal.amount)}</div>
                    <div className="text-xs text-neutral-600">
                      {withdrawal.bankAccount?.bankName} ****{withdrawal.bankAccount?.accountNumberLast4}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCancellingWithdrawal(withdrawal);
                      setIsCancelOpen(true);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Batalkan
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cancel Withdrawal Dialog */}
        <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Batalkan penarikan?</AlertDialogTitle>
              <AlertDialogDescription>
                Anda yakin ingin membatalkan penarikan sebesar {cancellingWithdrawal && formatCurrency(cancellingWithdrawal.amount)}? Dana akan dikembalikan ke saldo tersedia.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Pertahankan</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelWithdrawal}
                disabled={isCancelling}
                className="bg-red-600 hover:bg-red-700 rounded-xl"
              >
                {isCancelling ? <Spinner className="w-4 h-4 animate-spin" aria-hidden="true" /> : 'Ya, Batalkan'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

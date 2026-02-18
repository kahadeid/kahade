/**
 * KAHADE TRANSACTION DETAIL PAGE - Professional Responsive Design
 * 
 * Design Philosophy:
 * - Mobile: Stacked cards with tab navigation
 * - Tablet/Desktop: Two-column layout with sidebar
 * - Consistent visual hierarchy across all breakpoints
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, Warning, Copy, Spinner, XCircle, 
  Package, CreditCard, ChatCircle, PaperPlaneTilt, Star, Truck, 
  File, ShieldCheck, User
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { transactionApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { UnderlineTabsSimple } from '@/components/ui/underline-tabs';

interface Message {
  id: string;
  userId: string;
  message: string;
  attachments?: string[];
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

interface DeliveryProof {
  id: string;
  courier?: string;
  trackingNumber?: string;
  notes: string;
  fileUrls: string[];
  submittedAt: string;
}

interface Transaction {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  amount: number;
  platformFee: number;
  status: string;
  initiatorRole: string;
  initiatorId: string;
  counterpartyId?: string;
  category: string;
  terms?: string;
  feePayer: string;
  createdAt: string;
  acceptedAt?: string;
  paidAt?: string;
  // deliveredAt is not returned by backend - use deliveryProof instead
  completedAt?: string;
  cancelledAt?: string;
  disputedAt?: string;
  initiator?: { id: string; username: string; reputationScore?: number };
  counterparty?: { id: string; username: string; reputationScore?: number };
  deliveryProof?: DeliveryProof;
}

// Note: Backend OrderStatus enum: WAITING_COUNTERPARTY, PENDING_ACCEPT, ACCEPTED, PAID, COMPLETED, CANCELLED, DISPUTED, REFUNDED
// DELIVERED is handled via order.deliveredAt field, not as a separate status
const statusConfig: Record<string, { label: string; color: string; bgColor: string; step: number }> = {
  WAITING_COUNTERPARTY: { label: 'Waiting for Counterparty', color: 'text-amber-600', bgColor: 'bg-amber-50', step: 1 },
  PENDING_ACCEPT: { label: 'Pending Acceptance', color: 'text-amber-600', bgColor: 'bg-amber-50', step: 1 },
  ACCEPTED: { label: 'Awaiting Payment', color: 'text-blue-600', bgColor: 'bg-blue-50', step: 2 },
  PAID: { label: 'Awaiting Delivery', color: 'text-purple-600', bgColor: 'bg-purple-50', step: 3 },
  DELIVERED: { label: 'Awaiting Confirmation', color: 'text-blue-600', bgColor: 'bg-blue-50', step: 4 }, // Virtual status based on deliveredAt
  COMPLETED: { label: 'Completed', color: 'text-emerald-600', bgColor: 'bg-emerald-50', step: 5 },
  DISPUTED: { label: 'In Dispute', color: 'text-red-600', bgColor: 'bg-red-50', step: 0 },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-600', bgColor: 'bg-gray-100', step: 0 },
  REFUNDED: { label: 'Refunded', color: 'text-orange-600', bgColor: 'bg-orange-50', step: 0 },
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
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

const formatRelativeTime = (dateString: string) => {
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
};

const tabs = [
  { id: 'details', label: 'Details', icon: File },
  { id: 'chat', label: 'Chat', icon: ChatCircle },
  { id: 'delivery', label: 'Delivery', icon: Truck },
];

export default function TransactionDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDeliveryProofOpen, setIsDeliveryProofOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [deliveryProof, setDeliveryProof] = useState({
    courier: '',
    trackingNumber: '',
    notes: '',
  });
  const [rating, setRating] = useState({ score: 5, comment: '' });

  useEffect(() => {
    fetchTransaction();
    fetchMessages();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  useEffect(() => {
    if (activeTab !== 'chat') return;
    const interval = setInterval(() => fetchMessages(), 10000);
    return () => clearInterval(interval);
  }, [activeTab, id]);

  const fetchTransaction = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await transactionApi.get(id);
      const responseData = response?.data;
      const transactionData =
        responseData?.data?.transaction ||
        responseData?.data ||
        responseData?.transaction ||
        responseData;
      setTransaction(transactionData);
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to load transaction');
      setLocation('/transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const response = await transactionApi.getMessages(id);
      // Safely extract messages array
      const data = response?.data;
      let msgList: Message[] = [];
      if (data) {
        if (Array.isArray(data.messages)) msgList = data.messages;
        else if (Array.isArray(data.data)) msgList = data.data;
        else if (Array.isArray(data)) msgList = data;
      }
      setMessages(msgList);
    } catch (error) {
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !transaction) return;
    setIsSendingMessage(true);
    try {
      await transactionApi.addMessage(transaction.id, newMessage.trim());
      setNewMessage('');
      await fetchMessages();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (transaction) {
      navigator.clipboard.writeText(transaction.orderNumber);
      toast.success('Order number copied');
    }
  };

  const handleAccept = async () => {
    if (!transaction) return;
    setIsActionLoading(true);
    try {
      await transactionApi.accept(transaction.id);
      toast.success('Transaction accepted!');
      fetchTransaction();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to accept');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!transaction) return;
    setIsActionLoading(true);
    try {
      await transactionApi.reject(transaction.id, cancelReason);
      toast.success('Transaction rejected');
      setIsCancelOpen(false);
      fetchTransaction();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePay = async () => {
    if (!transaction) return;
    setIsActionLoading(true);
    try {
      await transactionApi.pay(transaction.id);
      toast.success('Payment successful!');
      fetchTransaction();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to pay');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!transaction) return;
    setIsActionLoading(true);
    try {
      if (deliveryProof.courier || deliveryProof.trackingNumber || deliveryProof.notes) {
        await transactionApi.submitDeliveryProof(transaction.id, deliveryProof);
      }
      await transactionApi.confirmDelivery(transaction.id);
      toast.success('Delivery confirmed!');
      setIsDeliveryProofOpen(false);
      fetchTransaction();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to confirm delivery');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!transaction) return;
    setIsActionLoading(true);
    try {
      await transactionApi.confirmReceipt(transaction.id);
      toast.success('Transaction completed!');
      setIsRatingOpen(true);
      fetchTransaction();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to confirm receipt');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!transaction) return;
    setIsActionLoading(true);
    try {
      await transactionApi.submitRating(transaction.id, rating);
      toast.success('Rating submitted!');
      setIsRatingOpen(false);
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!transaction) return;
    setIsActionLoading(true);
    try {
      await transactionApi.cancel(transaction.id, cancelReason);
      toast.success('Transaction cancelled');
      setIsCancelOpen(false);
      fetchTransaction();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitDispute = async () => {
    if (!transaction || !disputeReason.trim() || !disputeDescription.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsActionLoading(true);
    try {
      await transactionApi.dispute(transaction.id, {
        reason: disputeReason,
        description: disputeDescription,
      });
      toast.success('Dispute submitted');
      setIsDisputeOpen(false);
      fetchTransaction();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to submit dispute');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Transaction" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner className="w-10 h-10 animate-spin text-black mx-auto mb-4" aria-hidden="true" weight="bold" />
            <p className="text-neutral-600">Loading transaction...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!transaction) {
    return (
      <DashboardLayout title="Transaction" subtitle="Not found">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-neutral-500" aria-hidden="true" weight="regular" />
          </div>
          <h3 className="font-semibold text-black mb-1">Transaction Not Found</h3>
          <p className="text-sm text-neutral-600 mb-4">The transaction you're looking for doesn't exist.</p>
          <Link href="/transactions">
            <Button className="bg-black text-white hover:bg-black/90 rounded-xl">
              Back to Transactions
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Determine effective status - DELIVERED is a virtual status when PAID + has deliveryProof
  const effectiveStatus = transaction.status === 'PAID' && transaction.deliveryProof 
    ? 'DELIVERED' 
    : transaction.status;
  const status = statusConfig[effectiveStatus] || statusConfig.PENDING_ACCEPT;
  const isBuyer = (transaction.initiatorRole === 'BUYER' && transaction.initiatorId === user?.id) ||
                  (transaction.initiatorRole === 'SELLER' && transaction.counterpartyId === user?.id);
  const isSeller = !isBuyer;
  const isInitiator = transaction.initiatorId === user?.id;
  const buyer = isBuyer ? (isInitiator ? transaction.initiator : transaction.counterparty) : (isInitiator ? transaction.counterparty : transaction.initiator);
  const seller = isSeller ? (isInitiator ? transaction.initiator : transaction.counterparty) : (isInitiator ? transaction.counterparty : transaction.initiator);

  const progressSteps = [
    { id: 1, label: 'Created', completed: true },
    { id: 2, label: 'Accepted', completed: !!transaction.acceptedAt },
    { id: 3, label: 'Paid', completed: !!transaction.paidAt },
    { id: 4, label: 'Delivered', completed: !!transaction.deliveryProof }, // Use deliveryProof instead of deliveredAt
    { id: 5, label: 'Completed', completed: !!transaction.completedAt },
  ];

  return (
    <DashboardLayout title="Transaction" subtitle={transaction.orderNumber}>
      <div className="space-y-6">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${status.bgColor} ${status.color} border-0 text-xs`}>
                  {status.label}
                </Badge>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-black mb-1 line-clamp-2">{transaction.title}</h1>
              <p className="text-sm text-neutral-600 line-clamp-2">{transaction.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        {!['CANCELLED', 'REFUNDED', 'DISPUTED'].includes(transaction.status) && (
          <div className="flex items-center justify-between overflow-x-auto">
            {progressSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    step.completed 
                      ? 'bg-emerald-500 text-white' 
                      : status.step === step.id
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5" aria-hidden="true" weight="fill" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`text-xs mt-1 whitespace-nowrap ${step.completed || status.step === step.id ? 'text-black font-medium' : 'text-neutral-500'}`}>
                    {step.label}
                  </span>
                </div>
                {index < progressSteps.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-1 ${
                    progressSteps[index + 1].completed ? 'bg-emerald-500' : 'bg-neutral-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <UnderlineTabsSimple
                tabs={tabs.map(tab => ({
                  ...tab,
                  count: tab.id === 'chat' ? (Array.isArray(messages) ? messages : []).length : undefined
                }))}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </motion.div>

            <AnimatePresence mode="wait">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Transaction Details */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6">
                    <h2 className="font-semibold text-black mb-4 text-lg md:text-xl">Transaction Details</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <div className="text-xs text-neutral-600 uppercase tracking-wide">Transaction ID</div>
                        <button 
                          onClick={handleCopyOrderNumber}
                          className="font-mono text-sm text-black hover:text-neutral-900/80 flex items-center gap-1 transition-colors"
                        >
                          {transaction.orderNumber}
                          <Copy className="w-3 h-3" aria-hidden="true" weight="bold" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-neutral-600 uppercase tracking-wide">Amount</div>
                        <div className="text-sm font-semibold text-black">{formatCurrency(transaction.amount)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-neutral-600 uppercase tracking-wide">Platform Fee</div>
                        <div className="text-sm font-semibold text-black">{formatCurrency(transaction.platformFee)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Parties */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6">
                    <h2 className="font-semibold text-black mb-4 text-lg md:text-xl">Parties Involved</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl ${isBuyer ? 'bg-black/5 border border-black/10' : 'bg-neutral-50'}`}>
                        <div className="text-xs text-neutral-600 mb-2 flex items-center gap-2">
                          <User className="w-3 h-3" aria-hidden="true" />
                          Buyer {isBuyer && <Badge className="bg-black text-white border-0 text-[10px]">You</Badge>}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                            {buyer?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-black text-sm">{buyer?.username || 'Waiting...'}</div>
                            {buyer?.reputationScore && (
                              <div className="text-xs text-neutral-600 flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500" aria-hidden="true" weight="fill" />
                                {buyer.reputationScore}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl ${isSeller ? 'bg-black/5 border border-black/10' : 'bg-neutral-50'}`}>
                        <div className="text-xs text-neutral-600 mb-2 flex items-center gap-2">
                          <Package className="w-3 h-3" aria-hidden="true" />
                          Seller {isSeller && <Badge className="bg-black text-white border-0 text-[10px]">You</Badge>}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                            {seller?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-black text-sm">{seller?.username || 'Waiting...'}</div>
                            {seller?.reputationScore && (
                              <div className="text-xs text-neutral-600 flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500" aria-hidden="true" weight="fill" />
                                {seller.reputationScore}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6">
                    <h2 className="font-semibold text-black mb-3 text-lg md:text-xl">Description</h2>
                    <p className="text-sm text-neutral-600 whitespace-pre-wrap">{transaction.description}</p>
                    
                    {transaction.terms && (
                      <div className="mt-4 pt-4 border-t border-neutral-200">
                        <h3 className="font-medium text-black text-sm mb-2">Terms & Conditions</h3>
                        <p className="text-sm text-neutral-600 whitespace-pre-wrap">{transaction.terms}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
                >
                  {/* Messages */}
                  <div className="h-80 overflow-y-auto p-4 space-y-3">
                    {(Array.isArray(messages) ? messages : []).length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <ChatCircle className="w-10 h-10 text-neutral-300 mx-auto mb-2" aria-hidden="true" weight="regular" />
                          <p className="text-sm text-neutral-600">No messages yet</p>
                        </div>
                      </div>
                    ) : (
                      (Array.isArray(messages) ? messages : []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${msg.userId === user?.id ? 'order-2' : ''}`}>
                            <div className={`px-4 py-2.5 rounded-2xl ${
                              msg.userId === user?.id
                                ? 'bg-black text-white rounded-br-md'
                                : 'bg-neutral-100 text-black rounded-bl-md'
                            }`}>
                              <p className="text-sm">{msg.message}</p>
                            </div>
                            <div className={`text-[10px] text-neutral-500 mt-1 ${msg.userId === user?.id ? 'text-right' : ''}`}>
                              {msg.user.username} • {formatRelativeTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input */}
                  <div className="p-4 border-t border-neutral-200 bg-neutral-50">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 h-10 rounded-xl border-neutral-200"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isSendingMessage || !newMessage.trim()}
                        className="bg-black text-white hover:bg-black/90 rounded-xl h-10 w-10 p-0"
                      >
                        {isSendingMessage ? (
                          <Spinner className="w-4 h-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <PaperPlaneTilt className="w-4 h-4" aria-hidden="true" weight="fill" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Delivery Tab */}
              {activeTab === 'delivery' && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6"
                >
                  {transaction.deliveryProof ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" weight="fill" />
                        </div>
                        <div>
                          <div className="font-medium text-black">Delivery Confirmed</div>
                          <div className="text-xs text-neutral-600">{formatDate(transaction.deliveryProof.submittedAt)}</div>
                        </div>
                      </div>
                      {transaction.deliveryProof.courier && (
                        <div className="p-4 bg-neutral-50 rounded-xl">
                          <div className="text-xs text-neutral-600 mb-1">Courier</div>
                          <div className="text-sm font-medium text-black">{transaction.deliveryProof.courier}</div>
                        </div>
                      )}
                      {transaction.deliveryProof.trackingNumber && (
                        <div className="p-4 bg-neutral-50 rounded-xl">
                          <div className="text-xs text-neutral-600 mb-1">Tracking Number</div>
                          <div className="text-sm font-medium text-black font-mono">{transaction.deliveryProof.trackingNumber}</div>
                        </div>
                      )}
                      {transaction.deliveryProof.notes && (
                        <div className="p-4 bg-neutral-50 rounded-xl">
                          <div className="text-xs text-neutral-600 mb-1">Notes</div>
                          <div className="text-sm text-black">{transaction.deliveryProof.notes}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="w-12 h-12 text-neutral-300 mx-auto mb-3" aria-hidden="true" weight="regular" />
                      <h3 className="font-medium text-black mb-1">No Delivery Info</h3>
                      <p className="text-sm text-neutral-600">Delivery information will appear here once submitted</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Sidebar - Actions */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6"
            >
              <h2 className="font-semibold text-black mb-4 text-lg md:text-xl">Actions</h2>
              <div className="space-y-3">
                {/* Accept/Reject for counterparty */}
                {transaction.status === 'PENDING_ACCEPT' && !isInitiator && (
                  <>
                    <Button
                      onClick={handleAccept}
                      disabled={isActionLoading}
                      className="w-full bg-black text-white hover:bg-black/90 rounded-xl h-11"
                    >
                      {isActionLoading ? <Spinner className="w-4 h-4 animate-spin mr-2" aria-hidden="true" /> : <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" />}
                      Accept Transaction
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCancelOpen(true)}
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-11"
                    >
                      <XCircle className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" />
                      Reject
                    </Button>
                  </>
                )}

                {/* Pay for buyer */}
                {transaction.status === 'ACCEPTED' && isBuyer && (
                  <Button
                    onClick={handlePay}
                    disabled={isActionLoading}
                    className="w-full bg-black text-white hover:bg-black/90 rounded-xl h-11"
                  >
                    {isActionLoading ? <Spinner className="w-4 h-4 animate-spin mr-2" aria-hidden="true" /> : <CreditCard className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" />}
                    Pay Now
                  </Button>
                )}

                {/* Confirm Delivery for seller */}
                {transaction.status === 'PAID' && isSeller && (
                  <Button
                    onClick={() => setIsDeliveryProofOpen(true)}
                    disabled={isActionLoading}
                    className="w-full bg-black text-white hover:bg-black/90 rounded-xl h-11"
                  >
                    <Truck className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" />
                    Confirm Delivery
                  </Button>
                )}

                {/* Confirm Receipt for buyer */}
                {effectiveStatus === 'DELIVERED' && isBuyer && (
                  <Button
                    onClick={handleConfirmReceipt}
                    disabled={isActionLoading}
                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl h-11"
                  >
                    {isActionLoading ? <Spinner className="w-4 h-4 animate-spin mr-2" aria-hidden="true" /> : <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" />}
                    Confirm Receipt
                  </Button>
                )}

                {/* Dispute */}
                {['PAID', 'DELIVERED'].includes(effectiveStatus) && (
                  <Button
                    variant="outline"
                    onClick={() => setIsDisputeOpen(true)}
                    className="w-full border-amber-200 text-amber-600 hover:bg-amber-50 rounded-xl h-11"
                  >
                    <Warning className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" />
                    Open Dispute
                  </Button>
                )}

                {/* Cancel */}
                {['PENDING_ACCEPT', 'ACCEPTED'].includes(transaction.status) && isInitiator && (
                  <Button
                    variant="outline"
                    onClick={() => setIsCancelOpen(true)}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-11"
                  >
                    <XCircle className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" />
                    Cancel Transaction
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Transaction Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" aria-hidden="true" weight="duotone" />
                </div>
                <div>
                  <h3 className="font-medium text-black text-sm mb-1">Escrow Protected</h3>
                  <p className="text-xs text-neutral-600">
                    Funds are held securely until both parties confirm the transaction is complete.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {/* Cancel Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Transaction</DialogTitle>
            <DialogDescription>Please provide a reason for cancellation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="min-h-24 rounded-xl border-neutral-200"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleCancel} disabled={isActionLoading} className="bg-red-600 text-white hover:bg-red-700 rounded-xl">
              {isActionLoading ? <Spinner className="w-4 h-4 animate-spin mr-2" aria-hidden="true" /> : null}
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Proof Dialog */}
      <Dialog open={isDeliveryProofOpen} onOpenChange={setIsDeliveryProofOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delivery</DialogTitle>
            <DialogDescription>Provide delivery details (optional but recommended).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Courier</Label>
              <Input
                value={deliveryProof.courier}
                onChange={(e) => setDeliveryProof({ ...deliveryProof, courier: e.target.value })}
                placeholder="e.g., JNE, J&T, SiCepat"
                className="h-10 rounded-xl border-neutral-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tracking Number</Label>
              <Input
                value={deliveryProof.trackingNumber}
                onChange={(e) => setDeliveryProof({ ...deliveryProof, trackingNumber: e.target.value })}
                placeholder="Enter tracking number"
                className="h-10 rounded-xl border-neutral-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea
                value={deliveryProof.notes}
                onChange={(e) => setDeliveryProof({ ...deliveryProof, notes: e.target.value })}
                placeholder="Additional notes..."
                className="min-h-20 rounded-xl border-neutral-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeliveryProofOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleConfirmDelivery} disabled={isActionLoading} className="bg-black text-white hover:bg-black/90 rounded-xl">
              {isActionLoading ? <Spinner className="w-4 h-4 animate-spin mr-2" aria-hidden="true" /> : null}
              Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={isDisputeOpen} onOpenChange={setIsDisputeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Open Dispute</DialogTitle>
            <DialogDescription>Our team will review your dispute within 1-3 business days.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Reason</Label>
              <Input
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Brief reason for dispute"
                className="h-10 rounded-xl border-neutral-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="min-h-24 rounded-xl border-neutral-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisputeOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSubmitDispute} disabled={isActionLoading} className="bg-amber-600 text-white hover:bg-amber-700 rounded-xl">
              {isActionLoading ? <Spinner className="w-4 h-4 animate-spin mr-2" aria-hidden="true" /> : null}
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Transaction</DialogTitle>
            <DialogDescription>How was your experience?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating({ ...rating, score: star })}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${star <= rating.score ? 'text-amber-500' : 'text-neutral-300'}`}
                    weight={star <= rating.score ? 'fill' : 'regular'}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={rating.comment}
              onChange={(e) => setRating({ ...rating, comment: e.target.value })}
              placeholder="Leave a comment (optional)"
              className="min-h-20 rounded-xl border-neutral-200"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRatingOpen(false)} className="rounded-xl">Skip</Button>
            <Button onClick={handleSubmitRating} disabled={isActionLoading} className="bg-black text-white hover:bg-black/90 rounded-xl">
              {isActionLoading ? <Spinner className="w-4 h-4 animate-spin mr-2" aria-hidden="true" /> : null}
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

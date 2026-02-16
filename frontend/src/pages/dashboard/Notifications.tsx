import { SkipToContent } from '@/lib/accessibility';
/**
 * KAHADE NOTIFICATIONS PAGE - Professional Responsive Design
 * 
 * Design Philosophy:
 * - Mobile: Full-width card list with swipe actions
 * - Tablet/Desktop: Centered content with optimal width
 * - Consistent visual hierarchy across all breakpoints
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Warning, Info, Wallet, ArrowsLeftRight,
  Check, Trash, Spinner, Package, ShieldCheck,
  User, Megaphone
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { notificationApi } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;  // Backend uses readAt (DateTime) not read (boolean)
  createdAt: string;
  data?: Record<string, unknown>;
}

const typeConfig: Record<string, { icon: typeof Bell; color: string; bgColor: string }> = {
  TRANSACTION: { icon: ArrowsLeftRight, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  PAYMENT: { icon: Wallet, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  INFO: { icon: Info, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  ALERT: { icon: Warning, color: 'text-red-600', bgColor: 'bg-red-50' },
  DISPUTE: { icon: Warning, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  SYSTEM: { icon: ShieldCheck, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  ORDER: { icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  USER: { icon: User, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  PROMOTION: { icon: Megaphone, color: 'text-amber-600', bgColor: 'bg-amber-50' },
};

type NotificationCategory = 'all' | 'promotion' | 'transaction' | 'information';

const categoryConfig: Record<Exclude<NotificationCategory, 'all'>, { label: string; className: string }> = {
  promotion: { label: 'Promosi', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  transaction: { label: 'Transaksi', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  information: { label: 'Informasi', className: 'border-slate-200 bg-slate-50 text-slate-700' },
};

const getCategoryFromType = (type: string): Exclude<NotificationCategory, 'all'> => {
  const normalized = type?.toUpperCase?.() ?? '';
  if (['PROMOTION', 'MARKETING', 'CAMPAIGN', 'OFFER'].includes(normalized)) return 'promotion';
  if (['TRANSACTION', 'PAYMENT', 'ORDER', 'DISPUTE'].includes(normalized)) return 'transaction';
  return 'information';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short'
  }).format(date);
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory>('all');
  
  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { limit: 50 };
      if (filter === 'unread') params.read = false;
      
      const response = await notificationApi.list(params);
      // Safely extract notifications array
      const data = response?.data;
      let notifList: Notification[] = [];
      if (data) {
        if (Array.isArray(data.data)) notifList = data.data;
        else if (Array.isArray(data.notifications)) notifList = data.notifications;
        else if (Array.isArray(data)) notifList = data;
      }
      setNotifications(notifList);
    } catch (error) {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure notifications is always an array
  const notifList = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notifList.filter(n => !n.readAt).length;
  const filteredNotifications = notifList.filter((notif) => {
    if (categoryFilter === 'all') return true;
    return getCategoryFromType(notif.type) === categoryFilter;
  });

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifList.map(n => ({ ...n, readAt: new Date().toISOString() })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(notifList.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    } catch (error) {
      toast.error('Failed to mark notification');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications(notifList.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Notifications" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner className="w-10 h-10 animate-spin text-black mx-auto mb-4" aria-hidden="true" weight="bold" aria-hidden="true" />
            <p className="text-neutral-600">Loading notifications...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Notifications" subtitle={`${unreadCount} unread`}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ========== HEADER ACTIONS ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-5"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-black" aria-hidden="true" weight="duotone" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-semibold text-black">{notifList.length}</span>
                    <span className="text-neutral-600 ml-1">Notifications</span>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <Badge className="bg-black text-white border-0">{unreadCount} new</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter Tabs */}
                <div className="flex bg-neutral-100 rounded-xl p-1">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilter('all')}
                    className={`rounded-lg h-8 px-4 ${filter === 'all' ? 'bg-white shadow-sm text-black' : 'text-neutral-600 hover:text-neutral-900'}`}
                  >
                    All
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilter('unread')}
                    className={`rounded-lg h-8 px-4 ${filter === 'unread' ? 'bg-white shadow-sm text-black' : 'text-neutral-600 hover:text-neutral-900'}`}
                  >
                    Unread
                  </Button>
                </div>
                
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleMarkAllRead}
                    className="rounded-xl border-neutral-200 h-8"
                  >
                    <Check className="w-4 h-4 mr-1" aria-hidden="true" weight="bold" aria-hidden="true" />
                    <span className="hidden sm:inline">Mark All Read</span>
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={categoryFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className={`rounded-full h-8 px-4 ${
                    categoryFilter === 'all' ? 'bg-black text-white hover:bg-black/90' : 'border-neutral-200 text-neutral-600 hover:text-neutral-900'
                  }`}
                  onClick={() => setCategoryFilter('all')}
                >
                  Semua
                </Button>
                {(['promotion', 'transaction', 'information'] as const).map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className={`rounded-full h-8 px-4 border ${
                      categoryFilter === category ? categoryConfig[category].className : 'border-neutral-200 text-neutral-600 hover:text-neutral-900'
                    }`}
                    onClick={() => setCategoryFilter(category)}
                  >
                    {categoryConfig[category].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* ========== NOTIFICATIONS LIST ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
        >
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-neutral-200">
              <AnimatePresence>
                {filteredNotifications.map((notif, index) => {
                  const config = typeConfig[notif.type] || typeConfig.INFO;
                  const Icon = config.icon;
                  const category = getCategoryFromType(notif.type);
                  
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.03 }}
                      className={`p-4 md:px-5 hover:bg-neutral-50 transition-colors ${
                        !notif.readAt ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-4 md:gap-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${config.bgColor}`}>
                          <Icon className={`w-5 h-5 ${config.color}`} weight="duotone" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className={`font-medium text-sm ${!notif.readAt ? 'text-black' : 'text-neutral-600'}`}>
                                  {notif.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] leading-4 px-2 py-0.5 rounded-full border ${categoryConfig[category].className}`}
                                >
                                  {categoryConfig[category].label}
                                </Badge>
                                {!notif.readAt && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-neutral-600 mt-0.5 line-clamp-2">{notif.message}</p>
                            </div>
                            <span className="text-xs text-neutral-500 shrink-0 whitespace-nowrap">
                              {formatDate(notif.createdAt)}
                            </span>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 mt-3">
                            {!notif.readAt && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                                onClick={() => handleMarkRead(notif.id)}
                              >
                                <Check className="w-3 h-3 mr-1" aria-hidden="true" weight="bold" aria-hidden="true" />
                                Mark Read
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(notif.id)}
                            >
                              <Trash className="w-3 h-3 mr-1" aria-hidden="true" weight="bold" aria-hidden="true" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-neutral-500" aria-hidden="true" weight="regular" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-black mb-1">No notifications</h3>
              <p className="text-sm text-neutral-600 max-w-sm mx-auto">
                {filter === 'unread' 
                  ? 'All notifications have been read.'
                  : categoryFilter === 'all'
                    ? 'You will receive notifications about orders and account activity here.'
                    : 'Tidak ada notifikasi untuk kategori ini.'
                }
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

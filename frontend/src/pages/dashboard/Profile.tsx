import { SkipToContent } from '@/lib/accessibility';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  User, CaretRight, SignOut, Spinner, ShieldCheck,
  UserCircle, IdentificationCard, Receipt, Bank, ClockCounterClockwise,
  Star, Trophy, UserPlus, Target,
  Question, Headset, ChatCircle,
  Bell, LockKey, Globe, MoonStars,
  Wallet, TrendUp
} from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { referralApi, userApi } from '@/lib/api';

interface UserStats {
  totalTransactions: number;
  completedTransactions: number;
  successRate: number;
  avgResponseTime: string;
  totalVolume: number;
}

interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  totalEarnings: number;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
  external?: boolean;
}

function MenuItem({ icon, label, subtitle, href, onClick, badge, badgeColor = 'bg-gray-100 text-gray-600', external }: MenuItemProps) {
  const content = (
    <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-neutral-50 transition-colors cursor-pointer">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground text-[15px]">{label}</div>
        {subtitle && <div className="text-xs text-neutral-600 mt-0.5">{subtitle}</div>}
      </div>
      {badge && <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badgeColor}`}>{badge}</span>}
      <CaretRight className="w-5 h-5 text-neutral-500" aria-hidden="true" weight="regular" aria-hidden="true" />
    </div>
  );

  if (onClick) return <button onClick={onClick} className="w-full text-left">{content}</button>;
  if (external && href) return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-4 py-2.5 bg-neutral-50">
      <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">{title}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-neutral-200 mx-4" />;
}

function getRankInfo(points: number) {
  if (points >= 10000) return { name: 'Diamond', color: 'text-cyan-500', bg: 'bg-cyan-50' };
  if (points >= 5000) return { name: 'Platinum', color: 'text-purple-500', bg: 'bg-purple-50' };
  if (points >= 2000) return { name: 'Gold', color: 'text-amber-500', bg: 'bg-amber-50' };
  if (points >= 500) return { name: 'Silver', color: 'text-gray-500', bg: 'bg-gray-100' };
  return { name: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-50' };
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalTransactions: 0,
    completedTransactions: 0,
    successRate: 100,
    avgResponseTime: '< 1h',
    totalVolume: 0,
  });
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

  useEffect(() => {
    if (user) fetchData();
    setIsLoading(false);
  }, [user]);

  const userPoints = useMemo(
    () => stats.completedTransactions * 10 + (referralStats?.totalReferrals || 0) * 50,
    [stats.completedTransactions, referralStats?.totalReferrals]
  );
  const rankInfo = getRankInfo(userPoints);

  const fetchData = async () => {
    try {
      const [statsRes, referralRes] = await Promise.all([
        userApi.getStats(),
        referralApi.getStats().catch(() => ({ data: null })),
      ]);
      if (statsRes.data) setStats(statsRes.data);
      if (referralRes.data) setReferralStats(referralRes.data);
    } catch (error) {
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const getKycStatusBadge = () => {
    const status = user?.kycStatus || 'NOT_SUBMITTED';
    const configs: Record<string, { label: string; color: string }> = {
      VERIFIED: { label: 'Terverifikasi', color: 'bg-emerald-100 text-emerald-700' },
      PENDING: { label: 'Menunggu', color: 'bg-amber-100 text-amber-700' },
      REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-700' },
      NOT_SUBMITTED: { label: 'Belum', color: 'bg-gray-100 text-gray-600' },
    };
    return configs[status] || configs.NOT_SUBMITTED;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Profil" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner className="w-10 h-10 animate-spin text-black mx-auto mb-4" aria-hidden="true" weight="bold" aria-hidden="true" />
            <p className="text-neutral-600">Memuat profil...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const kycBadge = getKycStatusBadge();

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto pb-8 space-y-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden bg-gradient-to-br from-black via-[#111827] to-[#1F2937] text-white">
          <Link href="/profile/edit">
            <div className="p-5 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white" aria-hidden="true" weight="regular" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold truncate">{user?.username || 'User'}</h2>
                    {user?.kycStatus === 'VERIFIED' && <ShieldCheck className="w-5 h-5 text-emerald-300" aria-hidden="true" weight="fill" aria-hidden="true" />}
                  </div>
                  <p className="text-sm text-white/75 truncate">{user?.email || ''}</p>
                  <p className="text-xs text-white/55 mt-0.5">ID: {user?.id?.slice(0, 8) || '---'}</p>
                </div>
                <CaretRight className="w-5 h-5 text-white/70" aria-hidden="true" weight="regular" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="text-xs text-white/70">Transaksi</div>
                  <div className="text-lg font-semibold">{stats.totalTransactions}</div>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="text-xs text-white/70">Success</div>
                  <div className="text-lg font-semibold">{stats.successRate}%</div>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="text-xs text-white/70">Poin</div>
                  <div className="text-lg font-semibold">{userPoints}</div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <SectionHeader title="Quick Access" />
          <div className="grid grid-cols-3 gap-2 px-4 py-3">
            <Link href="/wallet" className="rounded-xl border border-neutral-200 p-2 hover:bg-neutral-50">
              <Wallet className="w-5 h-5 text-neutral-900 mb-2" aria-hidden="true" weight="regular" aria-hidden="true" />
              <p className="text-xs font-medium">Wallet</p>
            </Link>
            <Link href="/transactions" className="rounded-xl border border-neutral-200 p-2 hover:bg-neutral-50">
              <Receipt className="w-5 h-5 text-neutral-900 mb-2" aria-hidden="true" weight="regular" aria-hidden="true" />
              <p className="text-xs font-medium">Pesanan</p>
            </Link>
            <Link href="/activity" className="rounded-xl border border-neutral-200 p-2 hover:bg-neutral-50">
              <TrendUp className="w-5 h-5 text-neutral-900 mb-2" aria-hidden="true" weight="regular" aria-hidden="true" />
              <p className="text-xs font-medium">Aktivitas</p>
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <SectionHeader title="Detail Akun" />
          <MenuItem icon={<UserCircle className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Informasi Akun" subtitle="Nama, email, nomor telepon" href="/profile/edit" />
          <Divider />
          <MenuItem icon={<IdentificationCard className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Verifikasi Identitas" subtitle="KYC untuk limit lebih tinggi" href="/kyc" badge={kycBadge.label} badgeColor={kycBadge.color} />
          <Divider />
          <MenuItem icon={<Receipt className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Riwayat Transaksi" subtitle={`${stats.totalTransactions} transaksi`} href="/transactions" />
          <Divider />
          <MenuItem icon={<Bank className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Rekening Bank" subtitle="Kelola rekening penarikan" href="/bank-accounts" />
          <Divider />
          <MenuItem icon={<ClockCounterClockwise className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Laporan / Activity Log" subtitle="Riwayat aktivitas akun" href="/activity" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <SectionHeader title="Rewards" />
          <MenuItem icon={<Star className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Points" subtitle="Kumpulkan poin dari transaksi" href="/rewards/points" badge={`${userPoints} pts`} badgeColor="bg-amber-100 text-amber-700" />
          <Divider />
          <MenuItem icon={<Trophy className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Rank" subtitle="Level keanggotaan Anda" href="/rewards/rank" badge={rankInfo.name} badgeColor={`${rankInfo.bg} ${rankInfo.color}`} />
          <Divider />
          <MenuItem icon={<UserPlus className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Undang Teman" subtitle={`${referralStats?.totalReferrals || 0} referral berhasil`} href="/referrals" />
          <Divider />
          <MenuItem icon={<Target className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Misi" subtitle="Selesaikan misi, dapatkan hadiah" href="/rewards/missions" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <SectionHeader title="Support" />
          <MenuItem icon={<Question className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Pusat Bantuan" subtitle="FAQ dan panduan penggunaan" href="/support" />
          <Divider />
          <MenuItem icon={<Headset className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Hubungi Kami" subtitle="Chat dengan tim support" href="https://wa.me/6281234567890" external />
          <Divider />
          <MenuItem icon={<ChatCircle className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Kirim Masukan" subtitle="Saran dan kritik untuk kami" href="mailto:support@kahade.id" external />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <SectionHeader title="Pengaturan" />
          <MenuItem icon={<Bell className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Notifikasi" subtitle="Atur preferensi notifikasi" href="/settings?tab=notifications" />
          <Divider />
          <MenuItem icon={<LockKey className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Keamanan" subtitle="Password, 2FA, dan sesi aktif" href="/settings?tab=security" />
          <Divider />
          <MenuItem icon={<Globe className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Bahasa" subtitle="Bahasa Indonesia" href="/settings?tab=profile" />
          <Divider />
          <MenuItem icon={<MoonStars className="w-6 h-6 text-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />} label="Tampilan" subtitle="Mode terang / gelap" href="/settings?tab=profile" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="pt-2 pb-4">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link href="/terms" className="text-sm text-neutral-600 hover:text-foreground transition-colors">Syarat & Ketentuan</Link>
            <span className="text-neutral-200">|</span>
            <Link href="/privacy" className="text-sm text-neutral-600 hover:text-foreground transition-colors">Kebijakan Privasi</Link>
          </div>

          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3.5 mx-auto max-w-xs bg-white border border-neutral-200 rounded-xl text-red-600 font-medium hover:bg-red-50 hover:border-red-200 transition-colors">
            <SignOut className="w-5 h-5" aria-hidden="true" weight="regular" aria-hidden="true" />
            <span>Keluar</span>
          </button>

          <div className="text-center text-xs text-neutral-500 mt-6">Kahade v1.0.0</div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

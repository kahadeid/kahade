import { SkipToContent } from '@/lib/accessibility';
/**
 * KAHADE SETTINGS PAGE - Professional Responsive Design
 * 
 * Design Philosophy:
 * - Mobile: Full-width cards with collapsible sections
 * - Tablet/Desktop: Sidebar navigation with content area
 * - Consistent visual hierarchy across all breakpoints
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Bell, ShieldCheck, DeviceMobile, Eye, EyeSlash, Spinner, SignOut,
  Key, Trash, DownloadSimple, Warning, Check, X,
  Envelope, Receipt, CaretRight, DeviceTablet, Laptop, Clock, Shield,
  CheckCircle, Info
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { userApi, authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { UnderlineTabsSimple } from '@/components/ui/underline-tabs';

interface Session {
  id: string;
  userAgent: string;
  ipAddress: string;
  location?: string;
  lastActiveAt: string;
  isCurrent: boolean;
  device?: string;
}

const checkPasswordStrength = (password: string): { score: number; feedback: string[]; passed: string[] } => {
  const feedback: string[] = [];
  const passed: string[] = [];
  let score = 0;

  if (password.length >= 8) { score += 1; passed.push('8+ characters'); } else { feedback.push('8+ characters'); }
  if (/[A-Z]/.test(password)) { score += 1; passed.push('Uppercase'); } else { feedback.push('Uppercase'); }
  if (/[a-z]/.test(password)) { score += 1; passed.push('Lowercase'); } else { feedback.push('Lowercase'); }
  if (/[0-9]/.test(password)) { score += 1; passed.push('Number'); } else { feedback.push('Number'); }
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) { score += 1; passed.push('Special char'); } else { feedback.push('Special char'); }

  return { score, feedback, passed };
};

const tabs = [
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'sessions', label: 'Sessions', icon: DeviceMobile },
  { id: 'privacy', label: 'Privacy', icon: Lock },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('security');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    transaction: true,
    marketing: false,
  });
  
  const [twoFactor, setTwoFactor] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);

  const passwordStrength = checkPasswordStrength(passwordForm.newPassword);

  useEffect(() => {
    fetchSessions();
    if (user?.mfaEnabled) {
      setTwoFactor(true);
    }
    calculateSecurityScore();
  }, [user]);

  const calculateSecurityScore = () => {
    let score = 40;
    if (user?.mfaEnabled) score += 30;
    if (user?.kycStatus === 'VERIFIED') score += 20;
    if (user?.phone) score += 10;
    setSecurityScore(Math.min(score, 100));
  };

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await authApi.getSessions();
      const sessionsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.sessions || response.data.data || []);
      setSessions(sessionsData);
    } catch (error) {
      setSessions([{
        id: 'current',
        userAgent: navigator.userAgent,
        ipAddress: 'Current Device',
        lastActiveAt: new Date().toISOString(),
        isCurrent: true
      }]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (passwordStrength.score < 5) {
      toast.error('Password does not meet requirements');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await authApi.enable2FA();
      if (response.data.qrCodeDataURL) {
        setQrCode(response.data.qrCodeDataURL);
        setShow2FADialog(true);
      }
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to enable 2FA');
    }
  };

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsEnabling2FA(true);
    try {
      await authApi.verify2FA(verificationCode);
      setTwoFactor(true);
      setShow2FADialog(false);
      setVerificationCode('');
      toast.success('Two-factor authentication enabled!');
      calculateSecurityScore();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    const code = prompt('Enter 2FA code from authenticator:');
    
    if (!code) {
      toast.error('2FA code is required');
      return;
    }
    
    try {
      await authApi.disable2FA({ code });
      setTwoFactor(false);
      toast.success('Two-factor authentication disabled');
      calculateSecurityScore();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      await userApi.updateNotificationSettings(notifications);
      toast.success('Notification preferences saved');
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await authApi.revokeSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Session revoked successfully');
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await authApi.revokeAllSessions();
      toast.success('All other sessions revoked');
      fetchSessions();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to revoke sessions');
    }
  };

  const handleExportData = async () => {
    try {
      toast.info('Preparing your data export...');
      await userApi.requestDataExport();
      toast.success('Data export requested. Check your email.');
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to request data export');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      await userApi.deleteAccount(deleteConfirmText);
      toast.success('Account deleted');
      logout();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const getDeviceIcon = (userAgent: string | null | undefined) => {
    const ua = userAgent || '';
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
      return DeviceMobile;
    }
    if (ua.includes('Tablet') || ua.includes('iPad')) {
      return DeviceTablet;
    }
    return Laptop;
  };

  const parseUserAgent = (ua: string | null | undefined) => {
    const userAgent = ua || '';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Browser';
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 5) return 'Active now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  const getSecurityScoreColor = () => {
    if (securityScore >= 80) return 'text-emerald-600';
    if (securityScore >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getSecurityScoreLabel = () => {
    if (securityScore >= 80) return 'Excellent';
    if (securityScore >= 60) return 'Good';
    if (securityScore >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account">
      <div className="max-w-4xl mx-auto">
        {/* ========== TAB NAVIGATION ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <UnderlineTabsSimple
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ========== SECURITY TAB ========== */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Security Score */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-black">Security Score</h3>
                    <p className="text-sm text-neutral-600">Your account security level</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getSecurityScoreColor()}`}>{securityScore}%</div>
                    <div className={`text-sm ${getSecurityScoreColor()}`}>{getSecurityScoreLabel()}</div>
                  </div>
                </div>
                <Progress value={securityScore} className="h-2 mb-4" />
                
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-xl flex items-center gap-4 ${twoFactor ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${twoFactor ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      {twoFactor ? <Check className="w-4 aria-hidden="true" h-4 text-emerald-600" weight="bold" aria-hidden="true" /> : <Warning className="w-4 aria-hidden="true" h-4 text-amber-600" weight="fill" aria-hidden="true" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black">2FA</div>
                      <div className={`text-xs ${twoFactor ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {twoFactor ? 'Enabled' : 'Not enabled'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-xl flex items-center gap-4 ${user?.kycStatus === 'VERIFIED' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user?.kycStatus === 'VERIFIED' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      {user?.kycStatus === 'VERIFIED' ? <Check className="w-4 aria-hidden="true" h-4 text-emerald-600" weight="bold" aria-hidden="true" /> : <Warning className="w-4 aria-hidden="true" h-4 text-amber-600" weight="fill" aria-hidden="true" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black">KYC</div>
                      <div className={`text-xs ${user?.kycStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {user?.kycStatus === 'VERIFIED' ? 'Verified' : 'Not verified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-xl flex items-center gap-4 ${user?.phone ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user?.phone ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      {user?.phone ? <Check className="w-4 aria-hidden="true" h-4 text-emerald-600" weight="bold" aria-hidden="true" /> : <Info className="w-4 aria-hidden="true" h-4 text-gray-400" weight="fill" aria-hidden="true" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black">Phone</div>
                      <div className={`text-xs ${user?.phone ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {user?.phone ? 'Added' : 'Optional'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <ShieldCheck className="w-5 aria-hidden="true" h-5 text-emerald-600" weight="duotone" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Two-Factor Authentication</h3>
                      <p className="text-sm text-neutral-600">Extra security with authenticator app</p>
                    </div>
                  </div>
                  {twoFactor ? (
                    <Button variant="outline" onClick={handleDisable2FA} className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl">
                      Disable
                    </Button>
                  ) : (
                    <Button onClick={handleEnable2FA} className="bg-black text-white hover:bg-black/90 rounded-xl">
                      Enable
                    </Button>
                  )}
                </div>
                
                {twoFactor && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle className="w-5 aria-hidden="true" h-5" weight="fill" aria-hidden="true" />
                      <span className="font-medium text-sm">Two-factor authentication is active</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Key className="w-5 aria-hidden="true" h-5 text-black" weight="duotone" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Change Password</h3>
                    <p className="text-sm text-neutral-600">Update your password regularly</p>
                  </div>
                </div>
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="pr-10 h-11 rounded-xl border-neutral-200"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
                      >
                        {showCurrentPassword ? <EyeSlash className="w-5 aria-hidden="true" h-5" /> : <Eye className="w-5 aria-hidden="true" h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">New Password</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="pr-10 h-11 rounded-xl border-neutral-200"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
                        >
                          {showNewPassword ? <EyeSlash className="w-5 aria-hidden="true" h-5" /> : <Eye className="w-5 aria-hidden="true" h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Confirm Password</Label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="h-11 rounded-xl border-neutral-200"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  {passwordForm.newPassword && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              level <= passwordStrength.score 
                                ? passwordStrength.score <= 2 ? 'bg-red-500' : passwordStrength.score <= 4 ? 'bg-amber-500' : 'bg-emerald-500'
                                : 'bg-neutral-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {passwordStrength.passed.map((item) => (
                          <Badge key={item} className="bg-emerald-50 text-emerald-600 border-0 text-xs">{item}</Badge>
                        ))}
                        {passwordStrength.feedback.map((item) => (
                          <Badge key={item} className="bg-neutral-100 text-neutral-600 border-0 text-xs">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isChangingPassword}
                    className="bg-black text-white hover:bg-black/90 rounded-xl h-11"
                  >
                    {isChangingPassword ? <Spinner className="w-4 aria-hidden="true" h-4 animate-spin mr-2" /> : null}
                    Update Password
                  </Button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ========== NOTIFICATIONS TAB ========== */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <div className="p-5 md:p-6 border-b border-neutral-200">
                  <h3 className="font-semibold text-black">Notification Preferences</h3>
                  <p className="text-sm text-neutral-600">Choose how you want to be notified</p>
                </div>
                
                <div className="divide-y divide-neutral-200">
                  <div className="flex items-center justify-between p-4 md:px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Envelope className="w-5 aria-hidden="true" h-5 text-blue-600" weight="duotone" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="font-medium text-black text-sm">Email Notifications</div>
                        <div className="text-xs text-neutral-600">Receive updates via email</div>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 md:px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <Bell className="w-5 aria-hidden="true" h-5 text-purple-600" weight="duotone" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="font-medium text-black text-sm">Push Notifications</div>
                        <div className="text-xs text-neutral-600">Receive push notifications</div>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 md:px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Receipt className="w-5 aria-hidden="true" h-5 text-emerald-600" weight="duotone" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="font-medium text-black text-sm">Transaction Updates</div>
                        <div className="text-xs text-neutral-600">Get notified about order status</div>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.transaction}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, transaction: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 md:px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Info className="w-5 aria-hidden="true" h-5 text-amber-600" weight="duotone" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="font-medium text-black text-sm">Marketing & Promotions</div>
                        <div className="text-xs text-neutral-600">Receive offers and updates</div>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                    />
                  </div>
                </div>
                
                <div className="p-5 md:p-6 bg-neutral-50">
                  <Button 
                    onClick={handleSaveNotifications}
                    disabled={isSavingNotifications}
                    className="bg-black text-white hover:bg-black/90 rounded-xl h-11 w-full sm:w-auto"
                  >
                    {isSavingNotifications ? <Spinner className="w-4 aria-hidden="true" h-4 animate-spin mr-2" /> : null}
                    Save Preferences
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========== SESSIONS TAB ========== */}
          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-200">
                  <div>
                    <h3 className="font-semibold text-black">Active Sessions</h3>
                    <p className="text-sm text-neutral-600">Manage your logged-in devices</p>
                  </div>
                  {sessions.length > 1 && (
                    <Button 
                      variant="outline" 
                      onClick={handleRevokeAllSessions}
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm"
                    >
                      <SignOut className="w-4 aria-hidden="true" h-4 mr-1" />
                      Sign Out All
                    </Button>
                  )}
                </div>
                
                {isLoadingSessions ? (
                  <div className="p-12 text-center">
                    <Spinner className="w-8 aria-hidden="true" h-8 animate-spin text-black mx-auto mb-3" />
                    <p className="text-sm text-neutral-600">Loading sessions...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200">
                    {sessions.map((session) => {
                      const DeviceIcon = getDeviceIcon(session.userAgent);
                      return (
                        <div key={session.id} className="flex items-center justify-between p-4 md:px-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.isCurrent ? 'bg-emerald-50' : 'bg-neutral-100'}`}>
                              <DeviceIcon className={`w-5 h-5 ${session.isCurrent ? 'text-emerald-600' : 'text-neutral-600'}`} weight="duotone" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-black text-sm">{parseUserAgent(session.userAgent)}</span>
                                {session.isCurrent && (
                                  <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[10px]">Current</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-neutral-600">
                                <span>{session.ipAddress}</span>
                                <span>•</span>
                                <span>{formatLastActive(session.lastActiveAt)}</span>
                              </div>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRevokeSession(session.id)}
                              className="text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" weight="bold" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ========== PRIVACY TAB ========== */}
          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Export Data */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                      <DownloadSimple className="w-5 aria-hidden="true" h-5 text-blue-600" weight="duotone" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Export Your Data</h3>
                      <p className="text-sm text-neutral-600">Download a copy of your data</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    className="border-neutral-200 rounded-xl"
                  >
                    <DownloadSimple className="w-4 aria-hidden="true" h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Delete Account */}
              <div className="bg-white rounded-2xl border border-red-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                      <Trash className="w-5 aria-hidden="true" h-5 text-red-600" weight="duotone" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-600">Delete Account</h3>
                      <p className="text-sm text-neutral-600">Permanently delete your account and data</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setShowDeleteDialog(true)}
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2FA Dialog */}
        <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan the QR code with your authenticator app, then enter the verification code.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {qrCode && (
                <div className="flex justify-center p-4 bg-white rounded-xl border border-neutral-200">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-11 rounded-xl text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShow2FADialog(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button 
                onClick={handleVerify2FA} 
                disabled={isEnabling2FA || verificationCode.length !== 6}
                className="bg-black text-white hover:bg-black/90 rounded-xl"
              >
                {isEnabling2FA ? <Spinner className="w-4 aria-hidden="true" h-4 animate-spin mr-2" /> : null}
                Verify & Enable
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Account</DialogTitle>
              <DialogDescription>
                This action cannot be undone. All your data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <Warning className="w-5 aria-hidden="true" h-5" weight="fill" aria-hidden="true" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  This will delete all your transactions, wallet balance, and account data permanently.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Type DELETE to confirm</Label>
                <Input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
              >
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

import { SkipToContent } from '@/lib/accessibility';
/**
 * KAHADE BANK ACCOUNTS PAGE - Professional Responsive Design
 * 
 * Design Philosophy:
 * - Mobile: Card-based layout with swipe actions
 * - Tablet/Desktop: Grid layout with detailed cards
 * - Consistent visual hierarchy across all breakpoints
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bank, Plus, Trash, CheckCircle, Warning, Spinner,
  Star, ShieldCheck, X, CaretRight, Check
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { bankAccountApi } from '@/lib/api';

interface BankAccount {
  id: string;
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountNumberLast4: string;
  accountHolderName?: string;
  isActive: boolean;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

interface BankInfo {
  code: string;
  name: string;
  logo?: string;
}

const bankColors: Record<string, { bg: string; text: string }> = {
  BCA: { bg: 'bg-blue-600', text: 'text-white' },
  BNI: { bg: 'bg-orange-500', text: 'text-white' },
  BRI: { bg: 'bg-blue-800', text: 'text-white' },
  MANDIRI: { bg: 'bg-blue-900', text: 'text-yellow-400' },
  CIMB: { bg: 'bg-red-600', text: 'text-white' },
  PERMATA: { bg: 'bg-green-600', text: 'text-white' },
  DANAMON: { bg: 'bg-red-700', text: 'text-white' },
  BSI: { bg: 'bg-emerald-600', text: 'text-white' },
  BTN: { bg: 'bg-blue-500', text: 'text-white' },
  MEGA: { bg: 'bg-blue-700', text: 'text-white' },
};

const getBankCode = (bankName: string): string => {
  const codeMap: Record<string, string> = {
    'Bank Central Asia': 'BCA',
    'Bank Negara Indonesia': 'BNI',
    'Bank Rakyat Indonesia': 'BRI',
    'Bank Mandiri': 'MANDIRI',
    'CIMB Niaga': 'CIMB',
    'Bank Permata': 'PERMATA',
    'Bank Danamon': 'DANAMON',
    'Bank Syariah Indonesia': 'BSI',
    'Bank Tabungan Negara': 'BTN',
    'Bank Mega': 'MEGA',
  };
  return codeMap[bankName] || 'BANK';
};

export default function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [formData, setFormData] = useState({
    bankCode: '',
    accountNumber: '',
    accountHolderName: '',
  });

  const [formErrors, setFormErrors] = useState({
    bankCode: '',
    accountNumber: '',
    accountHolderName: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, banksRes] = await Promise.all([
        bankAccountApi.list(),
        bankAccountApi.getSupportedBanks(),
      ]);
      // Safely extract accounts array
      const accData = accountsRes?.data;
      let accList: BankAccount[] = [];
      if (accData) {
        if (Array.isArray(accData.accounts)) accList = accData.accounts;
        else if (Array.isArray(accData.data)) accList = accData.data;
        else if (Array.isArray(accData)) accList = accData;
      }
      setAccounts(accList);
      
      // Safely extract banks array
      const bankData = banksRes?.data;
      let bankList: BankInfo[] = [];
      if (bankData) {
        if (Array.isArray(bankData.banks)) bankList = bankData.banks;
        else if (Array.isArray(bankData.data)) bankList = bankData.data;
        else if (Array.isArray(bankData)) bankList = bankData;
      }
      setBanks(bankList);
    } catch (error: unknown) {
      if (error?.response?.status !== 401) {
        toast.error('Failed to load bank accounts');
      }
      setAccounts([]);
      setBanks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      bankCode: '',
      accountNumber: '',
      accountHolderName: '',
    };
    let isValid = true;

    if (!formData.bankCode) {
      errors.bankCode = 'Pilih bank terlebih dahulu';
      isValid = false;
    }

    if (!formData.accountNumber) {
      errors.accountNumber = 'Nomor rekening wajib diisi';
      isValid = false;
    } else if (!/^\d{10,16}$/.test(formData.accountNumber)) {
      errors.accountNumber = 'Nomor rekening harus 10-16 digit';
      isValid = false;
    }

    if (!formData.accountHolderName) {
      errors.accountHolderName = 'Nama pemilik rekening wajib diisi';
      isValid = false;
    } else if (formData.accountHolderName.length < 2) {
      errors.accountHolderName = 'Nama minimal 2 karakter';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddAccount = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await bankAccountApi.create({
        bankCode: formData.bankCode,
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName.trim(),
      });
      toast.success('Rekening bank berhasil ditambahkan');
      setIsAddOpen(false);
      setFormData({ bankCode: '', accountNumber: '', accountHolderName: '' });
      setFormErrors({ bankCode: '', accountNumber: '', accountHolderName: '' });
      fetchData();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan rekening bank');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await bankAccountApi.setDefault(id);
      toast.success('Rekening utama berhasil diperbarui');
      fetchData();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Gagal menjadikan rekening utama');
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;

    setIsSubmitting(true);
    try {
      await bankAccountApi.delete(selectedAccount.id);
      toast.success('Rekening bank berhasil dihapus');
      setIsDeleteOpen(false);
      setSelectedAccount(null);
      fetchData();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Gagal menghapus rekening bank');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAccount = async (id: string) => {
    setIsVerifying(true);
    try {
      const response = await bankAccountApi.verify(id);
      toast.success(response.data.message || 'Permintaan verifikasi dikirim');
      fetchData();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Gagal meminta verifikasi');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Rekening Bank" subtitle="Memuat...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner className="w-1 aria-hidden="true"0 h-10 animate-spin text-black mx-auto mb-4" weight="bold" aria-hidden="true" />
            <p className="text-neutral-600">Memuat rekening bank...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Rekening Bank" subtitle="Kelola rekening penarikan">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ========== HEADER ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
              <Bank className="w-6 aria-hidden="true" h-6 text-white" weight="duotone" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-semibold text-black">{(Array.isArray(accounts) ? accounts : []).length} Rekening Bank</h2>
              <p className="text-sm text-neutral-600">Untuk penarikan dan pembayaran</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddOpen(true)}
            className="bg-black text-white hover:bg-black/90 rounded-xl h-11"
          >
            <Plus className="w-4 aria-hidden="true" h-4 mr-2" weight="bold" aria-hidden="true" />
            Tambah Rekening
          </Button>
        </motion.div>

        {/* ========== ACCOUNTS LIST ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {(Array.isArray(accounts) ? accounts : []).length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Bank className="w-8 aria-hidden="true" h-8 text-neutral-500" weight="regular" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-black mb-1">Belum Ada Rekening Bank</h3>
              <p className="text-sm text-neutral-600 max-w-sm mx-auto mb-4">
                Tambahkan rekening bank untuk menarik dana. Kami mendukung semua bank besar di Indonesia.
              </p>
              <Button 
                onClick={() => setIsAddOpen(true)}
                className="bg-black text-white hover:bg-black/90 rounded-xl h-11"
              >
                <Plus className="w-4 aria-hidden="true" h-4 mr-2" weight="bold" aria-hidden="true" />
                Tambah Rekening Bank
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              {(Array.isArray(accounts) ? accounts : []).map((account, index) => {
                const bankCode = account.bankCode || getBankCode(account.bankName);
                const colors = bankColors[bankCode] || { bg: 'bg-gray-600', text: 'text-white' };
                
                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Bank Logo */}
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                        <span className={`text-sm font-bold ${colors.text}`}>{bankCode.slice(0, 3)}</span>
                      </div>
                      
                      {/* Account Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-black">{account.bankName}</span>
                          {account.isDefault && (
                            <Badge className="bg-black text-white border-0 text-[10px]">Utama</Badge>
                          )}
                          {account.isVerified ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[10px]">
                              <CheckCircle className="w-3 aria-hidden="true" h-3 mr-0.5" weight="fill" aria-hidden="true" />
                              Terverifikasi
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-600 border-0 text-[10px]">
                              <Warning className="w-3 aria-hidden="true" h-3 mr-0.5" weight="fill" aria-hidden="true" />
                              Belum Verifikasi
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-neutral-600">
                          •••• •••• •••• {account.accountNumberLast4 || account.accountNumber.slice(-4)}
                        </div>
                        {account.accountHolderName && (
                          <div className="text-xs text-neutral-500 mt-0.5">{account.accountHolderName}</div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!account.isVerified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyAccount(account.id)}
                            disabled={isVerifying}
                            className="border-neutral-200 rounded-lg h-8 text-xs"
                          >
                            {isVerifying ? <Spinner className="w-3 aria-hidden="true" h-3 animate-spin" /> : 'Verifikasi'}
                          </Button>
                        )}
                        {!account.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(account.id)}
                            className="border-neutral-200 rounded-lg h-8 text-xs"
                          >
                            <Star className="w-3 aria-hidden="true" h-3 mr-1" weight="bold" aria-hidden="true" />
                            Jadikan Utama
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account);
                            setIsDeleteOpen(true);
                          }}
                          className="text-red-600 hover:bg-red-50 rounded-lg h-8 w-8 p-0"
                        >
                          <Trash className="w-4 aria-hidden="true" h-4" weight="bold" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>

        {/* ========== INFO CARD ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-50 rounded-2xl p-4 md:p-6 border border-neutral-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 aria-hidden="true" h-5 text-emerald-600" weight="duotone" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-black mb-1">Penarikan Aman</h3>
              <p className="text-sm text-neutral-600">
                Informasi rekening bank Anda dienkripsi dan disimpan dengan aman. Kami memverifikasi semua rekening agar dana terkirim dengan aman.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========== ADD ACCOUNT DIALOG ========== */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Rekening Bank</DialogTitle>
            <DialogDescription>
              Tambahkan rekening bank untuk penarikan. Pastikan nama rekening sesuai dengan data terdaftar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bank</Label>
              <Select value={formData.bankCode} onValueChange={(v) => setFormData({ ...formData, bankCode: v })}>
                <SelectTrigger className="h-11 rounded-xl border-neutral-200">
                  <SelectValue placeholder="Pilih bank" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(banks) ? banks : []).map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.bankCode && (
                <p className="text-xs text-red-600">{formErrors.bankCode}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nomor Rekening</Label>
              <Input
                type="text"
                placeholder="Masukkan nomor rekening"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                className="h-11 rounded-xl border-neutral-200"
                maxLength={16}
              />
              {formErrors.accountNumber && (
                <p className="text-xs text-red-600">{formErrors.accountNumber}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nama Pemilik Rekening</Label>
              <Input
                type="text"
                placeholder="Masukkan nama pemilik rekening"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value.toUpperCase() })}
                className="h-11 rounded-xl border-neutral-200 uppercase"
              />
              {formErrors.accountHolderName && (
                <p className="text-xs text-red-600">{formErrors.accountHolderName}</p>
              )}
              <p className="text-xs text-neutral-600">Harus sesuai dengan nama di rekening bank</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
              Batal
            </Button>
            <Button 
              onClick={handleAddAccount}
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-black/90 rounded-xl"
            >
              {isSubmitting ? <Spinner className="w-4 aria-hidden="true" h-4 animate-spin mr-2" /> : null}
              Tambah Rekening
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== DELETE CONFIRMATION DIALOG ========== */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Hapus Rekening Bank</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus rekening ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAccount && (
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="font-medium text-black">{selectedAccount.bankName}</div>
              <div className="text-sm text-neutral-600">
                •••• •••• •••• {selectedAccount.accountNumberLast4 || selectedAccount.accountNumber.slice(-4)}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">
              Batal
            </Button>
            <Button 
              onClick={handleDeleteAccount}
              disabled={isSubmitting}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
            >
              {isSubmitting ? <Spinner className="w-4 aria-hidden="true" h-4 animate-spin mr-2" /> : null}
              Hapus Rekening
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

#!/bin/bash

# ============================================================
# KAHADE FIX-AUTH.SH
# Memperbaiki integrasi auth frontend (Register + OTP)
# ============================================================

set -e

FRONTEND_DIR="/var/www/kahade/frontend"

echo "=================================================="
echo " KAHADE FIX AUTH - Starting..."
echo "=================================================="

# ----- 1. Backup file lama -----
echo "[1/4] Backup file lama..."
cp "$FRONTEND_DIR/src/pages/auth/Register.tsx" "$FRONTEND_DIR/src/pages/auth/Register.tsx.bak" 2>/dev/null || true
cp "$FRONTEND_DIR/vite.config.ts" "$FRONTEND_DIR/vite.config.ts.bak" 2>/dev/null || true
echo "      ✓ Backup selesai"

# ----- 2. Fix vite.config.ts proxy port (3001 → 3000) -----
echo "[2/4] Fix vite proxy port..."
sed -i "s|target: 'http://localhost:3001'|target: 'http://localhost:3000'|g" "$FRONTEND_DIR/vite.config.ts"
echo "      ✓ Proxy port diperbaiki → 3000"

# ----- 3. Fix Register.tsx -----
echo "[3/4] Menulis ulang Register.tsx dengan integrasi API..."

cat > "$FRONTEND_DIR/src/pages/auth/Register.tsx" << 'REGISTER_EOF'
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeSlash, GoogleLogo, ArrowLeft, ArrowRight,
  Check, ShieldCheck, Star, Lightning, Clock, Spinner
} from '@phosphor-icons/react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';

const steps = ['Info Dasar', 'Kontak', 'Preferensi', 'Verifikasi'];
const preferences = ['Membeli dari marketplace', 'Menjual produk', 'Jasa freelance', 'Keperluan bisnis'];

interface StepContentProps {
  step: number;
  data: Record<string, any>;
  onChange: (key: string, val: any) => void;
  otpRef: React.RefObject<(HTMLInputElement | null)[]>;
}

function StepContent({ step, data, onChange, otpRef }: StepContentProps) {
  const [showPwd, setShowPwd] = useState(false);

  if (step === 0) return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Nama Lengkap</label>
        <input type="text" placeholder="Ahmad Rizki" value={data.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Username</label>
        <input type="text" placeholder="ahmadrizki" value={data.username || ''} onChange={e => onChange('username', e.target.value)}
          className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Email</label>
        <input type="email" placeholder="email@contoh.com" value={data.email || ''} onChange={e => onChange('email', e.target.value)}
          className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Password</label>
        <div className="relative">
          <input type={showPwd ? 'text' : 'password'} placeholder="Min. 8 karakter" value={data.password || ''} onChange={e => onChange('password', e.target.value)}
            className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPwd ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Nomor HP</label>
        <input type="tel" placeholder="+62 812-XXXX-XXXX" value={data.phone || ''} onChange={e => onChange('phone', e.target.value)}
          className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Kota</label>
        <input type="text" placeholder="Jakarta" value={data.city || ''} onChange={e => onChange('city', e.target.value)}
          className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm" />
      </div>
    </div>
  );

  if (step === 2) return (
    <div className="space-y-3">
      <p className="text-sm font-semibold mb-4">Saya akan menggunakan Kahade untuk:</p>
      {preferences.map(opt => {
        const selected = (data.prefs || []).includes(opt);
        return (
          <label key={opt} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 border-border hover:border-primary/50 transition-colors">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selected ? 'bg-primary border-primary' : 'border-border'}`}>
              {selected && <Check size={12} className="text-primary-foreground" weight="bold" />}
            </div>
            <span className="text-sm">{opt}</span>
            <input type="checkbox" className="sr-only" checked={selected} onChange={() => {
              const curr = data.prefs || [];
              onChange('prefs', selected ? curr.filter((p: string) => p !== opt) : [...curr, opt]);
            }} />
          </label>
        );
      })}
    </div>
  );

  if (step === 3) return (
    <div className="text-center space-y-6">
      <div>
        <p className="font-semibold mb-2">Verifikasi Email</p>
        <p className="text-sm text-muted-foreground">
          Masukkan kode 6 digit yang dikirim ke <strong>{data.email || 'email Anda'}</strong>
        </p>
      </div>
      <div className="flex justify-center gap-2">
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            maxLength={1}
            ref={el => { if (otpRef.current) otpRef.current[i] = el; }}
            className="w-11 h-14 rounded-xl border-2 border-border text-center text-xl font-bold focus:outline-none focus:border-foreground transition-colors bg-background"
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '');
              e.target.value = val;
              // Update otp state
              if (otpRef.current) {
                const otp = otpRef.current.map(inp => inp?.value || '').join('');
                onChange('otp', otp);
              }
              // Auto-focus next
              if (val && otpRef.current?.[i + 1]) {
                otpRef.current[i + 1]?.focus();
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && otpRef.current?.[i - 1]) {
                otpRef.current[i - 1]?.focus();
              }
            }}
            onPaste={e => {
              e.preventDefault();
              const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
              paste.split('').forEach((char, idx) => {
                if (otpRef.current?.[idx]) {
                  otpRef.current[idx]!.value = char;
                }
              });
              const otp = paste.padEnd(6, '').slice(0, 6);
              onChange('otp', otp);
              otpRef.current?.[Math.min(paste.length, 5)]?.focus();
            }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Tidak menerima kode?{' '}
        <button
          type="button"
          className="text-foreground font-semibold hover:underline"
          onClick={async () => {
            try {
              await authApi.resendVerification();
              alert('Kode OTP telah dikirim ulang ke email Anda');
            } catch {
              alert('Gagal mengirim ulang kode. Coba beberapa saat lagi.');
            }
          }}
        >
          Kirim ulang
        </button>
      </p>
    </div>
  );

  return null;
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRef = useRef<(HTMLInputElement | null)[]>([]);
  const { register } = useAuth();
  const [, navigate] = useLocation();

  const updateData = (key: string, val: any) => setData(prev => ({ ...prev, [key]: val }));

  const validateStep = (): string | null => {
    if (currentStep === 0) {
      if (!data.name?.trim()) return 'Nama lengkap wajib diisi';
      if (!data.username?.trim()) return 'Username wajib diisi';
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) return 'Username hanya boleh huruf, angka, dan _ (3-20 karakter)';
      if (!data.email?.trim()) return 'Email wajib diisi';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Format email tidak valid';
      if (!data.password?.trim()) return 'Password wajib diisi';
      if (data.password.length < 8) return 'Password minimal 8 karakter';
    }
    if (currentStep === 3) {
      const otp = data.otp || '';
      if (otp.length < 6) return 'Masukkan 6 digit kode OTP';
    }
    return null;
  };

  const handleNext = async () => {
    setError(null);
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Step 2 → 3: Lakukan registrasi ke backend, lalu tampilkan form OTP
    if (currentStep === 2) {
      setIsLoading(true);
      try {
        await register({
          email: data.email,
          username: data.username,
          password: data.password,
          phone: data.phone || undefined,
        });
        // Registrasi berhasil, lanjut ke step verifikasi OTP
        setCurrentStep(3);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Gagal mendaftar';
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Step 3 (terakhir): Verifikasi OTP
    if (currentStep === 3) {
      setIsLoading(true);
      try {
        await authApi.verifyEmail(data.otp);
        // Berhasil verifikasi, redirect ke dashboard
        navigate('/dashboard');
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Kode OTP tidak valid';
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Step lainnya: lanjut ke step berikutnya
    setCurrentStep(s => s + 1);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[0.45fr_0.55fr] overflow-x-hidden">
      {/* LEFT — Form */}
      <div className="bg-background px-5 md:px-14 py-12 flex flex-col justify-center overflow-x-hidden">
        <div className="max-w-sm mx-auto w-full">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors">
              <ArrowLeft size={16} /> kahade.id
            </button>
          </Link>

          <h1 className="text-3xl font-bold mb-1">Buat Akun</h1>
          <h1 className="text-3xl font-bold text-muted-foreground mb-8">Gratis</h1>

          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-8">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < currentStep ? 'bg-green-600 text-white' : i === currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i < currentStep ? <Check size={12} weight="bold" /> : i + 1}
                  </div>
                  <span className="hidden sm:block">{step}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-[2px] rounded-full transition-colors duration-500 mx-1 ${i < currentStep ? 'bg-green-600' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <StepContent step={currentStep} data={data} onChange={updateData} otpRef={otpRef} />
            </motion.div>
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className={`flex gap-3 mt-6 ${currentStep > 0 ? 'flex-row' : 'flex-col'}`}>
            {currentStep > 0 && currentStep < 3 && (
              <button onClick={() => { setError(null); setCurrentStep(s => s - 1); }} className="btn-secondary flex-1" disabled={isLoading}>
                <ArrowLeft size={16} /> Kembali
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="btn-primary flex-1 w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Spinner size={16} className="animate-spin" /> Memproses...</>
              ) : currentStep === steps.length - 1 ? (
                <><Check size={16} /> Selesai Daftar</>
              ) : currentStep === 2 ? (
                <><ArrowRight size={16} /> Daftar Sekarang</>
              ) : (
                <>Lanjut <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          {currentStep === 0 && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">Atau</span><div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-border rounded-xl text-sm font-semibold hover:bg-muted transition-all">
                  <GoogleLogo size={20} /> Lanjutkan dengan Google
                </button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-5">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">Masuk</Link>
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden md:flex bg-primary text-primary-foreground flex-col justify-center px-14 py-12">
        <div className="max-w-md">
          <div className="text-3xl font-black mb-2">KAHADE</div>
          <p className="text-primary-foreground/60 text-sm mb-12">Platform Escrow Terpercaya Indonesia</p>
          <blockquote className="text-xl font-semibold leading-relaxed mb-8">
            "Daftar gratis dan mulai transaksi aman dalam 5 menit."
          </blockquote>
          <div className="flex items-center gap-4 mb-12 pb-12 border-b border-white/10">
            <div className="flex -space-x-2">
              {['A','B','C','D','E'].map((l, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-xs font-bold">{l}</div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} weight="fill" className="text-yellow-400" />)}
              </div>
              <p className="text-xs text-primary-foreground/60">4.9/5 · 10.000+ pengguna</p>
            </div>
          </div>
          <div className="space-y-4">
            {[{ icon: ShieldCheck, text: 'Verifikasi identitas aman' }, { icon: Lightning, text: 'Setup dalam 5 menit' }, { icon: Clock, text: 'Transaksi pertama gratis' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0"><Icon size={16} /></div>
                <span className="text-sm text-primary-foreground/80">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
REGISTER_EOF

echo "      ✓ Register.tsx berhasil diperbaiki"

# ----- 4. Rebuild frontend -----
echo "[4/4] Rebuild frontend..."
cd "$FRONTEND_DIR"

if command -v pnpm &> /dev/null; then
  pnpm build
elif command -v npm &> /dev/null; then
  npm run build
else
  echo "      ⚠ pnpm/npm tidak ditemukan, skip build"
fi

echo ""
echo "=================================================="
echo " ✅ SELESAI! Perubahan yang dilakukan:"
echo "=================================================="
echo " 1. vite.config.ts → proxy port 3001 → 3000"
echo " 2. Register.tsx → Integrasi penuh dengan API:"
echo "    - Step 0: + field username (required)"
echo "    - Step 2→3: Panggil authApi.register()"
echo "    - Step 3: OTP terkumpul & authApi.verifyEmail()"
echo "    - Validasi tiap step sebelum lanjut"
echo "    - Error message ditampilkan di form"
echo "    - Loading state saat proses API"
echo "    - Kirim ulang OTP via authApi.resendVerification()"
echo " 3. Backup tersimpan di .bak"
echo "=================================================="

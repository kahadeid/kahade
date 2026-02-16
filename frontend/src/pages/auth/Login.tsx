import { SkipToContent } from '@/lib/accessibility';
/*
 * KAHADE LOGIN PAGE - Clean Mobile-First Design
 * 
 * VALIDATION FIX [FE-FORM-001]: Applied Zod validation
 * API FIX [FE-API-001]: Using custom hooks for error handling
 * 
 * Layout Order:
 * 1. Logo
 * 2. Title
 * 3. Subtitle
 * 4. Email address
 * 5. Password
 * 6. Remember me checkbox
 * 7. Sign In button
 * 8. Or continue with divider
 * 9. Social login buttons (Google, Apple, X)
 * 10. Don't have an account? Create account
 */

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ShieldCheck, Envelope, Lock, Eye, EyeSlash, Spinner,
  GoogleLogo, AppleLogo, XLogo, Warning,
  DeviceMobile, Key, ArrowLeft, Lightning, Users
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getAppMode } from '@/config/app.config';
import { cn } from '@/lib/ui-utils';
import { loginSchema, type LoginFormData } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';

// Error code to user-friendly message mapping
const getErrorMessage = (error: unknown): { title: string; description: string; action?: string } => {
  // Type guard for error with response
  const hasResponse = (err: unknown): err is { 
    response?: { 
      data?: { 
        code?: string; 
        message?: string;
        remainingMinutes?: number;
        suspendReason?: string;
      };
      status?: number;
    };
    code?: string;
    message?: string;
  } => typeof err === 'object' && err !== null;
  
  if (!hasResponse(error)) {
    return {
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.'
    };
  }

  const code = error.response?.data?.code || error.code;
  const message = error.response?.data?.message || error.message;
  const status = error.response?.status;

  switch (code) {
    case 'ACCOUNT_LOCKED':
      const remainingMinutes = error.response?.data?.remainingMinutes;
      return {
        title: 'Akun Terkunci',
        description: remainingMinutes 
          ? `Terlalu banyak percobaan login. Silakan coba lagi dalam ${remainingMinutes} menit.`
          : 'Akun Anda terkunci sementara karena terlalu banyak percobaan login yang gagal.',
        action: 'wait'
      };
    
    case 'ACCOUNT_SUSPENDED':
      const suspendReason = error.response?.data?.suspendReason;
      return {
        title: 'Akun Ditangguhkan',
        description: suspendReason 
          ? `Akun Anda ditangguhkan: ${suspendReason}. Silakan hubungi support.`
          : 'Akun Anda telah ditangguhkan. Silakan hubungi support untuk bantuan.',
        action: 'contact'
      };
    
    case 'MFA_TOKEN_REQUIRED':
      return {
        title: 'Verifikasi Diperlukan',
        description: 'Silakan masukkan kode two-factor authentication Anda untuk melanjutkan.'
      };
    
    case 'MFA_INVALID':
      return {
        title: 'Kode Tidak Valid',
        description: 'Kode autentikasi yang Anda masukkan salah. Silakan coba lagi.'
      };
    
    case 'EMAIL_NOT_VERIFIED':
      return {
        title: 'Email Belum Diverifikasi',
        description: 'Silakan verifikasi email Anda sebelum login. Cek inbox untuk link verifikasi.',
        action: 'resend'
      };
    
    default:
      break;
  }

  switch (status) {
    case 401:
      return {
        title: 'Kredensial Tidak Valid',
        description: 'Email atau password yang Anda masukkan salah. Silakan periksa dan coba lagi.'
      };
    
    case 403:
      return {
        title: 'Akses Ditolak',
        description: message || 'Anda tidak memiliki izin untuk mengakses akun ini.'
      };
    
    case 429:
      return {
        title: 'Terlalu Banyak Permintaan',
        description: 'Anda telah melakukan terlalu banyak percobaan login. Silakan tunggu beberapa menit.',
        action: 'wait'
      };
    
    case 500:
    case 502:
    case 503:
      return {
        title: 'Server Error',
        description: 'Kami mengalami kesulitan teknis. Silakan coba lagi nanti.'
      };
    
    default:
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return {
          title: 'Koneksi Error',
          description: 'Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.'
        };
      }
      
      return {
        title: 'Login Gagal',
        description: message || 'Terjadi kesalahan tak terduga. Silakan coba lagi.'
      };
  }
};

const stats = [
  { value: 'Rp 50M+', label: 'Total Secured' },
  { value: '10K+', label: 'Active Users' },
  { value: '99.9%', label: 'Success Rate' }
];

const features = [
  { icon: ShieldCheck, text: 'Bank-level security' },
  { icon: Lightning, text: 'Instant transactions' },
  { icon: Users, text: 'Trusted by thousands' },
];

export default function Login() {
  const { login, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const appMode = getAppMode();
  const isAdminMode = appMode === 'admin';
  const [showPassword, setShowPassword] = useState(false);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [mfaCode, setMfaCode] = useState('');

  // VALIDATION FIX [FE-FORM-001]: Use react-hook-form with Zod validation
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    logger.debug('Login attempt', { email: data.email });
    
    try {
      await login(data.email, data.password);
      toast.success('Selamat datang!', {
        description: 'Anda berhasil login.'
      });
      logger.info('Login successful', { email: data.email });
    } catch (error: unknown) {
      setLoginAttempts(prev => prev + 1);
      const { title, description, action } = getErrorMessage(error);
      
      logger.error('Login failed', error, { email: data.email, attempts: loginAttempts + 1 });
      
      if (error.response?.data?.code === 'MFA_TOKEN_REQUIRED') {
        setShowMfaInput(true);
        toast.info(title, { description });
      } else {
        toast.error(title, { description });
      }
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mfaCode.length !== 6) {
      toast.error('Kode Tidak Valid', { description: 'Silakan masukkan kode 6 digit' });
      return;
    }

    try {
      const data = watch();
      await login(data.email, data.password);
      toast.success('Selamat datang!', {
        description: 'Anda berhasil login.'
      });
      logger.info('MFA login successful');
    } catch (error: unknown) {
      const { title, description } = getErrorMessage(error);
      toast.error(title, { description });
      logger.error('MFA login failed', error);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login segera hadir`, {
      description: 'Social login akan tersedia di update mendatang.'
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid opacity-10" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2">
            <img 
              src="/images/logo-white.svg" 
              alt="Kahade Logo" 
              className="h-8 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/logo.svg';
                target.style.filter = 'brightness(0) invert(1)';
              }}
            />
          </Link>
          
          {/* Main Content */}
          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Amankan setiap transaksi dengan percaya diri
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              Bergabunglah dengan ribuan pengguna yang mempercayai Kahade untuk transaksi online mereka. 
              Perlindungan penuh untuk pembeli dan penjual.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5" weight="bold" />
                  </div>
                  <span className="text-white/80">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-white/40 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-start px-6 py-12 lg:px-12 xl:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {!showMfaInput ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-2 mb-8">
                  <img src="/images/logo.svg" alt="Kahade Logo" className="h-10 w-auto" />
                </Link>
                
                {/* Title */}
                <h1 className="text-3xl xl:text-4xl font-bold mb-2 text-foreground">Selamat datang</h1>
                
                {/* Subtitle */}
                <p className="text-neutral-600 mb-8">
                  Masuk ke akun Anda untuk melanjutkan
                </p>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Alamat Email</Label>
                    <div className="relative">
                      <Envelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@contoh.com"
                        {...register('email')}
                        className={cn(
                          "pl-12 h-12 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-black transition-all",
                          errors.email && "border-red-500 bg-red-50"
                        )}
                        aria-invalid={errors.email ? 'true' : 'false'}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1.5">
                        <Warning className="w-4 h-4" aria-hidden="true" weight="fill" aria-hidden="true" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password Anda"
                        {...register('password')}
                        className={cn(
                          "pl-12 pr-12 h-12 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-black transition-all",
                          errors.password && "border-red-500 bg-red-50"
                        )}
                        aria-invalid={errors.password ? 'true' : 'false'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      >
                        {showPassword ? <EyeSlash className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 flex items-center gap-1.5">
                        <Warning className="w-4 h-4" aria-hidden="true" weight="fill" aria-hidden="true" />
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setValue('rememberMe', !rememberMe)}
                        className={cn(
                          "w-5 h-5 !min-h-5 !min-w-5 rounded border-2 flex items-center justify-center transition-all shrink-0",
                          rememberMe 
                            ? "bg-black border-black" 
                            : "bg-white border-neutral-300 hover:border-neutral-400"
                        )}
                        aria-label="Ingat saya"
                        aria-checked={rememberMe}
                        role="checkbox"
                      >
                        {rememberMe && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <label 
                        onClick={() => setValue('rememberMe', !rememberMe)}
                        className="text-sm text-neutral-600 cursor-pointer select-none leading-none"
                      >
                        Ingat saya
                      </label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-neutral-600 hover:text-foreground transition-colors leading-none flex items-center"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  
                  {/* Sign In Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-semibold"
                    disabled={isLoading || isSubmitting}
                  >
                    {isLoading || isSubmitting ? (
                      <>
                        <Spinner className="w-5 h-5 animate-spin mr-2" aria-hidden="true" />
                        Masuk...
                      </>
                    ) : (
                      'Masuk'
                    )}
                  </Button>
                </form>
                
                {!isAdminMode && (
                  <>
                    {/* Or continue with divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-neutral-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-muted-foreground">Atau lanjutkan dengan</span>
                      </div>
                    </div>
                    
                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        type="button"
                        className="h-12 border-2 border-neutral-200 rounded-xl flex items-center justify-center hover:border-black hover:bg-neutral-100 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        onClick={() => handleSocialLogin('Google')}
                        aria-label="Login dengan Google"
                      >
                        <GoogleLogo className="w-5 h-5" aria-hidden="true" weight="bold" aria-hidden="true" />
                      </button>
                      <button 
                        type="button"
                        className="h-12 border-2 border-neutral-200 rounded-xl flex items-center justify-center hover:border-black hover:bg-neutral-100 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        onClick={() => handleSocialLogin('Apple')}
                        aria-label="Login dengan Apple"
                      >
                        <AppleLogo className="w-5 h-5" aria-hidden="true" weight="fill" aria-hidden="true" />
                      </button>
                      <button 
                        type="button"
                        className="h-12 border-2 border-neutral-200 rounded-xl flex items-center justify-center hover:border-black hover:bg-neutral-100 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        onClick={() => handleSocialLogin('X')}
                        aria-label="Login dengan X"
                      >
                        <XLogo className="w-5 h-5" aria-hidden="true" weight="fill" aria-hidden="true" />
                      </button>
                    </div>
                    
                    {/* Create Account Link */}
                    <p className="mt-8 text-center text-neutral-600">
                      Belum punya akun?{' '}
                      <Link href="/register" className="font-semibold text-foreground hover:underline">
                        Daftar sekarang
                      </Link>
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              /* MFA Form */
              <motion.div
                key="mfa-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setShowMfaInput(false)}
                  className="flex items-center gap-2 text-neutral-600 hover:text-foreground mb-8 transition-colors"
                  aria-label="Kembali ke login"
                >
                  <ArrowLeft className="w-5 h-5" aria-hidden="true" weight="bold" aria-hidden="true" />
                  Kembali ke login
                </button>
                
                <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center mb-6">
                  <DeviceMobile className="w-8 h-8 text-foreground" aria-hidden="true" weight="duotone" aria-hidden="true" />
                </div>
                
                <h1 className="text-3xl font-bold mb-3 text-foreground">Two-Factor Authentication</h1>
                <p className="text-neutral-600 mb-8">
                  Masukkan kode 6-digit dari aplikasi authenticator Anda untuk melanjutkan.
                </p>
                
                <form onSubmit={handleMfaSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="mfaCode" className="text-foreground font-medium">Kode Autentikasi</Label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="mfaCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        className="pl-12 h-12 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-black text-center text-2xl tracking-[0.5em] font-mono transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        aria-label="6-digit authentication code"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-semibold"
                    disabled={isLoading || mfaCode.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="w-5 h-5 animate-spin mr-2" aria-hidden="true" />
                        Memverifikasi...
                      </>
                    ) : (
                      'Verifikasi'
                    )}
                  </Button>
                </form>
                
                <p className="mt-8 text-center text-neutral-600">
                  Kehilangan akses ke authenticator?{' '}
                  <Link href="/support" className="font-semibold text-foreground hover:underline">
                    Hubungi support
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

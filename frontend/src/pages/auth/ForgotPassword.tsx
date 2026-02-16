import { SkipToContent } from '@/lib/accessibility';
/*
 * KAHADE FORGOT PASSWORD PAGE - Clean Mobile-First Design
 * 
 * Layout Order:
 * 1. Logo
 * 2. Title
 * 3. Subtitle
 * 4. Email input
 * 5. Send reset link button
 * 6. Back to login link
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Envelope, ArrowLeft, Spinner, CheckCircle, ShieldCheck, Lock,
  ArrowRight, Info, Clock, Warning, Lightning, Users
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/ui-utils';

const features = [
  { icon: ShieldCheck, text: 'Bank-level security' },
  { icon: Lightning, text: 'Instant transactions' },
  { icon: Users, text: 'Trusted by thousands' },
];

const stats = [
  { value: 'Rp 50M+', label: 'Total Secured' },
  { value: '10K+', label: 'Active Users' },
  { value: '99.9%', label: 'Success Rate' }
];

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError('Email address is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    
    try {
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
      setCountdown(60);
      toast.success('Reset link sent!', {
        description: 'Check your inbox for the password reset link.'
      });
    } catch (error: unknown) {
      
      if (error.response?.status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'] || 60;
        setCountdown(parseInt(retryAfter));
        toast.error('Too many requests', {
          description: `Please wait ${retryAfter} seconds before trying again.`
        });
      } else {
        // For security, always show success even if email doesn't exist
        setIsSubmitted(true);
        setCountdown(60);
        toast.success('Reset link sent!', {
          description: 'If an account exists with this email, you will receive a reset link.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    
    try {
      await authApi.forgotPassword(email);
      setCountdown(60);
      toast.success('Email resent!', {
        description: 'Please check your inbox for the reset link.'
      });
    } catch (error: unknown) {
      if (error.response?.status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'] || 60;
        setCountdown(parseInt(retryAfter));
        toast.error('Too many requests', {
          description: `Please wait ${retryAfter} seconds before trying again.`
        });
      } else {
        setCountdown(60);
        toast.success('Email resent!', {
          description: 'If an account exists with this email, you will receive a reset link.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setIsSubmitted(false);
    setEmail('');
    setCountdown(0);
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
              alt="Kahade" 
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
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
              <Lock className="w-10 h-10 text-white" aria-hidden="true" weight="duotone" aria-hidden="true" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Account Recovery
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              We take your security seriously. Password reset links expire after 1 hour for your protection.
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
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-2 mb-8">
                  <img src="/images/logo.svg" alt="Kahade" className="h-10 w-auto" />
                </Link>
                
                {/* Title */}
                <h1 className="text-3xl xl:text-4xl font-bold mb-2 text-foreground">Forgot your password?</h1>
                
                {/* Subtitle */}
                <p className="text-neutral-600 mb-8">
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email address</Label>
                    <div className="relative">
                      <Envelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) validateEmail(e.target.value);
                        }}
                        onBlur={() => validateEmail(email)}
                        placeholder="name@example.com"
                        className={cn(
                          "pl-12 h-12 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-black transition-all",
                          emailError && "border-red-500 bg-red-50"
                        )}
                      />
                    </div>
                    {emailError && (
                      <p className="text-sm text-red-500 flex items-center gap-1.5">
                        <Warning className="w-4 h-4" aria-hidden="true" weight="fill" aria-hidden="true" />
                        {emailError}
                      </p>
                    )}
                  </div>
                  
                  {/* Send Reset Link Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-semibold"
                    disabled={isLoading || countdown > 0}
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="w-5 h-5 animate-spin mr-2" aria-hidden="true" />
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      <>
                        <Clock className="w-5 h-5 mr-2" aria-hidden="true" />
                        Wait {countdown}s
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </Button>
                </form>

                {/* Security Tips */}
                <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-neutral-600 shrink-0 mt-0.5" aria-hidden="true" weight="fill" aria-hidden="true" />
                    <div className="text-sm text-neutral-600">
                      <p className="font-medium text-foreground mb-1">Security tip</p>
                      <p>Make sure you're on the official Kahade website before entering your email. We'll never ask for your password via email.</p>
                    </div>
                  </div>
                </div>
                
                {/* Back to Login */}
                <p className="mt-8 text-center text-neutral-600">
                  Remember your password?{' '}
                  <Link href="/login" className="font-semibold text-foreground hover:underline">
                    Back to login
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-2 mb-8">
                  <img src="/images/logo.svg" alt="Kahade" className="h-10 w-auto" />
                </Link>
                
                {/* Success Icon */}
                <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-600" aria-hidden="true" weight="fill" aria-hidden="true" />
                </div>
                
                {/* Title */}
                <h1 className="text-3xl xl:text-4xl font-bold mb-2 text-foreground">Check your email</h1>
                
                {/* Subtitle */}
                <p className="text-neutral-600 mb-6">
                  We've sent a password reset link to
                </p>
                
                {/* Email Display */}
                <div className="bg-secondary rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <Envelope className="w-5 h-5 text-neutral-600" aria-hidden="true" />
                    <span className="font-medium text-foreground">{email}</span>
                  </div>
                </div>

                <p className="text-sm text-neutral-600 mb-6 text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>

                <div className="space-y-3">
                  <Button 
                    onClick={handleResend}
                    variant="outline"
                    className="w-full h-12 border-2 border-neutral-200 rounded-xl font-medium"
                    disabled={isLoading || countdown > 0}
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="w-5 h-5 animate-spin mr-2" aria-hidden="true" />
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      <>
                        <Clock className="w-5 h-5 mr-2" aria-hidden="true" />
                        Resend in {countdown}s
                      </>
                    ) : (
                      'Resend email'
                    )}
                  </Button>

                  <Button 
                    onClick={handleChangeEmail}
                    variant="ghost"
                    className="w-full h-12 text-neutral-600 hover:text-foreground"
                  >
                    Try a different email
                  </Button>
                </div>

                {/* Email client shortcuts */}
                <div className="mt-8 pt-8 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600 mb-4 text-center">Open your email app</p>
                  <div className="flex justify-center gap-3">
                    <a 
                      href="https://mail.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-secondary rounded-xl text-sm font-medium text-foreground hover:bg-neutral-200 transition-colors"
                    >
                      Gmail
                    </a>
                    <a 
                      href="https://outlook.live.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-secondary rounded-xl text-sm font-medium text-foreground hover:bg-neutral-200 transition-colors"
                    >
                      Outlook
                    </a>
                    <a 
                      href="https://mail.yahoo.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-secondary rounded-xl text-sm font-medium text-foreground hover:bg-neutral-200 transition-colors"
                    >
                      Yahoo
                    </a>
                  </div>
                </div>
                
                {/* Back to Login */}
                <p className="mt-8 text-center text-neutral-600">
                  <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-foreground hover:underline">
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" weight="bold" aria-hidden="true" />
                    Back to login
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

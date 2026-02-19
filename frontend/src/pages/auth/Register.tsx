/*
 * KAHADE REGISTER PAGE - Clean Mobile-First Design
 * 
 * Layout Order:
 * 1. Logo
 * 2. Title
 * 3. Subtitle
 * 4. Form fields
 * 5. Create Account button
 * 6. Or continue with divider
 * 7. Social login buttons (Google, Apple, X)
 * 8. Already have an account? Sign in
 */

import { useState, useEffect } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Envelope, Lock, Eye, EyeSlash, ArrowRight, Spinner, User, Phone, 
  CheckCircle, WarningCircle, GoogleLogo, AppleLogo, XLogo, ArrowLeft,
  Gift, Lightning, Users, Wallet, Check, X
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/ui-utils';


/**
 * Password strength checker
 */
const checkPasswordStrength = (password: string): { score: number; feedback: string[]; passed: string[]; isValid: boolean } => {
  const feedback: string[] = [];
  const passed: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
    passed.push('At least 8 characters');
  } else {
    feedback.push('At least 8 characters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
    passed.push('Uppercase letter');
  } else {
    feedback.push('Uppercase letter');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
    passed.push('Lowercase letter');
  } else {
    feedback.push('Lowercase letter');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
    passed.push('Number');
  } else {
    feedback.push('Number');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
    passed.push('Special character');
  } else {
    feedback.push('Special character');
  }

  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  const hasCommonPassword = commonPasswords.some(p => password.toLowerCase().includes(p));
  if (hasCommonPassword) {
    feedback.push('Password is too common');
  } else if (password.length > 0) {
    passed.push('Not a common password');
  }

  const isValid = score === 5 && !hasCommonPassword;

  return { score, feedback, passed, isValid };
};

// Error code to user-friendly message mapping
const getErrorMessage = (error: unknown): { title: string; description: string } => {
  // Type guard for error with response
  const hasResponse = (err: unknown): err is { 
    response?: { 
      data?: { 
        code?: string; 
        message?: string; 
        errors?: string[] | Record<string, string[]> 
      };
      status?: number;
    } 
  } => typeof err === 'object' && err !== null && 'response' in err;
  
  if (!hasResponse(error)) {
    return {
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.'
    };
  }

  const code = error.response?.data?.code;
  const message = error.response?.data?.message;
  const errors = error.response?.data?.errors;
  const status = error.response?.status;

  if (errors && Array.isArray(errors)) {
    return {
      title: 'Validation Error',
      description: errors.join('. ')
    };
  }

  switch (code) {
    case 'WEAK_PASSWORD':
      return {
        title: 'Password Too Weak',
        description: error.response?.data?.errors?.join('. ') || 'Please choose a stronger password.'
      };
    
    case 'EMAIL_EXISTS':
    case 'DUPLICATE_EMAIL':
      return {
        title: 'Email Already Registered',
        description: 'This email is already associated with an account. Try logging in instead.'
      };
    
    case 'USERNAME_EXISTS':
    case 'DUPLICATE_USERNAME':
      return {
        title: 'Username Taken',
        description: 'This username is already in use. Please choose a different one.'
      };
    
    default:
      break;
  }

  switch (status) {
    case 400:
      return {
        title: 'Invalid Input',
        description: message || 'Please check your information and try again.'
      };
    
    case 409:
      return {
        title: 'Account Already Exists',
        description: 'An account with this email or username already exists.'
      };
    
    case 429:
      return {
        title: 'Too Many Requests',
        description: 'Please wait a few minutes before trying again.'
      };
    
    default:
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return {
          title: 'Connection Error',
          description: 'Unable to connect to the server. Please check your internet connection.'
        };
      }
      
      return {
        title: 'Registration Failed',
        description: message || 'An unexpected error occurred. Please try again.'
      };
  }
};

const benefits = [
  { icon: ShieldCheck, title: 'Secure Escrow', description: 'Funds held safely until transaction complete' },
  { icon: Lightning, title: 'Fast Transactions', description: 'Complete transactions in minutes' },
  { icon: Users, title: 'Trusted Community', description: 'Join 10,000+ verified users' },
  { icon: Wallet, title: 'Low Fees', description: 'Starting from just 2.5%' }
];

const stats = [
  { value: 'Rp 50M+', label: 'Total Secured' },
  { value: '10K+', label: 'Active Users' },
  { value: '99.9%', label: 'Success Rate' }
];

export default function Register() {
  const { register, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeTerms: false,
    agreeMarketing: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const params = new URLSearchParams(search);
    const ref = params.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }));
    }
  }, [search]);

  const passwordStrength = checkPasswordStrength(formData.password);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'username':
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 30) return 'Username must be less than 30 characters';
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) return 'Must start with letter, only letters, numbers, underscores';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (value && !/^\+?[0-9]{10,20}$/.test(value.replace(/\s/g, ''))) return 'Please enter a valid phone number';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (!passwordStrength.isValid) return 'Password does not meet all requirements';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData] as string);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value as string);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      const usernameError = validateField('username', formData.username);
      const emailError = validateField('email', formData.email);
      const phoneError = validateField('phone', formData.phone);
      
      setErrors({ username: usernameError, email: emailError, phone: phoneError });
      setTouched({ username: true, email: true, phone: true });
      
      return !usernameError && !emailError && !phoneError;
    }
    
    if (stepNum === 2) {
      const passwordError = validateField('password', formData.password);
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      
      setErrors(prev => ({ ...prev, password: passwordError, confirmPassword: confirmError }));
      setTouched(prev => ({ ...prev, password: true, confirmPassword: true }));
      
      return !passwordError && !confirmError;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error('Terms Required', {
        description: 'You must agree to the Terms & Conditions to create an account.'
      });
      return;
    }
    
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        referralCode: formData.referralCode || undefined
      });
      setRegistrationComplete(true);
    } catch (error: unknown) {
      const { title, description } = getErrorMessage(error);
      toast.error(title, { description });
    }
  };

  const handleSocialSignup = (provider: string) => {
    toast.info(`${provider} signup coming soon`, {
      description: 'Social signup will be available in a future update.'
    });
  };

  const getStrengthColor = () => {
    if (!passwordStrength.isValid) {
      if (passwordStrength.score <= 2) return 'bg-red-500';
      if (passwordStrength.score <= 3) return 'bg-orange-500';
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (!passwordStrength.isValid) {
      if (passwordStrength.score <= 2) return 'Weak';
      if (passwordStrength.score <= 3) return 'Fair';
      return 'Almost there';
    }
    return 'Strong';
  };

  // Registration Complete Screen
  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-3xl bg-green-100 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="w-12 h-12 text-green-600" weight="fill" aria-hidden="true" />
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-4 text-foreground">Welcome to Kahade!</h1>
          <p className="text-neutral-600 mb-8">
            Your account has been created successfully. Please check your email to verify your account.
          </p>
          
          <div className="space-y-3">
            <Link href="/login" className="block block">
              <Button className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-semibold">
                Continue to Login
                <ArrowRight className="ml-2 w-5 h-5" weight="bold" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/" className="block block">
              <Button variant="ghost" className="w-full text-neutral-600">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    /* AUDIT FIX #4: Ensure mobile/tablet uses column layout, desktop uses split layout */
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link href="/" className="block inline-flex items-center gap-2">
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
          
          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Start securing your transactions today
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              Create your free account and join thousands of users who trust Kahade.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <benefit.icon className="w-6 h-6 mb-2" weight="bold" />
                  <div className="font-semibold text-sm">{benefit.title}</div>
                  <div className="text-xs text-white/50">{benefit.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
          
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
      {/* AUDIT FIX #4: Ensure form column is full width on mobile/tablet */}
      <div className="w-full lg:flex-1 min-w-0 flex flex-col justify-start px-4 py-8 md:px-12 xl:px-20 bg-white overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Account Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Logo */}
                <Link href="/" className="block inline-flex items-center gap-2 mb-6 md:mb-8">
                  <img src="/images/logo.svg" alt="Kahade" className="h-8 md:h-10 w-auto" />
                </Link>
                
                {/* Title */}
                <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold mb-1 text-foreground">Create your account</h1>
                
                {/* Subtitle */}
                <p className="text-sm md:text-base text-neutral-600 mb-6 md:mb-8">
                  Enter your details to get started
                </p>
                
                {/* Progress Steps */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                        step >= s ? 'bg-black text-white' : 'bg-neutral-100 text-muted-foreground'
                      )}>
                        {step > s ? <Check className="w-4 h-4" aria-hidden="true" weight="bold" /> : s}
                      </div>
                      {s < 3 && (
                        <div className={cn(
                          "flex-1 h-1 rounded-full transition-all",
                          step > s ? 'bg-black' : 'bg-neutral-200'
                        )} />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-5">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        onBlur={() => handleBlur('username')}
                        className={cn(
                          "pl-12 h-12 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-black transition-all",
                          errors.username && touched.username && "border-red-500 bg-red-50"
                        )}
                      />
                    </div>
                    {errors.username && touched.username && (
                      <p className="text-sm text-red-500 flex items-center gap-1.5">
                        <WarningCircle className="w-4 h-4" aria-hidden="true" weight="fill" />
                        {errors.username}
                      </p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email address</Label>
                    <div className="relative">
                      <Envelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        className={cn(
                          "pl-12 h-12 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-black transition-all",
                          errors.email && touched.email && "border-red-500 bg-red-50"
                        )}
                      />
                    </div>
                    {errors.email && touched.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1.5">
                        <WarningCircle className="w-4 h-4" aria-hidden="true" weight="fill" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground font-medium">
                      Phone number <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+628123456789"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        className={cn(
                          "pl-12 h-12 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-black transition-all",
                          errors.phone && touched.phone && "border-red-500 bg-red-50"
                        )}
                      />
                    </div>
                    {errors.phone && touched.phone && (
                      <p className="text-sm text-red-500 flex items-center gap-1.5">
                        <WarningCircle className="w-4 h-4" aria-hidden="true" weight="fill" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  
                  {/* Continue Button */}
                  <Button 
                    type="button"
                    onClick={handleNextStep}
                    className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-semibold"
                  >
                    Continue
                  </Button>
                </div>
                
                {/* Or continue with divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-neutral-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                {/* Social Signup Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    type="button"
                    className="h-12 border-2 border-neutral-200 rounded-xl flex items-center justify-center hover:border-black hover:bg-neutral-100 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    onClick={() => handleSocialSignup('Google')}
                  >
                    <GoogleLogo className="w-5 h-5" aria-hidden="true" weight="bold" />
                  </button>
                  <button 
                    type="button"
                    className="h-12 border-2 border-neutral-200 rounded-xl flex items-center justify-center hover:border-black hover:bg-neutral-100 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    onClick={() => handleSocialSignup('Apple')}
                  >
                    <AppleLogo className="w-5 h-5" aria-hidden="true" weight="fill" />
                  </button>
                  <button 
                    type="button"
                    className="h-12 border-2 border-neutral-200 rounded-xl flex items-center justify-center hover:border-black hover:bg-neutral-100 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    onClick={() => handleSocialSignup('X')}
                  >
                    <XLogo className="w-5 h-5" aria-hidden="true" weight="fill" />
                  </button>
                </div>
                
                {/* Sign in link */}
                <p className="mt-8 text-center text-neutral-600">
                  Already have an account?{' '}
                  <Link href="/login" className="block font-semibold text-foreground hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}
            
            {/* Step 2: Password */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Logo */}
                <Link href="/" className="block inline-flex items-center gap-2 mb-8">
                  <img src="/images/logo.svg" alt="Kahade" className="h-10 w-auto" />
                </Link>
                
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-neutral-600 hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" aria-hidden="true" weight="bold" />
                  Back
                </button>
                
                {/* Title */}
                <h1 className="text-3xl xl:text-4xl font-bold mb-2 text-foreground">Create password</h1>
                
                {/* Subtitle */}
                <p className="text-neutral-600 mb-6">
                  Choose a strong password to secure your account
                </p>
                
                {/* Progress Steps */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                        step >= s ? 'bg-black text-white' : 'bg-neutral-100 text-muted-foreground'
                      )}>
                        {step > s ? <Check className="w-4 h-4" aria-hidden="true" weight="bold" /> : s}
                      </div>
                      {s < 3 && (
                        <div className={cn(
                          "flex-1 h-1 rounded-full transition-all",
                          step > s ? 'bg-black' : 'bg-neutral-200'
                        )} />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-5">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                        className={cn(
                          "pl-12 pr-12 h-12 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-black transition-all",
                          errors.password && touched.password && "border-red-500 bg-red-50"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeSlash className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                      </button>
                    </div>
                    
                    {/* Password Strength */}
                    {formData.password && (
                      <div className="space-y-3 mt-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${getStrengthColor()}`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            passwordStrength.score <= 2 ? 'text-red-500' :
                            passwordStrength.score <= 3 ? 'text-orange-500' :
                            passwordStrength.score <= 4 ? 'text-yellow-600' : 'text-green-500'
                          )}>
                            {getStrengthLabel()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[...passwordStrength.passed, ...passwordStrength.feedback].map((item) => (
                            <div 
                              key={item}
                              className={cn(
                                "flex items-center gap-2 text-xs",
                                passwordStrength.passed.includes(item) ? 'text-green-600' : 'text-muted-foreground'
                              )}
                            >
                              {passwordStrength.passed.includes(item) ? (
                                <Check className="w-3.5 h-3.5" aria-hidden="true" weight="bold" />
                              ) : (
                                <X className="w-3.5 h-3.5" />
                              )}
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={cn(
                          "pl-12 pr-12 h-12 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-black transition-all",
                          errors.confirmPassword && touched.confirmPassword && "border-red-500 bg-red-50"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeSlash className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="text-sm text-red-500 flex items-center gap-1.5">
                        <WarningCircle className="w-4 h-4" aria-hidden="true" weight="fill" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                  
                  {/* Continue Button */}
                  <Button 
                    type="button"
                    onClick={handleNextStep}
                    className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-semibold"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Step 3: Final */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Logo */}
                <Link href="/" className="block inline-flex items-center gap-2 mb-8">
                  <img src="/images/logo.svg" alt="Kahade" className="h-10 w-auto" />
                </Link>
                
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-neutral-600 hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" aria-hidden="true" weight="bold" />
                  Back
                </button>
                
                {/* Title */}
                <h1 className="text-3xl xl:text-4xl font-bold mb-2 text-foreground">Almost there!</h1>
                
                {/* Subtitle */}
                <p className="text-neutral-600 mb-6">
                  Review your information and agree to our terms
                </p>
                
                {/* Progress Steps */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                        step >= s ? 'bg-black text-white' : 'bg-neutral-100 text-muted-foreground'
                      )}>
                        {step > s ? <Check className="w-4 h-4" aria-hidden="true" weight="bold" /> : s}
                      </div>
                      {s < 3 && (
                        <div className={cn(
                          "flex-1 h-1 rounded-full transition-all",
                          step > s ? 'bg-black' : 'bg-neutral-200'
                        )} />
                      )}
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Summary */}
                  <div className="p-5 rounded-xl bg-secondary space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Username</span>
                      <span className="font-medium text-foreground">{formData.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Email</span>
                      <span className="font-medium text-foreground">{formData.email}</span>
                    </div>
                    {formData.phone && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Phone</span>
                        <span className="font-medium text-foreground">{formData.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Referral Code */}
                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="text-foreground font-medium">
                      Referral code <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="referralCode"
                        type="text"
                        placeholder="Enter referral code"
                        value={formData.referralCode}
                        onChange={(e) => handleChange('referralCode', e.target.value.toUpperCase())}
                        className="pl-12 h-12 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-black transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      />
                    </div>
                  </div>
                  
                  {/* Terms Checkboxes */}
                  <div className="space-y-4">
                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleChange('agreeTerms', !formData.agreeTerms)}
                        className={cn(
                          "w-5 h-5 !min-h-5 !min-w-5 rounded border-2 flex items-center justify-center transition-all shrink-0 mt-0.5",
                          formData.agreeTerms 
                            ? "bg-black border-black" 
                            : "bg-white border-neutral-300 hover:border-neutral-400"
                        )}
                      >
                        {formData.agreeTerms && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <label 
                        onClick={() => handleChange('agreeTerms', !formData.agreeTerms)}
                        className="text-sm text-neutral-600 cursor-pointer leading-relaxed select-none"
                      >
                        I agree to the{' '}
                        <Link href="/terms" className="block text-foreground hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="block text-foreground hover:underline">Privacy Policy</Link>
                      </label>
                    </div>
                    
                    {/* Marketing Checkbox */}
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleChange('agreeMarketing', !formData.agreeMarketing)}
                        className={cn(
                          "w-5 h-5 !min-h-5 !min-w-5 rounded border-2 flex items-center justify-center transition-all shrink-0 mt-0.5",
                          formData.agreeMarketing 
                            ? "bg-black border-black" 
                            : "bg-white border-neutral-300 hover:border-neutral-400"
                        )}
                      >
                        {formData.agreeMarketing && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <label 
                        onClick={() => handleChange('agreeMarketing', !formData.agreeMarketing)}
                        className="text-sm text-neutral-600 cursor-pointer leading-relaxed select-none"
                      >
                        I want to receive product updates and marketing communications
                      </label>
                    </div>
                  </div>
                  
                  {/* Create Account Button */}
                  <Button 
                    type="submit"
                    className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-semibold"
                    disabled={isLoading || !formData.agreeTerms}
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="w-5 h-5 animate-spin mr-2" aria-hidden="true" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { SkipToContent } from '@/lib/accessibility';
/**
 * KAHADE CREATE TRANSACTION/ORDER PAGE - Professional Responsive Design
 * 
 * Design Philosophy:
 * - Mobile: Full-screen step wizard WITHOUT bottom navigation
 * - Arrow back header for navigation
 * - Consistent input styling with login/register
 * - Category icons from Phosphor Icons
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, User, FileText, CurrencyDollar, 
  CheckCircle, Spinner, Package, Truck, Clock,
  ShieldCheck, Warning, Copy, EnvelopeSimple, Check,
  CaretRight, Info, Scales, UserCircle,
  DeviceMobile, TShirt, Wrench, GameController, Cube,
  Car, House, Briefcase, DotsThree
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { transactionApi } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

// Categories with Phosphor Icons
const categories = [
  { value: 'ELECTRONICS', label: 'Electronics', icon: DeviceMobile },
  { value: 'FASHION', label: 'Fashion & Apparel', icon: TShirt },
  { value: 'SERVICES', label: 'Services', icon: Wrench },
  { value: 'DIGITAL_GOODS', label: 'Digital Goods', icon: GameController },
  { value: 'PHYSICAL_GOODS', label: 'Physical Goods', icon: Cube },
  { value: 'AUTOMOTIVE', label: 'Automotive', icon: Car },
  { value: 'PROPERTY', label: 'Property', icon: House },
  { value: 'FREELANCE', label: 'Freelance Work', icon: Briefcase },
  { value: 'OTHER', label: 'Other', icon: DotsThree },
];

// Delivery methods
const deliveryMethods = [
  { value: 'SHIPPING', label: 'Shipping/Courier', description: 'Physical delivery via courier', icon: Truck },
  { value: 'DIGITAL', label: 'Digital Delivery', description: 'Files, codes, or digital access', icon: FileText },
  { value: 'MEETUP', label: 'In-Person Meetup', description: 'Face-to-face handover', icon: UserCircle },
  { value: 'SERVICE', label: 'Service Completion', description: 'Work/service to be completed', icon: Package },
];

// Holding periods
const holdingPeriods = [
  { value: 3, label: '3 Days', description: 'Quick transactions' },
  { value: 7, label: '7 Days', description: 'Standard (Recommended)' },
  { value: 14, label: '14 Days', description: 'Complex transactions' },
  { value: 30, label: '30 Days', description: 'Large/custom orders' },
];

const steps = [
  { id: 1, title: 'Role', icon: User },
  { id: 2, title: 'Details', icon: FileText },
  { id: 3, title: 'Delivery', icon: Truck },
  { id: 4, title: 'Price', icon: CurrencyDollar },
  { id: 5, title: 'Review', icon: CheckCircle },
];

interface CounterpartyInfo {
  id: string;
  username: string;
  email: string;
  reputationScore?: number;
  verified?: boolean;
}

export default function CreateTransaction() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [counterpartyInfo, setCounterpartyInfo] = useState<CounterpartyInfo | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    role: 'buyer' as 'buyer' | 'seller',
    counterpartyEmail: '',
    title: '',
    description: '',
    category: '',
    deliveryMethod: 'SHIPPING',
    estimatedDeliveryDays: 7,
    shippingNotes: '',
    amount: '',
    feePaidBy: 'buyer' as 'buyer' | 'seller' | 'split',
    holdingPeriodDays: 7,
    terms: '',
    agreeToTerms: false,
  });

  const debouncedEmail = useDebounce(formData.counterpartyEmail, 500);

  useEffect(() => {
    const validateEmail = async () => {
      if (!debouncedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)) {
        setCounterpartyInfo(null);
        setEmailError(null);
        return;
      }

      setIsValidatingEmail(true);
      setEmailError(null);

      try {
        const response = await transactionApi.validateCounterparty(debouncedEmail);
        const payload = response?.data?.data || response?.data;
        if (payload?.found && payload?.user) {
          setCounterpartyInfo(payload.user);
          setEmailError(null);
        } else {
          setCounterpartyInfo(null);
        }
      } catch (error: unknown) {
        const message = error?.response?.data?.message || error?.response?.data?.error || '';
        if (typeof message === 'string' && message.includes('yourself')) {
          setEmailError('Cannot create transaction with yourself');
        }
        setCounterpartyInfo(null);
      } finally {
        setIsValidatingEmail(false);
      }
    };

    validateEmail();
  }, [debouncedEmail]);

  // Calculate fees
  const amount = parseFloat(formData.amount) || 0;
  const platformFeePercent = 2.5;
  const platformFee = Math.round(amount * platformFeePercent / 100);
  
  const buyerPays = formData.feePaidBy === 'buyer' 
    ? amount + platformFee 
    : formData.feePaidBy === 'split' 
      ? amount + Math.round(platformFee / 2)
      : amount;
      
  const sellerReceives = formData.feePaidBy === 'seller'
    ? amount - platformFee
    : formData.feePaidBy === 'split'
      ? amount - Math.round(platformFee / 2)
      : amount;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.counterpartyEmail) {
          toast.error('Counterparty email is required');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.counterpartyEmail)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        if (emailError) {
          toast.error(emailError);
          return false;
        }
        return true;
        
      case 2:
        if (!formData.title || formData.title.trim().length < 3) {
          toast.error('Title must be at least 3 characters');
          return false;
        }
        if (!formData.category) {
          toast.error('Please select a category');
          return false;
        }
        if (!formData.description || formData.description.trim().length < 10) {
          toast.error('Description must be at least 10 characters');
          return false;
        }
        return true;
        
      case 3:
        if (!formData.deliveryMethod) {
          toast.error('Please select a delivery method');
          return false;
        }
        return true;
        
      case 4:
        if (!formData.amount || parseFloat(formData.amount) < 10000) {
          toast.error('Minimum transaction amount is Rp 10,000');
          return false;
        }
        return true;
        
      case 5:
        if (!formData.agreeToTerms) {
          toast.error('Please agree to the terms and conditions');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await transactionApi.create({
        counterpartyEmail: formData.counterpartyEmail,
        role: formData.role,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        amount: parseFloat(formData.amount),
        feePaidBy: formData.feePaidBy,
        terms: formData.terms || undefined,
      });

      // Handle various response formats from API
      const responseData = response?.data;
      let transactionId: string | null = null;
      
      // Try to extract transaction ID from different response structures
      if (responseData) {
        // Direct response: { id: "..." }
        if (responseData.id) {
          transactionId = responseData.id;
        }
        // Wrapped in data: { data: { id: "..." } }
        else if (responseData.data?.id) {
          transactionId = responseData.data.id;
        }
        // Wrapped in transaction: { transaction: { id: "..." } }
        else if (responseData.transaction?.id) {
          transactionId = responseData.transaction.id;
        }
        // Wrapped in data.transaction: { data: { transaction: { id: "..." } } }
        else if (responseData.data?.transaction?.id) {
          transactionId = responseData.data.transaction.id;
        }
      }

      toast.success('Order created successfully!');
      
      if (transactionId) {
        setLocation(`/transactions/${transactionId}`);
      } else {
        // Fallback to transactions list with refresh
        setLocation('/transactions?refresh=true');
      }
    } catch (error: unknown) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to create order';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, amount: value });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ========== HEADER WITH BACK BUTTON ========== */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => currentStep === 1 ? setLocation('/transactions') : handleBack()}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-black" aria-hidden="true" weight="bold" aria-hidden="true" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-base text-black sm:text-lg">
            Create Order
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 pb-8">
        {/* ========== PROGRESS STEPS ========== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {/* Mobile Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-black">Step {currentStep} of {steps.length}</span>
              <span className="text-sm text-neutral-600">{steps[currentStep - 1].title}</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Desktop Progress */}
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  currentStep >= step.id ? 'text-black' : 'text-neutral-500'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    currentStep > step.id 
                      ? 'bg-emerald-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-black text-white' 
                        : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" aria-hidden="true" weight="bold" aria-hidden="true" />
                    ) : (
                      <step.icon className="w-5 h-5" weight={currentStep === step.id ? 'bold' : 'regular'} />
                    )}
                  </div>
                  <span className="font-medium text-sm">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 lg:w-20 h-0.5 mx-3 ${
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-neutral-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ========== FORM CONTENT ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Role & Party */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5 space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-black mb-1">Select Your Role</h2>
                  <p className="text-sm text-neutral-600">Are you buying or selling?</p>
                </div>

                <RadioGroup
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v as 'buyer' | 'seller' })}
                  className="grid grid-cols-2 gap-3"
                >
                  <Label
                    htmlFor="buyer"
                    className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.role === 'buyer' 
                        ? 'border-black bg-neutral-50' 
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <RadioGroupItem value="buyer" id="buyer" className="sr-only" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                      formData.role === 'buyer' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <Package className="w-6 h-6" aria-hidden="true" weight="duotone" aria-hidden="true" />
                    </div>
                    <span className="font-semibold text-black">I'm Buying</span>
                    <span className="text-xs text-neutral-600 text-center mt-1">I want to purchase something</span>
                  </Label>
                  
                  <Label
                    htmlFor="seller"
                    className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.role === 'seller' 
                        ? 'border-black bg-neutral-50' 
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <RadioGroupItem value="seller" id="seller" className="sr-only" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                      formData.role === 'seller' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <CurrencyDollar className="w-6 h-6" aria-hidden="true" weight="duotone" aria-hidden="true" />
                    </div>
                    <span className="font-semibold text-black">I'm Selling</span>
                    <span className="text-xs text-neutral-600 text-center mt-1">I want to sell something</span>
                  </Label>
                </RadioGroup>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {formData.role === 'buyer' ? 'Seller' : 'Buyer'}'s Email
                  </Label>
                  <div className="relative">
                    <EnvelopeSimple className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" weight="regular" aria-hidden="true" />
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={formData.counterpartyEmail}
                      onChange={(e) => setFormData({ ...formData, counterpartyEmail: e.target.value })}
                      className="pl-12 h-12"
                    />
                    {isValidatingEmail && (
                      <Spinner className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-neutral-500" aria-hidden="true" />
                    )}
                  </div>
                  
                  {emailError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <Warning className="w-4 h-4" aria-hidden="true" weight="fill" aria-hidden="true" />
                      {emailError}
                    </div>
                  )}
                  
                  {counterpartyInfo && (
                    <div className="flex items-center gap-4 p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-emerald-600" aria-hidden="true" weight="duotone" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-black text-sm">{counterpartyInfo.username}</div>
                        <div className="text-xs text-emerald-600">Verified user found</div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" weight="fill" aria-hidden="true" />
                    </div>
                  )}
                  
                  {!counterpartyInfo && formData.counterpartyEmail && !isValidatingEmail && !emailError && (
                    <div className="flex items-center gap-2 text-neutral-600 text-sm">
                      <Info className="w-4 h-4" aria-hidden="true" weight="fill" aria-hidden="true" />
                      User not found. An invitation will be sent.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Item Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5 space-y-5"
              >
                <div>
                  <h2 className="text-lg font-semibold text-black mb-1">Item Details</h2>
                  <p className="text-sm text-neutral-600">Describe what you're {formData.role === 'buyer' ? 'buying' : 'selling'}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Title</Label>
                  <Input
                    placeholder="e.g., iPhone 15 Pro Max 256GB"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-12"
                    maxLength={100}
                  />
                  <div className="text-xs text-neutral-500 text-right">{formData.title.length}/100</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => {
                        const IconComponent = cat.icon;
                        return (
                          <SelectItem key={cat.value} value={cat.value}>
                            <span className="flex items-center gap-3">
                              <IconComponent className="w-5 h-5 text-neutral-600" aria-hidden="true" weight="duotone" aria-hidden="true" />
                              <span>{cat.label}</span>
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    placeholder="Provide detailed description including condition, specifications, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[120px] resize-none"
                    maxLength={2000}
                  />
                  <div className="text-xs text-neutral-500 text-right">{formData.description.length}/2000</div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Delivery */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5 space-y-5"
              >
                <div>
                  <h2 className="text-lg font-semibold text-black mb-1">Delivery Method</h2>
                  <p className="text-sm text-neutral-600">How will the item be delivered?</p>
                </div>

                <RadioGroup
                  value={formData.deliveryMethod}
                  onValueChange={(v) => setFormData({ ...formData, deliveryMethod: v })}
                  className="space-y-3"
                >
                  {deliveryMethods.map((method) => (
                    <Label
                      key={method.value}
                      htmlFor={method.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.deliveryMethod === method.value 
                          ? 'border-black bg-neutral-50' 
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <RadioGroupItem value={method.value} id={method.value} className="sr-only" />
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        formData.deliveryMethod === method.value ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        <method.icon className="w-5 h-5" weight="duotone" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-black">{method.label}</div>
                        <div className="text-sm text-neutral-600">{method.description}</div>
                      </div>
                      {formData.deliveryMethod === method.value && (
                        <CheckCircle className="w-5 h-5 text-black shrink-0" aria-hidden="true" weight="fill" aria-hidden="true" />
                      )}
                    </Label>
                  ))}
                </RadioGroup>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estimated Delivery Time</Label>
                  <Select 
                    value={formData.estimatedDeliveryDays.toString()} 
                    onValueChange={(v) => setFormData({ ...formData, estimatedDeliveryDays: parseInt(v) })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {/* Step 4: Price & Terms */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5 space-y-5"
              >
                <div>
                  <h2 className="text-lg font-semibold text-black mb-1">Price & Terms</h2>
                  <p className="text-sm text-neutral-600">Set the transaction amount and fee arrangement</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Amount (IDR)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 font-medium">Rp</span>
                    <Input
                      type="text"
                      placeholder="0"
                      value={formData.amount ? parseInt(formData.amount).toLocaleString('id-ID') : ''}
                      onChange={handleAmountChange}
                      className="pl-12 h-12 text-lg font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Who Pays the Fee?</Label>
                  <p className="text-xs text-neutral-600">Platform fee: 2.5% ({formatCurrency(platformFee)})</p>
                  
                  <RadioGroup
                    value={formData.feePaidBy}
                    onValueChange={(v) => setFormData({ ...formData, feePaidBy: v as 'buyer' | 'seller' | 'split' })}
                    className="grid grid-cols-3 gap-2"
                  >
                    {[
                      { value: 'buyer', label: 'Buyer' },
                      { value: 'seller', label: 'Seller' },
                      { value: 'split', label: 'Split 50/50' },
                    ].map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`fee-${option.value}`}
                        className={`flex items-center justify-center p-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                          formData.feePaidBy === option.value 
                            ? 'border-black bg-black text-white' 
                            : 'border-neutral-200 hover:border-neutral-300 text-black'
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`fee-${option.value}`} className="sr-only" />
                        {option.label}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Fee Summary */}
                {amount > 0 && (
                  <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Item Price</span>
                      <span className="font-medium text-black">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Platform Fee (2.5%)</span>
                      <span className="font-medium text-black">{formatCurrency(platformFee)}</span>
                    </div>
                    <div className="border-t border-neutral-200 pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Buyer Pays</span>
                        <span className="font-semibold text-black">{formatCurrency(buyerPays)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Seller Receives</span>
                        <span className="font-semibold text-emerald-600">{formatCurrency(sellerReceives)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5 space-y-5"
              >
                <div>
                  <h2 className="text-lg font-semibold text-black mb-1">Review Order</h2>
                  <p className="text-sm text-neutral-600">Please review all details before creating</p>
                </div>

                <div className="space-y-4">
                  {/* Role & Party */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-black">Transaction Parties</span>
                      <Badge className="bg-black text-white border-0">
                        {formData.role === 'buyer' ? 'Buying' : 'Selling'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-neutral-600" aria-hidden="true" weight="duotone" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="font-medium text-black text-sm">
                          {counterpartyInfo?.username || formData.counterpartyEmail}
                        </div>
                        <div className="text-xs text-neutral-600">
                          {formData.role === 'buyer' ? 'Seller' : 'Buyer'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <span className="text-sm font-medium text-black">Item Details</span>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Title</span>
                        <span className="text-sm font-medium text-black">{formData.title}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Category</span>
                        <span className="text-sm font-medium text-black">
                          {categories.find(c => c.value === formData.category)?.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Delivery</span>
                        <span className="text-sm font-medium text-black">
                          {deliveryMethods.find(d => d.value === formData.deliveryMethod)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-black rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/70 text-sm">Total Amount</span>
                      <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Buyer Pays</span>
                      <span className="font-medium">{formatCurrency(buyerPays)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Seller Receives</span>
                      <span className="font-medium text-emerald-400">{formatCurrency(sellerReceives)}</span>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm text-amber-900 cursor-pointer">
                      I agree to the <Link href="/terms" className="underline font-medium">Terms of Service</Link> and understand that funds will be held in escrow until the transaction is completed.
                    </Label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== NAVIGATION BUTTONS ========== */}
          <div className="flex items-center justify-between p-4 border-t border-neutral-200 bg-neutral-50">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? () => setLocation('/transactions') : handleBack}
              className="rounded-xl border-neutral-200 h-11"
            >
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" aria-hidden="true" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                className="bg-black text-white hover:bg-black/90 rounded-xl h-11"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" weight="bold" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.agreeToTerms}
                className="bg-black text-white hover:bg-black/90 rounded-xl h-11"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" weight="bold" aria-hidden="true" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" aria-hidden="true" />
                    Create Order
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-600"
        >
          <ShieldCheck className="w-4 h-4" aria-hidden="true" weight="fill" aria-hidden="true" />
          <span>Your funds are protected by our secure escrow system</span>
        </motion.div>
      </div>
    </div>
  );
}

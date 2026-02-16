import { SkipToContent } from '@/lib/accessibility';
/**
 * KAHADE KYC VERIFICATION PAGE - Professional Responsive Design
 * 
 * Design Philosophy:
 * - Mobile: Full-width step wizard with large touch targets
 * - Tablet/Desktop: Centered card with progress indicator
 * - Consistent visual hierarchy across all breakpoints
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IdentificationCard, Upload, CheckCircle, Warning,
  Spinner, ShieldCheck, X, ArrowLeft, ArrowRight, Check, User
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';

type KYCStatus = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';

interface KYCData {
  status: KYCStatus;
  idType?: string;
  idNumber?: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

const idTypes = [
  { value: 'KTP', label: 'KTP (Indonesian ID)' },
  { value: 'SIM', label: 'SIM (Driver License)' },
  { value: 'PASSPORT', label: 'Passport' },
];

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'ID Document', icon: IdentificationCard },
];

export default function KYCVerification() {
  const { refreshUser } = useAuth();
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    idType: '',
    idNumber: '',
    fullName: '',
    dateOfBirth: '',
    address: '',
  });
  
  const [idFront, setIdFront] = useState<File | null>(null);
  
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await userApi.getKYCStatus();
      setKycData(response.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      toast.error('Please upload an image or PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFile(file);
    if (!isImage) {
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.idType || !formData.idNumber || !formData.fullName) {
          toast.error('Please fill all required fields');
          return false;
        }
        return true;
      case 2:
        if (!idFront) {
          toast.error('Please upload your ID document');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step) && step < 2) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('documentType', formData.idType);
      formDataToSend.append('idNumber', formData.idNumber);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('document', idFront!);

      await userApi.uploadKYC(formDataToSend);
      toast.success('KYC submitted successfully!');
      fetchKYCStatus();
      refreshUser();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="KYC Verification" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner className="w-10 h-10 animate-spin text-black mx-auto mb-4" aria-hidden="true" weight="bold" aria-hidden="true" />
            <p className="text-neutral-600">Loading verification status...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Already verified
  if (kycData?.status === 'VERIFIED') {
    return (
      <DashboardLayout title="KYC Verification" subtitle="Your identity has been verified">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" aria-hidden="true" weight="fill" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Identity Verified</h2>
            <p className="text-neutral-600 mb-6">
              Your identity has been successfully verified. You now have access to higher transaction limits.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50">
                <p className="text-sm text-neutral-600">Transaction Limit</p>
                <p className="text-xl font-bold text-black">Rp 100M</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50">
                <p className="text-sm text-neutral-600">Verified Since</p>
                <p className="text-xl font-bold text-black">
                  {kycData?.verifiedAt ? new Date(kycData.verifiedAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  // Pending review
  if (kycData?.status === 'PENDING') {
    return (
      <DashboardLayout title="KYC Verification" subtitle="Your documents are under review">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <Spinner className="w-10 h-10 text-amber-600 animate-spin" aria-hidden="true" weight="bold" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Under Review</h2>
            <p className="text-neutral-600 mb-6">
              Your documents are being reviewed. This usually takes 1-3 business days.
            </p>
            <div className="p-4 rounded-xl bg-neutral-50">
              <p className="text-sm text-neutral-600">Submitted On</p>
              <p className="text-lg font-semibold text-black">
                {kycData?.submittedAt ? new Date(kycData.submittedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : '-'}
              </p>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  // Rejected
  if (kycData?.status === 'REJECTED') {
    return (
      <DashboardLayout title="KYC Verification" subtitle="Your verification was rejected">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto space-y-6"
        >
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Warning className="w-5 h-5 text-red-600" aria-hidden="true" weight="fill" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Verification Rejected</h3>
                <p className="text-sm text-red-700">{kycData?.rejectionReason || 'Please resubmit with valid documents.'}</p>
              </div>
            </div>
          </div>
          <Button 
            className="bg-black text-white hover:bg-black/90 rounded-xl h-11 w-full" 
            onClick={() => setKycData({ status: 'NONE' })}
          >
            Resubmit Documents
          </Button>
        </motion.div>
      </DashboardLayout>
    );
  }

  // Not submitted - show form
  return (
    <DashboardLayout title="KYC Verification" subtitle="Verify your identity">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-50 rounded-2xl p-4 md:p-6 border border-neutral-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" weight="duotone" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">Why Verify?</h3>
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" weight="fill" aria-hidden="true" />
                  <span>Increase transaction limit to Rp 100.000.000</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" weight="fill" aria-hidden="true" />
                  <span>Get verified badge on your profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" weight="fill" aria-hidden="true" />
                  <span>Faster dispute resolution</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-5"
        >
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    step > s.id 
                      ? 'bg-emerald-500 text-white' 
                      : step === s.id 
                        ? 'bg-black text-white' 
                        : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {step > s.id ? (
                      <Check className="w-5 h-5" aria-hidden="true" weight="bold" aria-hidden="true" />
                    ) : (
                      <s.icon className="w-5 h-5" weight={step === s.id ? 'bold' : 'regular'} />
                    )}
                  </div>
                  <span className={`text-xs mt-2 hidden sm:block ${step >= s.id ? 'text-black font-medium' : 'text-neutral-500'}`}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 md:w-20 h-0.5 mx-2 md:mx-4 ${step > s.id ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5 md:p-6 space-y-5"
              >
                <div>
                  <h2 className="text-lg font-semibold text-black mb-1">Personal Information</h2>
                  <p className="text-sm text-neutral-600">Enter your details as shown on your ID</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ID Type</Label>
                    <Select value={formData.idType} onValueChange={(v) => setFormData({ ...formData, idType: v })}>
                      <SelectTrigger className="h-11 rounded-xl border-neutral-200">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        {idTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ID Number</Label>
                    <Input
                      type="text"
                      placeholder="Enter your ID number"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                      className="h-11 rounded-xl border-neutral-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="h-11 rounded-xl border-neutral-200"
                    />
                    <p className="text-xs text-neutral-500">Must match the name on your ID</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date of Birth</Label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="h-11 rounded-xl border-neutral-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Address (Optional)</Label>
                      <Input
                        type="text"
                        placeholder="City"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="h-11 rounded-xl border-neutral-200"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: ID Document */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5 md:p-6 space-y-5"
              >
                <div>
                  <h2 className="text-lg font-semibold text-black mb-1">Upload ID Document</h2>
                  <p className="text-sm text-neutral-600">Take a clear photo of your {formData.idType || 'ID'}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Document *</Label>
                  <label className={`block aspect-[3/2] rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
                    idFrontPreview || idFront ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-200 hover:border-neutral-900 bg-neutral-50'
                  }`}>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, setIdFront, setIdFrontPreview)}
                    />
                    {idFrontPreview ? (
                      <div className="relative w-full h-full">
                        <img src={idFrontPreview} alt="ID Document" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setIdFront(null);
                            setIdFrontPreview(null);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                        >
                          <X className="w-4 h-4" weight="bold" aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Upload className="w-8 h-8 text-neutral-500 mb-2" aria-hidden="true" weight="duotone" aria-hidden="true" />
                        {idFront ? (
                          <span className="text-sm text-neutral-600">{idFront.name}</span>
                        ) : (
                          <span className="text-sm text-neutral-600">Upload document</span>
                        )}
                      </div>
                    )}
                  </label>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Warning className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" weight="fill" aria-hidden="true" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Photo Requirements</p>
                      <ul className="list-disc list-inside text-amber-700 space-y-0.5">
                        <li>All corners must be visible</li>
                        <li>No glare or blur</li>
                        <li>Maximum file size: 5MB</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between p-4 md:p-6 border-t border-neutral-200 bg-neutral-50">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="rounded-xl border-neutral-200 h-11"
            >
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" aria-hidden="true" />
              Back
            </Button>
            
            {step < 2 ? (
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
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-black/90 rounded-xl h-11"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" weight="bold" aria-hidden="true" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" aria-hidden="true" weight="bold" aria-hidden="true" />
                    Submit for Verification
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

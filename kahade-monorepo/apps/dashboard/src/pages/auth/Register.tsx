import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Eye, EyeSlash, GoogleLogo, AppleLogo, ArrowLeft, ArrowRight,
 Check, ShieldCheck, Star, Lightning, Clock
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import { staggerContainer, staggerItem } from '@kahade/utils';

const steps = ['Info Dasar', 'Kontak', 'Preferensi', 'Verifikasi'];

const preferences = ['Membeli dari marketplace', 'Menjual produk', 'Jasa freelance', 'Keperluan bisnis'];

interface StepContentProps {
 step: number;
 data: Record<string, any>;
 onChange: (key: string, val: any) => void;
}

function StepContent({ step, data, onChange }: StepContentProps) {
 const [showPwd, setShowPwd] = useState(false);

 if (step === 0) return (
 <div className="space-y-4">
 <div>
 <label className="text-sm font-medium mb-1.5 block">Nama Lengkap</label>
 <input type="text" placeholder="Ahmad Rizki" value={data.name || ''} onChange={e => onChange('name', e.target.value)}
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
 <p className="text-sm text-muted-foreground">Masukkan kode 6 digit yang dikirim ke {data.email || 'email Anda'}</p>
 </div>
 <div className="flex justify-center gap-2">
 {[...Array(6)].map((_, i) => (
 <input key={i} type="text" maxLength={1}
 className="w-11 h-14 rounded-xl border-2 border-border text-center text-xl font-bold focus:outline-none focus:border-foreground transition-colors bg-background"
 onKeyUp={e => {
 if (e.key !== 'Backspace' && (e.target as HTMLInputElement).value) {
 const next = (e.target as HTMLElement).nextSibling as HTMLInputElement;
 if (next) next.focus();
 }
 }}
 />
 ))}
 </div>
 <p className="text-xs text-muted-foreground">
 Tidak menerima kode?{' '}
 <button className="text-foreground font-semibold hover:underline">Kirim ulang</button>
 </p>
 </div>
 );

 return null;
}

export default function Register() {
 const [currentStep, setCurrentStep] = useState(0);
 const [data, setData] = useState<Record<string, any>>({});

 const updateData = (key: string, val: any) => setData(prev => ({ ...prev, [key]: val }));

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
 <StepContent step={currentStep} data={data} onChange={updateData} />
 </motion.div>
 </AnimatePresence>

 <div className={`flex gap-3 mt-6 ${currentStep > 0 ? 'flex-row' : 'flex-col'}`}>
 {currentStep > 0 && (
 <button onClick={() => setCurrentStep(s => s - 1)} className="btn-secondary flex-1">
 <ArrowLeft size={16} /> Kembali
 </button>
 )}
 <button
 onClick={() => currentStep < steps.length - 1 ? setCurrentStep(s => s + 1) : null}
 className="btn-primary flex-1 w-full"
 >
 {currentStep === steps.length - 1 ? 'Selesai Daftar' : 'Lanjut'}
 <ArrowRight size={16} />
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

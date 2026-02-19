/*
 * KAHADE PRICING PAGE - DEDICATED
 * 
 * Comprehensive pricing information with:
 * - Interactive transaction fee calculator
 * - Detailed plan comparison
 * - FAQ section for pricing
 * - Enterprise custom solutions
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Check, X, ArrowRight, Calculator, CreditCard, 
  ShieldCheck, Lightning, Users, Headset, ChartLineUp,
  Package, Star, ArrowUpRight, Question
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import Footer from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Pricing plans data
const pricingPlans = [
  {
    name: 'Pemula',
    description: 'Untuk individu dan transaksi kecil',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: 'Hingga 5 transaksi/bulan', included: true },
      { text: 'Perlindungan escrow dasar', included: true },
      { text: 'Dukungan email (48 jam)', included: true },
      { text: 'Pemrosesan standar', included: true },
      { text: 'Analitik dasar', included: true },
      { text: 'Dukungan prioritas', included: false },
      { text: 'Akses API', included: false },
      { text: 'Branding kustom', included: false },
      { text: 'Manajer akun khusus', included: false },
    ],
    cta: 'Mulai Gratis',
    popular: false,
    badge: null,
  },
  {
    name: 'Profesional',
    description: 'Untuk freelancer dan bisnis yang berkembang',
    monthlyPrice: 299000,
    yearlyPrice: 2990000,
    features: [
      { text: 'Transaksi tanpa batas', included: true },
      { text: 'Perlindungan escrow lanjutan', included: true },
      { text: 'Dukungan prioritas 24/7', included: true },
      { text: 'Pemrosesan cepat (2x)', included: true },
      { text: 'Analitik lanjutan & laporan', included: true },
      { text: 'Akses API & Webhook', included: true },
      { text: 'Branding kustom', included: true },
      { text: 'Integrasi payment gateway', included: true },
      { text: 'Manajer akun khusus', included: false },
    ],
    cta: 'Coba Gratis 14 Hari',
    popular: true,
    badge: 'Paling Populer',
  },
  {
    name: 'Enterprise',
    description: 'Untuk organisasi besar dengan volume tinggi',
    monthlyPrice: 999000,
    yearlyPrice: 9990000,
    features: [
      { text: 'Semua fitur Profesional', included: true },
      { text: 'Volume transaksi unlimited', included: true },
      { text: 'Manajer akun khusus', included: true },
      { text: 'Integrasi kustom', included: true },
      { text: 'Jaminan SLA 99.9%', included: true },
      { text: 'Solusi white-label', included: true },
      { text: 'Keamanan lanjutan & audit', included: true },
      { text: 'Dukungan kepatuhan', included: true },
      { text: 'Konsultasi bisnis', included: true },
    ],
    cta: 'Hubungi Sales',
    popular: false,
    badge: 'Enterprise',
  },
];

// Platform fee structure
const feeStructure = {
  percentage: 2.5,
  minimum: 2500,
  maximum: 250000,
};

// Pricing FAQs
const pricingFAQs = [
  {
    question: 'Bagaimana cara kerja biaya platform?',
    answer: 'Kahade mengenakan biaya 2.5% dari nilai transaksi dengan minimum Rp 2.500 dan maksimum Rp 250.000. Biaya ini digunakan untuk menjaga keamanan, infrastruktur, dan dukungan pelanggan 24/7.'
  },
  {
    question: 'Apakah ada biaya tersembunyi?',
    answer: 'Tidak ada biaya tersembunyi. Semua biaya ditampilkan dengan jelas sebelum Anda menyelesaikan transaksi. Yang Anda lihat adalah yang Anda bayar.'
  },
  {
    question: 'Siapa yang membayar biaya platform?',
    answer: 'Biaya platform dapat dibayar oleh pembeli, penjual, atau dibagi rata sesuai kesepakatan kedua belah pihak di awal transaksi.'
  },
  {
    question: 'Apakah saya bisa upgrade atau downgrade paket?',
    answer: 'Ya, Anda dapat mengubah paket kapan saja. Upgrade berlaku segera, dan untuk downgrade akan berlaku pada periode billing berikutnya.'
  },
  {
    question: 'Apakah ada diskon untuk pembayaran tahunan?',
    answer: 'Ya, pembayaran tahunan mendapatkan diskon 20% dibanding pembayaran bulanan. Ini cara terbaik untuk menghemat jika Anda berencana menggunakan Kahade jangka panjang.'
  },
  {
    question: 'Bagaimana dengan refund policy?',
    answer: 'Kami menawarkan 30 hari money-back guarantee untuk paket berbayar. Jika tidak puas, kami akan mengembalikan uang Anda tanpa pertanyaan.'
  },
  {
    question: 'Apakah ada trial period untuk paket berbayar?',
    answer: 'Ya, paket Profesional dan Enterprise mendapatkan free trial 14 hari. Tidak perlu kartu kredit untuk memulai trial.'
  },
  {
    question: 'Bagaimana cara mendapatkan paket Enterprise custom?',
    answer: 'Hubungi tim sales kami untuk mendiskusikan kebutuhan spesifik organisasi Anda. Kami akan menyiapkan proposal dan pricing yang disesuaikan.'
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState(5000000);
  const [calculatedFee, setCalculatedFee] = useState(0);
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  // Calculate platform fee
  useEffect(() => {
    const percentageFee = (transactionAmount * feeStructure.percentage) / 100;
    const fee = Math.max(
      feeStructure.minimum,
      Math.min(percentageFee, feeStructure.maximum)
    );
    setCalculatedFee(fee);
  }, [transactionAmount]);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-28 md:pt-32 lg:pt-36 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" aria-hidden="true" />
        
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground">
                <CreditCard className="w-4 h-4" aria-hidden="true" weight="fill" />
                Harga Transparan, Tanpa Biaya Tersembunyi
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-foreground"
            >
              Pilih paket yang tepat untuk bisnis Anda
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Mulai gratis, upgrade saat Anda berkembang. Semua paket termasuk perlindungan escrow dan keamanan tingkat enterprise.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4"
            >
              <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Bulanan
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  isYearly ? 'bg-black' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-md transition-transform ${
                    isYearly ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Tahunan
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  Hemat 20%
                </span>
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== PRICING PLANS ========== */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-black text-white ring-4 ring-black/10 scale-105 lg:scale-110'
                    : 'bg-card border-2 border-border'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2" aria-hidden="true">
                    <span className="px-4 py-1.5 bg-card text-foreground text-xs font-bold rounded-full shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-foreground'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.popular ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className={`text-5xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-foreground'}`}>
                    {formatPrice(isYearly ? plan.yearlyPrice : plan.monthlyPrice)}
                  </div>
                  <div className={`text-sm ${plan.popular ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {plan.monthlyPrice === 0 ? 'selamanya' : isYearly ? '/tahun' : '/bulan'}
                  </div>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <div className={`text-xs mt-1 ${plan.popular ? 'text-white/50' : 'text-muted-foreground'}`}>
                      Setara {formatPrice((isYearly ? plan.yearlyPrice : plan.monthlyPrice) / 12)}/bulan
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            plan.popular ? 'text-white' : 'text-foreground'
                          }`}
                          weight="bold"
                        />
                      ) : (
                        <X
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            plan.popular ? 'text-white/30' : 'text-neutral-200'
                          }`}
                          weight="bold"
                        />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? plan.popular
                              ? 'text-white'
                              : 'text-muted-foreground'
                            : plan.popular
                            ? 'text-white/30 line-through'
                            : 'text-neutral-200 line-through'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.name === 'Enterprise' ? '/contact' : '/register'}>
                  <Button
                    className={`w-full h-12 font-semibold rounded-xl ${
                      plan.popular
                        ? 'bg-card text-foreground hover:bg-gray-100'
                        : 'bg-black text-white hover:bg-black/90'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEE CALCULATOR ========== */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
              >
                Kalkulator Biaya Transaksi
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground"
              >
                Hitung biaya platform untuk transaksi Anda
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl border-2 border-black/10 p-8 md:p-10"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" aria-hidden="true" weight="bold" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Simulasi Biaya</h3>
                  <p className="text-sm text-muted-foreground">Masukkan nilai transaksi</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nilai Transaksi
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(Number(e.target.value))}
                      className="w-full h-14 pl-12 pr-4 bg-muted border-2 border-border rounded-xl text-foreground font-semibold text-lg focus:outline-none focus:border-black transition-colors"
                      min="0"
                      step="100000"
                    />
                  </div>
                  <input
                    type="range"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(Number(e.target.value))}
                    className="w-full mt-4"
                    min="100000"
                    max="50000000"
                    step="100000"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Rp 100K</span>
                    <span>Rp 50M</span>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="bg-muted rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Nilai Transaksi</span>
                    <span className="font-semibold text-foreground">{formatPrice(transactionAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Biaya Platform ({feeStructure.percentage}%)</span>
                    <span className="font-semibold text-foreground">{formatPrice(calculatedFee)}</span>
                  </div>
                  <div className="pt-4 border-t-2 border-border">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total yang Diterima</span>
                      <span className="text-2xl font-bold text-foreground">
                        {formatPrice(transactionAmount - calculatedFee)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fee Info */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Persentase</div>
                    <div className="text-xl font-bold text-foreground">{feeStructure.percentage}%</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Min. Biaya</div>
                    <div className="text-xl font-bold text-foreground">{formatPrice(feeStructure.minimum)}</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Max. Biaya</div>
                    <div className="text-xl font-bold text-foreground">{formatPrice(feeStructure.maximum)}</div>
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-100 rounded-xl p-4">
                  <p className="text-sm text-amber-900">
                    <strong>Catatan:</strong> Biaya platform dapat dibayar oleh pembeli, penjual, atau dibagi rata sesuai kesepakatan di awal transaksi.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== COMPARISON TABLE ========== */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Perbandingan Fitur Detail
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Lihat semua fitur yang tersedia di setiap paket
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto overflow-x-auto -mx-4 px-4 pb-2"
          >
            <div className="min-w-[800px] bg-card rounded-2xl border-2 border-border overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-4 bg-muted border-b-2 border-border">
                <div className="p-6 font-bold text-foreground">Fitur</div>
                <div className="p-6 text-center font-bold text-foreground border-l-2 border-border">
                  Pemula
                </div>
                <div className="p-6 text-center font-bold text-foreground border-l-2 border-border bg-black/5">
                  Profesional
                </div>
                <div className="p-6 text-center font-bold text-foreground border-l-2 border-border">
                  Enterprise
                </div>
              </div>

              {/* Rows */}
              {[
                { feature: 'Jumlah Transaksi', values: ['5/bulan', 'Unlimited', 'Unlimited'] },
                { feature: 'Perlindungan Escrow', values: ['Dasar', 'Lanjutan', 'Lanjutan + Audit'] },
                { feature: 'Response Time Support', values: ['48 jam', '2 jam', '<30 menit'] },
                { feature: 'Pemrosesan Transaksi', values: ['Standar', 'Cepat (2x)', 'Instant (5x)'] },
                { feature: 'Analitik & Laporan', values: ['Dasar', 'Lanjutan', 'Custom'] },
                { feature: 'API Access', values: [false, true, true] },
                { feature: 'Webhook', values: [false, true, true] },
                { feature: 'White-label', values: [false, false, true] },
                { feature: 'Dedicated Account Manager', values: [false, false, true] },
                { feature: 'Custom Integration', values: [false, false, true] },
                { feature: 'SLA Guarantee', values: [false, false, '99.9%'] },
              ].map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 border-b border-border last:border-b-0 hover:bg-muted transition-colors"
                >
                  <div className="p-6 text-foreground font-medium">{row.feature}</div>
                  {row.values.map((value, i) => (
                    <div
                      key={i}
                      className={`p-6 text-center border-l-2 border-border ${
                        i === 1 ? 'bg-black/5' : ''
                      }`}
                    >
                      {typeof value === 'boolean' ? (
                        value ? (
                          <Check className="w-6 h-6 text-foreground mx-auto" aria-hidden="true" weight="bold" />
                        ) : (
                          <X className="w-6 h-6 text-neutral-200 mx-auto" weight="bold" aria-hidden="true" />
                        )
                      ) : (
                        <span className="text-muted-foreground font-medium">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== PRICING FAQ ========== */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
              >
                Pertanyaan Seputar Harga
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground"
              >
                Jawaban untuk pertanyaan umum tentang pricing
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl border-2 border-border p-6 md:p-8"
            >
              <Accordion type="single" collapsible className="w-full">
                {pricingFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:text-neutral-900/80">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 text-center"
            >
              <p className="text-muted-foreground mb-4">Masih ada pertanyaan?</p>
              <Link href="/contact">
                <Button className="h-12 px-6 bg-black text-white hover:bg-black/90 rounded-xl font-semibold">
                  Hubungi Tim Sales
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-16 md:py-20 lg:py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" aria-hidden="true" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
            >
              Siap untuk memulai?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/70 mb-8 max-w-2xl mx-auto"
            >
              Mulai dengan paket gratis dan upgrade saat bisnis Anda berkembang. Tidak perlu kartu kredit.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/register">
                <Button className="h-14 px-8 bg-card text-foreground hover:bg-gray-100 rounded-xl font-semibold text-base">
                  Mulai Gratis Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/*
 * KAHADE COMPARE PAGE
 * 
 * Comparison with:
 * - Traditional methods (no escrow)
 * - Competitors
 * - Feature comparison table
 * - Pricing comparison
 * - Why choose Kahade
 */

import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Check, X, ShieldCheck, Lightning, CreditCard,
  Users, Headset, ChartLineUp, Globe, ArrowRight,
  Warning, Star, Crown, Scales
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Comparison with traditional methods
const traditionalComparison = {
  withoutEscrow: [
    { feature: 'Perlindungan Pembeli', value: 'Tidak ada', icon: X, color: 'text-red-500' },
    { feature: 'Perlindungan Penjual', value: 'Tidak ada', icon: X, color: 'text-red-500' },
    { feature: 'Dispute Resolution', value: 'Manual & rumit', icon: Warning, color: 'text-orange-500' },
    { feature: 'Tracking Transaksi', value: 'Tidak ada', icon: X, color: 'text-red-500' },
    { feature: 'Refund Process', value: 'Sulit & lama', icon: Warning, color: 'text-orange-500' },
    { feature: 'Trust & Safety', value: 'Risiko tinggi', icon: Warning, color: 'text-orange-500' },
  ],
  withKahade: [
    { feature: 'Perlindungan Pembeli', value: 'Full protection', icon: Check, color: 'text-green-500' },
    { feature: 'Perlindungan Penjual', value: 'Full protection', icon: Check, color: 'text-green-500' },
    { feature: 'Dispute Resolution', value: 'Professional mediation', icon: Check, color: 'text-green-500' },
    { feature: 'Tracking Transaksi', value: 'Real-time updates', icon: Check, color: 'text-green-500' },
    { feature: 'Refund Process', value: 'Otomatis & cepat', icon: Check, color: 'text-green-500' },
    { feature: 'Trust & Safety', value: 'Maksimal', icon: Check, color: 'text-green-500' },
  ]
};

// Feature comparison with competitors
const competitorFeatures = [
  {
    category: 'Core Features',
    features: [
      { name: 'Escrow Protection', kahade: true, competitor1: true, competitor2: true },
      { name: 'Multi-payment Methods', kahade: true, competitor1: true, competitor2: false },
      { name: '24/7 Customer Support', kahade: true, competitor1: false, competitor2: false },
      { name: 'API & Webhooks', kahade: true, competitor1: true, competitor2: false },
      { name: 'Mobile App', kahade: true, competitor1: false, competitor2: true },
    ]
  },
  {
    category: 'Security',
    features: [
      { name: '256-bit Encryption', kahade: true, competitor1: true, competitor2: true },
      { name: 'Two-Factor Authentication', kahade: true, competitor1: true, competitor2: false },
      { name: 'Biometric Auth', kahade: true, competitor1: false, competitor2: false },
      { name: 'KYC Verification', kahade: true, competitor1: true, competitor2: true },
      { name: 'Fraud Detection AI', kahade: true, competitor1: false, competitor2: false },
    ]
  },
  {
    category: 'Business Features',
    features: [
      { name: 'Bulk Transactions', kahade: true, competitor1: true, competitor2: false },
      { name: 'Invoice Management', kahade: true, competitor1: false, competitor2: false },
      { name: 'Multi-user Accounts', kahade: true, competitor1: true, competitor2: false },
      { name: 'White-label Solution', kahade: true, competitor1: false, competitor2: false },
      { name: 'Custom Integration', kahade: true, competitor1: true, competitor2: false },
    ]
  },
  {
    category: 'Support & Service',
    features: [
      { name: 'Email Support', kahade: true, competitor1: true, competitor2: true },
      { name: 'Live Chat', kahade: true, competitor1: false, competitor2: true },
      { name: 'Phone Support', kahade: true, competitor1: false, competitor2: false },
      { name: 'Dedicated Account Manager', kahade: true, competitor1: false, competitor2: false },
      { name: 'Priority Support', kahade: true, competitor1: true, competitor2: false },
    ]
  },
];

// Pricing comparison
const pricingComparison = [
  {
    provider: 'Kahade',
    transactionFee: '2.5%',
    minFee: 'Rp 2.500',
    maxFee: 'Rp 250.000',
    monthlyFee: 'Gratis - Rp 999K',
    highlight: true
  },
  {
    provider: 'Competitor A',
    transactionFee: '3.0%',
    minFee: 'Rp 5.000',
    maxFee: 'Rp 500.000',
    monthlyFee: 'Rp 500K - Rp 1.5M',
    highlight: false
  },
  {
    provider: 'Competitor B',
    transactionFee: '2.9%',
    minFee: 'Rp 3.000',
    maxFee: 'Rp 300.000',
    monthlyFee: 'Rp 299K - Rp 1.2M',
    highlight: false
  },
];

// Why choose Kahade
const whyKahade = [
  {
    icon: ShieldCheck,
    title: 'Keamanan Terjamin',
    description: 'Enkripsi 256-bit, 2FA, dan compliance dengan regulasi Indonesia',
    color: 'blue'
  },
  {
    icon: Lightning,
    title: 'Proses Tercepat',
    description: 'Pemrosesan transaksi < 12 jam dengan tracking real-time',
    color: 'yellow'
  },
  {
    icon: CreditCard,
    title: 'Biaya Paling Kompetitif',
    description: 'Fee 2.5% dengan cap Rp 250K, lebih murah dari kompetitor',
    color: 'green'
  },
  {
    icon: Headset,
    title: 'Support 24/7',
    description: 'Tim support Indonesia yang responsif via chat, email, dan phone',
    color: 'purple'
  },
  {
    icon: Globe,
    title: 'Platform Lengkap',
    description: 'Web, mobile app, dan API untuk semua kebutuhan bisnis Anda',
    color: 'teal'
  },
  {
    icon: Users,
    title: 'Dipercaya 10.000+',
    description: 'Lebih dari 10.000 pengguna aktif dan Rp 50M+ dana diamankan',
    color: 'orange'
  },
];

export default function Compare() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      teal: 'bg-teal-50 text-teal-700 border-teal-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      
      {/* HERO */}
      <section className="relative pt-28 md:pt-32 lg:pt-36 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" aria-hidden="true" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full text-sm font-medium text-black">
                <Scales className="w-4 h-4" aria-hidden="true" weight="fill" />
                Bandingkan & Pilih yang Terbaik
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-black"
            >
              Mengapa Kahade adalah pilihan terbaik?
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-neutral-600 mb-8"
            >
              Lihat perbandingan lengkap Kahade dengan metode traditional dan kompetitor.
            </motion.p>
          </div>
        </div>
      </section>

      {/* TRADITIONAL VS KAHADE */}
      <section className="py-16 md:py-20 lg:py-28 bg-neutral-50">
        <div className="container">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
            >
              Tanpa Escrow vs Dengan Kahade
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-neutral-600"
            >
              Perbedaan signifikan dalam keamanan dan trust
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Without Escrow */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-red-100 rounded-2xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-red-50 border-2 border-red-100 flex items-center justify-center">
                  <Warning className="w-7 h-7 text-red-600" aria-hidden="true" weight="fill" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">Tanpa Escrow</h3>
                  <p className="text-sm text-neutral-600">Metode Traditional</p>
                </div>
              </div>
              <div className="space-y-4">
                {traditionalComparison.withoutEscrow.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-2 bg-red-50/50 rounded-lg">
                    <item.icon className={`w-6 h-6 ${item.color} shrink-0 mt-0.5`} weight="bold" />
                    <div className="flex-1">
                      <div className="font-semibold text-black text-sm">{item.feature}</div>
                      <div className="text-sm text-neutral-600">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* With Kahade */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-green-200 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4" aria-hidden="true">
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                  <Crown className="w-4 h-4" aria-hidden="true" weight="fill" />
                  Recommended
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-green-50 border-2 border-green-200 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-green-600" aria-hidden="true" weight="fill" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">Dengan Kahade</h3>
                  <p className="text-sm text-neutral-600">Protected & Secure</p>
                </div>
              </div>
              <div className="space-y-4">
                {traditionalComparison.withKahade.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-2 bg-green-50/50 rounded-lg">
                    <item.icon className={`w-6 h-6 ${item.color} shrink-0 mt-0.5`} weight="bold" />
                    <div className="flex-1">
                      <div className="font-semibold text-black text-sm">{item.feature}</div>
                      <div className="text-sm text-neutral-600">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* COMPETITOR COMPARISON */}
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
            >
              Perbandingan dengan Kompetitor
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-neutral-600"
            >
              Feature-by-feature comparison
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto overflow-x-auto"
          >
            <div className="min-w-[800px]">
              {competitorFeatures.map((category, catIndex) => (
                <div key={category.category} className="mb-8">
                  <h3 className="text-xl font-bold text-black mb-4 px-4">{category.category}</h3>
                  <div className="bg-white border-2 border-neutral-200 rounded-2xl overflow-hidden">
                    {/* Header */}
                    {catIndex === 0 && (
                      <div className="grid grid-cols-4 bg-neutral-50 border-b-2 border-neutral-200">
                        <div className="p-4 font-bold text-black">Feature</div>
                        <div className="p-4 text-center font-bold text-black border-l-2 border-neutral-200 bg-green-50">
                          <div className="flex items-center justify-center gap-2">
                            Kahade
                            <Crown className="w-5 h-5 text-green-600" aria-hidden="true" weight="fill" />
                          </div>
                        </div>
                        <div className="p-4 text-center font-bold text-black border-l-2 border-neutral-200">
                          Competitor A
                        </div>
                        <div className="p-4 text-center font-bold text-black border-l-2 border-neutral-200">
                          Competitor B
                        </div>
                      </div>
                    )}

                    {/* Rows */}
                    {category.features.map((feature, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="p-4 text-black font-medium">{feature.name}</div>
                        <div className="p-4 text-center border-l-2 border-neutral-200 bg-green-50/30">
                          {feature.kahade ? (
                            <Check className="w-6 h-6 text-green-600 mx-auto" aria-hidden="true" weight="bold" />
                          ) : (
                            <X className="w-6 h-6 text-neutral-200 mx-auto" weight="bold" aria-hidden="true" />
                          )}
                        </div>
                        <div className="p-4 text-center border-l-2 border-neutral-200">
                          {feature.competitor1 ? (
                            <Check className="w-6 h-6 text-black mx-auto" aria-hidden="true" weight="bold" />
                          ) : (
                            <X className="w-6 h-6 text-neutral-200 mx-auto" weight="bold" aria-hidden="true" />
                          )}
                        </div>
                        <div className="p-4 text-center border-l-2 border-neutral-200">
                          {feature.competitor2 ? (
                            <Check className="w-6 h-6 text-black mx-auto" aria-hidden="true" weight="bold" />
                          ) : (
                            <X className="w-6 h-6 text-neutral-200 mx-auto" weight="bold" aria-hidden="true" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRICING COMPARISON */}
      <section className="py-16 md:py-20 lg:py-28 bg-neutral-50">
        <div className="container">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
            >
              Perbandingan Harga
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-neutral-600"
            >
              Kahade menawarkan harga paling kompetitif di industri
            </motion.p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <div className="min-w-[600px] bg-white border-2 border-neutral-200 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-5 bg-neutral-50 border-b-2 border-neutral-200">
                <div className="p-4 font-bold text-black">Provider</div>
                <div className="p-4 text-center font-bold text-black border-l-2 border-neutral-200">Transaction Fee</div>
                <div className="p-4 text-center font-bold text-black border-l-2 border-neutral-200">Min Fee</div>
                <div className="p-4 text-center font-bold text-black border-l-2 border-neutral-200">Max Fee</div>
                <div className="p-4 text-center font-bold text-black border-l-2 border-neutral-200">Monthly Fee</div>
              </div>

              {/* Rows */}
              {pricingComparison.map((provider, index) => (
                <div
                  key={provider.provider}
                  className={`grid grid-cols-5 border-b border-neutral-200 last:border-b-0 ${
                    provider.highlight ? 'bg-green-50/30' : 'hover:bg-neutral-50'
                  } transition-colors`}
                >
                  <div className="p-4 font-semibold text-black flex items-center gap-2">
                    {provider.provider}
                    {provider.highlight && <Crown className="w-5 h-5 text-green-600" aria-hidden="true" weight="fill" />}
                  </div>
                  <div className="p-4 text-center border-l-2 border-neutral-200 font-medium text-neutral-600">
                    {provider.transactionFee}
                  </div>
                  <div className="p-4 text-center border-l-2 border-neutral-200 font-medium text-neutral-600">
                    {provider.minFee}
                  </div>
                  <div className="p-4 text-center border-l-2 border-neutral-200 font-medium text-neutral-600">
                    {provider.maxFee}
                  </div>
                  <div className="p-4 text-center border-l-2 border-neutral-200 font-medium text-neutral-600">
                    {provider.monthlyFee}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE KAHADE */}
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
            >
              Mengapa Memilih Kahade?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-neutral-600 max-w-2xl mx-auto"
            >
              6 alasan utama yang membuat Kahade unggul dari kompetitor
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {whyKahade.map((reason, index) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className={`h-full ${getColorClasses(reason.color)} border-2 rounded-2xl p-8 hover:shadow-lg transition-all`}>
                  <div className={`w-16 h-16 rounded-xl ${getColorClasses(reason.color)} border-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <reason.icon className="w-8 h-8" weight="duotone" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{reason.title}</h3>
                  <p className="opacity-90">{reason.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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
              Siap memilih yang terbaik?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/70 mb-8"
            >
              Bergabung dengan ribuan pengguna yang sudah percaya pada Kahade.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/register">
                <Button className="h-14 px-8 bg-white text-black hover:bg-gray-100 rounded-xl font-semibold">
                  Mulai Sekarang
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

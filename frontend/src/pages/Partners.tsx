/*
 * KAHADE PARTNERS & INTEGRATIONS PAGE
 * 
 * - Payment gateway partners
 * - Bank partners  
 * - Integration capabilities
 * - API documentation preview
 * - Partner program
 */

import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Bank, CreditCard, QrCode, Wallet, Globe,
  ArrowRight, Check, Code, Plug, Handshake,
  Lightning, ShieldCheck, ChartLineUp, Users,
  FileCode, Broadcast, Key, BookOpen
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Payment partners
const paymentPartners = [
  { name: 'Midtrans', type: 'Payment Gateway', logo: '/images/partners/midtrans.svg' },
  { name: 'Xendit', type: 'Payment Gateway', logo: '/images/partners/xendit.svg' },
  { name: 'Doku', type: 'Payment Gateway', logo: '/images/partners/doku.svg' },
  { name: 'OVO', type: 'E-Wallet', logo: '/images/partners/ovo.svg' },
  { name: 'GoPay', type: 'E-Wallet', logo: '/images/partners/gopay.svg' },
  { name: 'Dana', type: 'E-Wallet', logo: '/images/partners/dana.svg' },
  { name: 'ShopeePay', type: 'E-Wallet', logo: '/images/partners/shopeepay.svg' },
  { name: 'LinkAja', type: 'E-Wallet', logo: '/images/partners/linkaja.svg' },
];

// Bank partners
const bankPartners = [
  { name: 'BCA', fullName: 'Bank Central Asia' },
  { name: 'Mandiri', fullName: 'Bank Mandiri' },
  { name: 'BNI', fullName: 'Bank Negara Indonesia' },
  { name: 'BRI', fullName: 'Bank Rakyat Indonesia' },
  { name: 'CIMB Niaga', fullName: 'CIMB Niaga' },
  { name: 'Permata', fullName: 'Bank Permata' },
];

// Integration features
const integrationFeatures = [
  {
    icon: Code,
    title: 'RESTful API',
    description: 'Modern REST API dengan comprehensive documentation',
    details: 'JSON-based, versioned, rate-limited'
  },
  {
    icon: Broadcast,
    title: 'Webhooks',
    description: 'Real-time notifications untuk setiap event',
    details: 'Retry logic, signature verification'
  },
  {
    icon: Key,
    title: 'API Keys',
    description: 'Secure authentication dengan test & live keys',
    details: 'Rotating keys, IP whitelisting'
  },
  {
    icon: FileCode,
    title: 'SDK & Libraries',
    description: 'Official SDK untuk berbagai bahasa',
    details: 'PHP, Node.js, Python, Java, Go'
  },
  {
    icon: Plug,
    title: 'Pre-built Plugins',
    description: 'Plugin ready untuk platform populer',
    details: 'WordPress, Shopify, WooCommerce'
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Detailed docs dengan code examples',
    details: 'Interactive API explorer'
  },
];

// Partner benefits
const partnerBenefits = [
  'Revenue sharing yang kompetitif',
  'Dedicated partner success manager',
  'Priority technical support',
  'Co-marketing opportunities',
  'Early access to new features',
  'Partner portal & dashboard',
];

export default function Partners() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      {/* HERO */}
      <section className="relative pt-28 md:pt-32 lg:pt-36 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" aria-hidden="true" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full text-sm font-medium text-foreground">
                <Handshake className="w-4 h-4" aria-hidden="true" weight="fill" />
                Partners & Integrations
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-foreground"
            >
              Terintegrasi dengan ekosistem yang Anda gunakan
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground mb-8"
            >
              Kahade bekerja seamless dengan payment gateway, bank, dan tools favorit Anda. Plus API yang powerful untuk custom integration.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <Button className="h-14 px-8 bg-black text-white hover:bg-black/90 rounded-xl font-semibold">
                  Mulai Integrasi
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
              <Button className="h-14 px-8 border-2 border-black/20 hover:border-neutral-900 hover:bg-black/5 rounded-xl font-semibold">
                <BookOpen className="mr-2 w-5 h-5" aria-hidden="true" weight="bold" />
                Lihat API Docs
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PAYMENT PARTNERS */}
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Payment Gateway Partners
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Mendukung semua metode pembayaran populer di Indonesia
            </motion.p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {paymentPartners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-muted border-2 border-border rounded-xl p-6 hover:border-neutral-900 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-lg bg-card border border-border flex items-center justify-center mb-3">
                  <CreditCard className="w-8 h-8 text-foreground" aria-hidden="true" weight="duotone" />
                </div>
                <div className="font-bold text-foreground mb-1">{partner.name}</div>
                <div className="text-xs text-muted-foreground">{partner.type}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BANK PARTNERS */}
      <section className="py-16 md:py-20 lg:py-28 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Bank Partners
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Transfer bank dari dan ke semua bank besar di Indonesia
            </motion.p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {bankPartners.map((bank, index) => (
              <motion.div
                key={bank.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6 hover:border-neutral-900 transition-colors flex flex-col items-center justify-center text-center"
              >
                <div className="w-14 h-14 rounded-lg bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-3">
                  <Bank className="w-7 h-7 text-blue-600" aria-hidden="true" weight="duotone" />
                </div>
                <div className="font-bold text-foreground text-sm">{bank.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATION FEATURES */}
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Developer-Friendly Integration
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              API yang powerful dan mudah digunakan untuk integrasi custom
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {integrationFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-card border-2 border-border rounded-2xl p-6 hover:border-neutral-900 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                  <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" weight="bold" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-3">{feature.description}</p>
                  <p className="text-sm text-black/60 italic">{feature.details}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* API Example */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="bg-neutral-900 rounded-2xl p-8 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm text-white/60">API Example</span>
              </div>
              <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                <code>{`// Create escrow transaction
const transaction = await kahade.transactions.create({
  amount: 5000000,
  currency: 'IDR',
  buyer: { email: 'buyer@example.com' },
  seller: { email: 'seller@example.com' },
  description: 'Website Development Project',
  terms: 'Payment released upon project completion'
});`}</code>
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PARTNER PROGRAM */}
      <section className="py-16 md:py-20 lg:py-28 bg-muted">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Jadi Partner Kahade
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Gabung dengan partner program kami dan dapatkan revenue sharing serta dukungan penuh untuk grow bersama.
                </p>
                <ul className="space-y-4 mb-8">
                  {partnerBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-6 h-6 text-foreground" aria-hidden="true" weight="bold" />
                      <span className="text-foreground font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact">
                  <Button className="h-14 px-8 bg-black text-white hover:bg-black/90 rounded-xl font-semibold">
                    Apply as Partner
                    <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-6"
              >
                {[
                  { icon: Users, value: '200+', label: 'Active Partners' },
                  { icon: ChartLineUp, value: 'Rp 2M+', label: 'Monthly Revenue Share' },
                  { icon: ShieldCheck, value: '99.9%', label: 'API Uptime' },
                  { icon: Lightning, value: '<100ms', label: 'Avg Response Time' },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className="bg-card border-2 border-border rounded-2xl p-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center mx-auto mb-3">
                      <stat.icon className="w-6 h-6 text-white" weight="bold" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
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
              Siap untuk integrasi?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/70 mb-8"
            >
              Dapatkan API key dan mulai integrasi dalam hitungan menit.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <Button className="h-14 px-8 bg-card text-foreground hover:bg-gray-100 rounded-xl font-semibold">
                  Get API Keys
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
              <Button className="h-14 px-8 border-2 border-white/30 bg-transparent text-white hover:bg-white/10 rounded-xl font-semibold">
                <BookOpen className="mr-2 w-5 h-5" aria-hidden="true" weight="bold" />
                View Documentation
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

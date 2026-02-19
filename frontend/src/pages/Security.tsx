/*
 * KAHADE SECURITY & TRUST PAGE
 * 
 * Comprehensive security information:
 * - Security infrastructure
 * - Compliance & certifications
 * - Data protection
 * - Trust badges
 * - Security measures
 */

import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Lock, Fingerprint, Eye, Certificate,
  Bank, Gavel, Broadcast, FileText, UserCircle,
  Lightning, Bell, Key, Database, CloudCheck,
  Detective, Scales, Clock, Check, ArrowRight,
  IdentificationBadge, Warning, ChartLineUp, Vault
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import Footer from '@/components/layout/Footer';

// Security features
const securityFeatures = [
  {
    icon: Lock,
    title: 'Enkripsi End-to-End',
    description: 'Semua data dienkripsi dengan AES-256 saat transit dan penyimpanan.',
    details: 'Military-grade encryption untuk melindungi informasi sensitif Anda'
  },
  {
    icon: Fingerprint,
    title: 'Autentikasi Multi-Faktor',
    description: 'Lapisan keamanan tambahan dengan 2FA/MFA untuk akses akun.',
    details: 'SMS, Email, Authenticator app, dan biometrik'
  },
  {
    icon: Eye,
    title: 'Monitoring 24/7',
    description: 'Sistem monitoring real-time untuk mendeteksi aktivitas mencurigakan.',
    details: 'Tim keamanan siaga 24/7 memantau setiap transaksi'
  },
  {
    icon: Database,
    title: 'Backup Berkala',
    description: 'Data Anda di-backup secara otomatis ke multiple data centers.',
    details: 'Recovery point objective (RPO) < 1 jam'
  },
  {
    icon: Detective,
    title: 'Fraud Detection',
    description: 'AI-powered fraud detection untuk mencegah transaksi mencurigakan.',
    details: 'Machine learning model yang terus belajar dari pola penipuan'
  },
  {
    icon: CloudCheck,
    title: 'Infrastructure Security',
    description: 'Hosted di cloud provider tier-1 dengan sertifikasi keamanan.',
    details: 'AWS/GCP dengan ISO 27001, SOC 2, dan PCI DSS'
  },
];

// Compliance badges
const complianceBadges = [
  {
    name: 'Bank Indonesia',
    abbr: 'BI',
    icon: Bank,
    description: 'Terdaftar dan diawasi oleh Bank Indonesia',
    color: 'blue'
  },
  {
    name: 'PPATK',
    abbr: 'PPATK',
    icon: Certificate,
    description: 'Compliant dengan regulasi anti pencucian uang',
    color: 'green'
  },
  {
    name: 'Kemenkumham',
    abbr: 'Kemenkumham',
    icon: Gavel,
    description: 'Badan hukum resmi terdaftar',
    color: 'purple'
  },
  {
    name: 'Kominfo',
    abbr: 'Kominfo',
    icon: Broadcast,
    description: 'Sistem elektronik terdaftar PSE',
    color: 'orange'
  },
];

// Data protection measures
const dataProtection = [
  {
    title: 'Enkripsi Data',
    items: [
      'AES-256 encryption untuk data at rest',
      'TLS 1.3 untuk data in transit',
      'End-to-end encryption untuk data sensitif',
      'Hardware security modules (HSM)'
    ]
  },
  {
    title: 'Kontrol Akses',
    items: [
      'Role-based access control (RBAC)',
      'Least privilege principle',
      'Session management yang ketat',
      'IP whitelisting untuk admin'
    ]
  },
  {
    title: 'Audit & Logging',
    items: [
      'Comprehensive audit trails',
      'Immutable transaction logs',
      'Real-time alerting',
      'Regular security audits'
    ]
  },
  {
    title: 'Privacy & GDPR',
    items: [
      'Data minimization',
      'Right to be forgotten',
      'Data portability',
      'Privacy by design'
    ]
  },
];

// Security stats
const securityStats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '<30s', label: 'Fraud Detection' },
  { value: '256-bit', label: 'Encryption' },
  { value: '24/7', label: 'Security Monitoring' },
];

// Incident response
const incidentResponse = [
  {
    step: '1',
    title: 'Detection',
    description: 'Automated systems detect potential security incidents',
    time: '< 1 minute'
  },
  {
    step: '2',
    title: 'Analysis',
    description: 'Security team analyzes the threat and determines severity',
    time: '< 5 minutes'
  },
  {
    step: '3',
    title: 'Containment',
    description: 'Immediate action to contain and isolate the threat',
    time: '< 15 minutes'
  },
  {
    step: '4',
    title: 'Resolution',
    description: 'Fix the issue and restore normal operations',
    time: '< 1 hour'
  },
  {
    step: '5',
    title: 'Post-Mortem',
    description: 'Analyze incident and implement preventive measures',
    time: '< 24 hours'
  },
];

export default function Security() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      
      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-28 md:pt-32 lg:pt-36 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-blue-100 to-transparent rounded-full blur-3xl opacity-40" aria-hidden="true" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-100 rounded-full text-sm font-medium text-blue-700">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" weight="fill" />
                Keamanan & Kepercayaan
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-black"
            >
              Keamanan tingkat enterprise untuk melindungi transaksi Anda
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto"
            >
              Kami menggunakan teknologi keamanan terdepan dan compliant dengan regulasi untuk menjaga data dan dana Anda tetap aman.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/register">
                <Button className="h-14 px-8 bg-black text-white hover:bg-black/90 rounded-xl font-semibold text-base">
                  Mulai Transaksi Aman
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== SECURITY STATS ========== */}
      <section className="py-12 md:py-16 border-y border-neutral-200 bg-neutral-50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
            {securityStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-neutral-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECURITY FEATURES ========== */}
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
            >
              Infrastruktur Keamanan Berlapis
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-neutral-600 max-w-2xl mx-auto"
            >
              Multiple layers of security untuk memastikan dana dan data Anda terlindungi
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-white border-2 border-neutral-200 rounded-2xl p-6 hover:border-neutral-900 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300">
                  <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" weight="bold" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
                  <p className="text-neutral-600 mb-3 leading-relaxed">{feature.description}</p>
                  <p className="text-sm text-black/60 italic">{feature.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMPLIANCE SECTION ========== */}
      <section className="py-16 md:py-20 lg:py-28 bg-neutral-50">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
            >
              Compliance & Regulasi
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-neutral-600 max-w-2xl mx-auto"
            >
              Kami beroperasi dengan lisensi resmi dan compliant dengan regulasi Indonesia
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {complianceBadges.map((badge, index) => {
              const colorClasses = {
                blue: 'bg-blue-50 border-blue-200 text-blue-700',
                green: 'bg-green-50 border-green-200 text-green-700',
                purple: 'bg-purple-50 border-purple-200 text-purple-700',
                orange: 'bg-orange-50 border-orange-200 text-orange-700',
              }[badge.color];

              return (
                <motion.div
                  key={badge.abbr}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`${colorClasses} border-2 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow`}
                >
                  <div className={`w-16 h-16 rounded-xl ${colorClasses} flex items-center justify-center mx-auto mb-4`}>
                    <badge.icon className="w-8 h-8" weight="duotone" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{badge.name}</h3>
                  <p className="text-sm opacity-80">{badge.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Compliance Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="bg-white border-2 border-neutral-200 rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Certificate className="w-6 h-6 text-blue-600" aria-hidden="true" weight="duotone" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-2">Komitmen Kepatuhan</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Kahade beroperasi sesuai dengan UU ITE, peraturan Bank Indonesia tentang layanan keuangan digital, 
                    dan regulasi PPATK untuk pencegahan pencucian uang. Kami secara berkala menjalani audit eksternal 
                    dan update sistem untuk memastikan compliance berkelanjutan.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== DATA PROTECTION ========== */}
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
            >
              Perlindungan Data & Privacy
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-neutral-600 max-w-2xl mx-auto"
            >
              Protokol keamanan komprehensif untuk melindungi informasi pribadi Anda
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {dataProtection.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-50 border-2 border-neutral-200 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-black mb-4">{category.title}</h3>
                <ul className="space-y-3">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-black shrink-0 mt-0.5" aria-hidden="true" weight="bold" />
                      <span className="text-sm text-neutral-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== INCIDENT RESPONSE ========== */}
      <section className="py-16 md:py-20 lg:py-28 bg-neutral-50">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
            >
              Security Incident Response
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-neutral-600 max-w-2xl mx-auto"
            >
              Protokol response cepat jika terjadi insiden keamanan
            </motion.p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Desktop: Horizontal Timeline */}
            <div className="hidden md:block">
              <div className="grid grid-cols-5 gap-4">
                {incidentResponse.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative text-center"
                  >
                    {index < incidentResponse.length - 1 && (
                      <div className="absolute top-8 left-1/2 w-full h-0.5 bg-neutral-200" aria-hidden="true" />
                    )}
                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-xl bg-black text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        {step.step}
                      </div>
                      <h3 className="font-bold text-black mb-2">{step.title}</h3>
                      <p className="text-sm text-neutral-600 mb-2">{step.description}</p>
                      <div className="inline-block px-3 py-1 bg-black/5 rounded-full text-xs font-semibold text-black">
                        {step.time}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile: Vertical Timeline */}
            <div className="md:hidden space-y-6">
              {incidentResponse.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    {index < incidentResponse.length - 1 && (
                      <div className="w-0.5 h-full bg-neutral-200 mt-2 min-h-[60px]" />
                    )}
                  </div>
                  <div className="flex-1 pt-2 pb-4">
                    <h3 className="font-bold text-black mb-1">{step.title}</h3>
                    <p className="text-sm text-neutral-600 mb-2">{step.description}</p>
                    <div className="inline-block px-3 py-1 bg-black/5 rounded-full text-xs font-semibold text-black">
                      {step.time}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECURITY BEST PRACTICES ========== */}
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
              >
                Tips Keamanan untuk Pengguna
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-neutral-600"
              >
                Best practices untuk menjaga keamanan akun Anda
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-4 md:gap-6"
            >
              {[
                {
                  icon: Key,
                  title: 'Gunakan Password Kuat',
                  tips: 'Minimal 12 karakter dengan kombinasi huruf, angka, dan simbol'
                },
                {
                  icon: Fingerprint,
                  title: 'Aktifkan 2FA',
                  tips: 'Tambah lapisan keamanan dengan autentikasi dua faktor'
                },
                {
                  icon: Eye,
                  title: 'Monitor Aktivitas',
                  tips: 'Cek activity log secara berkala untuk transaksi mencurigakan'
                },
                {
                  icon: Warning,
                  title: 'Waspada Phishing',
                  tips: 'Jangan klik link mencurigakan atau share password'
                },
                {
                  icon: Bell,
                  title: 'Aktifkan Notifikasi',
                  tips: 'Terima alert real-time untuk setiap aktivitas akun'
                },
                {
                  icon: UserCircle,
                  title: 'Update Profile',
                  tips: 'Pastikan informasi kontak selalu up-to-date'
                },
              ].map((tip, index) => (
                <div
                  key={tip.title}
                  className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-6 hover:border-neutral-900 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center shrink-0">
                      <tip.icon className="w-6 h-6 text-white" weight="bold" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black mb-1">{tip.title}</h3>
                      <p className="text-sm text-neutral-600">{tip.tips}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-16 md:py-20 lg:py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" aria-hidden="true" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6"
            >
              <ShieldCheck className="w-8 h-8 text-white" aria-hidden="true" weight="duotone" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
            >
              Transaksi aman dimulai di sini
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/70 mb-8 max-w-2xl mx-auto"
            >
              Bergabung dengan ribuan pengguna yang mempercayai Kahade untuk melindungi transaksi mereka.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <Button className="h-14 px-8 bg-white text-black hover:bg-gray-100 rounded-xl font-semibold">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="h-14 px-8 border-2 border-white/30 bg-transparent text-white hover:bg-white/10 rounded-xl font-semibold">
                  Hubungi Security Team
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

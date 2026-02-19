/*
 * KAHADE ABOUT PAGE — AUDIT FIX v3.0
 *
 * Perbaikan:
 * - Tambah entitas hukum resmi: PT Kawal Hak Dengan Aman
 * - Konsisten dengan design system (bg-background, section-padding, badge)
 * - Hapus hardcoded bg-card
 * - Informasi kontak yang benar
 */

import { motion } from 'framer-motion';
import {
  ShieldCheck, Target, Eye, Heart, Globe, Lightning, ArrowRight,
  Users, Trophy, Rocket, Handshake, Buildings, MapPin, Envelope
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

const values = [
  {
    icon: ShieldCheck,
    title: 'Keamanan Utama',
    description: 'Keamanan adalah prioritas tertinggi kami. Kami menerapkan enkripsi setara bank dan autentikasi multi-faktor untuk melindungi setiap transaksi.'
  },
  {
    icon: Eye,
    title: 'Transparansi Penuh',
    description: 'Kami percaya pada keterbukaan penuh. Setiap transaksi dilacak dan terlihat oleh semua pihak terkait tanpa penyembunyian biaya.'
  },
  {
    icon: Heart,
    title: 'Membangun Kepercayaan',
    description: 'Kepercayaan adalah fondasi setiap hubungan transaksi. Kami memfasilitasi kepercayaan antara pihak yang belum saling mengenal.'
  },
  {
    icon: Lightning,
    title: 'Inovasi Berkelanjutan',
    description: 'Kami terus berinovasi untuk menghadirkan solusi terbaik dan selalu selangkah di depan ancaman baru dalam ekosistem digital.'
  }
];

const milestones = [
  { year: '2023', title: 'Perusahaan Didirikan', description: 'PT Kawal Hak Dengan Aman (Kahade) didirikan dengan visi menjadi platform escrow paling tepercaya di Indonesia.' },
  { year: '2024 Q1', title: 'Peluncuran Platform', description: 'Meluncurkan platform escrow dengan fitur keamanan lengkap dan dukungan multi-pembayaran Indonesia.' },
  { year: '2024 Q3', title: '10.000 Pengguna', description: 'Mencapai tonggak 10.000 pengguna aktif dan Rp 50M+ transaksi yang diamankan.' },
  { year: '2025', title: 'Ekspansi & Inovasi', description: 'Meluncurkan aplikasi mobile, fitur resolusi sengketa AI, dan sistem reward pengguna.' }
];

const stats = [
  { value: '10K+', label: 'Pengguna Aktif', icon: Users },
  { value: 'Rp 50M+', label: 'Total Diamankan', icon: ShieldCheck },
  { value: '99.9%', label: 'Ketersediaan Sistem', icon: Rocket },
  { value: '4.9/5', label: 'Penilaian Pengguna', icon: Trophy },
];

const team = [
  { name: 'Ahmad Rizki', role: 'CEO & Pendiri Bersama', avatar: 'AR' },
  { name: 'Sarah Wijaya', role: 'CTO & Pendiri Bersama', avatar: 'SW' },
  { name: 'Michael Chen', role: 'Kepala Keamanan', avatar: 'MC' },
  { name: 'Emily Rodriguez', role: 'Kepala Produk', avatar: 'ER' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="section-padding-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--muted)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" aria-hidden="true" />
        <div className="container relative z-10">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <span className="badge badge-secondary mb-4 inline-block">Tentang Kami</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Membangun Kepercayaan<br />
              <span className="relative inline-block">
                di Setiap Transaksi
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute bottom-1 left-0 right-0 h-3 bg-black/10 -z-0 origin-left"
                />
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Kahade (PT Kawal Hak Dengan Aman) adalah platform escrow peer-to-peer yang hadir
              untuk menghilangkan risiko penipuan dan membangun ekosistem transaksi digital
              yang aman, transparan, dan dapat dipercaya di Indonesia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={staggerItem} className="card p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-foreground" weight="duotone" aria-hidden="true" />
                <p className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div {...fadeInUp}>
              <span className="badge badge-secondary mb-4 inline-block">Misi Kami</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Setiap Orang Berhak atas Transaksi yang Aman
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Di era belanja dan jual-beli online yang berkembang pesat, penipuan menjadi ancaman nyata.
                Kami hadir untuk memastikan dana pembeli terlindungi hingga barang atau jasa benar-benar
                diterima sesuai perjanjian.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Dengan teknologi escrow yang transparan dan sistem resolusi sengketa yang adil,
                kami membangun ekosistem transaksi digital di mana kepercayaan bukan lagi kemewahan,
                melainkan standar.
              </p>
            </motion.div>
            <motion.div
              {...fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {values.map((val) => (
                <div key={val.title} className="card p-5 hover:border-foreground/20 transition-colors">
                  <val.icon className="w-6 h-6 mb-3" weight="duotone" aria-hidden="true" />
                  <h3 className="font-semibold mb-2 text-sm">{val.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{val.description}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-12 max-w-2xl mx-auto">
            <span className="badge badge-secondary mb-4 inline-block">Perjalanan Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold">Tonggak Sejarah Kahade</h2>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" aria-hidden="true" />
              <div className="space-y-8">
                {milestones.map((m, i) => (
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className={`relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-foreground border-4 border-background -translate-x-1/2 mt-1" aria-hidden="true" />
                    <div className={`pl-16 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <span className="badge badge-primary mb-2 inline-block">{m.year}</span>
                      <h3 className="font-bold text-lg mb-2">{m.title}</h3>
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                    </div>
                    <div className="hidden md:block md:w-1/2" aria-hidden="true" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-12 max-w-2xl mx-auto">
            <span className="badge badge-secondary mb-4 inline-block">Tim Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Orang-Orang di Balik Kahade</h2>
            <p className="text-muted-foreground">
              Tim kami terdiri dari para profesional berpengalaman di bidang fintech, keamanan, dan produk digital.
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {team.map((member) => (
              <motion.div key={member.name} variants={staggerItem} className="card p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold">{member.avatar}</span>
                </div>
                <h3 className="font-semibold mb-1">{member.name}</h3>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Legal Info */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeInUp} className="card card-premium p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Buildings className="w-5 h-5" weight="duotone" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3">Informasi Perusahaan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-wrap gap-x-3">
                      <span className="text-muted-foreground">Nama Badan Hukum:</span>
                      <span className="font-semibold">PT Kawal Hak Dengan Aman</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 items-start">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" weight="duotone" aria-hidden="true" />
                      <span className="text-muted-foreground">
                        Gg. Abot, Cihideung Udik, Kec. Ciampea, Kabupaten Bogor, Jawa Barat 16620
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 items-center">
                      <Envelope className="w-4 h-4 text-muted-foreground flex-shrink-0" weight="duotone" aria-hidden="true" />
                      <a href="mailto:halo@kahade.id" className="hover:text-foreground transition-colors">halo@kahade.id</a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container">
          <motion.div {...fadeInUp} className="card card-premium p-8 md:p-12 text-center max-w-3xl mx-auto">
            <Handshake className="w-12 h-12 mx-auto mb-6" weight="duotone" aria-hidden="true" />
            <h2 className="text-3xl font-bold mb-4">Bergabung dengan Komunitas Kahade</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Mulai bertransaksi dengan aman hari ini bersama ribuan pengguna yang telah mempercayakan
              transaksi mereka kepada Kahade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="block block">
                <Button className="btn-primary btn-lg">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" weight="bold" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/contact" className="block block">
                <Button variant="outline" className="btn-lg">
                  Hubungi Kami
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

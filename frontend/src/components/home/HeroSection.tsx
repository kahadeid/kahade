import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  Sparkle, ArrowRight, Play, ShieldCheck,
  IdentificationBadge, Clock, Scales, ChartLineUp
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/ui-utils';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { compliancePartners } from './HomeData';

export default function HeroSection() {
  return (
    <section className="section-padding-lg relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--muted)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" aria-hidden="true" />
      <div className="absolute -top-20 right-0 w-[320px] md:w-[520px] lg:w-[720px] h-[320px] md:h-[520px] lg:h-[720px] bg-gradient-radial from-muted to-transparent rounded-full blur-3xl opacity-70" aria-hidden="true" />
      <div className="absolute -bottom-24 left-0 w-[240px] md:w-[360px] lg:w-[520px] h-[240px] md:h-[360px] lg:h-[520px] bg-gradient-radial from-muted to-transparent rounded-full blur-3xl opacity-40" aria-hidden="true" />
      
      <div className="container relative z-10">
        <motion.div
          className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center px-4"
          {...staggerContainer}
        >
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div {...fadeInUp} className="mb-6 flex justify-center lg:justify-start">
              <span className="badge badge-secondary inline-flex items-center gap-2">
                <Sparkle className="w-4 h-4" aria-hidden="true" weight="fill" />
                Dipercaya 10.000+ pengguna
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold leading-[1.08] mb-6 tracking-tight"
            >
              <span className="block">Mengurangi Penipuan.</span>
              <span className="block mt-1 md:mt-2 relative w-fit mx-auto lg:mx-0">
                <span className="relative z-10">Meningkatkan Kepercayaan.</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute bottom-1 md:bottom-2 left-0 right-0 h-3 md:h-4 bg-black/10 -z-0 origin-left"
                />
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              {...fadeInUp}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-xl leading-relaxed mx-auto lg:mx-0"
            >
              <span className="hidden md:inline">
                Kahade menahan dana sementara, memastikan barang/jasa sesuai, lalu melepas pembayaran saat kedua pihak setuju. Aman, transparan, dan cepat.
              </span>
              <span className="hidden sm:inline md:hidden">
                Kahade menahan dana hingga barang/jasa sesuai, lalu melepas pembayaran saat kedua pihak setuju. Aman dan transparan.
              </span>
              <span className="inline sm:hidden">
                Dana ditahan hingga transaksi selesai. Aman, transparan, cepat.
              </span>
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeInUp} className="flex flex-col sm:flex-row gap-4 sm:gap-4 items-center justify-center lg:justify-start w-full">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="btn-primary btn-lg w-full sm:w-auto">
                  Mulai Transaksi
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
              <Link href="/how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" className="btn-lg w-full sm:w-auto">
                  <Play className="mr-2 w-5 h-5" aria-hidden="true" weight="fill" />
                  Cara Kerjanya
                </Button>
              </Link>
            </motion.div>

            {/* Trust Line */}
            <motion.div {...fadeInUp} className="mt-8">
              <p className="text-sm text-muted-foreground mb-4 text-center lg:text-left">
                Kepatuhan & keamanan adalah prioritas.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-4">
                {compliancePartners.map((partner) => (
                  <div
                    key={partner.abbr}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border hover:border-foreground/20 transition-colors"
                    title={partner.name}
                  >
                    <partner.fallbackIcon className="w-4 h-4 text-muted-foreground" weight="duotone" aria-hidden="true" />
                    <span className="text-xs font-medium">{partner.abbr}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Hero Preview Card */}
          <motion.div
            {...fadeInUp}
            className="relative"
          >
            <div className="absolute -top-6 -left-6 h-24 w-24 rounded-3xl bg-muted blur-2xl" aria-hidden="true" />
            <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-muted blur-2xl" aria-hidden="true" />
            <div className="card card-premium relative p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div className="badge badge-primary inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" weight="fill" />
                  Escrow Terlindungi
                </div>
                <span className="text-xs text-muted-foreground">Pratinjau Langsung</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Transaksi #KHD-2451</p>
                      <p className="text-xs text-muted-foreground">Verifikasi pembeli ↔ penjual</p>
                    </div>
                    <span className="badge badge-success">
                      Aktif
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Jumlah</span>
                    <span className="font-semibold">Rp 12.500.000</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Penahanan</span>
                    <span className="font-semibold">Brankas Escrow</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Pengguna Terverifikasi', value: '98%', icon: IdentificationBadge },
                    { label: 'Rata-rata Pencairan', value: '< 12 jam', icon: Clock },
                    { label: 'Rasio Sengketa', value: '0,8%', icon: Scales },
                    { label: 'Dana Diamankan', value: 'Rp 50M+', icon: ChartLineUp },
                  ].map((stat) => (
                    <div key={stat.label} className="card p-4">
                      <stat.icon className="w-5 h-5 mb-3" weight="duotone" aria-hidden="true" />
                      <p className="text-lg font-semibold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

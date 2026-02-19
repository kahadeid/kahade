/*
 * KAHADE USE CASES PAGE
 * 
 * Industry-specific use cases:
 * - Freelancers & Agencies
 * - E-commerce & Marketplace
 * - Real Estate
 * - Digital Products
 * - Services
 * - International Trade
 */

import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Package, Users, House, Laptop, Wrench, Globe,
  ShieldCheck, Lightning, CheckCircle, ArrowRight,
  ChartLineUp, Star, Briefcase, ShoppingCart,
  FileText, CreditCard, UserCircle
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Use cases data
const useCases = [
  {
    icon: Laptop,
    title: 'Freelancers & Agencies',
    description: 'Terima pembayaran proyek dengan aman',
    color: 'blue',
    benefits: [
      'Dana ditahan sampai deliverables selesai',
      'Milestone-based payments',
      'Dispute resolution untuk scope changes',
      'Professional invoice & receipts'
    ],
    stats: {
      users: '5.000+',
      avgTransaction: 'Rp 8.5M',
      satisfaction: '98%'
    },
    testimonial: {
      name: 'Andi Prasetyo',
      role: 'Web Developer Freelance',
      quote: 'Kahade mengubah cara saya menerima pembayaran. Client lebih percaya dan saya lebih tenang.'
    }
  },
  {
    icon: ShoppingCart,
    title: 'E-commerce & Marketplace',
    description: 'Lindungi transaksi jual-beli online',
    color: 'green',
    benefits: [
      'Buyer protection untuk barang tidak sesuai',
      'Seller protection dari fraud',
      'Automatic fund release setelah konfirmasi',
      'Integration dengan toko online'
    ],
    stats: {
      users: '3.000+',
      avgTransaction: 'Rp 2.5M',
      satisfaction: '97%'
    },
    testimonial: {
      name: 'Sarah Wijaya',
      role: 'Owner Toko Fashion Online',
      quote: 'Sejak pakai Kahade, dispute berkurang 80%. Customers jadi lebih percaya.'
    }
  },
  {
    icon: House,
    title: 'Real Estate',
    description: 'Transaksi properti yang aman',
    color: 'purple',
    benefits: [
      'Escrow untuk booking fee & DP',
      'Document verification',
      'Large transaction support',
      'Legal compliance check'
    ],
    stats: {
      users: '800+',
      avgTransaction: 'Rp 85M',
      satisfaction: '99%'
    },
    testimonial: {
      name: 'Michael Chen',
      role: 'Property Agent',
      quote: 'High-value transactions jadi lebih smooth. Client investor juga lebih yakin.'
    }
  },
  {
    icon: FileText,
    title: 'Digital Products',
    description: 'Jual produk digital dengan perlindungan',
    color: 'orange',
    benefits: [
      'Instant digital delivery setelah payment',
      'License key management',
      'Refund protection',
      'Subscription billing'
    ],
    stats: {
      users: '2.500+',
      avgTransaction: 'Rp 450K',
      satisfaction: '96%'
    },
    testimonial: {
      name: 'Dewi Lestari',
      role: 'Course Creator',
      quote: 'Perfect untuk jual online course. Payment processor + escrow dalam satu platform.'
    }
  },
  {
    icon: Wrench,
    title: 'Services & Consulting',
    description: 'Booking layanan jasa profesional',
    color: 'red',
    benefits: [
      'Retainer & deposit management',
      'Time-based billing',
      'Service level agreement',
      'Client satisfaction guarantee'
    ],
    stats: {
      users: '1.800+',
      avgTransaction: 'Rp 12M',
      satisfaction: '98%'
    },
    testimonial: {
      name: 'Budi Santoso',
      role: 'Business Consultant',
      quote: 'Retainer fee jadi lebih professional. Client appreciate transparansinya.'
    }
  },
  {
    icon: Globe,
    title: 'International Trade',
    description: 'Transaksi ekspor-impor lintas negara',
    color: 'teal',
    benefits: [
      'Multi-currency support',
      'Customs clearance coordination',
      'Shipping verification',
      'International compliance'
    ],
    stats: {
      users: '500+',
      avgTransaction: 'Rp 150M',
      satisfaction: '99%'
    },
    testimonial: {
      name: 'Lisa Tan',
      role: 'Import/Export Trader',
      quote: 'Game changer untuk B2B international. Supplier overseas juga trust sistem escrow.'
    }
  },
];

// Success stories
const successStories = [
  {
    company: 'TechStartup Indonesia',
    industry: 'Software Development',
    challenge: 'Kesulitan mendapat kepercayaan client enterprise untuk project besar',
    solution: 'Menggunakan Kahade escrow untuk milestone-based payment',
    results: [
      'Deal value naik 3x lipat',
      'Client retention 95%',
      'Close rate meningkat 60%'
    ],
    icon: Laptop
  },
  {
    company: 'MarketplaceXYZ',
    industry: 'E-commerce Platform',
    challenge: 'Dispute rate tinggi antara buyer dan seller',
    solution: 'Integrasi Kahade untuk semua high-value transactions',
    results: [
      'Dispute turun 75%',
      'GMV naik 120%',
      'Trust score meningkat'
    ],
    icon: ShoppingCart
  },
  {
    company: 'PropertyHub',
    industry: 'Real Estate',
    challenge: 'DP sering bermasalah saat deal cancel',
    solution: 'Escrow untuk booking fee dengan clear terms',
    results: [
      'Zero dispute dalam 6 bulan',
      'Transaction volume +200%',
      '5-star rating konsisten'
    ],
    icon: House
  },
];

export default function UseCases() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      teal: 'bg-teal-50 text-teal-700 border-teal-200',
    };
    return colors[color as keyof typeof colors];
  };

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
                <Briefcase className="w-4 h-4" aria-hidden="true" weight="fill" />
                Solusi untuk Setiap Industri
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-foreground"
            >
              Kahade untuk bisnis Anda
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground mb-8"
            >
              Dari freelancer hingga enterprise, temukan bagaimana Kahade membantu bisnis di berbagai industri melakukan transaksi lebih aman.
            </motion.p>
          </div>
        </div>
      </section>

      {/* USE CASES GRID */}
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border-2 border-border rounded-2xl p-8 hover:border-neutral-900 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-xl ${getColorClasses(useCase.color)} border-2 flex items-center justify-center`}>
                    <useCase.icon className="w-8 h-8" weight="duotone" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{useCase.title}</h3>
                    <p className="text-muted-foreground">{useCase.description}</p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Keuntungan:</h4>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-foreground shrink-0 mt-0.5" aria-hidden="true" weight="fill" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="flex gap-2 mb-6 p-3 bg-muted rounded-xl">
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{useCase.stats.users}</div>
                    <div className="text-xs text-muted-foreground">Pengguna</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{useCase.stats.avgTransaction}</div>
                    <div className="text-xs text-muted-foreground">Avg. Transaksi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{useCase.stats.satisfaction}</div>
                    <div className="text-xs text-muted-foreground">Satisfaction</div>
                  </div>
                </div>

                {/* Testimonial */}
                <div className={`${getColorClasses(useCase.color)} border-2 rounded-xl p-4`}>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4" weight="fill" />
                    ))}
                  </div>
                  <p className="text-sm italic mb-3">"{useCase.testimonial.quote}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                      <UserCircle className="w-5 h-5" aria-hidden="true" weight="fill" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{useCase.testimonial.name}</div>
                      <div className="text-xs opacity-70">{useCase.testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="py-16 md:py-20 lg:py-28 bg-muted">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Success Stories
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Bagaimana bisnis menggunakan Kahade untuk scale dan meningkatkan trust
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {successStories.map((story, index) => (
              <motion.div
                key={story.company}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border-2 border-border rounded-2xl p-8"
              >
                <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center mb-4">
                  <story.icon className="w-7 h-7 text-white" weight="bold" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{story.company}</h3>
                <div className="text-sm text-muted-foreground mb-6">{story.industry}</div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-foreground uppercase mb-1">Challenge</div>
                    <p className="text-sm text-muted-foreground">{story.challenge}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground uppercase mb-1">Solution</div>
                    <p className="text-sm text-muted-foreground">{story.solution}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground uppercase mb-2">Results</div>
                    <ul className="space-y-2">
                      {story.results.map((result, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <ChartLineUp className="w-4 h-4 text-green-600" aria-hidden="true" weight="bold" />
                          <span className="text-sm font-semibold text-foreground">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
              Siap untuk success story Anda sendiri?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/70 mb-8"
            >
              Mulai dengan paket gratis. Tidak perlu kartu kredit.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register" className="block block">
                <Button className="h-14 px-8 bg-card text-foreground hover:bg-gray-100 rounded-xl font-semibold">
                  Mulai Gratis
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
              <Link href="/contact" className="block block">
                <Button className="h-14 px-8 border-2 border-white/30 bg-transparent text-white hover:bg-white/10 rounded-xl font-semibold">
                  Diskusi dengan Sales
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

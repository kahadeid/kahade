/*
 * KAHADE HOW IT WORKS PAGE - CLICKUP-INSPIRED REDESIGN
 * 
 * Design Philosophy:
 * - ClickUp-style smooth animations and step progression
 * - Enhanced step cards with micro-interactions
 * - Improved visual flow and hierarchy
 * - Brand color: var(--color-black)
 */

import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  UserPlus, FileText, Wallet, PaperPlaneTilt, CheckCircle,
  ArrowRight, ShieldCheck, Clock, Question, Check, Scales,
  Play, Lightning
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const steps = [
  {
    icon: UserPlus,
    title: 'Buat Akun',
    description: 'Buat akun gratis di Kahade. Pendaftaran cepat dan mudah, cukup email dan kata sandi.',
    details: [
      'Verifikasi email untuk keamanan akun',
      'Lengkapi profil untuk meningkatkan kepercayaan',
      'Opsional: Verifikasi KYC untuk batas transaksi lebih tinggi'
    ]
  },
  {
    icon: FileText,
    title: 'Buat Transaksi',
    description: 'Pembeli atau penjual dapat membuat transaksi baru dengan detail lengkap barang/jasa.',
    details: [
      'Tentukan judul dan deskripsi transaksi',
      'Masukkan nominal dan mata uang',
      'Pilih kategori dan syarat khusus jika ada',
      'Undang pihak lawan melalui tautan atau email'
    ]
  },
  {
    icon: Wallet,
    title: 'Pembeli Menyetor Dana',
    description: 'Pembeli menyetor dana ke escrow Kahade. Dana aman dan tidak dapat diakses siapa pun.',
    details: [
      'Pilih metode pembayaran (Transfer, E-Wallet, VA)',
      'Dana masuk ke rekening escrow Kahade',
      'Penjual menerima notifikasi dana diterima',
      'Status transaksi diperbarui real-time'
    ]
  },
  {
    icon: PaperPlaneTilt,
    title: 'Penjual Mengirim Barang/Jasa',
    description: 'Penjual mengirim barang atau menyelesaikan jasa sesuai kesepakatan.',
    details: [
      'Unggah bukti pengiriman atau penyelesaian',
      'Masukkan nomor resi jika ada',
      'Pembeli menerima notifikasi',
      'Masa penahanan dana dimulai'
    ]
  },
  {
    icon: CheckCircle,
    title: 'Konfirmasi & Lepaskan Dana',
    description: 'Pembeli mengonfirmasi penerimaan, dana dilepaskan ke penjual.',
    details: [
      'Pembeli memeriksa dan mengonfirmasi barang/jasa',
      'Dana otomatis dilepas ke penjual',
      'Kedua pihak dapat memberi penilaian',
      'Transaksi selesai dan tercatat'
    ]
  }
];

const faqs = [
  {
    question: 'Berapa biaya menggunakan Kahade?',
    answer: 'Kahade mengenakan biaya platform sebesar 1-3% dari nilai transaksi, tergantung kategori dan nominal. Biaya ini dapat ditanggung pembeli, penjual, atau dibagi sesuai kesepakatan.'
  },
  {
    question: 'Bagaimana jika terjadi sengketa?',
    answer: 'Jika terjadi sengketa, kedua pihak dapat mengajukan dispute. Tim mediator Kahade akan meninjau bukti dari kedua pihak dan mengambil keputusan yang adil. Proses sengketa biasanya selesai dalam 3-7 hari kerja.'
  },
  {
    question: 'Apakah dana saya aman?',
    answer: 'Ya, dana Anda sangat aman. Dana escrow disimpan di rekening terpisah yang diawasi dan tidak dapat diakses siapa pun kecuali melalui proses yang telah ditentukan. Semua transaksi tercatat untuk transparansi penuh.'
  },
  {
    question: 'Berapa lama proses pencairan dana?',
    answer: 'Setelah pembeli mengonfirmasi, dana akan dicairkan ke penjual dalam 1-3 hari kerja tergantung metode pencairan yang dipilih. Transfer ke bank lokal biasanya lebih cepat.'
  },
  {
    question: 'Apakah verifikasi KYC wajib?',
    answer: 'Verifikasi KYC opsional untuk transaksi kecil. Namun, untuk transaksi di atas Rp 100.000.000, verifikasi KYC wajib demi keamanan dan kepatuhan regulasi.'
  },
  {
    question: 'Kategori transaksi apa saja yang didukung?',
    answer: 'Kahade mendukung berbagai kategori termasuk: Elektronik, Jasa Digital, Barang Fisik, Layanan Profesional, dan lainnya. Beberapa kategori terlarang seperti barang ilegal tidak diperbolehkan.'
  }
];

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: 'Escrow Terjamin',
    description: 'Dana disimpan di rekening escrow terpisah yang diawasi dan diasuransikan.'
  },
  {
    icon: Clock,
    title: 'Masa Penahanan',
    description: 'Masa penahanan dana memberi waktu untuk verifikasi sebelum dilepas.'
  },
  {
    icon: Scales,
    title: 'Penyelesaian Sengketa',
    description: 'Tim mediator profesional siap membantu menyelesaikan sengketa secara adil.'
  },
  {
    icon: Lightning,
    title: 'Pemrosesan Cepat',
    description: 'Pelepasan dana cepat setelah konfirmasi, biasanya dalam 24 jam.'
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 lg:pt-40 pb-12 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-neutral-100)_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" aria-hidden="true" />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gray-100 rounded-full blur-3xl" 
        />
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto px-4"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4"
            >
              Cara Kerja
            </motion.span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-black">
              Proses Sederhana & Aman
            </h1>
            <p className="text-base md:text-lg text-neutral-600 mb-8">
              Ikuti 5 langkah mudah ini untuk melindungi setiap transaksi.
              Mulai hanya dalam hitungan menit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center">
              <Link href="/register">
                <Button className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 bg-black text-white hover:bg-black/90 font-semibold rounded-xl btn-hover-lift">
                  Mulai Gratis
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 border-2 border-black/20 hover:border-neutral-900 hover:bg-black/5 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-200">
                <Play className="mr-2 w-5 h-5" aria-hidden="true" weight="fill" />
                Lihat Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Steps Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative mb-6 md:mb-8 last:mb-0"
              >
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="absolute left-5 md:left-6 top-16 md:top-20 w-0.5 h-[calc(100%-2rem)] bg-neutral-200" aria-hidden="true" />
                )}
                
                <div className="flex gap-4 md:gap-6">
                  {/* Step Number */}
                  <div className="shrink-0">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm md:text-base"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </motion.div>
                  </div>
                  
                  {/* Content */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 flex-1 border border-neutral-200 hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-neutral-100 flex items-center justify-center"
                      >
                        <step.icon className="w-4 h-4 md:w-5 md:h-5 text-black" weight="bold" />
                      </motion.div>
                      <span className="text-xs md:text-sm font-mono text-neutral-600">Langkah {index + 1}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-black">{step.title}</h3>
                    <p className="text-sm md:text-base text-neutral-600 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-2 text-xs md:text-sm"
                        >
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" aria-hidden="true" weight="bold" />
                          <span className="text-neutral-600">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Security Features */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              Keamanan
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">
              Keamanan di Setiap Langkah
            </h2>
            <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
              Setiap tahap transaksi dilindungi dengan teknologi keamanan mutakhir.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-neutral-200 text-center group hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
              >
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-black group-hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
                >
                  <feature.icon className="w-6 h-6 md:w-7 md:h-7" weight="bold" />
                </motion.div>
                <h3 className="text-base md:text-lg font-bold mb-2 text-black">{feature.title}</h3>
                <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-12 md:py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">
              Pertanyaan Umum
            </h2>
            <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
              Jawaban atas pertanyaan yang sering diajukan tentang prosesnya.
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className="bg-white rounded-xl md:rounded-2xl px-4 md:px-6 border border-neutral-200 hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4 md:py-5">
                      <span className="font-semibold text-black text-sm md:text-base pr-4">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-600 pb-4 md:pb-5 text-sm md:text-base leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
            
            <div className="text-center mt-8">
              <Link href="/faq">
                <Button variant="outline" className="h-11 md:h-12 px-6 border-2 border-black/20 hover:border-neutral-900 hover:bg-black/5 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-200">
                  Lihat Semua FAQ
                  <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" aria-hidden="true" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-white/5 rounded-full blur-3xl" 
        />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto px-4"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6"
            >
              <ShieldCheck className="w-7 h-7 md:w-8 md:h-8 text-white" aria-hidden="true" weight="bold" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
              Siap Memulai?
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-8">
              Daftar sekarang dan nikmati transaksi aman bersama Kahade.
              Gratis untuk memulai.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center">
              <Link href="/register">
                <Button className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 bg-white text-black hover:bg-gray-100 font-semibold rounded-xl btn-hover-lift">
                  Daftar Gratis
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl bg-transparent transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-200">
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

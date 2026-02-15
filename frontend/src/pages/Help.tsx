import { SkipToContent } from '@/lib/accessibility';
/*
 * KAHADE HELP CENTER PAGE - PROFESSIONAL REDESIGN
 * 
 * Design Philosophy:
 * - Clean, modern, and professional aesthetic
 * - Fully responsive for Mobile, Tablet, and Desktop
 * - Brand color: var(--color-black)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  MagnifyingGlass, Question, Book, Wallet, ShieldCheck,
  User, Gear, ChatCircle, ArrowRight, CaretRight,
  Headset, Envelope, Clock
} from '@phosphor-icons/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories = [
  { icon: Book, title: 'Memulai', description: 'Pelajari dasar menggunakan Kahade', articles: 12, href: '/help/getting-started' },
  { icon: Wallet, title: 'Pembayaran & Dompet', description: 'Setoran, penarikan, dan saldo', articles: 15, href: '/help/payments' },
  { icon: ShieldCheck, title: 'Keamanan & Privasi', description: 'Jaga akun tetap aman', articles: 8, href: '/help/security' },
  { icon: User, title: 'Akun & Profil', description: 'Kelola pengaturan akun', articles: 10, href: '/help/account' },
  { icon: Question, title: 'Transaksi & Escrow', description: 'Cara kerja transaksi escrow', articles: 18, href: '/help/transactions' },
  { icon: Gear, title: 'Pemecahan Masalah', description: 'Masalah umum dan solusinya', articles: 14, href: '/help/troubleshooting' }
];

const popularArticles = [
  { title: 'Cara membuat transaksi escrow pertama Anda', category: 'Memulai' },
  { title: 'Memahami biaya escrow dan harga', category: 'Pembayaran & Dompet' },
  { title: 'Cara memverifikasi identitas (KYC)', category: 'Akun & Profil' },
  { title: 'Apa yang dilakukan jika transaksi bermasalah', category: 'Transaksi & Escrow' },
  { title: 'Cara menarik dana ke bank Anda', category: 'Pembayaran & Dompet' },
  { title: 'Mengatur autentikasi dua faktor', category: 'Keamanan & Privasi' }
];

const contactOptions = [
  { icon: ChatCircle, title: 'Live Chat', description: 'Chat dengan tim dukungan kami', availability: 'Tersedia 24/7', action: 'Mulai Chat' },
  { icon: Envelope, title: 'Dukungan Email', description: 'Kirim pesan detail kepada kami', availability: 'Respon dalam 24 jam', action: 'Kirim Email' },
  { icon: Headset, title: 'Dukungan Telepon', description: 'Bicara dengan agen dukungan', availability: 'Sen-Jum, 09.00-18.00', action: 'Telepon Sekarang' }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 lg:pt-40 pb-12 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-neutral-100)_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" aria-hidden="true" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto px-4"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              Pusat Bantuan
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-black">
              Bagaimana Kami Bisa Membantu?
            </h1>
            <p className="text-base md:text-lg text-neutral-600 mb-8">
              Cari di basis pengetahuan kami atau jelajahi kategori untuk menemukan jawaban.
            </p>
            
            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 aria-hidden="true" h-5 text-neutral-600" weight="regular" aria-hidden="true" />
              <Input
                placeholder="Cari artikel bantuan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 md:h-14 text-base md:text-lg bg-white border-neutral-200 focus:border-black focus:ring-black shadow-sm rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Categories Grid */}
      <section className="py-12 md:py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              Kategori
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">Jelajahi Berdasarkan Topik</h2>
            <p className="text-sm md:text-base text-neutral-600">Temukan jawaban berdasarkan kategori</p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={category.href}>
                  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-neutral-200 h-full group cursor-pointer hover:shadow-lg hover:border-neutral-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                      <category.icon className="w-5 h-5 md:w-6 md:h-6" weight="bold" />
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-2 text-black">
                      {category.title}
                    </h3>
                    <p className="text-xs md:text-sm text-neutral-600 mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {category.articles} artikel
                      </span>
                      <CaretRight className="w-5 aria-hidden="true" h-5 text-black opacity-0 group-hover:opacity-100 transition-opacity" weight="bold" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Popular Articles */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              Populer
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">Artikel Populer</h2>
            <p className="text-sm md:text-base text-neutral-600">Artikel bantuan yang paling sering dilihat</p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl md:rounded-2xl border border-neutral-200 divide-y divide-neutral-200 overflow-hidden">
              {popularArticles.map((article, index) => (
                <motion.div
                  key={article.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 md:p-5 flex items-center justify-between group cursor-pointer hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-4 md:gap-4">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      <Book className="w-4 h-4 md:w-5 aria-hidden="true" md:h-5 text-black" weight="regular" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm md:text-base text-black group-hover:text-neutral-600 transition-colors">
                        {article.title}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        {article.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 aria-hidden="true" h-5 text-muted-foreground group-hover:text-neutral-900 transition-colors shrink-0" weight="bold" aria-hidden="true" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Options */}
      <section className="py-12 md:py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              Dukungan
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">Masih Butuh Bantuan?</h2>
            <p className="text-sm md:text-base text-neutral-600">Tim dukungan kami siap membantu Anda</p>
          </motion.div>
          
          <div className="grid sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {contactOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-neutral-200 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <option.icon className="w-6 h-6 md:w-7 md:h-7 text-black" weight="bold" />
                </div>
                <h3 className="font-bold text-base md:text-lg mb-2 text-black">{option.title}</h3>
                <p className="text-xs md:text-sm text-neutral-600 mb-2">{option.description}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
                  <Clock className="w-3 aria-hidden="true" h-3" weight="regular" aria-hidden="true" />
                  {option.availability}
                </div>
                <Button className="w-full h-10 md:h-11 bg-black text-white hover:bg-black/90 font-semibold rounded-xl">
                  {option.action}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Link */}
      <section className="py-12 md:py-16 lg:py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" aria-hidden="true" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto px-4"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
              <Question className="w-7 h-7 md:w-8 aria-hidden="true" md:h-8 text-white" weight="bold" aria-hidden="true" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
              Butuh Jawaban Cepat?
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-8">
              Lihat pertanyaan yang sering diajukan untuk jawaban instan.
            </p>
            <Link href="/faq">
              <Button className="h-12 md:h-14 px-6 md:px-8 bg-white text-black hover:bg-gray-100 font-semibold rounded-xl">
                Lihat FAQ
                <ArrowRight className="ml-2 w-5 aria-hidden="true" h-5" weight="bold" aria-hidden="true" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

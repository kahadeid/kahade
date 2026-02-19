/*
 * KAHADE FAQ PAGE - CLICKUP-INSPIRED REDESIGN
 * 
 * Design Philosophy:
 * - ClickUp-style smooth animations and micro-interactions
 * - Enhanced accordion with hover effects
 * - Improved search and category filtering
 * - Brand color: var(--color-black)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import {
  Question, CaretDown, MagnifyingGlass, ChatCircle,
  ArrowRight, Lightbulb, ShieldCheck, CreditCard, 
  UserCircle, Wallet, Gear
} from '@phosphor-icons/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const faqCategories = [
  { id: 'general', name: 'Umum', icon: Question },
  { id: 'transactions', name: 'Transaksi', icon: Wallet },
  { id: 'payments', name: 'Pembayaran', icon: CreditCard },
  { id: 'security', name: 'Keamanan', icon: ShieldCheck },
  { id: 'account', name: 'Akun', icon: UserCircle },
];

const faqs = [
  {
    category: 'general',
    question: 'Apa itu Kahade?',
    answer: 'Kahade adalah platform escrow peer-to-peer yang aman untuk melindungi pembeli dan penjual dalam transaksi online. Kami menahan dana dengan aman hingga kedua pihak memenuhi kewajibannya, sehingga transaksi berlangsung tepercaya.'
  },
  {
    category: 'general',
    question: 'Bagaimana cara kerja escrow?',
    answer: 'Escrow bekerja dalam tiga langkah sederhana: 1) Pembeli menyetor dana ke Kahade, 2) Penjual mengirim barang atau layanan, 3) Setelah pembeli mengonfirmasi kepuasan, kami melepaskan dana ke penjual. Ini melindungi kedua pihak dari penipuan.'
  },
  {
    category: 'general',
    question: 'Apakah Kahade aman digunakan?',
    answer: 'Ya, Kahade menerapkan keamanan setara bank termasuk enkripsi SSL 256-bit, autentikasi dua faktor, dan penyimpanan dana yang aman. Uang Anda terlindungi sepanjang proses transaksi.'
  },
  {
    category: 'transactions',
    question: 'Bagaimana cara membuat transaksi?',
    answer: 'Untuk membuat transaksi, masuk ke dashboard, klik "Transaksi Baru", masukkan detail (nominal, deskripsi, pihak lawan), lalu kirim. Anda dapat membagikan tautan transaksi ke pihak lain.'
  },
  {
    category: 'transactions',
    question: 'Apa yang terjadi jika ada sengketa?',
    answer: 'Jika terjadi sengketa, salah satu pihak dapat membuka kasus sengketa. Tim kami akan meninjau bukti dari kedua pihak dan mengambil keputusan yang adil. Kami menargetkan penyelesaian dalam 3-5 hari kerja.'
  },
  {
    category: 'transactions',
    question: 'Berapa lama transaksi berlangsung?',
    answer: 'Durasi transaksi bergantung pada kesepakatan kedua pihak. Biasanya, setelah pembeli mengonfirmasi penerimaan, dana dilepas ke penjual dalam 24 jam. Periode escrow dapat disesuaikan 1-30 hari.'
  },
  {
    category: 'payments',
    question: 'Metode pembayaran apa yang diterima?',
    answer: 'Kami menerima transfer bank, kartu kredit/debit, serta metode pembayaran digital termasuk e-wallet dan QRIS. Pilihan dapat berbeda di setiap wilayah. Semua pembayaran diproses secara aman melalui platform kami.'
  },
  {
    category: 'payments',
    question: 'Berapa biaya layanan Kahade?',
    answer: 'Kahade mengenakan biaya platform sebesar 2.5% dari nilai transaksi, dengan biaya minimum Rp 2.500 dan maksimum Rp 250.000 per transaksi. Biaya ini untuk memastikan keamanan dan kelancaran transaksi Anda.'
  },
  {
    category: 'payments',
    question: 'Bagaimana cara menarik dana?',
    answer: 'Masuk ke Dompet, klik "Tarik Dana", masukkan nominal dan detail bank, lalu konfirmasi. Penarikan biasanya diproses dalam 1-3 hari kerja tergantung bank Anda.'
  },
  {
    category: 'security',
    question: 'Bagaimana Anda melindungi data saya?',
    answer: 'Kami menggunakan enkripsi standar industri, server aman, dan kontrol akses yang ketat. Data pribadi dan finansial Anda tidak pernah dibagikan tanpa persetujuan. Kami mematuhi regulasi perlindungan data internasional.'
  },
  {
    category: 'security',
    question: 'Apa itu autentikasi dua faktor?',
    answer: 'Autentikasi dua faktor (2FA) menambahkan lapisan keamanan ekstra dengan meminta kode verifikasi dari ponsel selain kata sandi. Kami sangat menyarankan mengaktifkan 2FA di pengaturan akun.'
  },
  {
    category: 'account',
    question: 'Bagaimana cara memverifikasi akun?',
    answer: 'Verifikasi akun (KYC) memerlukan pengiriman identitas resmi dan bukti alamat. Ini membantu mencegah penipuan dan memenuhi regulasi. Verifikasi biasanya selesai dalam 24-48 jam.'
  },
  {
    category: 'account',
    question: 'Bisakah saya memiliki beberapa akun?',
    answer: 'Tidak, setiap pengguna hanya diperbolehkan satu akun. Beberapa akun dapat menyebabkan penangguhan. Jika Anda memerlukan akun terpisah untuk bisnis, hubungi tim dukungan kami.'
  },
  {
    category: 'account',
    question: 'Bagaimana cara menghapus akun?',
    answer: 'Untuk menghapus akun, pastikan semua transaksi selesai dan saldo nol. Lalu buka Pengaturan > Akun > Hapus Akun. Tindakan ini tidak dapat dibatalkan dan semua data akan dihapus permanen.'
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 lg:pt-40 pb-12 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--muted)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" aria-hidden="true" />
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
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-block px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold mb-4"
            >
              FAQ
            </motion.span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-foreground">
              Pertanyaan yang Sering Diajukan
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              Temukan jawaban cepat untuk pertanyaan umum tentang Kahade.
            </p>
            
            {/* Search */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-xl mx-auto w-full"
            >
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" weight="regular" />
              <Input
                placeholder="Cari pertanyaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 h-12 md:h-14 text-base bg-card border-border focus:border-black focus:ring-black rounded-xl shadow-sm"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Category Tabs */}
      <section className="py-4 md:py-6 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container">
          <div className="flex overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:justify-center gap-2 scrollbar-hide">
            {faqCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => { setSelectedCategory(category.id); setOpenIndex(null); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2 md:py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                <category.icon className="w-4 h-4" weight={selectedCategory === category.id ? 'fill' : 'bold'} />
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Accordion */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="bg-card rounded-xl md:rounded-2xl border border-border overflow-hidden hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full p-4 md:p-6 flex items-center justify-between text-left hover:bg-muted transition-colors"
                >
                  <span className="font-semibold pr-4 text-foreground text-sm md:text-base">{faq.question}</span>
                  <motion.div 
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      openIndex === index ? 'bg-black' : 'bg-muted'
                    }`}
                  >
                    <CaretDown 
                      className={`w-4 h-4 md:w-5 md:h-5 ${
                        openIndex === index ? 'text-white' : 'text-foreground'
                      }`} 
                      weight="bold" 
                    />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-6 pb-4 md:pb-6 text-muted-foreground text-sm md:text-base leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            
            {filteredFaqs.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-12 md:py-16"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4"
                >
                  <Lightbulb className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" aria-hidden="true" weight="regular" />
                </motion.div>
                <h3 className="font-bold text-lg md:text-xl mb-2 text-foreground">Tidak ada pertanyaan ditemukan</h3>
                <p className="text-sm md:text-base text-muted-foreground">Coba sesuaikan kata kunci pencarian Anda.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Contact CTA */}
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
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6"
            >
              <ChatCircle className="w-7 h-7 md:w-8 md:h-8 text-white" aria-hidden="true" weight="fill" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
              Masih Punya Pertanyaan?
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-8 max-w-lg mx-auto">
              Tidak menemukan yang Anda cari? Tim dukungan kami siap membantu Anda 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center">
              <Link href="/contact" className="block block">
                <Button className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 bg-card text-foreground hover:bg-gray-100 font-semibold rounded-xl btn-hover-lift">
                  Hubungi Dukungan
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
              <Link href="/help" className="block block">
                <Button className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl bg-transparent transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-200">
                  Kunjungi Pusat Bantuan
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

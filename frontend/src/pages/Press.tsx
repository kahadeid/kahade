/*
 * KAHADE PRESS / NEWS PAGE - CLICKUP-INSPIRED REDESIGN
 * 
 * Design Philosophy:
 * - ClickUp-style smooth animations and micro-interactions
 * - Enhanced media cards with hover effects
 * - Better spacing and visual hierarchy
 * - Brand color: var(--color-black)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Newspaper, Calendar, ArrowRight, Download, Envelope,
  Image, FileText, Play, MagnifyingGlass
} from '@phosphor-icons/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const pressReleases = [
  { id: 1, title: 'Kahade Menggalang Pendanaan Seri B $25M untuk Perluasan di Asia Tenggara', date: '20 Jan 2026', category: 'Pendanaan', excerpt: 'Putaran pendanaan ini dipimpin oleh firma modal ventura terkemuka sehingga total pendanaan mencapai $40M.' },
  { id: 2, title: 'Kahade Meluncurkan Aplikasi Mobile untuk iOS dan Android', date: '10 Jan 2026', category: 'Produk', excerpt: 'Aplikasi mobile baru menghadirkan pengalaman escrow penuh bagi pengguna saat bepergian.' },
  { id: 3, title: 'Kahade Bermitra dengan Platform E-commerce Utama', date: '15 Des 2025', category: 'Kemitraan', excerpt: 'Kemitraan strategis untuk menyediakan layanan escrow kepada jutaan penjual online.' },
  { id: 4, title: 'Kahade Meraih Sertifikasi SOC 2 Tipe II', date: '28 Nov 2025', category: 'Keamanan', excerpt: 'Membuktikan komitmen kami pada standar keamanan dan kepatuhan tertinggi.' },
  { id: 5, title: 'Kahade Melampaui 1 Juta Transaksi', date: '15 Okt 2025', category: 'Pencapaian', excerpt: 'Menjadi bukti kepercayaan yang terus tumbuh dari pengguna kami di seluruh dunia.' },
];

const mediaFeatures = [
  { outlet: 'TechCrunch', title: 'How Kahade is Solving Trust in P2P Commerce', date: 'Jan 2026' },
  { outlet: 'Forbes', title: 'Top 10 Fintech Startups to Watch in 2026', date: 'Jan 2026' },
  { outlet: 'Bloomberg', title: 'The Rise of Escrow Services in Digital Commerce', date: 'Dec 2025' },
  { outlet: 'The Verge', title: 'Kahade Review: Making Online Transactions Safer', date: 'Nov 2025' },
];

const mediaKitItems = [
  { icon: Image, title: 'Paket Logo', description: 'Berbagai format dan ukuran', format: 'ZIP' },
  { icon: FileText, title: 'Panduan Merek', description: 'Warna, tipografi, penggunaan', format: 'PDF' },
  { icon: Image, title: 'Tangkapan Layar Produk', description: 'Gambar resolusi tinggi', format: 'ZIP' },
  { icon: FileText, title: 'Fakta Perusahaan', description: 'Data dan angka penting', format: 'PDF' },
];

export default function Press() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReleases = pressReleases.filter(release =>
    release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    release.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            className="text-center max-w-3xl mx-auto px-4"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4"
            >
              Pers & Berita
            </motion.span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-black">
              Kahade di Berita
            </h1>
            <p className="text-base md:text-lg text-neutral-600 mb-8">
              Tetap terbarui dengan berita terbaru, siaran pers, dan liputan media tentang Kahade.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 md:gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="h-11 md:h-12 px-5 md:px-6 bg-black text-white hover:bg-black/90 font-semibold rounded-xl">
                  <Envelope className="w-5 h-5 mr-2" aria-hidden="true" weight="bold" />
                  Pertanyaan Media
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="h-11 md:h-12 px-5 md:px-6 border-neutral-200 font-semibold rounded-xl">
                  <Download className="w-5 h-5 mr-2" aria-hidden="true" weight="bold" />
                  Unduh Media Kit
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Press Releases */}
      <section className="py-12 md:py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8"
          >
            <div>
              <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-3">
                Terbaru
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-black">Siaran Pers</h2>
            </div>
            <div className="relative w-full md:w-64">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" weight="regular" />
              <Input
                placeholder="Cari siaran pers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 md:h-11 bg-white border-neutral-200 focus:border-black focus:ring-black rounded-xl"
              />
            </div>
          </motion.div>
          
          <div className="space-y-3 md:space-y-4">
            {filteredReleases.map((release, index) => (
              <motion.article
                key={release.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-neutral-200 group cursor-pointer hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-black text-white text-xs font-semibold">
                        {release.category}
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" weight="regular" />
                        {release.date}
                      </span>
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2 text-black group-hover:text-neutral-600 transition-colors">
                      {release.title}
                    </h3>
                    <p className="text-xs md:text-sm text-neutral-600">{release.excerpt}</p>
                  </div>
                  <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" className="h-9 md:h-10 gap-2 flex-shrink-0 text-black hover:text-neutral-600 rounded-lg">
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4" aria-hidden="true" weight="bold" />
                    </Button>
                  </motion.div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
      
      {/* Media Coverage */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              Sorotan
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">Liputan Media</h2>
            <p className="text-sm md:text-base text-neutral-600">Cerita pilihan dari publikasi terkemuka</p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {mediaFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-neutral-200 flex items-center gap-4 md:gap-4 group cursor-pointer hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
              >
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 group-hover:bg-black transition-colors"
                >
                  <Play className="w-6 h-6 md:w-7 md:h-7 text-neutral-600 group-hover:text-white transition-colors" aria-hidden="true" weight="fill" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs md:text-sm text-black font-semibold mb-0.5">{feature.outlet}</div>
                  <h3 className="font-bold text-sm md:text-base text-black truncate">
                    {feature.title}
                  </h3>
                  <div className="text-xs text-muted-foreground">{feature.date}</div>
                </div>
                <motion.div whileHover={{ x: 3 }}>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-neutral-900 transition-colors flex-shrink-0" aria-hidden="true" weight="bold" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Media Kit */}
      <section className="py-12 md:py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              Sumber Daya
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">Media Kit</h2>
            <p className="text-sm md:text-base text-neutral-600">Unduh aset merek resmi Kahade</p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {mediaKitItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-neutral-200 text-center group cursor-pointer hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-black transition-colors"
                >
                  <item.icon className="w-5 h-5 md:w-7 md:h-7 text-black group-hover:text-white transition-colors" weight="bold" />
                </motion.div>
                <h3 className="font-bold text-sm md:text-base mb-1 text-black">{item.title}</h3>
                <p className="text-xs text-neutral-600 mb-2 md:mb-3">{item.description}</p>
                <span className="inline-flex items-center gap-1 text-xs text-black font-semibold">
                  <Download className="w-3 h-3" aria-hidden="true" weight="bold" />
                  {item.format}
                </span>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-6 md:mt-8"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="h-11 md:h-12 px-5 md:px-6 bg-black text-white hover:bg-black/90 font-semibold rounded-xl">
                <Download className="w-5 h-5 mr-2" aria-hidden="true" weight="bold" />
                Unduh Media Kit Lengkap
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" aria-hidden="true" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 left-0 w-[400px] h-[400px] bg-white rounded-full blur-3xl" 
        />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto px-4"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6"
            >
              <Envelope className="w-7 h-7 md:w-8 md:h-8 text-white" aria-hidden="true" weight="bold" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
              Kontak Media
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-6 md:mb-8">
              Untuk pertanyaan pers, permintaan wawancara, atau kemitraan media, silakan hubungi tim komunikasi kami.
            </p>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 inline-block"
            >
              <div className="text-lg md:text-xl font-bold text-white">halo@kahade.id</div>
              <div className="text-xs md:text-sm text-white/70">Kami biasanya merespons dalam 24 jam</div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

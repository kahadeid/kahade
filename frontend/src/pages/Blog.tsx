/*
 * KAHADE BLOG PAGE - CLICKUP-INSPIRED REDESIGN
 * 
 * Design Philosophy:
 * - ClickUp-style smooth animations and micro-interactions
 * - Enhanced card grid with staggered animations
 * - Improved search and category filtering
 * - Brand color: var(--color-black)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  MagnifyingGlass, Calendar, Clock, User, Tag,
  ArrowRight, BookOpen, TrendUp, Lightbulb, Sparkle
} from '@phosphor-icons/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories = [
  { name: 'Semua', count: 24 },
  { name: 'Update Produk', count: 8 },
  { name: 'Keamanan', count: 6 },
  { name: 'Tips & Panduan', count: 5 },
  { name: 'Berita Industri', count: 5 },
];

const featuredPost = {
  id: 1,
  title: 'Memperkenalkan Kahade 2.0: Era Baru Transaksi Aman',
  excerpt: 'Kami dengan antusias mengumumkan peluncuran Kahade 2.0, menghadirkan antarmuka yang sepenuhnya didesain ulang, peningkatan keamanan, dan fitur baru yang membuat escrow P2P semakin mudah.',
  category: 'Update Produk',
  author: 'Tim Kahade',
  date: '25 Jan 2026',
  readTime: '5 menit baca',
  image: '/images/blog/featured.jpg'
};

const posts = [
  {
    id: 2,
    title: '5 Tips Transaksi Online Aman di 2026',
    excerpt: 'Pelajari praktik penting untuk melindungi diri saat membeli atau menjual secara online.',
    category: 'Tips & Panduan',
    author: 'Sarah Chen',
    date: '22 Jan 2026',
    readTime: '4 menit baca'
  },
  {
    id: 3,
    title: 'Memahami Escrow: Panduan Lengkap',
    excerpt: 'Semua yang perlu Anda ketahui tentang cara kerja escrow dan mengapa ini penting.',
    category: 'Tips & Panduan',
    author: 'Michael Park',
    date: '20 Jan 2026',
    readTime: '7 menit baca'
  },
  {
    id: 4,
    title: 'Cara Kami Melindungi Dana Anda: Kupasan Keamanan',
    excerpt: 'Melihat lebih dekat langkah keamanan yang kami gunakan untuk menjaga dana Anda.',
    category: 'Keamanan',
    author: 'David Kim',
    date: '18 Jan 2026',
    readTime: '6 menit baca'
  },
  {
    id: 5,
    title: 'Meningkatnya Perdagangan P2P di Asia Tenggara',
    excerpt: 'Menelusuri tren transaksi peer-to-peer yang terus bertumbuh di kawasan ini.',
    category: 'Berita Industri',
    author: 'Lisa Wong',
    date: '15 Jan 2026',
    readTime: '5 menit baca'
  },
  {
    id: 6,
    title: 'Fitur Baru: Penyelesaian Sengketa Instan',
    excerpt: 'Memperkenalkan sistem penyelesaian sengketa berbasis AI untuk hasil lebih cepat.',
    category: 'Update Produk',
    author: 'Tim Kahade',
    date: '12 Jan 2026',
    readTime: '3 menit baca'
  },
  {
    id: 7,
    title: 'Membangun Kepercayaan di Marketplace Digital',
    excerpt: 'Bagaimana layanan escrow mentransformasi perdagangan online dan membangun kepercayaan.',
    category: 'Berita Industri',
    author: 'James Lee',
    date: '10 Jan 2026',
    readTime: '5 menit baca'
  }
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 lg:pt-40 pb-8 md:pb-12 relative overflow-hidden">
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
              Blog
            </motion.span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-black">
              Wawasan & Pembaruan
            </h1>
            <p className="text-base md:text-lg text-neutral-600 mb-8">
              Tetap terinformasi dengan berita, tips, dan pembaruan terbaru dari tim Kahade.
            </p>
            
            {/* Search */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-md mx-auto"
            >
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" aria-hidden="true" weight="regular" />
              <Input
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11 md:h-12 bg-white border-neutral-200 focus:border-black focus:ring-black rounded-xl shadow-sm"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Categories */}
      <section className="py-4 md:py-6 border-b border-neutral-200 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="container">
          <div className="flex overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:justify-center gap-2 scrollbar-hide">
            {categories.map((category) => (
              <motion.button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === category.name
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                }`}
              >
                {category.name} ({category.count})
              </motion.button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Post */}
      {selectedCategory === 'Semua' && !searchQuery && (
        <section className="py-8 md:py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
            >
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="h-48 md:h-64 lg:h-auto bg-gradient-to-br from-[#F5F5F5] to-[#E8E8E8] flex items-center justify-center relative overflow-hidden group">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <TrendUp className="w-16 h-16 md:w-24 md:h-24 text-neutral-600 mx-auto mb-2" aria-hidden="true" weight="fill" />
                    <span className="text-sm text-neutral-600">Artikel Unggulan</span>
                  </motion.div>
                </div>
                <div className="p-6 md:p-8 lg:p-10 xl:p-12">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                    <span className="px-3 py-1 rounded-lg bg-black text-white text-xs md:text-sm font-medium">
                      {featuredPost.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs md:text-sm text-neutral-600">
                      <Sparkle className="w-4 h-4" aria-hidden="true" weight="fill" />
                      Unggulan
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 text-black">
                    {featuredPost.title}
                  </h2>
                  <p className="text-sm md:text-base text-neutral-600 mb-4 md:mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 md:gap-4 text-xs md:text-sm text-neutral-600 mb-6">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" aria-hidden="true" weight="regular" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" aria-hidden="true" weight="regular" />
                      {featuredPost.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" aria-hidden="true" weight="regular" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <Link href={`/blog/${featuredPost.id}`}>
                    <Button className="h-11 md:h-12 px-6 bg-black text-white hover:bg-black/90 font-semibold rounded-xl btn-hover-lift">
                      Baca Artikel
                      <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" weight="bold" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Posts Grid */}
      <section className="py-8 md:py-12 bg-neutral-50">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-xl md:rounded-2xl border border-neutral-200 overflow-hidden group cursor-pointer hover:shadow-clickup hover:border-neutral-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
              >
                <Link href={`/blog/${post.id}`}>
                  <div className="h-40 md:h-48 bg-gradient-to-br from-[#F5F5F5] to-[#E8E8E8] flex items-center justify-center relative overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Lightbulb className="w-10 h-10 md:w-12 md:h-12 text-neutral-600 group-hover:text-neutral-900 transition-colors duration-300" aria-hidden="true" weight="fill" />
                    </motion.div>
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-100 text-black text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-2 text-black group-hover:text-neutral-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs md:text-sm text-neutral-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" weight="regular" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" weight="regular" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
          
          {filteredPosts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12 md:py-16"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4"
              >
                <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-neutral-600" aria-hidden="true" weight="regular" />
              </motion.div>
              <h3 className="font-bold text-lg md:text-xl mb-2 text-black">No articles found</h3>
              <p className="text-sm md:text-base text-neutral-600">Coba sesuaikan pencarian atau filter Anda.</p>
            </motion.div>
          )}
          
          {/* Load More */}
          {filteredPosts.length > 0 && (
            <div className="text-center mt-8 md:mt-12">
              <Button variant="outline" className="h-11 md:h-12 px-6 border-2 border-black/20 hover:border-neutral-900 hover:bg-black/5 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-200">
                Muat Lebih Banyak Artikel
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Newsletter CTA */}
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
            className="text-center max-w-2xl mx-auto px-4"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6"
            >
              <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-white" aria-hidden="true" weight="fill" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
              Berlangganan Newsletter Kami
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-8 max-w-lg mx-auto">
              Dapatkan artikel, tips, dan pembaruan terbaru langsung ke inbox Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Masukkan email Anda"
                className="h-11 md:h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white focus:ring-white rounded-xl flex-1"
              />
              <Button className="h-11 md:h-12 px-6 bg-white text-black hover:bg-gray-100 font-semibold rounded-xl shrink-0 btn-hover-lift">
                Berlangganan
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

/*
 * KAHADE CAREERS PAGE - CLICKUP-INSPIRED REDESIGN
 * 
 * Design Philosophy:
 * - ClickUp-style smooth animations and micro-interactions
 * - Enhanced job listings with hover effects
 * - Improved search and filtering
 * - Brand color: var(--color-black)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, MapPin, Clock, CurrencyDollar, Users,
  Heart, Rocket, GraduationCap, Coffee, ArrowRight,
  Buildings, Globe, MagnifyingGlass, Sparkle
} from '@phosphor-icons/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const benefits = [
  { icon: Heart, title: 'Asuransi Kesehatan', description: 'Perlindungan medis, gigi, dan penglihatan yang komprehensif' },
  { icon: Rocket, title: 'Pengembangan Karier', description: 'Anggaran belajar dan program mentorship' },
  { icon: Clock, title: 'Jam Fleksibel', description: 'Bekerja saat Anda paling produktif' },
  { icon: Globe, title: 'Remote First', description: 'Bekerja dari mana saja di dunia' },
  { icon: CurrencyDollar, title: 'Kompensasi Kompetitif', description: 'Paket kompensasi di atas rata-rata pasar' },
  { icon: Coffee, title: 'Acara Tim', description: 'Retret tim dan acara sosial rutin' },
];

const departments = [
  { name: 'Semua', count: 12 },
  { name: 'Teknik', count: 5 },
  { name: 'Produk', count: 2 },
  { name: 'Desain', count: 2 },
  { name: 'Pemasaran', count: 2 },
  { name: 'Operasional', count: 1 },
];

const jobs = [
  { id: 1, title: 'Insinyur Full Stack Senior', department: 'Teknik', location: 'Remote', type: 'Penuh waktu', salary: '$120k - $180k' },
  { id: 2, title: 'Insinyur Backend', department: 'Teknik', location: 'Remote', type: 'Penuh waktu', salary: '$100k - $150k' },
  { id: 3, title: 'Insinyur Frontend', department: 'Teknik', location: 'Remote', type: 'Penuh waktu', salary: '$90k - $140k' },
  { id: 4, title: 'Manajer Produk', department: 'Produk', location: 'Remote', type: 'Penuh waktu', salary: '$110k - $160k' },
  { id: 5, title: 'Desainer Produk', department: 'Desain', location: 'Remote', type: 'Penuh waktu', salary: '$90k - $130k' },
  { id: 6, title: 'Peneliti UX', department: 'Desain', location: 'Remote', type: 'Penuh waktu', salary: '$80k - $120k' },
  { id: 7, title: 'Manajer Pemasaran Growth', department: 'Pemasaran', location: 'Remote', type: 'Penuh waktu', salary: '$90k - $130k' },
  { id: 8, title: 'Spesialis Pemasaran Konten', department: 'Pemasaran', location: 'Remote', type: 'Penuh waktu', salary: '$60k - $90k' },
  { id: 9, title: 'Insinyur DevOps', department: 'Teknik', location: 'Remote', type: 'Penuh waktu', salary: '$110k - $160k' },
  { id: 10, title: 'Insinyur Keamanan', department: 'Teknik', location: 'Remote', type: 'Penuh waktu', salary: '$120k - $170k' },
  { id: 11, title: 'Analis Produk', department: 'Produk', location: 'Remote', type: 'Penuh waktu', salary: '$70k - $100k' },
  { id: 12, title: 'Manajer Keberhasilan Pelanggan', department: 'Operasional', location: 'Remote', type: 'Penuh waktu', salary: '$60k - $90k' },
];

const values = [
  { title: 'Kepercayaan Utama', description: 'Kami membangun kepercayaan dalam setiap hal yang kami lakukan, baik internal maupun untuk pengguna.' },
  { title: 'Bergerak Cepat', description: 'Kami bergerak cepat, belajar dari umpan balik, dan terus beriterasi.' },
  { title: 'Berpikir Besar', description: 'Kami menangani tantangan besar dan menargetkan dampak global.' },
  { title: 'Tetap Rendah Hati', description: 'Kami mendengar, belajar, dan bertumbuh bersama sebagai tim.' },
];

export default function Careers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Semua');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'Semua' || job.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

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
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4"
            >
              <Sparkle className="w-4 h-4" aria-hidden="true" weight="fill" />
              Kami Merekrut
            </motion.span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-black leading-tight">
              Bangun Masa Depan Kepercayaan
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-neutral-600 mb-8">
              Bergabung dalam misi kami untuk membuat transaksi online aman dan tepercaya bagi semua orang.
              Kami mencari orang-orang bersemangat untuk tumbuh bersama.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-neutral-600">
              {[{icon: Users, label: '50+ Anggota Tim'}, {icon: Globe, label: '15+ Negara'}, {icon: Briefcase, label: `${jobs.length} Posisi Terbuka`}].map((stat, index) => (
                <motion.span 
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2"
                >
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-neutral-100 flex items-center justify-center"
                  >
                    <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-black" weight="bold" />
                  </motion.div>
                  {stat.label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              Nilai Kami
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">
              Prinsip yang memandu kami
            </h2>
            <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
              Nilai-nilai ini membentuk segala yang kami lakukan di Kahade.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-neutral-200 text-center hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
              >
                <h3 className="font-bold text-base md:text-lg mb-2 text-black">{value.title}</h3>
                <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
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
              Manfaat
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">
              Keuntungan bergabung dengan Kahade
            </h2>
            <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
              Kami menjaga tim agar mereka dapat fokus memberikan hasil terbaik.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-neutral-200 flex items-start gap-4 md:gap-4 hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300 group"
              >
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
                >
                  <benefit.icon className="w-5 h-5 md:w-6 md:h-6" weight="bold" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-sm md:text-base mb-1 text-black">{benefit.title}</h3>
                  <p className="text-xs md:text-sm text-neutral-600">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Open Positions */}
      <section className="py-12 md:py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              Posisi Terbuka
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">
              Temukan peluang berikutnya
            </h2>
            <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
              Bergabung dengan tim kami yang terus berkembang dan berikan dampak nyata.
            </p>
          </motion.div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 md:mb-8 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" aria-hidden="true" weight="regular" />
              <Input
                placeholder="Cari posisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11 md:h-12 bg-white border-neutral-200 focus:border-black focus:ring-black rounded-xl"
              />
            </div>
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
              {departments.map((dept) => (
                <motion.button
                  key={dept.name}
                  onClick={() => setSelectedDepartment(dept.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                    selectedDepartment === dept.name
                      ? 'bg-black text-white'
                      : 'bg-white border border-neutral-200 hover:bg-neutral-100 text-black'
                  }`}
                >
                  {dept.name} ({dept.count})
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Jobs List */}
          <div className="space-y-3 md:space-y-4 max-w-4xl mx-auto">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-neutral-200 hover:shadow-clickup hover:border-neutral-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300 cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-black group-hover:text-neutral-900/80 transition-colors mb-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" aria-hidden="true" weight="regular" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" aria-hidden="true" weight="regular" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" aria-hidden="true" weight="regular" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <CurrencyDollar className="w-4 h-4" aria-hidden="true" weight="regular" />
                        {job.salary}
                      </span>
                    </div>
                  </div>
                  <Button className="h-10 md:h-11 px-5 bg-black text-white hover:bg-black/90 font-semibold rounded-xl shrink-0 btn-hover-lift">
                    Lamar
                    <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" weight="bold" />
                  </Button>
                </div>
              </motion.div>
            ))}
            
            {filteredJobs.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 md:py-16"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4"
                >
                  <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-neutral-600" aria-hidden="true" weight="regular" />
                </motion.div>
                <h3 className="font-bold text-lg md:text-xl mb-2 text-black">Tidak ada posisi ditemukan</h3>
                <p className="text-sm md:text-base text-neutral-600">Coba sesuaikan pencarian atau filter Anda.</p>
              </motion.div>
            )}
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
              <Briefcase className="w-7 h-7 md:w-8 md:h-8 text-white" aria-hidden="true" weight="bold" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
              Tidak menemukan peran yang cocok?
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-8 max-w-lg mx-auto">
              Kami selalu mencari talenta terbaik. Kirimkan resume Anda dan kami akan menghubungi jika ada peluang yang sesuai.
            </p>
            <Button className="h-12 md:h-14 px-6 md:px-8 bg-white text-black hover:bg-gray-100 font-semibold rounded-xl btn-hover-lift">
              Kirim Resume Anda
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

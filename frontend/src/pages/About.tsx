import { motion } from 'framer-motion';
import { 
  ShieldCheck, Target, Eye, Heart, Globe, Lightning, ArrowRight,
  Users, Trophy, Rocket, Handshake
} from '@phosphor-icons/react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fadeInUp } from '@/lib/animations';
import { cn } from '@/lib/ui-utils';

const values = [
  {
    icon: ShieldCheck,
    title: 'Keamanan Utama',
    description: 'Keamanan adalah prioritas tertinggi kami. Kami menerapkan enkripsi setara bank dan autentikasi multi-faktor untuk melindungi setiap transaksi.'
  },
  {
    icon: Eye,
    title: 'Transparansi Penuh',
    description: 'Kami percaya pada keterbukaan penuh. Setiap transaksi dilacak dan terlihat oleh semua pihak terkait.'
  },
  {
    icon: Heart,
    title: 'Membangun Kepercayaan',
    description: 'Kepercayaan adalah fondasi setiap hubungan bisnis. Kami memfasilitasi kepercayaan antara pihak yang belum saling mengenal.'
  },
  {
    icon: Lightning,
    title: 'Inovasi Berkelanjutan',
    description: 'Kami terus berinovasi untuk menghadirkan solusi terbaik dan selalu selangkah di depan ancaman baru.'
  }
];

const milestones = [
  { year: '2023', title: 'Perusahaan Didirikan', description: 'Kahade didirikan dengan visi menjadi platform escrow paling tepercaya di Indonesia.' },
  { year: '2024 Q1', title: 'Peluncuran Platform', description: 'Meluncurkan platform escrow dengan fitur keamanan lengkap dan dukungan multi-pembayaran.' },
  { year: '2024 Q3', title: '10.000 Pengguna', description: 'Mencapai tonggak 10.000 pengguna aktif dan Rp 50M+ transaksi yang diamankan.' },
  { year: '2025', title: 'Ekspansi Regional', description: 'Memperluas layanan ke Asia Tenggara dengan metode pembayaran terlokalisasi.' }
];

const stats = [
  { value: '10K+', label: 'Pengguna Aktif', icon: Users },
  { value: 'Rp 50M+', label: 'Total Diamankan', icon: ShieldCheck },
  { value: '99.9%', label: 'Ketersediaan', icon: Rocket },
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
      
      {/* Hero Section */}
      <section className="section-padding-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--muted)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" aria-hidden="true" />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-muted rounded-full blur-3xl" 
        />
        <div className="container relative z-10">
          <motion.div {...fadeInUp} className="section-header">
            <motion.span className="badge badge-primary mb-4">
              Tentang Kami
            </motion.span>
            <h1 className="section-title">
              Membangun Kepercayaan <br className="hidden sm:block" />dalam Transaksi Digital
            </h1>
            <p className="section-description">
              Kami adalah tim berdedikasi yang membangun ekosistem transaksi online
              yang aman, transparan, dan tepercaya untuk semua orang.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="section-padding border-y border-border bg-muted">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="text-center cursor-default"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3"
                >
                  <stat.icon className="w-6 h-6 md:w-7 md:h-7" weight="bold" aria-hidden="true" />
                </motion.div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Mission & Vision */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            <motion.div
              {...fadeInUp}
              whileHover={{ y: -8 }}
              className="card card-hover p-6 md:p-8 lg:p-10"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 md:mb-6"
              >
                <Target className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" weight="bold" />
              </motion.div>
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Misi Kami</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Menyediakan platform escrow yang aman dan mudah digunakan untuk melindungi setiap
                transaksi online. Kami berkomitmen mengurangi risiko penipuan dan membangun
                kepercayaan di ekonomi digital, agar perdagangan online lebih aman bagi semua orang.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="card card-hover p-6 md:p-8 lg:p-10"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 md:mb-6"
              >
                <Globe className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" weight="bold" />
              </motion.div>
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Visi Kami</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Menjadi platform escrow terdepan di Asia Tenggara, dikenal karena keamanan,
                transparansi, dan inovasi teknologi. Kami ingin semua orang dapat bertransaksi
                online dengan tenang dan penuh percaya diri.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Values */}
      <section className="section-padding-lg bg-muted">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-primary mb-4">
              Nilai Kami
            </span>
            <h2 className="section-title">
              Prinsip yang memandu kami
            </h2>
            <p className="section-description">
              Nilai inti ini membentuk setiap keputusan dan setiap fitur yang kami bangun.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="card card-hover p-6 md:p-8 text-center group"
              >
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-4',
                    'bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300'
                  )}
                >
                  <value.icon className="w-6 h-6 md:w-7 md:h-7" weight="bold" aria-hidden="true" />
                </motion.div>
                <h3 className="text-base md:text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Timeline */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-primary mb-4">
              Perjalanan Kami
            </span>
            <h2 className="section-title">
              Tonggak pencapaian kami
            </h2>
            <p className="section-description">
              Tonggak penting dalam perjalanan Kahade menjadi platform escrow tepercaya di Indonesia.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year + milestone.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex gap-4 md:gap-6 mb-6 md:mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs md:text-sm shrink-0"
                  >
                    {milestone.year.split(' ')[0]}
                  </motion.div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2 min-h-[40px]" />
                  )}
                </div>
                <motion.div 
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="card card-hover p-4 md:p-6 flex-1"
                >
                  <div className="text-xs font-semibold text-muted-foreground mb-1">{milestone.year}</div>
                  <h3 className="text-base md:text-lg font-bold mb-2">{milestone.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{milestone.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="section-padding-lg bg-muted">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-primary mb-4">
              Tim Kami
            </span>
            <h2 className="section-title">
              Kenali orang-orang di balik Kahade
            </h2>
            <p className="section-description">
              Tim ahli berdedikasi yang bekerja untuk membuat transaksi online lebih aman.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="card card-hover p-4 md:p-6 text-center"
              >
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg md:text-xl mx-auto mb-3 md:mb-4"
                >
                  {member.avatar}
                </motion.div>
                <h3 className="text-sm md:text-base font-bold mb-1">{member.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="section-padding-lg bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" aria-hidden="true" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary-foreground/5 rounded-full blur-3xl" 
        />
        <div className="container relative z-10">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto px-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-6"
            >
              <Handshake className="w-8 h-8 md:w-10 md:h-10" aria-hidden="true" weight="bold" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Bergabung dengan tim kami</h2>
            <p className="text-primary-foreground/70 text-sm md:text-base lg:text-lg mb-8 max-w-xl mx-auto">
              Kami selalu mencari talenta terbaik untuk bergabung dalam misi membuat transaksi online lebih aman bagi semua orang.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center">
              <Link href="/careers">
                <Button className="w-full sm:w-auto btn-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Lihat Posisi Terbuka
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="w-full sm:w-auto btn-lg border-2 border-primary-foreground/30 bg-transparent hover:bg-primary-foreground/10">
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

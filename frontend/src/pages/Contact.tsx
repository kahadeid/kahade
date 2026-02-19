/*
 * KAHADE CONTACT PAGE — AUDIT FIX v3.0
 *
 * Perbaikan:
 * - Email: halo@kahade.id (bukan support@kahade.id)
 * - Telepon: +62 811-127-812 (bukan +62 811-1278-12)
 * - Alamat lengkap: Gg. Abot, Cihideung Udik, Kec. Ciampea, Kabupaten Bogor, Jawa Barat 16620
 * - Email spesifik per departemen
 * - Konsisten dengan design system (bg-background, section-padding)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Envelope, Phone, MapPin, PaperPlaneTilt, ChatCircle, Clock,
  ArrowRight, WhatsappLogo, Headset, Question, CheckCircle
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Link } from 'wouter';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

const contactInfo = [
  {
    icon: Envelope,
    title: 'Email Utama',
    value: 'halo@kahade.id',
    description: 'Pertanyaan umum & informasi produk',
    action: 'mailto:halo@kahade.id'
  },
  {
    icon: Phone,
    title: 'Telepon',
    value: '+62 811-127-812',
    description: 'Sen – Jum, 09.00 – 18.00 WIB',
    action: 'tel:+62811127812'
  },
  {
    icon: MapPin,
    title: 'Alamat',
    value: 'Gg. Abot, Cihideung Udik',
    description: 'Kec. Ciampea, Kab. Bogor, Jawa Barat 16620',
    action: 'https://maps.google.com/?q=Gg.+Abot+Cihideung+Udik+Ciampea+Bogor+Jawa+Barat+16620'
  },
];

const departmentEmails = [
  { dept: 'Dukungan Pelanggan', email: 'bantuan@kahade.id', desc: 'Bantuan teknis & transaksi' },
  { dept: 'Verifikasi Akun', email: 'verifikasi@kahade.id', desc: 'KYC & verifikasi identitas' },
  { dept: 'Kemitraan', email: 'mitra@kahade.id', desc: 'Kerjasama & integrasi bisnis' },
  { dept: 'Karier', email: 'karir@kahade.id', desc: 'Lowongan & rekrutmen' },
];

const supportChannels = [
  {
    icon: ChatCircle,
    title: 'Live Chat',
    description: 'Chat langsung dengan tim dukungan kami melalui dashboard.',
    availability: 'Tersedia 24/7',
    cta: 'Mulai Chat',
    href: '/login'
  },
  {
    icon: Headset,
    title: 'Pusat Bantuan',
    description: 'Temukan jawaban di basis pengetahuan kami.',
    availability: 'Selalu tersedia',
    cta: 'Buka Pusat Bantuan',
    href: '/help'
  },
  {
    icon: Question,
    title: 'FAQ',
    description: 'Pertanyaan yang sering diajukan oleh pengguna Kahade.',
    availability: 'Selalu tersedia',
    cta: 'Lihat FAQ',
    href: '/faq'
  },
];

const subjects = [
  { value: 'general', label: 'Pertanyaan Umum' },
  { value: 'transaction', label: 'Transaksi & Escrow' },
  { value: 'payment', label: 'Pembayaran & Dompet' },
  { value: 'account', label: 'Akun & Verifikasi' },
  { value: 'dispute', label: 'Sengketa Transaksi' },
  { value: 'security', label: 'Keamanan & Privasi' },
  { value: 'partnership', label: 'Kemitraan & Integrasi' },
  { value: 'other', label: 'Lainnya' },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Harap isi semua kolom yang wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="section-padding-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--muted)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" aria-hidden="true" />
        <div className="container relative z-10">
          <motion.div
            {...fadeInUp}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="badge badge-secondary mb-4 inline-block">Hubungi Kami</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Ada yang Bisa Kami Bantu?
            </h1>
            <p className="text-lg text-muted-foreground">
              Tim kami siap membantu Anda. Pilih cara yang paling nyaman untuk menghubungi kami.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="pb-12 md:pb-16">
        <div className="container">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {contactInfo.map((info) => (
              <motion.a
                key={info.title}
                href={info.action}
                target={info.action.startsWith('https') ? '_blank' : undefined}
                rel={info.action.startsWith('https') ? 'noopener noreferrer' : undefined}
                variants={staggerItem}
                className="card card-hover p-6 text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <info.icon className="w-6 h-6" weight="duotone" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-1">{info.title}</h3>
                <p className="text-sm font-medium text-foreground mb-1">{info.value}</p>
                <p className="text-xs text-muted-foreground">{info.description}</p>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content: Form + Sidebar */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-16 max-w-6xl mx-auto">

            {/* Contact Form */}
            <motion.div
              {...fadeInUp}
              className="card card-premium p-6 md:p-8"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" weight="fill" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Pesan Terkirim!</h3>
                  <p className="text-muted-foreground mb-6">
                    Terima kasih sudah menghubungi kami. Tim kami akan membalas dalam 24 jam kerja.
                  </p>
                  <Button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}>
                    Kirim Pesan Lain
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2">Kirim Pesan</h2>
                  <p className="text-muted-foreground mb-8">
                    Isi formulir di bawah dan kami akan segera menghubungi Anda.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap <span className="text-destructive">*</span></Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Nama Anda"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Alamat Email <span className="text-destructive">*</span></Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="email@contoh.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subjek <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, subject: val }))}
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Pilih topik pesan Anda" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Pesan <span className="text-destructive">*</span></Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Ceritakan kebutuhan atau pertanyaan Anda secara detail..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="btn-primary btn-lg w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Mengirim...</>
                      ) : (
                        <>
                          Kirim Pesan
                          <PaperPlaneTilt className="ml-2 w-5 h-5" weight="fill" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Dengan mengirim formulir ini, Anda setuju dengan{' '}
                      <Link href="/privacy" className="underline hover:text-foreground transition-colors">
                        Kebijakan Privasi
                      </Link>{' '}
                      kami.
                    </p>
                  </form>
                </>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              {...fadeInUp}
              className="space-y-6"
            >
              {/* Support Channels */}
              <div>
                <h3 className="text-lg font-bold mb-4">Cara Lain Menghubungi Kami</h3>
                <div className="space-y-3">
                  {supportChannels.map((channel) => (
                    <Link
                      key={channel.title}
                      href={channel.href}
                      className="card card-hover p-4 flex items-start gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <channel.icon className="w-5 h-5" weight="duotone" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm mb-0.5">{channel.title}</p>
                        <p className="text-xs text-muted-foreground mb-1">{channel.description}</p>
                        <span className="text-xs font-medium text-green-600">{channel.availability}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" weight="bold" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="card card-premium p-5">
                <div className="flex items-center gap-3 mb-3">
                  <WhatsappLogo className="w-6 h-6 text-green-500" weight="fill" aria-hidden="true" />
                  <span className="font-semibold">WhatsApp</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Hubungi kami langsung via WhatsApp untuk respons yang lebih cepat.
                </p>
                <a
                  href="https://wa.me/62811127812"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2"
                >
                  <WhatsappLogo className="w-4 h-4" weight="fill" aria-hidden="true" />
                  Chat di WhatsApp
                </a>
              </div>

              {/* Department Emails */}
              <div className="card p-5">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Envelope className="w-4 h-4" weight="duotone" aria-hidden="true" />
                  Email per Departemen
                </h4>
                <div className="space-y-3">
                  {departmentEmails.map((dept) => (
                    <div key={dept.email} className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">{dept.dept}</span>
                      <a
                        href={`mailto:${dept.email}`}
                        className="text-sm font-medium hover:text-foreground transition-colors"
                      >
                        {dept.email}
                      </a>
                      <span className="text-xs text-muted-foreground">{dept.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Hours */}
              <div className="card p-5">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" weight="duotone" aria-hidden="true" />
                  Jam Operasional
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Senin – Jumat</span>
                    <span className="font-medium">09.00 – 18.00 WIB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sabtu</span>
                    <span className="font-medium">10.00 – 15.00 WIB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minggu & Libur</span>
                    <span className="font-medium text-muted-foreground">Tutup</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <p className="text-xs text-muted-foreground">
                      * Live chat & email dijawab 24/7 oleh sistem otomatis. Agen manusia tersedia pada jam kerja.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

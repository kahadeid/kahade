/*
 * KAHADE CONTACT PAGE - CLICKUP-INSPIRED REDESIGN
 * 
 * Design Philosophy:
 * - ClickUp-style smooth animations and micro-interactions
 * - Enhanced card hover effects with elevation
 * - Improved form interactions
 * - Brand color: var(--color-black)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Envelope, Phone, MapPin, PaperPlaneTilt, ChatCircle, Clock, 
  ArrowRight, WhatsappLogo, Headset, Question
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

const contactInfo = [
  {
    icon: Envelope,
    title: 'Email Kami',
    value: 'support@kahade.id',
    description: 'Respon dalam 24 jam',
    action: 'mailto:support@kahade.id'
  },
  {
    icon: Phone,
    title: 'Telepon Kami',
    value: '+62 811-1278-12',
    description: 'Sen - Jum, 09.00 - 18.00 WIB',
    action: 'tel:+62811127812'
  },
  {
    icon: MapPin,
    title: 'Kunjungi Kami',
    value: 'Bogor, Jawa Barat',
    description: 'Gg. Abot, Cihideung Udik, Kec. Ciampea',
    action: 'https://maps.google.com/?q=Gg.+Abot+Cihideung+Udik+Ciampea+Bogor+Jawa+Barat+16620'
  }
];

const quickLinks = [
  {
    icon: Headset,
    title: 'Pusat Bantuan',
    description: 'Jelajahi basis pengetahuan untuk jawaban cepat',
    href: '/help',
    cta: 'Kunjungi Pusat Bantuan'
  },
  {
    icon: Question,
    title: 'FAQ',
    description: 'Temukan jawaban untuk pertanyaan umum',
    href: '/faq',
    cta: 'Lihat FAQ'
  },
  {
    icon: WhatsappLogo,
    title: 'WhatsApp',
    description: 'Chat langsung dengan kami di WhatsApp',
    href: 'https://wa.me/62811127812',
    cta: 'Mulai Chat',
    external: true
  }
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Pesan terkirim!', {
      description: 'Tim kami akan segera menghubungi Anda.'
    });
    
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

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
              Hubungi Kami
            </motion.span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-black">
              Mari Terhubung
            </h1>
            <p className="text-base md:text-lg text-neutral-600">
              Punya pertanyaan atau butuh bantuan? Tim kami siap membantu Anda 24/7.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Contact Info Cards */}
      <section className="pb-12 md:pb-16">
        <div className="container">
          <div className="grid sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {contactInfo.map((info, index) => (
              <motion.a
                key={info.title}
                href={info.action}
                target={info.action.startsWith('http') ? '_blank' : undefined}
                rel={info.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-4 md:p-6 border border-neutral-200 text-center group hover:shadow-clickup hover:border-neutral-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300 cursor-pointer"
              >
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-black group-hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
                >
                  <info.icon className="w-6 h-6 md:w-7 md:h-7" weight="bold" />
                </motion.div>
                <h3 className="font-bold mb-1 text-black text-sm md:text-base">{info.title}</h3>
                <p className="text-black font-medium mb-1 text-sm md:text-base">{info.value}</p>
                <p className="text-xs md:text-sm text-neutral-600">{info.description}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
      
      {/* Contact Form & Quick Links */}
      <section className="py-12 md:py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3 bg-white rounded-2xl p-6 md:p-8 border border-neutral-200 hover:shadow-clickup transition-shadow duration-300"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-black">Kirim Pesan</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-black text-sm font-medium">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nama Anda"
                      required
                      className="h-11 md:h-12 bg-white border-neutral-200 focus:border-black focus:ring-black rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-black text-sm font-medium">Alamat Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@contoh.com"
                      required
                      className="h-11 md:h-12 bg-white border-neutral-200 focus:border-black focus:ring-black rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-black text-sm font-medium">Topik</Label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger className="h-11 md:h-12 bg-white border-neutral-200 focus:border-black focus:ring-black rounded-xl">
                      <SelectValue placeholder="Pilih topik" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Pertanyaan Umum</SelectItem>
                      <SelectItem value="support">Dukungan Teknis</SelectItem>
                      <SelectItem value="billing">Pembayaran & Tagihan</SelectItem>
                      <SelectItem value="partnership">Kemitraan</SelectItem>
                      <SelectItem value="feedback">Masukan</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-black text-sm font-medium">Pesan</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Bagaimana kami dapat membantu?"
                    rows={5}
                    required
                    className="bg-white border-neutral-200 focus:border-black focus:ring-black resize-none rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 md:h-12 bg-black text-white hover:bg-black/90 font-semibold rounded-xl btn-hover-lift"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Mengirim...</>
                  ) : (
                    <>
                      Kirim Pesan
                      <PaperPlaneTilt className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
            
            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-4 md:space-y-5"
            >
              <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">Tautan Cepat</h2>
              
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl p-4 md:p-5 border border-neutral-200 hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
                >
                  <div className="flex items-start gap-4 md:gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0"
                    >
                      <link.icon className="w-5 h-5 md:w-6 md:h-6 text-black" weight="bold" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold mb-1 text-black text-sm md:text-base">{link.title}</h3>
                      <p className="text-xs md:text-sm text-neutral-600 mb-3">{link.description}</p>
                      {link.external ? (
                        <a 
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-semibold text-black hover:underline"
                        >
                          {link.cta}
                          <ArrowRight className="ml-1 w-4 h-4" aria-hidden="true" weight="bold" />
                        </a>
                      ) : (
                        <Link href={link.href} className="inline-flex items-center text-sm font-semibold text-black hover:underline">
                          {link.cta}
                          <ArrowRight className="ml-1 w-4 h-4" aria-hidden="true" weight="bold" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Business Hours */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl p-4 md:p-5 border border-neutral-200 hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
              >
                <div className="flex items-start gap-4 md:gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0"
                  >
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-black" aria-hidden="true" weight="bold" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-3 text-black text-sm md:text-base">Jam Operasional</h3>
                    <div className="space-y-2 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Senin - Jumat</span>
                        <span className="font-medium text-black">09.00 - 18.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Sabtu</span>
                        <span className="font-medium text-black">09.00 - 15.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Minggu</span>
                        <span className="text-neutral-600">Tutup</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-black rounded-2xl md:rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" aria-hidden="true" />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 right-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-white/5 rounded-full blur-3xl" 
            />
            <div className="relative z-10">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6"
              >
                <ChatCircle className="w-7 h-7 md:w-8 md:h-8 text-white" aria-hidden="true" weight="bold" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Butuh bantuan segera?</h2>
              <p className="text-white/70 text-sm md:text-base mb-6 max-w-lg mx-auto">
                Tim dukungan kami tersedia 24/7 melalui live chat untuk membantu kebutuhan mendesak Anda.
              </p>
              <Button 
                className="h-12 md:h-14 px-6 md:px-8 bg-white text-black hover:bg-gray-100 font-semibold rounded-xl btn-hover-lift"
                onClick={() => window.open('https://wa.me/62811127812', '_blank')}
              >
                <WhatsappLogo className="mr-2 w-5 h-5" aria-hidden="true" weight="fill" />
                Chat di WhatsApp
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

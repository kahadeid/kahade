/*
 * KAHADE API DOCUMENTATION — NEW PAGE v1.0
 *
 * Dokumentasi API internal escrow P2P (user-to-user).
 * BUKAN dokumentasi bisnis/B2B.
 * Konteks: Developer yang membangun di atas platform Kahade.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Code, Key, ArrowRight, Lock, Broadcast, FileText,
  CheckCircle, Warning, Info, Terminal, BookOpen
} from '@phosphor-icons/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

const endpoints = [
  {
    method: 'POST',
    path: '/api/v1/transactions',
    desc: 'Buat transaksi escrow baru',
    auth: true,
    tag: 'Transaksi',
  },
  {
    method: 'GET',
    path: '/api/v1/transactions/:id',
    desc: 'Dapatkan detail transaksi berdasarkan ID',
    auth: true,
    tag: 'Transaksi',
  },
  {
    method: 'POST',
    path: '/api/v1/transactions/:id/fund',
    desc: 'Setor dana ke transaksi escrow',
    auth: true,
    tag: 'Pembayaran',
  },
  {
    method: 'POST',
    path: '/api/v1/transactions/:id/release',
    desc: 'Konfirmasi dan lepas dana ke penjual',
    auth: true,
    tag: 'Transaksi',
  },
  {
    method: 'POST',
    path: '/api/v1/transactions/:id/dispute',
    desc: 'Ajukan sengketa atas transaksi',
    auth: true,
    tag: 'Sengketa',
  },
  {
    method: 'GET',
    path: '/api/v1/wallet/balance',
    desc: 'Dapatkan saldo dompet pengguna',
    auth: true,
    tag: 'Dompet',
  },
  {
    method: 'POST',
    path: '/api/v1/wallet/withdraw',
    desc: 'Ajukan penarikan ke rekening bank',
    auth: true,
    tag: 'Dompet',
  },
  {
    method: 'GET',
    path: '/api/v1/users/profile',
    desc: 'Dapatkan profil pengguna yang terautentikasi',
    auth: true,
    tag: 'Pengguna',
  },
];

const webhookEvents = [
  { event: 'transaction.created', desc: 'Transaksi baru dibuat oleh pengguna' },
  { event: 'transaction.funded', desc: 'Dana berhasil disetor ke escrow' },
  { event: 'transaction.released', desc: 'Dana dilepas ke penjual' },
  { event: 'transaction.disputed', desc: 'Sengketa diajukan oleh salah satu pihak' },
  { event: 'transaction.cancelled', desc: 'Transaksi dibatalkan oleh pengguna' },
  { event: 'transaction.completed', desc: 'Transaksi selesai dan ditutup' },
  { event: 'withdrawal.completed', desc: 'Penarikan saldo berhasil diproses' },
  { event: 'kyc.verified', desc: 'Verifikasi identitas pengguna berhasil' },
];

const methodColors: Record<string, string> = {
  'GET': 'bg-blue-50 text-blue-700 border-blue-200',
  'POST': 'bg-green-50 text-green-700 border-green-200',
  'PUT': 'bg-amber-50 text-amber-700 border-amber-200',
  'DELETE': 'bg-red-50 text-red-700 border-red-200',
};

export default function ApiDocs() {
  const [activeTag, setActiveTag] = useState<string>('Semua');
  const tags = ['Semua', 'Transaksi', 'Pembayaran', 'Dompet', 'Pengguna', 'Sengketa'];
  const filtered = activeTag === 'Semua' ? endpoints : endpoints.filter(e => e.tag === activeTag);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="section-padding-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--muted)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" aria-hidden="true" />
        <div className="container relative z-10">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <span className="badge badge-secondary mb-4 inline-block">Dokumentasi API</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              API Escrow P2P Kahade
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Integrasikan mekanisme escrow peer-to-peer Kahade ke aplikasi Anda.
              REST API yang terdokumentasi, aman, dan mudah digunakan.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/docs/integration">
                <Button className="btn-primary">
                  Panduan Mulai Cepat
                  <ArrowRight className="ml-2 w-4 h-4" weight="bold" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">
                  Minta API Key
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Base Info */}
      <section className="section-padding">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {[
              { icon: Key, title: 'Autentikasi', desc: 'Bearer JWT token. Dapatkan token via endpoint /auth/login.' },
              { icon: Lock, title: 'HTTPS Only', desc: 'Semua request harus menggunakan HTTPS. HTTP akan ditolak.' },
              { icon: Terminal, title: 'Base URL', desc: 'https://api.kahade.id/v1 — semua endpoint relatif ke base ini.' },
            ].map((item) => (
              <motion.div key={item.title} {...fadeInUp} className="card p-5">
                <item.icon className="w-6 h-6 mb-3" weight="duotone" aria-hidden="true" />
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Rate Limit Notice */}
          <div className="card border-amber-200 bg-amber-50/50 p-4 flex items-start gap-3 max-w-5xl mx-auto mb-8">
            <Warning className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" weight="duotone" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Rate Limit</p>
              <p className="text-sm text-amber-700">
                API dibatasi 100 request/menit per API key. Untuk limit lebih tinggi, hubungi{' '}
                <a href="mailto:halo@kahade.id" className="underline">halo@kahade.id</a>.
              </p>
            </div>
          </div>

          {/* Endpoints */}
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Endpoint API</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`badge cursor-pointer transition-colors ${
                      activeTag === tag ? 'badge-primary' : 'badge-secondary hover:bg-foreground hover:text-background'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {filtered.map((ep) => (
                <motion.div
                  key={ep.path}
                  variants={staggerItem}
                  className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <span className={`badge border font-mono text-xs font-bold w-fit flex-shrink-0 ${methodColors[ep.method]}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-foreground flex-1 break-all">{ep.path}</code>
                  <p className="text-sm text-muted-foreground sm:text-right flex-1">{ep.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-secondary text-xs">{ep.tag}</span>
                    {ep.auth && (
                      <span className="badge badge-secondary text-xs flex items-center gap-1">
                        <Lock className="w-3 h-3" weight="bold" aria-hidden="true" />
                        Auth
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Broadcast className="w-6 h-6" weight="duotone" aria-hidden="true" />
                <h2 className="text-2xl font-bold">Webhook Events</h2>
              </div>
              <p className="text-muted-foreground">
                Kahade akan mengirim POST request ke URL webhook Anda ketika event berikut terjadi.
                Setiap payload disertai signature HMAC-SHA256 untuk verifikasi.
              </p>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-3"
            >
              {webhookEvents.map((we) => (
                <motion.div key={we.event} variants={staggerItem} className="card p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" aria-hidden="true" />
                  <div>
                    <code className="text-sm font-mono font-semibold block mb-1">{we.event}</code>
                    <p className="text-xs text-muted-foreground">{we.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Auth Example */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="card card-premium p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-6 h-6" weight="duotone" aria-hidden="true" />
                <h2 className="text-xl font-bold">Contoh Request</h2>
              </div>
              <div className="bg-muted/80 rounded-xl p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-foreground whitespace-pre leading-relaxed">{`# Autentikasi — dapatkan token
curl -X POST https://api.kahade.id/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@contoh.com", "password": "kata_sandi_anda"}'

# Buat transaksi escrow baru
curl -X POST https://api.kahade.id/v1/transactions \\
  -H "Authorization: Bearer <TOKEN_JWT_ANDA>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Pembelian Laptop Gaming",
    "amount": 12500000,
    "currency": "IDR",
    "counterpartyEmail": "penjual@contoh.com",
    "role": "BUYER",
    "holdingPeriodDays": 7,
    "description": "Laptop gaming bekas kondisi mulus"
  }'`}</pre>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" weight="duotone" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  Seluruh jumlah transaksi dalam satuan <strong>Rupiah (IDR)</strong>. Tidak ada dukungan mata uang asing saat ini.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nav */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs/integration">
              <Button className="btn-primary w-full sm:w-auto">
                <BookOpen className="mr-2 w-4 h-4" weight="duotone" aria-hidden="true" />
                Panduan Integrasi
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" className="w-full sm:w-auto">
                Kembali ke Dokumentasi
              </Button>
            </Link>
            <a href="mailto:halo@kahade.id" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Tanya Tim API
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

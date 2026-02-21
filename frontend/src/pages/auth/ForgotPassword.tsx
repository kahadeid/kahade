import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Envelope, CheckCircle, Key } from '@phosphor-icons/react';
import { Link } from 'wouter';
import { fadeInUp } from '@/lib/animations';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    let c = 45;
    setCountdown(c);
    const t = setInterval(() => { c--; setCountdown(c); if (c <= 0) clearInterval(t); }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/login">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Login
          </button>
        </Link>

        {!submitted ? (
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Key size={32} className="text-primary" weight="duotone" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Lupa Password?</h1>
            <p className="text-muted-foreground text-sm mb-8">
              Masukkan email Anda dan kami akan mengirimkan tautan reset password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <div className="relative">
                  <Envelope size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email" required placeholder="email@contoh.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full h-12">Kirim Tautan Reset</button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Kembali ke{' '}<Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">Login</Link>
            </p>
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <CheckCircle size={32} className="text-green-600" weight="fill" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email Terkirim!</h1>
            <p className="text-muted-foreground text-sm mb-2">
              Periksa inbox <strong>{email}</strong> untuk tautan reset.
            </p>
            <p className="text-xs text-muted-foreground mb-8">(Juga cek folder spam)</p>
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Kirim ulang dalam: <span className="font-semibold text-foreground">0:{countdown.toString().padStart(2, '0')}</span>
              </p>
            ) : (
              <button onClick={() => { setSubmitted(false); setCountdown(0); }} className="btn-secondary">
                Kirim Ulang
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

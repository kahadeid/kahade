import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Warning, UserCircle, Package, ShieldCheck, ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { buyerRisks, sellerRisks } from './HomeData';
import { cn, ariaProps } from '@/lib/ui-utils';

export default function ProblemSection() {
  return (
    <section className="section-padding-lg" aria-labelledby="problem-heading">
      <div className="container">
        <div className="section-header">
          <motion.h2 
            id="problem-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="section-title"
          >
            Risiko ada di kedua sisi
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="section-description"
          >
            Tanpa perlindungan yang tepat, pembeli dan penjual sama-sama menghadapi risiko besar dalam transaksi online.
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Buyer Risks */}
          <motion.article
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group"
          >
            <div className="card card-hover h-full p-6 md:p-8 border-2 border-destructive/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <UserCircle className="w-7 h-7 md:w-8 md:h-8 text-destructive" aria-hidden="true" weight="duotone" />
                </div>
                <div>
                  <div className="badge badge-error mb-2">
                    RISIKO PEMBELI
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-1">Tanpa Perlindungan</h3>
                  <p className="text-sm text-muted-foreground">Risiko tinggi kehilangan uang</p>
                </div>
              </div>
              <ul className="space-y-4" role="list">
                {buyerRisks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Warning className="w-4 h-4 text-destructive" aria-hidden="true" weight="fill" />
                    </div>
                    <span className="text-sm md:text-base text-muted-foreground leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
          
          {/* Seller Risks */}
          <motion.article
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group"
          >
            <div className="card card-hover h-full p-6 md:p-8 border-2 border-warning/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-warning/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-7 h-7 md:w-8 md:h-8 text-warning" aria-hidden="true" weight="duotone" />
                </div>
                <div>
                  <div className="badge badge-warning mb-2">
                    RISIKO PENJUAL
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-1">Tanpa Perlindungan</h3>
                  <p className="text-sm text-muted-foreground">Risiko tinggi penipuan</p>
                </div>
              </div>
              <ul className="space-y-4" role="list">
                {sellerRisks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Warning className="w-4 h-4 text-warning" aria-hidden="true" weight="fill" />
                    </div>
                    <span className="text-sm md:text-base text-muted-foreground leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        </div>
        
        {/* Solution Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 md:mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-primary rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" aria-hidden="true" />
            <div className="relative z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-6 shadow-xl">
                <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" aria-hidden="true" weight="duotone" />
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4 text-balance">
                Kahade menghilangkan risiko ini
              </h3>
              <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                Sistem escrow kami menahan dana dengan aman sampai kedua pihak puas,
                memastikan transaksi yang adil dan terlindungi untuk semua.
              </p>
              <Link href="/register">
                <Button 
                  className="btn-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg"
                  {...ariaProps('Start secure transaction with Kahade')}
                >
                  Mulai Transaksi Aman
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

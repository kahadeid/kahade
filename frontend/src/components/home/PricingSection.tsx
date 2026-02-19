import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Check, CreditCard } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { pricingPlans } from './HomeData';
import { cn } from '@/lib/ui-utils';

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="pricing" className="section-padding-lg bg-muted">
      <div className="container">
        <div className="section-header">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-title"
          >
            Harga Transparan
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="section-description mb-8"
          >
            Pilih paket yang sesuai kebutuhan Anda. Tanpa biaya tersembunyi.
          </motion.p>
          
          {/* Billing Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <span className={cn(
              'text-sm font-medium transition-colors',
              !isYearly ? 'text-foreground' : 'text-muted-foreground'
            )}>
              Bulanan
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors',
                isYearly ? 'bg-primary' : 'bg-muted-foreground/20'
              )}
              aria-label={`Switch to ${isYearly ? 'monthly' : 'yearly'} billing`}
            >
              <span 
                className={cn(
                  'absolute top-1 w-5 h-5 rounded-full bg-background shadow-md transition-transform',
                  isYearly ? 'left-8' : 'left-1'
                )}
              />
            </button>
            <span className={cn(
              'text-sm font-medium transition-colors',
              isYearly ? 'text-foreground' : 'text-muted-foreground'
            )}>
              Tahunan
              <span className="ml-2 badge badge-success text-xs">Hemat 20%</span>
            </span>
          </motion.div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-start">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative rounded-2xl p-6 md:p-8',
                plan.popular 
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/10' 
                  : 'card'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2" aria-hidden="true">
                  <span className="badge badge-secondary shadow-lg">
                    Paling Populer
                  </span>
                </div>
              )}
              <div className={cn(
                'text-lg font-bold mb-1',
                plan.popular ? 'text-primary-foreground' : 'text-foreground'
              )}>
                {plan.name}
              </div>
              <p className={cn(
                'text-sm mb-6',
                plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}>
                {plan.description}
              </p>
              <div className={cn(
                'text-3xl md:text-4xl font-bold mb-1',
                plan.popular ? 'text-primary-foreground' : 'text-foreground'
              )}>
                {formatPrice(isYearly ? plan.yearlyPrice : plan.monthlyPrice)}
              </div>
              <div className={cn(
                'text-sm mb-6',
                plan.popular ? 'text-primary-foreground/60' : 'text-muted-foreground'
              )}>
                {plan.monthlyPrice === 0 ? 'selamanya' : isYearly ? '/tahun' : '/bulan'}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check 
                      className={cn(
                        'w-5 h-5 shrink-0 mt-0.5',
                        plan.popular ? 'text-primary-foreground' : 'text-foreground'
                      )} 
                      weight="bold" 
                      aria-hidden="true"
                    />
                    <span className={cn(
                      'text-sm',
                      plan.popular ? 'text-primary-foreground/90' : 'text-muted-foreground'
                    )}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block block">
                <Button className={cn(
                  'w-full btn-lg',
                  plan.popular 
                    ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' 
                    : 'btn-primary'
                )}>
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Platform Fee Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 md:mt-16 max-w-3xl mx-auto"
        >
          <div className="card bg-accent/50 border-accent p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-accent-foreground" aria-hidden="true" weight="duotone" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold mb-2">Biaya Platform Per Transaksi</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4">
                  Kahade mengenakan biaya layanan yang adil dan transparan untuk setiap transaksi escrow:
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="card p-4">
                    <div className="text-xs text-muted-foreground mb-1">Persentase</div>
                    <div className="text-2xl font-bold">2.5%</div>
                    <div className="text-xs text-muted-foreground mt-1">dari nilai transaksi</div>
                  </div>
                  <div className="card p-4">
                    <div className="text-xs text-muted-foreground mb-1">Minimum</div>
                    <div className="text-2xl font-bold">Rp 2.500</div>
                    <div className="text-xs text-muted-foreground mt-1">biaya terendah</div>
                  </div>
                  <div className="card p-4">
                    <div className="text-xs text-muted-foreground mb-1">Maksimum</div>
                    <div className="text-2xl font-bold">Rp 250.000</div>
                    <div className="text-xs text-muted-foreground mt-1">biaya tertinggi</div>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-4 italic">
                  * Biaya platform digunakan untuk menjaga keamanan, infrastruktur, dan dukungan pelanggan 24/7
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

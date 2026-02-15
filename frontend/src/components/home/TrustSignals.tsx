import { motion } from 'framer-motion';
import { trustSignals } from './HomeData';
import { fadeInUp } from '@/lib/animations';

export default function TrustSignals() {
  return (
    <section className="section-padding border-y border-border bg-muted">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {trustSignals.map((signal, index) => (
            <motion.div 
              key={signal.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 md:mb-2">{signal.value}</div>
              <div className="text-sm md:text-base text-muted-foreground">{signal.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

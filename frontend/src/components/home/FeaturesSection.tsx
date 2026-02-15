import { motion } from 'framer-motion';
import { features } from './HomeData';
import { cn } from '@/lib/ui-utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function FeaturesSection() {
  return (
    <section id="features" className="section-padding-lg bg-muted" aria-labelledby="features-heading">
      <div className="container">
        <div className="section-header">
          <motion.h2 
            id="features-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="section-title"
          >
            Mengapa pilih Kahade
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="section-description"
          >
            Platform escrow paling lengkap dengan fitur keamanan mutakhir.
          </motion.p>
        </div>
        
        <motion.div 
          className="max-w-6xl mx-auto"
          {...staggerContainer}
          viewport={{ once: true }}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                variants={staggerItem}
                className="group"
              >
                <div className="card card-hover h-full p-6 md:p-8">
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300">
                      <feature.icon 
                        className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" 
                        weight="bold" 
                        aria-hidden="true" 
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

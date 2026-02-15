import { motion } from 'framer-motion';
import { steps } from './HomeData';
import { cn } from '@/lib/ui-utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function HowItWorksSection() {
  return (
    <section className="section-padding-lg" aria-labelledby="how-it-works-heading">
      <div className="container">
        <div className="section-header">
          <motion.h2 
            id="how-it-works-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="section-title"
          >
            Cara Kerja Kahade
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="section-description"
          >
            Proses 5 langkah yang sederhana untuk transaksi aman dan tepercaya.
          </motion.p>
        </div>
        
        {/* Mobile: Vertical Timeline */}
        <motion.div 
          className="md:hidden max-w-md mx-auto"
          {...staggerContainer}
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              variants={staggerItem}
              className="flex gap-4 mb-8 last:mb-0"
            >
              <div className="flex flex-col items-center">
                <div 
                  className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 shadow-lg"
                  aria-label={`Step ${step.step}`}
                >
                  {step.step}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-border mt-2 min-h-[40px]" aria-hidden="true" />
                )}
              </div>
              <div className="pt-2">
                <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Tablet & Desktop: Horizontal Timeline */}
        <motion.div 
          className="hidden md:block max-w-5xl mx-auto"
          {...staggerContainer}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-5 gap-4 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={staggerItem}
                className="relative text-center group"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div 
                    className="absolute top-6 left-1/2 w-full h-0.5 bg-border group-hover:bg-primary transition-colors duration-300" 
                    aria-hidden="true"
                  />
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <div 
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
                    aria-label={`Step ${step.step}`}
                  >
                    <step.icon className="w-6 h-6 lg:w-7 lg:h-7" weight="bold" aria-hidden="true" />
                  </div>
                  <div className="inline-flex badge badge-primary text-[10px] mb-2">
                    Langkah {step.step}
                  </div>
                  <h3 className="text-sm lg:text-base font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

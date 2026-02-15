import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, ChatCircleDots } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ariaProps } from '@/lib/ui-utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function FinalCTA() {
  return (
    <section 
      className="section-padding-lg bg-primary text-primary-foreground relative overflow-hidden"
      aria-labelledby="final-cta-heading"
    >
      {/* Background Patterns */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" 
        aria-hidden="true"
      />
      <div 
        className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary-foreground/5 rounded-full blur-3xl" 
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-primary-foreground/5 rounded-full blur-3xl" 
        aria-hidden="true"
      />
      
      <div className="container relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center px-4"
          {...staggerContainer}
          viewport={{ once: true }}
        >
          <motion.h2 
            id="final-cta-heading"
            variants={staggerItem}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-balance"
          >
            Siap mengamankan transaksi Anda?
          </motion.h2>
          
          <motion.p 
            variants={staggerItem}
            className="text-base md:text-lg lg:text-xl text-primary-foreground/80 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Bergabung dengan ribuan pengguna yang mempercayai Kahade untuk transaksi online mereka.
            Mulai gratis hari ini.
          </motion.p>
          
          <motion.div 
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center items-center"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button 
                className="btn-lg w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-2xl hover:shadow-primary-foreground/20 hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
                {...ariaProps('Start free account with Kahade')}
              >
                Mulai Gratis
                <ArrowRight className="ml-2 w-5 aria-hidden="true" h-5" weight="bold" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button 
                className="btn-lg w-full sm:w-auto border-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300"
                {...ariaProps('Contact sales team')}
              >
                <ChatCircleDots className="mr-2 w-5 aria-hidden="true" h-5" weight="bold" aria-hidden="true" />
                Hubungi Sales
              </Button>
            </Link>
          </motion.div>
          
          <motion.p 
            variants={staggerItem}
            className="mt-6 md:mt-8 text-sm text-primary-foreground/60"
          >
            Tidak perlu kartu kredit · Paket gratis tersedia selamanya · Setup dalam 2 menit
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

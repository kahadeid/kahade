import { motion } from 'framer-motion';
import { Icon } from '@phosphor-icons/react';

interface FeatureCardProps {
  icon: Icon;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ 
  icon: IconComponent, 
  title, 
  description,
  delay = 0 
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      whileHover={{ 
        y: -8, 
        transition: { duration: 0.2 } 
      }}
      className="group relative"
    >
      <div className="relative h-full p-6 rounded-2xl bg-white border border-black/5 
                    hover:border-neutral-900/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] 
                    transition-all duration-300">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br 
                      from-black/0 via-black/0 to-black/5 opacity-0 
                      group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          {/* Icon with animated background */}
          <div className="w-14 h-14 rounded-xl bg-black 
                        group-hover:scale-110 group-hover:rotate-3 
                        transition-all duration-300 flex items-center justify-center mb-4">
            <IconComponent className="w-7 h-7 text-white" aria-hidden="true" weight="duotone" />
          </div>
          
          <h3 className="text-lg font-bold text-black mb-2 
                       group-hover:translate-x-1 transition-transform duration-300">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

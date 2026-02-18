import { motion } from 'framer-motion';
import { Star, Quotes } from '@phosphor-icons/react';
import { testimonials } from './HomeData';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function TestimonialsSection() {
  return (
    <section className="section-padding-lg" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className="section-header">
          <motion.h2 
            id="testimonials-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="section-title"
          >
            Dipercaya ribuan pengguna
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="section-description"
          >
            Lihat pengalaman pengguna kami bersama Kahade.
          </motion.p>
        </div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto"
          {...staggerContainer}
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              variants={staggerItem}
              className="group"
            >
              <div className="card card-hover h-full p-6 md:p-8 relative">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
                  <Quotes className="w-12 h-12 text-primary" aria-hidden="true" weight="fill" />
                </div>
                
                <div className="relative z-10">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4 md:mb-6" role="img" aria-label={`Rating: ${testimonial.rating} out of 5 stars`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-warning" weight="fill" aria-hidden="true" />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed text-sm md:text-base">
                    <p>"{testimonial.content}"</p>
                  </blockquote>
                  
                  {/* Author */}
                  <footer className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <cite className="font-semibold text-sm md:text-base not-italic">
                        {testimonial.name}
                      </cite>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </footer>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/*
 * KAHADE MOBILE APP PAGE - PROFESSIONAL REDESIGN
 * 
 * Design Philosophy:
 * - Clean, modern, and professional aesthetic
 * - Fully responsive for Mobile, Tablet, and Desktop
 * - Brand color: var(--color-black)
 */

import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  DeviceMobile, AppleLogo, GooglePlayLogo, QrCode,
  ShieldCheck, Lightning, Bell, Fingerprint, ArrowRight, Sparkle
} from '@phosphor-icons/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const features = [
  { icon: ShieldCheck, title: 'Secure Transactions', description: 'Bank-level encryption and biometric authentication keep your funds safe.' },
  { icon: Lightning, title: 'Instant Notifications', description: 'Real-time push notifications for every transaction update.' },
  { icon: Bell, title: 'Smart Alerts', description: 'Customizable alerts for payment deadlines and important milestones.' },
  { icon: Fingerprint, title: 'Biometric Login', description: 'Quick and secure access with Face ID or fingerprint authentication.' }
];

const screenshots = [
  { title: 'Dashboard', description: 'Track all your transactions at a glance' },
  { title: 'Transaction Details', description: 'Full visibility into every escrow' },
  { title: 'Wallet', description: 'Manage your balance with ease' },
  { title: 'Notifications', description: 'Stay updated on every step' }
];

export default function MobileApp() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 lg:pt-40 pb-12 md:pb-16 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--muted)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" aria-hidden="true" />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
                <Sparkle className="w-4 h-4" aria-hidden="true" weight="fill" />
                Coming Soon
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-black leading-tight">
                Kahade in Your Pocket
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-neutral-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Experience the full power of Kahade escrow on your mobile device. 
                Secure transactions, instant notifications, and complete control wherever you go.
              </p>
              
              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 md:gap-4 mb-8 justify-center lg:justify-start">
                <Button className="bg-black hover:bg-black/90 text-white px-5 md:px-6 py-3 md:py-4 h-auto rounded-xl gap-3">
                  <AppleLogo className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" weight="fill" />
                  <div className="text-left">
                    <div className="text-[10px] md:text-xs opacity-80">Download on the</div>
                    <div className="font-semibold text-sm md:text-base">App Store</div>
                  </div>
                </Button>
                <Button className="border-2 border-neutral-200 bg-white text-black hover:bg-neutral-100 px-5 md:px-6 py-3 md:py-4 h-auto rounded-xl gap-3">
                  <GooglePlayLogo className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" weight="fill" />
                  <div className="text-left">
                    <div className="text-[10px] md:text-xs opacity-80">Get it on</div>
                    <div className="font-semibold text-sm md:text-base">Google Play</div>
                  </div>
                </Button>
              </div>
              
              {/* QR Code */}
              <div className="hidden md:flex items-center gap-4 p-4 rounded-xl bg-neutral-100 max-w-sm mx-auto lg:mx-0">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white flex items-center justify-center border border-neutral-200">
                  <QrCode className="w-10 h-10 md:w-12 md:h-12 text-black" aria-hidden="true" weight="regular" />
                </div>
                <div>
                  <div className="font-semibold text-sm md:text-base text-black">Scan to Download</div>
                  <div className="text-xs md:text-sm text-neutral-600">Point your camera at the QR code</div>
                </div>
              </div>
            </motion.div>
            
            {/* Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative order-first lg:order-last"
            >
              <div className="relative mx-auto w-56 h-[460px] md:w-72 md:h-[580px] bg-black rounded-[2.5rem] md:rounded-[3rem] p-2.5 md:p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 md:w-32 h-5 md:h-6 bg-black rounded-b-xl md:rounded-b-2xl" aria-hidden="true" />
                <div className="w-full h-full bg-gradient-to-br from-[#F5F5F5] to-[#E8E8E8] rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-black flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <DeviceMobile className="w-7 h-7 md:w-10 md:h-10 text-white" aria-hidden="true" weight="fill" />
                    </div>
                    <div className="font-bold text-base md:text-lg text-black">Kahade Mobile</div>
                    <div className="text-xs md:text-sm text-neutral-600">Coming Soon</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              Features
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">
              Powerful Features on the Go
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-neutral-600 max-w-2xl mx-auto">
              Everything you need to manage your escrow transactions from your mobile device.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-neutral-200 text-center group hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6 md:w-7 md:h-7" weight="bold" />
                </div>
                <h3 className="font-bold text-base md:text-lg mb-2 text-black">{feature.title}</h3>
                <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Screenshots Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold mb-4">
              Preview
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">
              Beautiful & Intuitive Design
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-neutral-600 max-w-2xl mx-auto">
              A seamless experience designed for simplicity and efficiency.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {screenshots.map((screen, index) => (
              <motion.div
                key={screen.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-full aspect-[9/16] max-w-[180px] md:max-w-[200px] mx-auto bg-gradient-to-br from-[#F5F5F5] to-[#E8E8E8] rounded-2xl md:rounded-3xl mb-3 md:mb-4 flex items-center justify-center border border-neutral-200">
                  <span className="text-xs md:text-sm text-muted-foreground">Preview</span>
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1 text-black">{screen.title}</h3>
                <p className="text-xs md:text-sm text-neutral-600">{screen.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" aria-hidden="true" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto px-4"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
              <DeviceMobile className="w-7 h-7 md:w-8 md:h-8 text-white" aria-hidden="true" weight="bold" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
              Get Notified When We Launch
            </h2>
            <p className="text-white/70 text-sm md:text-base lg:text-lg mb-8 max-w-lg mx-auto">
              Be the first to know when Kahade Mobile is available for download.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center">
              <Link href="/register">
                <Button className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 bg-white text-black hover:bg-gray-100 font-semibold rounded-xl">
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" weight="bold" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl bg-transparent">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

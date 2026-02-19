/*
 * KAHADE FOOTER - OPTIMIZED V2.0
 * 
 * Improvements:
 * - Uses design system utilities
 * - Enhanced accessibility
 * - Better responsive design
 * - Cleaner code organization
 */

import { Link, useLocation } from 'wouter';
import { useEffect, useMemo } from 'react';
import { 
  TwitterLogo, 
  InstagramLogo, 
  LinkedinLogo, 
  GithubLogo,
  YoutubeLogo,
  DiscordLogo
} from '@phosphor-icons/react';
import { cn, ariaProps } from '@/lib/ui-utils';

// Footer data structure
const footerLinks = {
  product: {
    title: 'Produk',
    links: [
      { label: 'Fitur', href: '/#features' },
      { label: 'Harga', href: '/#pricing' },
      { label: 'Aplikasi Mobile', href: '/mobile-app' },
      { label: 'API', href: '/docs/api' },
      { label: 'Integrasi', href: '/docs/integration' },
    ]
  },
  resources: {
    title: 'Sumber Daya',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Cara Kerja', href: '/how-it-works' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Pusat Bantuan', href: '/help' },
      { label: 'Dokumentasi', href: '/docs' },
    ]
  },
  company: {
    title: 'Perusahaan',
    links: [
      { label: 'Tentang Kami', href: '/about' },
      { label: 'Karier', href: '/careers' },
      { label: 'Kontak', href: '/contact' },
      { label: 'Pers', href: '/press' },
      { label: 'Mitra', href: '/partners' },
    ]
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Syarat Layanan', href: '/terms' },
      { label: 'Kebijakan Privasi', href: '/privacy' },
      { label: 'Kebijakan Cookie', href: '/cookies' },
      { label: 'Lisensi', href: '/licenses' },
      { label: 'Keamanan', href: '/security' },
    ]
  }
};

const socialLinks = [
  { icon: TwitterLogo, href: 'https://twitter.com/kahade', label: 'Twitter' },
  { icon: InstagramLogo, href: 'https://instagram.com/kahade', label: 'Instagram' },
  { icon: LinkedinLogo, href: 'https://linkedin.com/company/kahade', label: 'LinkedIn' },
  { icon: GithubLogo, href: 'https://github.com/kahade', label: 'GitHub' },
  { icon: YoutubeLogo, href: 'https://youtube.com/@kahade', label: 'YouTube' },
  { icon: DiscordLogo, href: 'https://discord.gg/kahade', label: 'Discord' },
];

// Scroll to top link component
interface ScrollToTopLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function ScrollToTopLink({ href, children, className, onClick }: ScrollToTopLinkProps) {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onClick?.();
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

export default function Footer() {
  const [location] = useLocation();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  return (
    <footer 
      className="bg-background border-t border-border relative overflow-hidden"
      role="contentinfo"
      aria-label="Footer situs"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--muted)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" aria-hidden="true" />
      
      {/* Main Footer Content */}
      <div className="relative container py-10 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-4">
            <ScrollToTopLink href="/" className="inline-block mb-4 md:mb-6">
              <img 
                src="/images/logo.svg" 
                alt="Kahade - Platform Escrow Tepercaya" 
                className="h-7 md:h-8 w-auto"
                width={120}
                height={32}
              />
            </ScrollToTopLink>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8 max-w-sm">
              Platform escrow P2P tepercaya di Indonesia. PT Kawal Hak Dengan Aman — melindungi pembeli dan penjual sejak 2024.
            </p>
          </div>
          
          {/* Link Columns */}
          <div className="lg:col-span-8">
            <nav 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
              aria-label="Navigasi footer"
            >
              {Object.entries(footerLinks).map(([key, section]) => (
                <FooterLinkSection
                  key={key}
                  title={section.title}
                  links={section.links}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Compliance & Copyright */}
      <div className="relative border-t border-border">
        <div className="container py-6 md:py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6">
            {/* Social Links */}
            <div 
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2"
              role="navigation"
              aria-label="Tautan media sosial"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center',
                    'bg-muted text-muted-foreground',
                    'hover:bg-primary hover:text-primary-foreground',
                    'transition-all duration-200'
                  )}
                  {...ariaProps(`Kunjungi halaman ${social.label} kami`)}
                >
                  <social.icon className="w-4 h-4" weight="regular" aria-hidden="true" />
                </a>
              ))}
            </div>
            
            {/* Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-xs md:text-sm text-muted-foreground/70">
                © {currentYear} PT Kawal Hak Dengan Aman (Kahade). Hak cipta dilindungi undang-undang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface FooterLinkSectionProps {
  title: string;
  links: Array<{ label: string; href: string }>;
}

function FooterLinkSection({ title, links }: FooterLinkSectionProps) {
  return (
    <div>
      <h4 className="section-label text-sm md:text-base mb-4 md:mb-5">
        {title}
      </h4>
      <ul className="space-y-2 md:space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <ScrollToTopLink 
              href={link.href}
              className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </ScrollToTopLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

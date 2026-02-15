/**
 * SEO Utilities
 * 
 * Comprehensive SEO optimization utilities for React applications.
 * Handles meta tags, Open Graph, Twitter Cards, structured data, and more.
 */

import { useEffect } from 'react';

/**
 * Meta Tag Configuration
 */
export interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  robots?: string;
  canonical?: string;
  og?: OpenGraphTags;
  twitter?: TwitterCardTags;
  jsonLd?: any;
}

/**
 * Open Graph Tags
 */
export interface OpenGraphTags {
  title?: string;
  description?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  url?: string;
  image?: string;
  imageAlt?: string;
  siteName?: string;
  locale?: string;
}

/**
 * Twitter Card Tags
 */
export interface TwitterCardTags {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

/**
 * Structured Data Types
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface Product {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  reviewCount?: number;
}

/**
 * Default SEO Configuration
 */
const DEFAULT_SEO = {
  siteName: 'Kahade',
  description: 'Platform marketplace terpercaya dengan sistem escrow untuk transaksi aman',
  locale: 'id_ID',
  twitterSite: '@kahade',
};

/**
 * Set page title
 */
export function setTitle(title: string, template?: string): void {
  const fullTitle = template
    ? template.replace('%s', title)
    : `${title} | ${DEFAULT_SEO.siteName}`;
  
  document.title = fullTitle;
}

/**
 * Set meta tag
 */
export function setMeta(
  name: string,
  content: string,
  property = false
): void {
  const attr = property ? 'property' : 'name';
  let element = document.querySelector(`meta[${attr}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

/**
 * Set canonical URL
 */
export function setCanonical(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = url;
}

/**
 * Set all meta tags
 */
export function setMetaTags(config: MetaTags): void {
  // Title
  if (config.title) {
    setTitle(config.title);
  }

  // Description
  if (config.description) {
    setMeta('description', config.description);
  }

  // Keywords
  if (config.keywords) {
    setMeta('keywords', config.keywords);
  }

  // Author
  if (config.author) {
    setMeta('author', config.author);
  }

  // Robots
  if (config.robots) {
    setMeta('robots', config.robots);
  }

  // Canonical
  if (config.canonical) {
    setCanonical(config.canonical);
  }

  // Open Graph
  if (config.og) {
    setOpenGraphTags(config.og);
  }

  // Twitter Cards
  if (config.twitter) {
    setTwitterCardTags(config.twitter);
  }

  // JSON-LD Structured Data
  if (config.jsonLd) {
    setJsonLd(config.jsonLd);
  }
}

/**
 * Set Open Graph tags
 */
export function setOpenGraphTags(og: OpenGraphTags): void {
  if (og.title) {
    setMeta('og:title', og.title, true);
  }

  if (og.description) {
    setMeta('og:description', og.description, true);
  }

  if (og.type) {
    setMeta('og:type', og.type, true);
  }

  if (og.url) {
    setMeta('og:url', og.url, true);
  }

  if (og.image) {
    setMeta('og:image', og.image, true);
    if (og.imageAlt) {
      setMeta('og:image:alt', og.imageAlt, true);
    }
  }

  if (og.siteName) {
    setMeta('og:site_name', og.siteName, true);
  } else {
    setMeta('og:site_name', DEFAULT_SEO.siteName, true);
  }

  if (og.locale) {
    setMeta('og:locale', og.locale, true);
  } else {
    setMeta('og:locale', DEFAULT_SEO.locale, true);
  }
}

/**
 * Set Twitter Card tags
 */
export function setTwitterCardTags(twitter: TwitterCardTags): void {
  if (twitter.card) {
    setMeta('twitter:card', twitter.card);
  }

  if (twitter.site) {
    setMeta('twitter:site', twitter.site);
  } else {
    setMeta('twitter:site', DEFAULT_SEO.twitterSite);
  }

  if (twitter.creator) {
    setMeta('twitter:creator', twitter.creator);
  }

  if (twitter.title) {
    setMeta('twitter:title', twitter.title);
  }

  if (twitter.description) {
    setMeta('twitter:description', twitter.description);
  }

  if (twitter.image) {
    setMeta('twitter:image', twitter.image);
    if (twitter.imageAlt) {
      setMeta('twitter:image:alt', twitter.imageAlt);
    }
  }
}

/**
 * Set JSON-LD structured data
 */
export function setJsonLd(data: any): void {
  const scriptId = 'jsonld-structured-data';
  let script = document.getElementById(scriptId);

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate product structured data
 */
export function generateProductJsonLd(product: Product): any {
  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
    },
  };

  if (product.rating && product.reviewCount) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return data;
}

/**
 * Generate organization structured data
 */
export function generateOrganizationJsonLd(): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kahade',
    url: 'https://kahade.com',
    logo: 'https://kahade.com/logo.png',
    description: DEFAULT_SEO.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jakarta',
      addressCountry: 'ID',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@kahade.com',
    },
    sameAs: [
      'https://twitter.com/kahade',
      'https://facebook.com/kahade',
      'https://instagram.com/kahade',
    ],
  };
}

/**
 * React hook for setting SEO meta tags
 * 
 * @example
 * ```tsx
 * function ProductPage({ product }) {
 *   useSEO({
 *     title: product.name,
 *     description: product.description,
 *     og: {
 *       type: 'product',
 *       image: product.image,
 *     },
 *   });
 *   
 *   return <div>...</div>;
 * }
 * ```
 */
export function useSEO(config: MetaTags): void {
  useEffect(() => {
    setMetaTags(config);

    // Cleanup on unmount
    return () => {
      // Reset to default title
      document.title = DEFAULT_SEO.siteName;
    };
  }, [config]);
}

/**
 * Generate SEO-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract keywords from text
 */
export function extractKeywords(
  text: string,
  maxKeywords = 10
): string[] {
  // Remove common words
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for',
    'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on',
    'that', 'the', 'to', 'was', 'will', 'with', 'yang', 'di',
    'ke', 'dari', 'untuk', 'dengan', 'ini', 'itu', 'dan',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count word frequency
  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  // Sort by frequency and return top keywords
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Truncate text to specified length for meta descriptions
 */
export function truncateForMeta(
  text: string,
  maxLength = 160
): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Validate and optimize image for Open Graph
 */
export function optimizeOGImage(imageUrl: string): string {
  // Ensure absolute URL
  if (!imageUrl.startsWith('http')) {
    const origin = typeof window !== 'undefined'
      ? window.location.origin
      : 'https://kahade.com';
    return `${origin}${imageUrl}`;
  }
  
  return imageUrl;
}

/**
 * Get current page URL (canonical)
 */
export function getCanonicalUrl(): string {
  if (typeof window === 'undefined') return '';
  
  const url = new URL(window.location.href);
  // Remove query parameters and hash for canonical URL
  return `${url.origin}${url.pathname}`;
}

export default {
  setTitle,
  setMeta,
  setCanonical,
  setMetaTags,
  setOpenGraphTags,
  setTwitterCardTags,
  setJsonLd,
  generateBreadcrumbJsonLd,
  generateProductJsonLd,
  generateOrganizationJsonLd,
  useSEO,
  generateSlug,
  extractKeywords,
  truncateForMeta,
  optimizeOGImage,
  getCanonicalUrl,
};

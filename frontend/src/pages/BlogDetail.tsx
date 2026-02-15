import { SkipToContent } from '@/lib/accessibility';
/*
 * KAHADE BLOG DETAIL PAGE - CLICKUP-INSPIRED REDESIGN
 * 
 * Design Philosophy:
 * - ClickUp-style smooth animations and micro-interactions
 * - Enhanced reading experience with better typography
 * - Floating action buttons with animations
 * - Brand color: var(--color-black)
 * 
 * SECURITY FIX [FE-SEC-001]: Replaced dangerouslySetInnerHTML with html-react-parser
 * - Safer HTML rendering with React component parsing
 * - Automatic noopener noreferrer on external links
 * - DOMPurify sanitization still applied
 */

import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, User, CalendarBlank, Tag, ShareNetwork,
  TwitterLogo, FacebookLogo, LinkedinLogo, Link as LinkIcon,
  BookmarkSimple, Heart, ChatCircle, CaretRight, Copy, Check,
  ArrowRight, Eye, Spinner
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import parse, { HTMLReactParserOptions, Element, domToReact } from 'html-react-parser';
import LandingLayout from '@/components/layout/LandingLayout';

interface Author {
  name: string;
  avatar: string;
  role: string;
  bio: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: Author;
  publishedAt: string;
  readTime: number;
  views: number;
  likes: number;
  commentsCount: number;
}

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  publishedAt: string;
  readTime: number;
}

const mockPost: BlogPost = {
  id: '1',
  slug: 'escrow-security-best-practices',
  title: 'Praktik Terbaik Keamanan Escrow: Melindungi Transaksi Online Anda di 2025',
  excerpt: 'Pelajari cara melindungi diri saat membeli atau menjual online dengan praktik keamanan escrow berikut.',
  content: `
    <p class="lead">Di pasar digital yang berkembang cepat, mengamankan transaksi online Anda menjadi semakin krusial. Layanan escrow muncul sebagai pilar kepercayaan dalam e-commerce, memberikan jaring pengaman bagi pembeli dan penjual.</p>
    
    <h2>Memahami Layanan Escrow</h2>
    <p>Layanan escrow bertindak sebagai pihak ketiga netral yang menahan dana selama transaksi. Dana hanya dilepas ke penjual setelah pembeli mengonfirmasi bahwa barang atau jasa telah diterima sesuai deskripsi. Mekanisme sederhana namun kuat ini telah merevolusi perdagangan online.</p>
    
    <blockquote>
      <p>"Kepercayaan adalah fondasi semua perdagangan. Layanan escrow menyediakan kepercayaan itu di era digital."</p>
      <cite>— Pakar Keamanan Finansial</cite>
    </blockquote>
    
    <h2>Fitur Keamanan Utama yang Perlu Dicari</h2>
    <p>Saat memilih layanan escrow, perhatikan fitur keamanan penting berikut:</p>
    
    <h3>1. Autentikasi Dua Faktor (2FA)</h3>
    <p>Selalu aktifkan 2FA pada akun escrow Anda. Ini menambahkan lapisan keamanan ekstra dengan meminta verifikasi kedua selain kata sandi.</p>
    
    <h3>2. Enkripsi End-to-End</h3>
    <p>Pastikan platform menggunakan enkripsi setara bank (SSL 256-bit) untuk melindungi data dan informasi finansial Anda saat transmisi.</p>
    
    <h3>3. Sistem Verifikasi Identitas</h3>
    <p>Pilih platform yang menerapkan verifikasi KYC (Know Your Customer). Ini membantu memastikan Anda bertransaksi dengan pihak yang sah.</p>
    
    <h2>Praktik Terbaik untuk Pembeli</h2>
    <ul>
      <li>Selalu verifikasi reputasi dan riwayat penjual</li>
      <li>Gunakan sistem pesan platform untuk semua komunikasi</li>
      <li>Dokumentasikan semuanya dengan foto dan tangkapan layar</li>
      <li>Jangan pernah melepas dana sebelum memeriksa barang secara menyeluruh</li>
      <li>Laporkan aktivitas mencurigakan segera</li>
    </ul>
    
    <h2>Praktik Terbaik untuk Penjual</h2>
    <ul>
      <li>Berikan deskripsi barang yang akurat dan detail</li>
      <li>Gunakan nomor resi untuk semua pengiriman</li>
      <li>Tanggapi pertanyaan pembeli dengan cepat</li>
      <li>Simpan catatan semua transaksi</li>
      <li>Bangun reputasi melalui layanan berkualitas konsisten</li>
    </ul>
    
    <h2>Masa Depan Transaksi Aman</h2>
    <p>Seiring teknologi berkembang, kita melihat inovasi baru dalam keamanan transaksi. Escrow berbasis blockchain, smart contract, dan deteksi penipuan berbasis AI membentuk masa depan perdagangan online yang aman.</p>
    
    <p>Di Kahade, kami berkomitmen menerapkan teknologi keamanan terbaru untuk melindungi pengguna. Platform kami menggabungkan keandalan escrow tradisional dengan fitur keamanan mutakhir untuk memberikan pengalaman transaksi paling aman.</p>
    
    <h2>Kesimpulan</h2>
    <p>Keamanan dalam transaksi online adalah tanggung jawab bersama. Dengan memilih layanan escrow tepercaya dan mengikuti praktik terbaik, Anda dapat mengurangi risiko dan menikmati manfaat pasar digital dengan percaya diri.</p>
  `,
  coverImage: '/images/blog/escrow-security.jpg',
  category: 'Keamanan',
  tags: ['Keamanan', 'Escrow', 'Praktik Terbaik', 'Keamanan Online'],
  author: {
    name: 'Ahmad Rizky',
    avatar: '/images/team/ahmad.jpg',
    role: 'Analis Keamanan',
    bio: 'Ahmad adalah pakar keamanan siber dengan pengalaman lebih dari 10 tahun di keamanan fintech. Ia memimpin inisiatif keamanan kami di Kahade.'
  },
  publishedAt: '2025-01-15T10:00:00Z',
  readTime: 8,
  views: 2456,
  likes: 128,
  commentsCount: 24
};

const mockRelatedPosts: RelatedPost[] = [
  {
    id: '2',
    slug: 'how-escrow-works',
    title: 'Cara Kerja Escrow: Panduan Lengkap untuk Pemula',
    excerpt: 'Semua yang perlu Anda ketahui tentang layanan escrow dan bagaimana melindungi transaksi Anda.',
    coverImage: '/images/blog/how-escrow-works.jpg',
    category: 'Panduan',
    publishedAt: '2025-01-10T10:00:00Z',
    readTime: 6
  },
  {
    id: '3',
    slug: 'avoiding-online-scams',
    title: '10 Tanda Bahaya untuk Mengenali Penipuan Online Sebelum Terlambat',
    excerpt: 'Pelajari cara mengenali taktik penipuan umum dan lindungi diri dari transaksi curang.',
    coverImage: '/images/blog/avoid-scams.jpg',
    category: 'Keamanan',
    publishedAt: '2025-01-05T10:00:00Z',
    readTime: 5
  },
  {
    id: '4',
    slug: 'marketplace-success-tips',
    title: 'Sukses di Marketplace: Tips untuk Pembeli dan Penjual',
    excerpt: 'Maksimalkan keberhasilan Anda di marketplace online dengan strategi yang sudah terbukti.',
    coverImage: '/images/blog/marketplace-tips.jpg',
    category: 'Tips',
    publishedAt: '2024-12-28T10:00:00Z',
    readTime: 7
  }
];

export default function BlogDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setPost(mockPost);
        setRelatedPosts(mockRelatedPosts);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [params.slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Tautan disalin ke clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Gagal menyalin tautan');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Dihapus dari suka' : 'Ditambahkan ke suka');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Dihapus dari bookmark' : 'Disimpan ke bookmark');
  };

  if (isLoading) {
    return (
      <LandingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner className="w-8 h-8 md:w-1 aria-hidden="true"0 md:h-10 animate-spin text-black" weight="bold" aria-hidden="true" />
        </div>
      </LandingLayout>
    );
  }

  if (!post) {
    return (
      <LandingLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-xl md:text-2xl font-bold text-black mb-4">Artikel Tidak Ditemukan</h1>
            <p className="text-sm md:text-base text-neutral-600 mb-6">Artikel yang Anda cari tidak tersedia atau telah dihapus.</p>
            <Link href="/blog">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="h-10 md:h-11 bg-black text-white hover:bg-black/90 rounded-xl">
                  <ArrowLeft className="w-4 aria-hidden="true" h-4 mr-2" weight="bold" aria-hidden="true" />
                  Kembali ke Blog
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </LandingLayout>
    );
  }

  // SECURITY FIX [FE-SEC-001]: Sanitize HTML content with DOMPurify
  const sanitizedContent = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "em", "strong", "b", "i", "u",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div", "cite"
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id"],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "form", "input", "button", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onmouseout", "onfocus", "onblur"],
  });

  // SECURITY FIX [FE-SEC-001]: Use html-react-parser instead of dangerouslySetInnerHTML
  // Parse options to automatically add noopener noreferrer to external links
  const parseOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === 'a') {
        const href = domNode.attribs.href;
        const props: Record<string, string> = { ...domNode.attribs };
        
        // Add security attributes to external links
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          props.target = '_blank';
          props.rel = 'noopener noreferrer';
        }
        
        return (
          <a {...props}>
            {domToReact(domNode.children as any, parseOptions)}
          </a>
        );
      }
    }
  };

  // Parse sanitized HTML into React components
  const parsedContent = parse(sanitizedContent, parseOptions);

  return (
    <LandingLayout>
      <article className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-neutral-50 border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {/* Breadcrumb */}
            <motion.nav 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-neutral-600 mb-4 md:mb-6"
            >
              <Link href="/" className="hover:text-neutral-900 transition-colors">Beranda</Link>
              <CaretRight className="w-3 h-3 md:w-4 aria-hidden="true" md:h-4" weight="bold" aria-hidden="true" />
              <Link href="/blog" className="hover:text-neutral-900 transition-colors">Blog</Link>
              <CaretRight className="w-3 h-3 md:w-4 aria-hidden="true" md:h-4" weight="bold" aria-hidden="true" />
              <span className="text-black">{post.category}</span>
            </motion.nav>

            {/* Category & Meta */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-wrap items-center gap-4 md:gap-4 mb-3 md:mb-4"
            >
              <Badge className="bg-black text-white hover:bg-black/90 text-xs">{post.category}</Badge>
              <div className="flex items-center gap-4 md:gap-4 text-xs md:text-sm text-neutral-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 md:w-4 aria-hidden="true" md:h-4" weight="regular" aria-hidden="true" />
                  {post.readTime} menit baca
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 md:w-4 aria-hidden="true" md:h-4" weight="regular" aria-hidden="true" />
                  {post.views.toLocaleString()} tayangan
                </span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 md:mb-6 leading-tight"
            >
              {post.title}
            </motion.h1>

            {/* Author & Date */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 md:gap-4">
                <Avatar className="w-10 h-10 md:w-1 aria-hidden="true"2 md:h-12">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback className="bg-black text-white text-sm">
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm md:text-base text-black">{post.author.name}</div>
                  <div className="text-xs md:text-sm text-neutral-600">
                    {post.author.role} • {formatDate(post.publishedAt)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLike}
                    className={`h-9 border-neutral-200 rounded-lg transition-all ${isLiked ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                  >
                    <Heart className="w-4 aria-hidden="true" h-4 mr-1" weight={isLiked ? 'fill' : 'regular'} />
                    {post.likes + (isLiked ? 1 : 0)}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBookmark}
                    className={`h-9 border-neutral-200 rounded-lg transition-all ${isBookmarked ? 'bg-amber-50 border-amber-200 text-amber-600' : ''}`}
                  >
                    <BookmarkSimple className="w-4 aria-hidden="true" h-4" weight={isBookmarked ? 'fill' : 'regular'} />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-2 md:-mt-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="aspect-[16/9] md:aspect-[2/1] rounded-xl md:rounded-2xl overflow-hidden bg-neutral-100 shadow-clickup"
          >
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/1200x600/f5f5f5/737373?text=Blog+Cover';
              }}
            />
          </motion.div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-8 lg:gap-12">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="prose prose-sm md:prose-lg max-w-none
                prose-headings:text-black prose-headings:font-bold
                prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-8 md:prose-h2:mt-10 prose-h2:mb-3 md:prose-h2:mb-4
                prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-6 md:prose-h3:mt-8 prose-h3:mb-2 md:prose-h3:mb-3
                prose-p:text-neutral-600 prose-p:leading-relaxed
                prose-a:text-black prose-a:underline hover:prose-a:no-underline
                prose-strong:text-black
                prose-ul:my-3 md:prose-ul:my-4 prose-li:text-neutral-600
                prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:bg-neutral-50 prose-blockquote:py-3 md:prose-blockquote:py-4 prose-blockquote:px-4 md:prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                prose-blockquote:text-neutral-600"
            >
              {/* SECURITY FIX [FE-SEC-001]: Using html-react-parser instead of dangerouslySetInnerHTML */}
              {parsedContent}
            </motion.div>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="sticky top-24 space-y-4"
              >
                {/* Share */}
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-sm font-bold text-black mb-3">Bagikan artikel ini</div>
                  <div className="flex flex-col gap-2">
                    <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start border-neutral-200 rounded-lg h-9 hover:bg-black hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        onClick={() => handleShare('twitter')}
                      >
                        <TwitterLogo className="w-4 aria-hidden="true" h-4 mr-2" weight="fill" aria-hidden="true" />
                        Twitter
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start border-neutral-200 rounded-lg h-9 hover:bg-black hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        onClick={() => handleShare('facebook')}
                      >
                        <FacebookLogo className="w-4 aria-hidden="true" h-4 mr-2" weight="fill" aria-hidden="true" />
                        Facebook
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start border-neutral-200 rounded-lg h-9 hover:bg-black hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        onClick={() => handleShare('linkedin')}
                      >
                        <LinkedinLogo className="w-4 aria-hidden="true" h-4 mr-2" weight="fill" aria-hidden="true" />
                        LinkedIn
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start border-neutral-200 rounded-lg h-9 hover:bg-black hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        onClick={handleCopyLink}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 aria-hidden="true" h-4 mr-2" weight="bold" aria-hidden="true" />
                            Tersalin!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 aria-hidden="true" h-4 mr-2" weight="regular" aria-hidden="true" />
                            Salin tautan
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-sm font-bold text-black mb-3">Tag</div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge variant="outline" className="border-neutral-200 hover:bg-black hover:text-white transition-colors cursor-pointer text-xs">
                            {tag}
                          </Badge>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>

          {/* Tags - Mobile */}
          <div className="lg:hidden mt-6 md:mt-8 pt-6 md:pt-8 border-t border-neutral-200">
            <div className="text-sm font-bold text-black mb-3">Tag</div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Badge variant="outline" className="border-neutral-200 hover:bg-black hover:text-white transition-colors cursor-pointer text-xs">
                      {tag}
                    </Badge>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-8 md:mt-12 p-4 md:p-6 bg-neutral-50 rounded-xl md:rounded-2xl"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-4">
              <Avatar className="w-12 h-12 md:w-1 aria-hidden="true"6 md:h-16">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback className="bg-black text-white text-base md:text-lg">
                  {post.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-xs md:text-sm text-neutral-600 mb-1">Ditulis oleh</div>
                <div className="text-base md:text-lg font-bold text-black">{post.author.name}</div>
                <div className="text-xs md:text-sm text-neutral-600 mb-2 md:mb-3">{post.author.role}</div>
                <p className="text-sm md:text-base text-neutral-600">{post.author.bio}</p>
              </div>
            </div>
          </motion.div>

          {/* Share - Mobile */}
          <div className="lg:hidden mt-6 md:mt-8 flex items-center justify-center gap-2 md:gap-3">
            <span className="text-xs md:text-sm text-neutral-600">Bagikan:</span>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="outline" size="icon" className="w-9 h-9 border-neutral-200 rounded-lg" onClick={() => handleShare('twitter')}>
                <TwitterLogo className="w-4 aria-hidden="true" h-4" weight="fill" aria-hidden="true" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="outline" size="icon" className="w-9 h-9 border-neutral-200 rounded-lg" onClick={() => handleShare('facebook')}>
                <FacebookLogo className="w-4 aria-hidden="true" h-4" weight="fill" aria-hidden="true" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="outline" size="icon" className="w-9 h-9 border-neutral-200 rounded-lg" onClick={() => handleShare('linkedin')}>
                <LinkedinLogo className="w-4 aria-hidden="true" h-4" weight="fill" aria-hidden="true" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="outline" size="icon" className="w-9 h-9 border-neutral-200 rounded-lg" onClick={handleCopyLink}>
                {copied ? <Check className="w-4 aria-hidden="true" h-4" weight="bold" aria-hidden="true" /> : <Copy className="w-4 aria-hidden="true" h-4" weight="regular" aria-hidden="true" />}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="bg-neutral-50 border-t border-neutral-200 py-10 md:py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-6 md:mb-8"
            >
              <h2 className="text-xl md:text-2xl font-bold text-black">Artikel Terkait</h2>
              <Link href="/blog">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="h-9 md:h-10 border-neutral-200 rounded-lg text-sm">
                    Lihat semua
                    <ArrowRight className="w-4 aria-hidden="true" h-4 ml-2" weight="bold" aria-hidden="true" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {relatedPosts.map((relatedPost, index) => (
                <motion.article
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-xl md:rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-clickup transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-300 group"
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                      <motion.img 
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        src={relatedPost.coverImage} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f5f5f5/737373?text=Blog';
                        }}
                      />
                    </div>
                    <div className="p-4 md:p-5">
                      <Badge variant="outline" className="mb-2 md:mb-3 border-neutral-200 text-xs">{relatedPost.category}</Badge>
                      <h3 className="font-bold text-sm md:text-base text-black mb-2 line-clamp-2 group-hover:text-neutral-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-xs md:text-sm text-neutral-600 line-clamp-2 mb-3">{relatedPost.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDate(relatedPost.publishedAt)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 aria-hidden="true" h-3" weight="regular" aria-hidden="true" />
                          {relatedPost.readTime} menit
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </article>
    </LandingLayout>
  );
}

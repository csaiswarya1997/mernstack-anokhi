import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  LogIn,
  Mail,
  Phone,
  Instagram,
  MapPin,
  MessageCircle,
  Share2,
  ChevronUp
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import API_URL from '../config';

const Logo = ({ className = "h-8", textColor = "text-primary" }) => (
  <div className={`flex flex-col items-center gap-1 -mt-5 ${className}`}>
    <div className="relative flex items-center justify-center">
      <span className={`text-[1.35rem] md:text-4xl font-serif font-bold tracking-tighter ${textColor} flex items-center`}>
        Z
        <span className="relative">
          A
          <div className="absolute top-[30%] -left-1">
            <div className="w-1.5 h-1.5 bg-current opacity-90" style={{ clipPath: 'polygon(50% 0%, 53% 47%, 100% 50%, 53% 53%, 50% 100%, 47% 53%, 0% 50%, 47% 47%)' }}></div>
          </div>
        </span>
        L
        <span className="relative flex items-center justify-center mx-[-0.02em]">
          O
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-current" style={{ clipPath: 'polygon(50% 0%, 53% 47%, 100% 50%, 53% 53%, 50% 100%, 47% 53%, 0% 50%, 47% 47%)' }}></div>
          </div>
        </span>
        URA
      </span>
    </div>
    <span className={`text-[6px] md:text-[8px] font-sans font-normal tracking-[0.4em] md:tracking-[0.8em] ${textColor} opacity-80 mt-[-0.4rem]`}>
      OWN THE ELEGANCE
    </span>
  </div>
);

const Layout = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const { cartCount, showAlert } = useCart();
  const { userInfo } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleShareWebsite = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const siteUrl = window.location.origin;
    try {
      if (navigator.share) {
        let files = [];
        try {
          const response = await fetch('/logo.png');
          const blob = await response.blob();
          const file = new File([blob], 'logo.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            files = [file];
          }
        } catch (fileErr) {
          console.warn('Could not attach logo file for sharing', fileErr);
        }

        const shareData = {
          title: 'Zaloura Boutique & Atelier',
          text: 'Explore handcrafted luxury and elegant heritage textiles at Zaloura Boutique & Atelier.',
          url: siteUrl
        };
        if (files.length > 0) {
          shareData.files = files;
        }

        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(siteUrl);
        showAlert('Link Copied', 'Website link copied to clipboard.');
      }
    } catch (err) {
      console.error('Error sharing website', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-secondary">
      {/* Global Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100]"
        style={{ scaleX }}
      />
      {/* Top Info Bar */}
      <div className="bg-secondary py-2 border-b border-white/5">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.25em]">
          <div className="flex items-center gap-6 md:gap-8">
            <a href={`tel:${settings?.phone}`} className="flex items-center gap-2 text-white/90 hover:text-accent transition-colors" title={settings?.phone || '+91 8921273858'}>
              <Phone size={12} className="text-accent" /> <span className="hidden lg:inline">{settings?.phone || '+91 8921273858'}</span>
            </a>
            <a href={`mailto:${settings?.email}`} className="flex items-center gap-2 text-white/90 hover:text-accent transition-colors" title={settings?.email || 'zaloura.in@gmail.com'}>
              <Mail size={12} className="text-accent" /> <span className="hidden lg:inline">{settings?.email || 'zaloura.in@gmail.com'}</span>
            </a>
          </div>
          <div className="flex items-center gap-6 md:gap-8">
            <a href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-green-400 transition-colors" title="WhatsApp">
              <MessageCircle size={12} /> <span className="hidden lg:inline">WhatsApp</span>
            </a>
            <a href={`https://instagram.com/${settings?.instagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-accent transition-colors" title="Instagram">
              <Instagram size={12} /> <span className="hidden lg:inline">Instagram</span>
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-2 md:px-16 h-20 flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 hover:bg-accent/10 rounded-full transition-colors text-primary focus:outline-none"
              aria-label="Toggle Menu"
            >
              <motion.div
                key={isMobileMenuOpen ? "open" : "closed"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </button>
            <Link to="/">
              <Logo className="h-6 md:h-8" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/zaloura-ethnic-wear" className={({ isActive }) => `text-[11px] uppercase tracking-widest font-bold transition-colors border-b-2 pb-1 ${isActive ? 'text-primary border-primary' : 'text-primary/60 border-transparent hover:text-primary hover:border-primary/30'}`}>Atelier</NavLink>
            <NavLink to="/zaloura-kurtis" className={({ isActive }) => `text-[11px] uppercase tracking-widest font-bold transition-colors border-b-2 pb-1 ${isActive ? 'text-primary border-primary' : 'text-primary/60 border-transparent hover:text-primary hover:border-primary/30'}`}>Kurtis</NavLink>
            <NavLink to="/zaloura-salwars" className={({ isActive }) => `text-[11px] uppercase tracking-widest font-bold transition-colors border-b-2 pb-1 ${isActive ? 'text-primary border-primary' : 'text-primary/60 border-transparent hover:text-primary hover:border-primary/30'}`}>Salwars</NavLink>
            <NavLink to="/zaloura-bespoke" className={({ isActive }) => `text-[11px] uppercase tracking-widest font-bold transition-colors border-b-2 pb-1 ${isActive ? 'text-primary border-primary' : 'text-primary/60 border-transparent hover:text-primary hover:border-primary/30'}`}>Bespoke</NavLink>
            <NavLink to="/zaloura-sustainability" className={({ isActive }) => `text-[11px] uppercase tracking-widest font-bold transition-colors border-b-2 pb-1 ${isActive ? 'text-primary border-primary' : 'text-primary/60 border-transparent hover:text-primary hover:border-primary/30'}`}>Sustainability</NavLink>
            <NavLink to="/contact-zaloura" className={({ isActive }) => `text-[11px] uppercase tracking-widest font-bold transition-colors border-b-2 pb-1 ${isActive ? 'text-primary border-primary' : 'text-primary/60 border-transparent hover:text-primary hover:border-primary/30'}`}>Contact</NavLink>
          </nav>

          <div className="flex items-center gap-2.5 md:gap-4">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-1.5 md:p-2 hover:bg-accent/20 rounded-full transition-colors text-primary" title="Search">
              <Search size={20} />
            </button>
            <button onClick={handleShareWebsite} className="p-1.5 md:p-2 hover:bg-accent/20 rounded-full transition-colors text-primary" title="Share Website">
              <Share2 size={20} />
            </button>
            <Link to={userInfo ? "/zaloura-profile" : "/zaloura-login"} className="p-1.5 md:p-2 hover:bg-accent/20 rounded-full transition-colors flex items-center gap-2 group" title="Account">
              <User size={20} className="text-primary" />
              {userInfo && (
                <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-primary">
                  {userInfo.name?.split(' ')[0] || 'Profile'}
                </span>
              )}
              {!userInfo && (
                <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-primary">
                  Account
                </span>
              )}
            </Link>
            <Link to="/zaloura-cart" className="p-1.5 md:p-2 hover:bg-accent/20 rounded-full transition-colors relative text-primary" title="Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-3 md:p-6 shadow-xl z-50"
            >
              <form onSubmit={handleSearch} className="max-w-[1280px] mx-auto flex items-center gap-3 md:gap-6">
                <div className="flex-1 relative group">
                  <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none">
                    <Search size={18} />
                  </button>
                  <input
                    type="text"
                    placeholder="Search kurtis, salwars, products..."
                    autoFocus
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 md:pl-12 pr-4 py-3 md:py-4 outline-none focus:border-primary/20 focus:bg-white transition-all font-serif italic text-sm md:text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-primary text-white px-4 md:px-8 py-2.5 md:py-4 rounded-2xl font-bold uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg shadow-primary/10"
                >
                  Search
                </motion.button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-primary"
                >
                  <X size={20} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-28 px-8 flex flex-col justify-between pb-12"
          >
            <motion.nav
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
              className="flex flex-col gap-6"
            >
              {[
                { to: "/zaloura-ethnic-wear", label: "Shop All" },
                { to: "/zaloura-kurtis", label: "Kurtis" },
                { to: "/zaloura-salwars", label: "Salwars" },
                { to: "/zaloura-bespoke", label: "Bespoke Customization" },
                { to: "/about-zaloura", label: "About Zaloura" },
                { to: "/zaloura-sustainability", label: "Sustainability" },
                { to: "/contact-zaloura", label: "Contact Us" },
                { to: userInfo ? "/zaloura-profile" : "/zaloura-login", label: userInfo ? "My Account" : "Login / Register" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { x: -20, opacity: 0 },
                    visible: { x: 0, opacity: 1 }
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <NavLink
                    onClick={() => setIsMobileMenuOpen(false)}
                    to={item.to}
                    className={({ isActive }) =>
                      `text-3xl font-serif block transition-all duration-300 ${isActive
                        ? 'text-primary font-bold translate-x-2'
                        : 'text-secondary hover:text-primary'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </motion.nav>

            {/* Bottom contact info in mobile menu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="border-t border-gray-100 pt-8 space-y-4"
            >
              <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Atelier Concierge</p>
              <p className="text-sm font-serif italic text-primary">{settings?.email || 'zaloura.in@gmail.com'}</p>
              <p className="text-xs font-sans text-secondary">{settings?.phone || '+91 8921273858'}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      {/* Compact Premium Footer */}
      <footer className="bg-secondary text-white py-12 border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/5 pb-12">

            {/* Logo & Identity */}
            <div className="space-y-6">
              <Logo className="h-8" textColor="text-white" />
              <p className="text-[11px] text-white/40 font-serif italic leading-relaxed max-w-xs">
                Handcrafted elegance for the modern woman. Bridging heritage textile arts with contemporary luxury.
              </p>
              <div className="flex items-center gap-4">
                <a href={`https://instagram.com/${settings?.instagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-primary transition-colors">
                  <Instagram size={16} />
                </a>
                <a href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-green-400 transition-colors">
                  <MessageCircle size={16} />
                </a>
                <a href={`mailto:${settings?.email}`} className="text-white/30 hover:text-primary transition-colors">
                  <Mail size={16} />
                </a>
                <button onClick={handleShareWebsite} className="text-white/30 hover:text-primary transition-colors flex items-center justify-center p-0 bg-transparent border-none" title="Share Website">
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary mb-6">Atelier</h4>
              <nav className="flex flex-col gap-3 text-[11px] font-bold uppercase tracking-widest text-white/40">
                <Link to="/zaloura-ethnic-wear" className="hover:text-white transition-colors w-fit">The Collection</Link>
                <Link to="/zaloura-kurtis" className="hover:text-white transition-colors w-fit">Kurtis</Link>
                <Link to="/zaloura-salwars" className="hover:text-white transition-colors w-fit">Salwars</Link>
                <Link to="/zaloura-bespoke" className="hover:text-white transition-colors w-fit">Bespoke</Link>
              </nav>
            </div>
 
            {/* Support Links */}
            <div>
              <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary mb-6">Maison</h4>
              <nav className="flex flex-col gap-3 text-[11px] font-bold uppercase tracking-widest text-white/40">
                <Link to="/about-zaloura" className="hover:text-white transition-colors w-fit">About Zaloura</Link>
                <Link to="/zaloura-sustainability" className="hover:text-white transition-colors w-fit">Sustainability</Link>
                <Link to="/contact-zaloura" className="hover:text-white transition-colors w-fit">Contact Us</Link>
                <Link to="/zaloura-shipping" className="hover:text-white transition-colors w-fit">Shipping & Returns</Link>
                {/* <Link to="/faq" className="hover:text-white transition-colors w-fit">FAQ</Link> */}
              </nav>
            </div>

            {/* Contact Details */}
            <div>
              <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary mb-6">Concierge</h4>
              <div className="space-y-4 text-[11px] font-bold tracking-widest text-white/40">
                <div className="group">
                  <p className="text-[8px] text-white/20 mb-1">PHONE</p>
                  <p className="text-white/60 group-hover:text-primary transition-colors">{settings?.phone || '+91 8921273858'}</p>
                </div>
                <div className="group">
                  <p className="text-[8px] text-white/20 mb-1">EMAIL</p>
                  <p className="text-white/60 group-hover:text-primary transition-colors">{settings?.email || 'zaloura.in@gmail.com'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom strip */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-8 text-[9px] uppercase tracking-[0.3em] font-bold text-white/20">
              <p>© 2024 Zaloura Studio</p>
              <span className="hidden md:block w-1 h-1 rounded-full bg-white/10" />
              <p>Handcrafted in India</p>
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[9px] uppercase tracking-[0.4em] font-bold text-primary hover:text-white transition-colors"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Sticky WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${(settings?.whatsapp || '+918921273858').replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[999] flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20ba5a] transition-all duration-300 group hover:scale-110 active:scale-95"
        aria-label="Chat on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Pulsing Ring Effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping group-hover:animate-none -z-10" />

        {/* Hover Tooltip */}
        <span className="absolute right-16 bg-secondary text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md whitespace-nowrap">
          Chat With Us
        </span>
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.449 5.487 0 9.951-4.462 9.954-9.953.002-2.661-1.034-5.159-2.922-7.048C16.399 1.709 13.9 1.672 12.24 1.672c-5.461 0-9.92 4.459-9.923 9.95-.001 1.92.5 3.79 1.446 5.385L2.73 21.07l4.317-1.13c-.156.09-.328.188-.4.214zM17.15 14.54c-.28-.14-1.657-.82-1.913-.91-.256-.09-.443-.14-.63.14-.186.28-.72.91-.88 1.095-.16.185-.32.21-.6.07-1.36-.68-2.316-1.196-3.236-2.783-.232-.39-.232-.7-.07-1 .18-.32.39-.46.56-.63.18-.17.24-.28.35-.49.11-.21.05-.39-.02-.53-.08-.14-.63-1.52-.86-2.08-.23-.55-.47-.48-.64-.49-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.35-.26.28-1 .98-1 2.4s1 2.79 1.14 2.97c.14.18 1.97 3.01 4.77 4.22.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.1.53-.08 1.657-.68 1.89-1.33.23-.65.23-1.21.16-1.33-.07-.12-.26-.19-.54-.33z"/>
        </svg>
      </motion.a>

      {/* Floating Sticky Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 z-[999] flex items-center justify-center w-12 h-12 bg-secondary hover:bg-primary text-accent rounded-full shadow-2xl transition-all duration-300 group hover:scale-110 active:scale-95 border border-accent/20 hover:border-accent/40"
            aria-label="Scroll to top"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Hover Tooltip */}
            <span className="absolute right-14 bg-secondary text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md whitespace-nowrap">
              Back to Top
            </span>
            <ChevronUp size={22} className="stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;


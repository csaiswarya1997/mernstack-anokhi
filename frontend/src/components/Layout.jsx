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
  MessageCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import API_URL from '../config';

const Logo = ({ className = "h-8" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <path 
          d="M20 20 C20 10 80 10 80 20 L80 50 C80 80 50 90 50 90 C50 90 20 80 20 50 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
        />
        <path 
          d="M25 25 C25 18 75 18 75 25 L75 50 C75 75 50 83 50 83 C50 83 25 75 25 50 Z" 
          fill="currentColor" 
          fillOpacity="0.1" 
          stroke="currentColor" 
          strokeWidth="1"
        />
      </svg>
      <span className="text-xl font-serif font-bold text-primary relative top-[-2px]">Z</span>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-xl font-serif font-bold tracking-tight text-primary">ZALOURA</span>
      <span className="text-[7px] font-sans font-bold tracking-[0.3em] text-secondary mt-0.5">WEAR ELEGANCE</span>
    </div>
  </div>
);

const Layout = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const { cartCount } = useCart();
  const { userInfo } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-secondary">
      {/* Global Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100]"
        style={{ scaleX }}
      />
      {/* Top Info Bar */}
      <div className="hidden lg:block bg-secondary py-2.5 border-b border-white/5">
        <div className="max-w-[1280px] mx-auto px-16 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.25em]">
          <div className="flex items-center gap-8">
            <a href={`tel:${settings?.phone}`} className="flex items-center gap-2 text-white hover:text-primary transition-colors">
              <Phone size={10} className="text-primary" /> {settings?.phone || '+91 98765 43210'}
            </a>
            <a href={`mailto:${settings?.email}`} className="flex items-center gap-2 text-white hover:text-primary transition-colors">
              <Mail size={10} className="text-primary" /> {settings?.email || 'concierge@zaloura.com'}
            </a>
          </div>
          <div className="flex items-center gap-8">
            <a href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-green-400 transition-colors">
              <MessageCircle size={10} /> WhatsApp
            </a>
            <a href={`https://instagram.com/${settings?.instagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-primary transition-colors">
              <Instagram size={10} /> Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors text-secondary"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/shop" className={({ isActive }) => `text-sm font-medium transition-colors border-b-2 pb-1 ${isActive ? 'text-primaryContainer border-primaryContainer font-bold' : 'text-primary border-transparent hover:text-primaryContainer hover:border-champagne'}`}>Shop All</NavLink>
            <NavLink to="/category/Kurti" className={({ isActive }) => `text-sm font-medium transition-colors border-b-2 pb-1 ${isActive ? 'text-primaryContainer border-primaryContainer font-bold' : 'text-primary border-transparent hover:text-primaryContainer hover:border-champagne'}`}>Kurtis</NavLink>
            <NavLink to="/category/Salwar" className={({ isActive }) => `text-sm font-medium transition-colors border-b-2 pb-1 ${isActive ? 'text-primaryContainer border-primaryContainer font-bold' : 'text-primary border-transparent hover:text-primaryContainer hover:border-champagne'}`}>Salwars</NavLink>
            <NavLink to="/bespoke" className={({ isActive }) => `text-sm font-medium transition-colors border-b-2 pb-1 ${isActive ? 'text-primaryContainer border-primaryContainer font-bold' : 'text-primary border-transparent hover:text-primaryContainer hover:border-champagne'}`}>Bespoke</NavLink>
            <NavLink to="/sustainability" className={({ isActive }) => `text-sm font-medium transition-colors border-b-2 pb-1 ${isActive ? 'text-primaryContainer border-primaryContainer font-bold' : 'text-primary border-transparent hover:text-primaryContainer hover:border-champagne'}`}>Sustainability</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `text-sm font-medium transition-colors border-b-2 pb-1 ${isActive ? 'text-primaryContainer border-primaryContainer font-bold' : 'text-primary border-transparent hover:text-primaryContainer hover:border-champagne'}`}>Contact Us</NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search size={20} />
            </button>
            <Link to={userInfo ? "/profile" : "/login"} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 group">
              <User size={20} className={userInfo ? "text-primaryContainer" : "text-primary"} />
              {userInfo && (
                <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-primary">
                  {userInfo.name?.split(' ')[0] || 'Profile'}
                </span>
              )}
              {!userInfo && (
                <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-primary group-hover:text-primaryContainer transition-colors">
                  Login
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primaryContainer text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
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
              className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 shadow-xl z-50"
            >
              <form onSubmit={handleSearch} className="max-w-[1280px] mx-auto flex items-center gap-6">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search the atelier for kurtis, salwars, or product codes..."
                    autoFocus
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-primary/20 focus:bg-white transition-all font-serif italic text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-primary text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10"
                >
                  Search
                </motion.button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-primary"
                >
                  <X size={24} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 px-4">
          <nav className="flex flex-col gap-6">
            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/shop" className={({ isActive }) => `text-2xl font-serif ${isActive ? 'text-primaryContainer font-bold underline underline-offset-8' : 'text-primary'}`}>Shop All</NavLink>
            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/category/Kurti" className={({ isActive }) => `text-2xl font-serif ${isActive ? 'text-primaryContainer font-bold underline underline-offset-8' : 'text-primary'}`}>Kurtis</NavLink>
            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/category/Salwar" className={({ isActive }) => `text-2xl font-serif ${isActive ? 'text-primaryContainer font-bold underline underline-offset-8' : 'text-primary'}`}>Salwars</NavLink>
            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/bespoke" className={({ isActive }) => `text-2xl font-serif ${isActive ? 'text-primaryContainer font-bold underline underline-offset-8' : 'text-primary'}`}>Bespoke Customization</NavLink>
            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/sustainability" className={({ isActive }) => `text-2xl font-serif ${isActive ? 'text-primaryContainer font-bold underline underline-offset-8' : 'text-primary'}`}>Sustainability</NavLink>
            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/contact" className={({ isActive }) => `text-2xl font-serif ${isActive ? 'text-primaryContainer font-bold underline underline-offset-8' : 'text-primary'}`}>Contact Us</NavLink>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-white py-20 border-t border-primary/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-8">
            <Logo className="h-10 text-white" />
            <p className="text-white/50 text-sm leading-relaxed font-serif italic">
              Crafting timeless elegance and sustainable luxury for the modern woman. Discover our artisanal collection.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-10 text-primary">Atelier</h4>
            <ul className="space-y-5 text-sm text-white/60">
              <li><Link to="/shop" className="hover:text-primary transition-colors">Shop All</Link></li>
              <li><Link to="/category/Kurti" className="hover:text-primary transition-colors">Kurtis</Link></li>
              <li><Link to="/category/Salwar" className="hover:text-primary transition-colors">Salwars</Link></li>
              <li><Link to="/bespoke" className="hover:text-primary transition-colors">Bespoke Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-10 text-primary">Maison</h4>
            <ul className="space-y-5 text-sm text-white/60">
              <li><Link to="/sustainability" className="hover:text-primary transition-colors">Sustainability</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-10 text-primary">Connect</h4>
            <div className="flex flex-col gap-5 text-sm text-white/60">
              <a href={`https://instagram.com/${settings?.instagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-3">
                <Instagram size={16} /> Instagram
              </a>
              <a href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-3">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a href={`mailto:${settings?.email}`} className="hover:text-primary transition-colors flex items-center gap-3">
                <Mail size={16} /> Email Concierge
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">© 2024 Zaloura Studio. All Rights Reserved.</p>
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">Handcrafted in Jaipur</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

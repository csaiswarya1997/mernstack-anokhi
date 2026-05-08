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
    <div className="min-h-screen flex flex-col bg-white font-sans text-primary">
      {/* Global Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primaryContainer origin-left z-[100]"
        style={{ scaleX }}
      />
      {/* Top Info Bar */}
      <div className="hidden lg:block bg-primary text-white py-2.5 border-b border-white/5">
        <div className="max-w-[1280px] mx-auto px-16 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.25em]">
          <div className="flex items-center gap-8">
            {/* <span className="flex items-center gap-2 text-white/50">
              <MapPin size={10} className="text-white/40" /> {settings?.address?.split(',')[0] || '123, Heritage Lane'}, {settings?.address?.split(',')?.slice(-1)[0]?.split(' ')?.slice(-2, -1)[0] || 'Jaipur'}
            </span> */}
            <a href={`tel:${settings?.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone size={10} className="text-white/40" /> {settings?.phone || '+91 98765 43210'}
            </a>
            <a href={`mailto:${settings?.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={10} className="text-white/40" /> {settings?.email || 'concierge@zaloura.com'}
            </a>
          </div>
          <div className="flex items-center gap-8">
            <a href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-400 transition-colors">
              <MessageCircle size={10} className="text-white/40" /> WhatsApp
            </a>
            <a href={`https://instagram.com/${settings?.instagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-pink-400 transition-colors">
              <Instagram size={10} className="text-white/40" /> Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="text-2xl font-serif text-primary font-bold">Zaloura</Link>
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
      <footer className="bg-primary text-white py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-serif mb-6">Zaloura</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Timeless elegance and sustainable craft. Discover our collection of handcrafted traditional wear.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">Quick Links</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
              <li><Link to="/bespoke" className="hover:text-white transition-colors">Bespoke Service</Link></li>
              <li><Link to="/sustainability" className="hover:text-white transition-colors">Sustainability</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">Support</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              {/* <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li> */}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">Connect</h4>
            <div className="flex gap-4 text-gray-300">
              <a href={`https://instagram.com/${settings?.instagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
              <a href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
              <a href={`mailto:${settings?.email}`} className="hover:text-white transition-colors">Email</a>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">© 2024 Zaloura Studio. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

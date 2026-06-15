import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Search, X, SlidersHorizontal, ChevronDown, LayoutGrid, List, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';

const Shop = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter & Sort states
  const [selectedCategories, setSelectedCategories] = useState(category ? [category] : []);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('latest');

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  // React to URL category changes
  useEffect(() => {
    if (category) {
      setSelectedCategories([category]);
    } else {
      setSelectedCategories([]);
    }
  }, [category]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();

        let filtered = [...data];

        // Search Query (from URL)
        if (searchQuery) {
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.productCode && p.productCode.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        // Categories
        if (selectedCategories.length > 0) {
          filtered = filtered.filter(p => selectedCategories.some(c => p.category.toLowerCase() === c.toLowerCase()));
        }

        // Prices
        if (selectedPrices.length > 0) {
          filtered = filtered.filter(p => {
            return selectedPrices.some(range => {
              if (range === 'under1k') return p.price < 1000;
              if (range === '1kTo2k') return p.price >= 1000 && p.price <= 2000;
              if (range === 'over2k') return p.price > 2000;
              return false;
            });
          });
        }

        // Sizes in stock
        if (selectedSizes.length > 0) {
          filtered = filtered.filter(p =>
            selectedSizes.some(size => p.stockBySize && p.stockBySize[size] > 0)
          );
        }

        // Sorting (Price Low-High, Price High-Low, Latest)
        if (sortBy === 'lowToHigh') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'highToLow') {
          filtered.sort((a, b) => b.price - a.price);
        } else {
          filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        setProducts(filtered);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedCategories, selectedPrices, selectedSizes, searchQuery, sortBy]);

  const handleCategoryChange = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    if (category) {
      navigate('/shop' + (searchQuery ? `?q=${searchQuery}` : ''));
    }
  };

  const handlePriceChange = (range) => {
    setSelectedPrices(prev =>
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const handleSizeChange = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-16 pt-8 md:pt-12 pb-24 min-h-[70vh]">
      {/* Editorial Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="max-w-2xl space-y-4">
            <motion.span 
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.4em" }}
              transition={{ duration: 1 }}
              className="text-[10px] uppercase font-bold text-gray-400 block"
            >
              {category || 'Curated Collections'}
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-7xl font-serif text-primary tracking-tighter leading-tight italic">
              {searchQuery ? `Exploring "${searchQuery}"` : category ? `${category}s` : 'The Collection'}
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-lg font-serif italic text-secondary/60 leading-relaxed max-w-xl mt-6"
            >
              Discover artisanal pieces that blend traditional heritage with modern silhouettes, each crafted with conscious intent.
            </motion.p>
          </div>
          
          {/* COMPACT CONTROLS - Moved next to title area */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 border-t md:border-t-0 pt-6 md:pt-0">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all
                ${isFilterOpen ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-gray-50 border border-gray-100 text-primary hover:border-primary/20'}`}
            >
              <Filter size={14} />
              {isFilterOpen ? 'Hide Filters' : 'Refine Selection'}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-100 text-primary hover:border-primary/20 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] outline-none cursor-pointer transition-all"
            >
              <option value="latest">Latest Treasures</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
            
            <AnimatePresence>
              {(selectedCategories.length > 0 || selectedPrices.length > 0 || selectedSizes.length > 0 || searchQuery) && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { setSelectedCategories([]); setSelectedPrices([]); setSelectedSizes([]); navigate('/shop'); }}
                  className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl border border-gray-100 text-gray-400 font-bold uppercase tracking-widest text-[9px] hover:text-red-400 hover:border-red-100 transition-all"
                >
                  <X size={14} /> Clear Selection
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Advanced Filters Sidebar (Toggled) */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.aside 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full lg:w-64 flex-shrink-0"
            >
              <div className="sticky top-32 space-y-12">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6 border-b border-gray-50 pb-3">Style Category</h4>
                  <ul className="space-y-4">
                    {['Kurti', 'Salwar'].map(cat => (
                      <li key={cat}>
                        <label className="flex items-center gap-4 cursor-pointer group">
                          <div className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center
                            ${selectedCategories.includes(cat) ? 'bg-primary border-primary' : 'bg-white border-gray-200 group-hover:border-primary/40'}`}>
                            {selectedCategories.includes(cat) && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => handleCategoryChange(cat)}
                            className="hidden"
                          />
                          <span className={`text-[13px] tracking-wide transition-all ${selectedCategories.includes(cat) ? 'text-primary font-bold' : 'text-secondary/60 font-medium group-hover:text-primary'}`}>
                            {cat}s
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6 border-b border-gray-50 pb-3">Investment Range</h4>
                  <ul className="space-y-4">
                    {[
                      { id: 'under1k', label: 'Under ₹1,000' },
                      { id: '1kTo2k', label: '₹1,000 - ₹2,000' },
                      { id: 'over2k', label: 'Over ₹2,000' }
                    ].map(range => (
                      <li key={range.id}>
                        <label className="flex items-center gap-4 cursor-pointer group">
                          <div className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center
                            ${selectedPrices.includes(range.id) ? 'bg-primary border-primary' : 'bg-white border-gray-200 group-hover:border-primary/40'}`}>
                            {selectedPrices.includes(range.id) && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedPrices.includes(range.id)}
                            onChange={() => handlePriceChange(range.id)}
                            className="hidden"
                          />
                          <span className={`text-[13px] tracking-wide transition-all ${selectedPrices.includes(range.id) ? 'text-primary font-bold' : 'text-secondary/60 font-medium group-hover:text-primary'}`}>
                            {range.label}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6 border-b border-gray-50 pb-3">Sizes In Stock</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeChange(size)}
                          className={`h-10 rounded-xl border flex items-center justify-center font-sans text-xs font-bold uppercase transition-all
                            ${isSelected ? 'bg-primary border-primary text-white shadow-lg shadow-primary/10' : 'bg-white border-gray-100 text-secondary/60 hover:border-primary/20'}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product Grid Area */}
        <div className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-14 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-5">
                  <div className="aspect-[3/4] bg-gray-50 rounded-2xl"></div>
                  <div className="h-3 bg-gray-50 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-50 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {products.length > 0 ? (
                <motion.div 
                  key={category || searchQuery || 'all'}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                  className={`grid grid-cols-2 sm:grid-cols-2 ${isFilterOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-x-4 sm:gap-x-10 gap-y-8 sm:gap-y-14 transition-all duration-700`}
                >
                  {products.map(product => (
                    <motion.div key={product._id || product.id} variants={itemVariants} layout>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-40 bg-gray-50/30 rounded-[3rem] border border-dashed border-gray-200"
                >
                  <h3 className="text-2xl font-serif text-primary mb-3 tracking-tighter italic">No matching pieces found</h3>
                  <p className="text-secondary/50 text-sm mb-10 max-w-xs mx-auto font-sans">Try refining your selection or resetting your search to explore the atelier.</p>
                  <button
                    onClick={() => { setSelectedCategories([]); setSelectedPrices([]); setSelectedSizes([]); navigate('/shop'); }}
                    className="bg-primary text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-2xl hover:bg-primaryContainer transition-all"
                  >
                    Reset Selection
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;

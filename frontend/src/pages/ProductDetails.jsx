import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ShoppingCart, Star, MessageSquare, ChevronLeft, ChevronRight, Truck, ShieldCheck, RefreshCw, Clock, ChevronDown, Info, Ruler, Heart, Share2, AlignLeft, X, Maximize2, Sparkles, Bell } from 'lucide-react';
import API_URL from '../config';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, showAlert, showConfirm, cartItems } = useCart();
  const { userInfo } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const mobileScrollRef = useRef(null);

  // Interactive States
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Restock Notification States
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockName, setRestockName] = useState('');
  const [restockEmail, setRestockEmail] = useState('');
  const [restockPhone, setRestockPhone] = useState('');
  const [isSubmittingRestock, setIsSubmittingRestock] = useState(false);

  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Prefill restock request modal when user info is available
  useEffect(() => {
    if (isRestockModalOpen && userInfo) {
      setRestockName(userInfo.name || '');
      setRestockEmail(userInfo.email || '');
      setRestockPhone(userInfo.phone || '');
    }
  }, [isRestockModalOpen, userInfo]);

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingRestock(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${id}/restock-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: restockName,
          email: restockEmail,
          phone: restockPhone,
          size: selectedSize
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsRestockModalOpen(false);
        showAlert('Success', data.message || 'You have been added to the waitlist!');
        setRestockName('');
        setRestockEmail('');
        setRestockPhone('');
      } else {
        showAlert('Waitlist Info', data.message || 'Failed to register. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Something went wrong. Please check your connection.');
    } finally {
      setIsSubmittingRestock(false);
    }
  };

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        setMainImage(data.image);

        if (userInfo) {
          const wishRes = await fetch(`${API_URL}/api/users/wishlist`, {
            headers: { 'Authorization': `Bearer ${userInfo.token}` }
          });
          if (wishRes.ok) {
            const wishlist = await wishRes.json();
            setIsWishlisted(wishlist.some(p => p._id === id));
          }
        } else {
          const savedWishlist = JSON.parse(localStorage.getItem('anokhi_wishlist') || '[]');
          setIsWishlisted(savedWishlist.includes(id));
        }

        if (data.sizes && data.sizes.length > 0) {
          const firstAvailable = data.sizes.find(s => s.stock > 0);
          if (firstAvailable) setSelectedSize(firstAvailable.size);
        }

        const allRes = await fetch(`${API_URL}/api/products`);
        const allData = await allRes.json();
        if (Array.isArray(allData)) {
          const related = allData
            .filter(p => p.category === data.category && p._id !== id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRelated();
    window.scrollTo(0, 0);
  }, [id, userInfo]);

  const toggleWishlist = async () => {
    if (!userInfo) {
      showConfirm(
        'Account Required',
        'Please sign in to your account to save pieces to your collection.',
        () => navigate('/login', { state: { from: { pathname: window.location.pathname } } }),
        'Login',
        'Not Now'
      );
      return;
    }

    try {
      if (isWishlisted) {
        const res = await fetch(`${API_URL}/api/users/wishlist/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${userInfo.token}` }
        });
        if (res.ok) {
          setIsWishlisted(false);
          showAlert('Removed', 'Removed from your collection.');
        }
      } else {
        const res = await fetch(`${API_URL}/api/users/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
          },
          body: JSON.stringify({ productId: id })
        });
        if (res.ok) {
          setIsWishlisted(true);
          showAlert('Saved', 'Added to your collection.');
        } else {
          const errorData = await res.json();
          showAlert('Error', errorData.message || 'Failed to add to wishlist.');
        }
      }
    } catch (err) {
      console.error('Failed to toggle wishlist', err);
      showAlert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleShare = async () => {
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
          title: product.name,
          url: window.location.href
        };
        if (files.length > 0) {
          shareData.files = files;
        }

        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showAlert('Link Copied', 'Product link copied to clipboard.');
      }
    } catch (err) { console.error(err); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reviewName, rating: reviewRating, comment: reviewComment })
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        setProduct(updatedProduct);
        setShowReviewForm(false);
        setReviewRating(5);
        setReviewName('');
        setReviewComment('');
        showAlert('Success', 'Review submitted successfully!');
      }
    } catch (err) { console.error(err); }
  };

  const allImages = product ? [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.gallery) ? product.gallery : [])
  ].filter(Boolean) : [];

  const uniqueImages = [...new Set(allImages)];

  // Sync mobile scroll position when mainImage changes (e.g. via thumbnail click)
  useEffect(() => {
    if (mobileScrollRef.current) {
      const index = uniqueImages.indexOf(mainImage);
      if (index !== -1) {
        const container = mobileScrollRef.current;
        const slideWidth = container.clientWidth;
        if (slideWidth > 0 && Math.abs(container.scrollLeft - index * slideWidth) > 5) {
          container.scrollTo({
            left: index * slideWidth,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [mainImage, uniqueImages]);

  const handleMobileScroll = (e) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const slideWidth = container.clientWidth;
    if (slideWidth > 0) {
      const index = Math.round(scrollPosition / slideWidth);
      if (uniqueImages[index] && uniqueImages[index] !== mainImage) {
        setMainImage(uniqueImages[index]);
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="w-12 h-12 border-4 border-primaryContainer border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-16">
      <h2 className="text-3xl font-serif text-primary mb-6">Masterpiece not found</h2>
      <button onClick={() => navigate('/shop')} className="text-primaryContainer font-bold hover:underline">Return to Collection</button>
    </div>
  );

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const nextImage = () => {
    const currentIndex = uniqueImages.indexOf(mainImage);
    const nextIdx = (currentIndex + 1) % uniqueImages.length;
    setMainImage(uniqueImages[nextIdx]);
  };

  const prevImage = () => {
    const currentIndex = uniqueImages.indexOf(mainImage);
    const prevIdx = (currentIndex - 1 + uniqueImages.length) % uniqueImages.length;
    setMainImage(uniqueImages[prevIdx]);
  };

  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const imageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: 0.4, ease: "easeInOut" }
  };

  const productCartItems = cartItems ? cartItems.filter(item => (item.id === product?._id || item._id === product?._id)) : [];
  const totalCartQty = productCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const displayedCountInStock = product ? Math.max(0, product.countInStock - totalCartQty) : 0;

  const selectedSizeCartItem = selectedSize && product ? cartItems.find(item => (item.id === product._id || item._id === product._id) && item.size === selectedSize) : null;
  const selectedSizeCartQty = selectedSizeCartItem ? selectedSizeCartItem.quantity : 0;
  const selectedSizeStock = selectedSize && product ? Number(product.stockBySize?.[selectedSize] || 0) : 0;
  const selectedSizeDisplayedStock = Math.max(0, selectedSizeStock - selectedSizeCartQty);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="max-w-[1440px] mx-auto px-4 md:px-16 pt-2 md:pt-4 pb-8 md:pb-12"
    >
      {/* LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors"
            >
              <X size={32} />
            </motion.button>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl md:h-[85vh] flex items-center justify-center p-4"
            >
              <img
                src={mainImage?.startsWith('http') ? mainImage : `${API_URL}${mainImage}`}
                alt="Preview"
                className="max-w-full max-h-full object-contain shadow-2xl border border-white/10"
              />
              {uniqueImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 md:left-10 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 md:right-10 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIZE CHART MODAL */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-gray-100 no-scrollbar"
            >
              <div className="relative p-6 md:p-12">
                <button
                  onClick={() => setIsSizeChartOpen(false)}
                  className="absolute top-6 right-6 md:top-8 md:right-8 text-gray-400 hover:text-primary transition-colors p-2"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>

                <div className="space-y-6 md:space-y-8">
                  <div className="text-center space-y-2 pt-4 md:pt-0">
                    <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-bold text-primaryContainer">Maison Zaloura</span>
                    <h2 className="text-2xl md:text-4xl font-serif text-primary italic">Sizing Master Chart</h2>
                    <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-gray-400">All measurements are in inches</p>
                  </div>

                  <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                    <table className="w-full text-left border-collapse min-w-[400px]">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="py-4 md:py-5 text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-primary">Size</th>
                          <th className="py-4 md:py-5 text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-primary">Chest</th>
                          <th className="py-4 md:py-5 text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-primary">Waist</th>
                          <th className="py-4 md:py-5 text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-primary">Hip</th>
                          <th className="py-4 md:py-5 text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-primary">Length</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs md:text-sm font-sans text-secondary">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s, idx) => (
                          <tr key={s} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                            <td className="py-4 md:py-6 font-bold group-hover:text-primary transition-colors">{s}</td>
                            <td className="py-4 md:py-6">{32 + idx * 2} - {34 + idx * 2}</td>
                            <td className="py-4 md:py-6">{26 + idx * 2} - {28 + idx * 2}</td>
                            <td className="py-4 md:py-6">{34 + idx * 2} - {36 + idx * 2}</td>
                            <td className="py-4 md:py-6">{43 + idx}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6 space-y-4 border border-gray-100">
                    <div className="flex items-start gap-3 md:gap-4">
                      <Info size={14} className="text-primaryContainer mt-1 flex-shrink-0 md:w-4 md:h-4" />
                      <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed italic">
                        For a more personalized fit, we recommend measuring your favorite similar piece at home and comparing it to our master chart. If you are between sizes, we suggest choosing the larger size for maximum comfort.
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsSizeChartOpen(false)}
                    className="w-full py-4 md:py-5 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg hover:shadow-2xl transition-all"
                  >
                    Return to Masterpiece
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-24 mb-8 lg:mb-16 relative items-start">
        {/* GALLERY SYSTEM */}
        <motion.div
          variants={fadeInUp}
          className="lg:sticky lg:top-32 lg:h-fit flex flex-col lg:flex-row-reverse gap-4 lg:gap-6 items-start w-full"
        >
          {/* Mobile Swipeable Gallery */}
          <div className="block lg:hidden w-full max-w-[500px] border-4 border-primary rounded-2xl aspect-[3/4] overflow-hidden bg-white relative shadow-lg">
            <div
              ref={mobileScrollRef}
              onScroll={handleMobileScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth h-full no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {uniqueImages.map((img, index) => (
                <div key={index} className="w-full h-full flex-shrink-0 snap-start snap-always">
                  <img
                    src={img?.startsWith('http') ? img : `${API_URL}${img}`}
                    alt={`${product.name} - View ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                </div>
              ))}
            </div>
            
            {/* Mobile Image Dots Indicator */}
            {uniqueImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
                {uniqueImages.map((_, index) => {
                  const isActive = uniqueImages.indexOf(mainImage) === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setMainImage(uniqueImages[index])}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-white w-3' : 'bg-white/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Zoomable Gallery */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="hidden lg:block w-full lg:flex-1 max-w-[500px] border-4 border-primary rounded-2xl aspect-[3/4] overflow-hidden bg-white relative cursor-zoom-in group shadow-lg"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={mainImage}
                variants={imageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                src={mainImage?.startsWith('http') ? mainImage : `${API_URL}${mainImage}`}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-primary shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                <Maximize2 size={20} />
              </div>
            </div>
          </div>

          {/* Thumbnails Container */}
          {uniqueImages.length > 1 && (
            <motion.div
              variants={staggerContainer}
              className="flex flex-row lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-y-auto w-full lg:w-20 max-h-[120px] lg:max-h-[666px] no-scrollbar py-1"
            >
              {uniqueImages.map((img, index) => (
                <motion.button
                  variants={fadeInUp}
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMainImage(img)}
                  className={`w-20 lg:w-full aspect-[3/4] flex-shrink-0 overflow-hidden border-4 rounded-xl transition-all duration-300
                    ${mainImage === img ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img?.startsWith('http') ? img : `${API_URL}${img}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div variants={fadeInUp} className="space-y-6 lg:space-y-10 lg:pt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primaryContainer bg-primaryContainer/5 px-3 py-1 rounded-full border border-primaryContainer/10">
                REF: #{product.productCode || 'REF-ZALOURA'}
              </span>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={toggleWishlist}
                  className={`transition-all ${isWishlisted ? 'text-primary' : 'text-gray-400'}`}
                >
                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={handleShare}
                  className="text-gray-400 hover:text-primary"
                >
                  <Share2 size={20} />
                </motion.button>
              </div>
            </div>
            <h1 className="text-2xl md:text-6xl font-serif text-primary tracking-tighter leading-tight italic">{product.name}</h1>
            <div className="flex items-center gap-3 pt-1">
              <p className="text-2xl md:text-4xl font-sans font-bold text-primary tracking-tighter">₹{(product.price || 0).toLocaleString('en-IN')}</p>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <p className="text-gray-400 line-through text-lg md:text-xl">₹{(product.originalPrice || 0).toLocaleString('en-IN')}</p>
                  <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded border border-red-100/50">
                    {product.discount > 0 ? `${product.discount}% OFF` : `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Sizing & Actions */}
          <div className="space-y-4 lg:space-y-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Select Size</h3>
              <button
                onClick={() => setIsSizeChartOpen(true)}
                className="text-[10px] uppercase tracking-widest font-bold text-primaryContainer border-b border-primaryContainer/20 pb-0.5 hover:text-primary hover:border-primary transition-all"
              >
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2 md:gap-3">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                const stock = product.stockBySize?.[size] || 0;
                const stockNum = Number(stock || 0);
                const cartItem = cartItems ? cartItems.find(item => (item.id === product._id || item._id === product._id) && item.size === size) : null;
                const cartQty = cartItem ? cartItem.quantity : 0;
                const displayedStock = Math.max(0, stockNum - cartQty);
                const isOut = displayedStock === 0;
                return (
                  <motion.button
                    whileHover={{ y: -2, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[56px] h-14 rounded-lg border flex flex-col items-center justify-center font-sans transition-all
                      ${selectedSize === size 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : isOut 
                          ? 'bg-gray-50 text-gray-400 border-dashed border-gray-300 hover:border-gray-400 opacity-80' 
                          : 'bg-white text-primary border-gray-100 hover:border-primary'}`}
                  >
                    <span className={`text-sm font-bold ${isOut && selectedSize !== size ? 'line-through decoration-gray-300' : ''}`}>{size}</span>
                    <span className="text-[8px] uppercase mt-1 font-bold opacity-60">
                      {isOut ? 'Sold Out' : `${displayedStock} Left`}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4 pt-1 lg:pt-2">
            {selectedSize && selectedSizeDisplayedStock === 0 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsRestockModalOpen(true)}
                className="w-full py-4 lg:py-5 rounded-2xl font-sans uppercase tracking-[0.3em] text-[10px] font-bold transition-all shadow-2xl bg-secondary text-white hover:bg-secondary/90 flex items-center justify-center gap-2"
              >
                <Bell size={12} className="animate-pulse" /> Notify Me When Restocked
              </motion.button>
            ) : (
              <motion.button
                whileHover={selectedSize && selectedSizeDisplayedStock > 0 ? { scale: 1.02, backgroundColor: "#2d3436" } : {}}
                whileTap={selectedSize && selectedSizeDisplayedStock > 0 ? { scale: 0.98 } : {}}
                disabled={!selectedSize}
                onClick={() => selectedSize && addToCart({ ...product, size: selectedSize })}
                className={`w-full py-4 lg:py-5 rounded-2xl font-sans uppercase tracking-[0.3em] text-[10px] font-bold transition-all shadow-2xl
                  ${!selectedSize ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primaryContainer text-white shadow-primaryContainer/20'}`}
              >
                {!selectedSize 
                  ? 'Select a Size' 
                  : `Add to Bag — ₹${(product.price || 0).toLocaleString('en-IN')}`}
              </motion.button>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4 lg:space-y-6 pt-6 lg:pt-10 border-t border-gray-100">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">
              <AlignLeft size={14} /> The Piece
            </div>
            <div className="bg-gray-50/50 p-5 md:p-8 border border-gray-100 relative overflow-hidden group">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: "100%" }}
                className="absolute top-0 left-0 w-1 bg-primaryContainer"
              ></motion.div>
              <p className="text-secondary font-sans leading-relaxed text-sm opacity-90 whitespace-pre-line italic">
                {product.description}
              </p>
            </div>
          </div>

          {/* Trust Info */}
          <div className="space-y-4 lg:space-y-6 pt-6 lg:pt-10 border-t border-gray-100">
            <motion.div
              whileHover={{ x: 10 }}
              className="bg-primary/5 p-5 rounded-2xl flex items-center gap-5 border border-primaryContainer/5 transition-colors hover:bg-primary/10"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-gray-100">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-primaryContainer">Est. Delivery Time</p>
                <p className="text-xs font-sans font-bold text-secondary mt-1">Ships in 10 to 20 Working Days</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <motion.section
        variants={fadeInUp}
        whileInView="visible"
        initial="hidden"
        viewport={{ once: true }}
        className="pt-8 lg:pt-16 border-t border-gray-100 mb-8 lg:mb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-24">
          <div>
            <h2 className="text-2xl md:text-4xl font-serif text-primary mb-4 lg:mb-8 italic">Client Experience</h2>
            {!showReviewForm ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReviewForm(true)}
                className="w-full py-5 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
              >
                <MessageSquare size={16} /> Write a Review
              </motion.button>
            ) : (
              <motion.form
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleReviewSubmit}
                className="space-y-5 bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl"
              >
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)} className={reviewRating >= star ? 'text-amber-400' : 'text-gray-200'}>
                      <Star size={24} fill={reviewRating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <input type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl" placeholder="Your Name" required />
                <textarea rows="4" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl" placeholder="Review details..." required />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowReviewForm(false)} className="flex-1 py-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-primaryContainer text-white rounded-xl shadow-lg shadow-primaryContainer/20">Submit</button>
                </div>
              </motion.form>
            )}
          </div>
          <div className="lg:col-span-2">
            {!product.reviews || product.reviews.length === 0 ? (
              <div className="h-full flex items-center justify-center p-12 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                <p className="text-secondary/30 font-serif italic text-2xl">Awaiting its first appraisal.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {product.reviews.map((review, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-serif text-lg text-primary">{review.name}</h4>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, star) => <Star key={star} size={14} fill={star < review.rating ? "currentColor" : "none"} />)}
                      </div>
                    </div>
                    <p className="text-secondary/80 font-sans italic">"{review.comment}"</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* RELATED PRODUCTS SECTION */}
      {relatedProducts.length > 0 && (
        <motion.section
          variants={fadeInUp}
          whileInView="visible"
          initial="hidden"
          viewport={{ once: true }}
          className="pt-8 lg:pt-12 border-t border-gray-100"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 lg:mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-primaryContainer">
                <Sparkles size={14} /> Curated Suggestions
              </div>
              <h2 className="text-2xl md:text-5xl font-serif text-primary tracking-tighter leading-tight italic">You May Also Like</h2>
            </div>
            <button onClick={() => navigate('/shop')} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-primary transition-colors border-b border-gray-200 pb-1">
              View All Masterpieces
            </button>
          </div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8"
          >
            {relatedProducts.map(relProduct => (
              <motion.div key={relProduct._id} variants={fadeInUp}>
                <ProductCard product={relProduct} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* RESTOCK WAITLIST MODAL */}
      <AnimatePresence>
        {isRestockModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full overflow-hidden rounded-[1.5rem] shadow-2xl border border-gray-100"
            >
              <div className="relative p-8">
                <button
                  onClick={() => setIsRestockModalOpen(false)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-primary transition-colors p-2"
                >
                  <X size={20} />
                </button>

                <div className="space-y-6">
                  <div className="text-center space-y-2 pt-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primaryContainer">
                      <Bell size={24} />
                    </div>
                    <h2 className="text-2xl font-serif text-primary italic pt-2">Notify Me</h2>
                    <p className="text-xs text-gray-500 font-sans leading-relaxed">
                      Be the first to know when <strong>{product.name}</strong> (Size <strong>{selectedSize}</strong>) is back in stock.
                    </p>
                  </div>

                  <form onSubmit={handleRestockSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={restockName}
                        onChange={(e) => setRestockName(e.target.value)}
                        className="w-full border-b border-gray-200 py-2 outline-none focus:border-primary transition-colors bg-transparent font-sans text-sm"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={restockEmail}
                        onChange={(e) => setRestockEmail(e.target.value)}
                        className="w-full border-b border-gray-200 py-2 outline-none focus:border-primary transition-colors bg-transparent font-sans text-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-gray-400">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={restockPhone}
                        onChange={(e) => setRestockPhone(e.target.value)}
                        className="w-full border-b border-gray-200 py-2 outline-none focus:border-primary transition-colors bg-transparent font-sans text-sm"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmittingRestock}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmittingRestock ? 'Submitting...' : 'Send Request'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductDetails;

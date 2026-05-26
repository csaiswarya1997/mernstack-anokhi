import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import API_URL from '../config';

const ProductCard = ({ product }) => {
  const { cartItems, showAlert, showConfirm } = useCart();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const productId = product._id || product.id;

  useEffect(() => {
    const checkWishlist = async () => {
      if (userInfo) {
        try {
          const res = await fetch(`${API_URL}/api/users/wishlist`, {
            headers: { 'Authorization': `Bearer ${userInfo.token}` }
          });
          if (res.ok) {
            const wishlist = await res.json();
            setIsWishlisted(wishlist.some(p => p._id === productId));
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        const savedWishlist = JSON.parse(localStorage.getItem('anokhi_wishlist') || '[]');
        setIsWishlisted(savedWishlist.includes(productId));
      }
    };
    checkWishlist();
  }, [productId, userInfo]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userInfo) {
      showConfirm(
        'Patron Account Required', 
        'Please sign in to your patron account to save pieces to your curated collection.', 
        () => navigate('/login', { state: { from: { pathname: window.location.pathname } } }),
        'Login',
        'Not Now'
      );
      return;
    }

    try {
      if (isWishlisted) {
        const res = await fetch(`${API_URL}/api/users/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${userInfo.token}` }
        });
        if (res.ok) {
          setIsWishlisted(false);
          showAlert('Removed', `${product.name} removed from your collection.`);
        }
      } else {
        const res = await fetch(`${API_URL}/api/users/wishlist`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
          },
          body: JSON.stringify({ productId })
        });
        if (res.ok) {
          setIsWishlisted(true);
          showAlert('Saved', `${product.name} added to your collection.`);
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

  const productCartItems = cartItems ? cartItems.filter(item => (item.id === productId || item._id === productId)) : [];
  const productCartQty = productCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isSoldOut = product.countInStock - productCartQty <= 0;

  return (
    <motion.div 
      whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
      className="group bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-shadow duration-500"
    >
      <Link to={`/product/${productId}`} className="block relative aspect-[3/4] bg-gray-50 overflow-hidden">
        {product.image ? (
          <motion.img 
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
            src={product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`} 
            alt={product.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
        )}

        {/* Wishlist Heart Icon */}
        <motion.button 
          whileTap={{ scale: 0.8 }}
          onClick={toggleWishlist}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-xl transition-all duration-300 z-10
            ${isWishlisted ? 'bg-primary text-white scale-110' : 'bg-white/80 text-gray-400 hover:text-primary'}`}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </motion.button>
        
        {/* Product Code Overlay */}
        {product.productCode && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-primary px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-lg shadow-lg border border-gray-100 z-10"
          >
            #{product.productCode}
          </motion.div>
        )}
        
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-primary px-4 py-2 text-[10px] uppercase font-bold tracking-[0.2em] rounded shadow-xl">
              Sold Out
            </span>
          </div>
        )}
        
        {product.originalPrice > product.price && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-2.5 py-1 text-[9px] uppercase font-bold tracking-widest rounded-full shadow-lg z-10">
            Sale
          </div>
        )}

        {/* Gradient Overlay for Trendy Look */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">{product.category}</p>
          {product.productCode && (
            <span className="text-[9px] font-mono text-gray-300">#{product.productCode}</span>
          )}
        </div>
        <Link to={`/product/${productId}`}>
          <h3 className="font-serif text-lg text-primary truncate hover:text-primaryContainer transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-3 mt-3">
          <span className="font-bold text-primary text-base">₹{(product.price || 0).toLocaleString('en-IN')}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-gray-300 line-through text-xs font-medium">₹{(product.originalPrice || 0).toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

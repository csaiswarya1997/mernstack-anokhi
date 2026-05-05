import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

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
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-[1440px] mx-auto px-4 md:px-16 pt-8 md:pt-12 pb-24 min-h-[70vh]"
    >
      <motion.div variants={fadeInUp} className="mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 block mb-2">Review Your Selection</span>
        <h1 className="text-4xl md:text-6xl font-serif text-primary tracking-tight">Shopping Bag</h1>
      </motion.div>

      <AnimatePresence mode="wait">
        {cartItems.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-50/50 border border-dashed border-gray-200 rounded-[2rem] p-20 text-center"
          >
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm"
            >
              <ShoppingBag className="text-gray-200" size={32} />
            </motion.div>
            <p className="text-secondary/40 font-serif italic text-2xl mb-8">Your bag is currently empty.</p>
            <Link to="/shop" className="inline-block bg-primary text-white px-12 py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl hover:bg-primaryContainer hover:-translate-y-1 transition-all">
              Explore Collections
            </Link>
          </motion.div>
        ) : (
          <div key="content" className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <motion.div layout className="space-y-8">
                <AnimatePresence>
                  {cartItems.map((item) => {
                    const cartItemId = item.cartItemId || `${item._id || item.id}-${item.size || 'M'}`;
                    return (
                      <motion.div
                        layout
                        key={cartItemId}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -50, scale: 0.9 }}
                        className="group flex flex-col sm:flex-row items-center gap-8 p-8 bg-white border border-gray-100 rounded-3xl hover:shadow-xl transition-all duration-500"
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-32 h-40 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-all"
                        >
                          {item.image ? (
                            <img src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                          ) : null}
                        </motion.div>

                        <div className="flex-grow text-center sm:text-left min-w-0">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                            <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">{item.category}</span>
                            {item.productCode && (
                              <span className="text-[10px] font-mono font-bold text-primaryContainer bg-primaryContainer/5 px-2.5 py-1 rounded-full border border-primaryContainer/10">
                                #{item.productCode}
                              </span>
                            )}
                          </div>
                          <Link to={`/product/${item._id || item.id}`}>
                            <h3 className="font-serif text-2xl text-primary hover:text-primaryContainer transition-colors truncate">{item.name}</h3>
                          </Link>
                          <p className="text-xs font-sans font-bold text-secondary/60 mt-2 uppercase tracking-widest">
                            Size: <span className="text-primary">{item.size || 'M'}</span>
                          </p>
                          <p className="font-sans font-bold text-primary text-lg mt-4">₹{item.price.toLocaleString('en-IN')}</p>
                        </div>

                        <div className="flex flex-col items-center sm:items-end gap-6">
                          <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(cartItemId, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all text-primary shadow-none hover:shadow-sm"
                            >
                              <Minus size={14} />
                            </motion.button>
                            <span className="w-10 text-center font-bold font-sans text-sm">{item.quantity}</span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(cartItemId, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all text-primary shadow-none hover:shadow-sm"
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>
                          <button
                            onClick={() => removeFromCart(cartItemId)}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>

            <motion.div
              variants={fadeInUp}
              className="lg:col-span-4"
            >
              <div className="bg-white border border-gray-100 rounded-[2rem] p-10 sticky top-32 shadow-sm space-y-10">
                <h2 className="font-serif text-3xl text-primary border-b border-gray-50 pb-6">Summary</h2>

                <div className="space-y-6 text-sm font-sans">
                  <div className="flex justify-between text-secondary/60">
                    <span>Subtotal</span>
                    <span className="text-primary font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-secondary/60">
                    <span>Shipping</span>
                    <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-secondary/40 text-[10px] uppercase tracking-widest font-bold">
                    <span>Est. Delivery</span>
                    <span>10-20 Working Days</span>
                  </div>
                  <div className="pt-6 border-t border-gray-50">
                    <div className="flex justify-between items-end">
                      <span className="font-serif text-xl text-primary">Total Price</span>
                      <span className="font-sans text-3xl font-bold text-primary tracking-tighter">₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-primaryContainer text-white py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-primary active:translate-y-0 transition-all"
                >
                  Proceed to Checkout
                </motion.button>

                <p className="text-[10px] text-center text-gray-400 font-sans italic leading-relaxed">
                  By proceeding, you agree to our terms of curated service and artisanal care.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Cart;

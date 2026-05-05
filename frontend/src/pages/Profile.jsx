import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Package, Settings, LogOut, ChevronRight, MapPin, CreditCard, Clock, Truck, CheckCircle2, ShoppingBag, ChevronDown, Hash, XCircle, AlertCircle, Heart, Star, Trash2, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const navigate = useNavigate();
  const { orders } = useCart();
  const { userInfo, logout } = useAuth();
  const [liveOrders, setLiveOrders] = useState(orders || []);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'wishlist', or 'settings'
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [bespokeRequests, setBespokeRequests] = useState([]);
  const [bespokeLoading, setBespokeLoading] = useState(false);

  // Settings state
  const { updateProfile, userInfo: authUserInfo } = useAuth();
  const { showAlert } = useCart();

  const [name, setName] = useState(userInfo?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  const sidebarVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Sync name when userInfo changes (e.g. after successful update)
  useEffect(() => {
    if (userInfo?.name) {
      setName(userInfo.name);
    }
  }, [userInfo]);

  useEffect(() => {
    const fetchLiveOrders = async () => {
      if (!userInfo?.token) return;
      try {
        const res = await fetch('http://localhost:5000/api/orders/myorders', {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setLiveOrders(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveOrders();
  }, [userInfo]);

  useEffect(() => {
    if (activeTab === 'wishlist') {
      fetchWishlistDetails();
    }
    if (activeTab === 'bespoke') {
      fetchBespokeRequests();
    }
  }, [activeTab]);

  const fetchBespokeRequests = async () => {
    if (!userInfo?.token) return;
    setBespokeLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/bespoke/myrequests', {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBespokeRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch bespoke requests', err);
    } finally {
      setBespokeLoading(false);
    }
  };

  const fetchWishlistDetails = async () => {
    if (!userInfo?.token) return;

    setWishlistLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/wishlist', {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist details', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!userInfo?.token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (res.ok) {
        setWishlistItems(prev => prev.filter(item => item._id !== productId));
      }
    } catch (err) {
      console.error('Failed to remove from wishlist', err);
    }
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
  };

  const orderSteps = [
    { key: 'Processing', label: 'Confirmed', icon: Clock, color: 'bg-blue-600', text: 'text-blue-600', lightBg: 'bg-blue-50' },
    { key: 'Shipped', label: 'Shipped', icon: Truck, color: 'bg-indigo-600', text: 'text-indigo-600', lightBg: 'bg-indigo-50' },
    { key: 'Out for Delivery', label: 'In Transit', icon: MapPin, color: 'bg-amber-600', text: 'text-amber-600', lightBg: 'bg-amber-50' },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2, color: 'bg-green-600', text: 'text-green-600', lightBg: 'bg-green-50' },
    { key: 'Cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-600', text: 'text-red-600', lightBg: 'bg-red-50' }
  ];

  const getStatusInfo = (status) => orderSteps.find(s => s.key === status) || orderSteps[0];
  const getStatusIndex = (status) => {
    const idx = orderSteps.findIndex(step => step.key === status);
    return idx === -1 ? 0 : idx;
  };

  const toggleOrder = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="max-w-[1440px] mx-auto px-4 md:px-16 pt-8 md:pt-12 pb-24"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
      >
        <div className="space-y-2">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 block"
          >
            The Maison Anokhi Member Experience
          </motion.span>
          <h1 className="text-4xl md:text-6xl font-serif text-primary tracking-tighter leading-tight italic">Bienvenue</h1>
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em] mb-4 block"
        >
          Customer Portal
        </motion.span>
      </motion.div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] p-10 lg:p-14 max-w-sm w-full shadow-2xl text-center border border-gray-100"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <LogOut size={28} />
              </div>
              <h3 className="font-serif text-2xl text-primary mb-3">Sign Out?</h3>
              <p className="text-gray-400 text-xs font-sans mb-10 leading-relaxed">
                Are you sure you want to end your session? You'll need to sign back in to access your collection.
              </p>
              <div className="space-y-3">
                <button
                  onClick={confirmLogout}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-primaryContainer transition-all shadow-lg"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-4 bg-gray-50 text-gray-400 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:text-primary transition-all"
                >
                  Stay Signed In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Compact Sticky Sidebar */}
        <motion.div
          variants={sidebarVariants}
          className="lg:col-span-3"
        >
          <div className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm sticky top-28">
            <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 bg-primaryContainer text-white rounded-2xl flex items-center justify-center text-xl font-serif font-bold"
              >
                {userInfo?.name?.charAt(0).toUpperCase()}
              </motion.div>
              <div>
                <h2 className="font-serif text-lg text-primary leading-tight font-bold">{userInfo?.name}</h2>
                <span className="text-[7px] uppercase tracking-widest font-bold text-primaryContainer/60">
                  {userInfo?.isAdmin ? 'Maison Admin' : 'Platinum Member'}
                </span>
              </div>
            </div>

            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'bespoke', label: 'Bespoke', icon: MessageSquare },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all whitespace-nowrap
                    ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 hover:text-primary'}`}
                >
                  <tab.icon size={14} /> <span>{tab.label}</span>
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-50 font-bold text-[9px] uppercase tracking-widest transition-all lg:mt-4"
              >
                <LogOut size={14} /> <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Focused Content Area */}
        <div className="lg:col-span-9 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' ? (
              <motion.div 
                key="orders"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 10 }}
                variants={containerVariants}
              >
                <h3 className="font-serif text-2xl lg:text-3xl text-primary flex items-center gap-4 mb-8 lg:mb-10">
                  Recent Acquisitions
                  <span className="text-[10px] font-sans font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{liveOrders.length}</span>
                </h3>

                {loading ? (
                  <div className="py-20 lg:py-32 text-center bg-gray-50/50 rounded-[2rem] lg:rounded-[3rem] border border-dashed border-gray-200">
                    <div className="w-10 h-10 border-2 border-primaryContainer border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 font-serif italic text-lg">Curating history...</p>
                  </div>
                ) : liveOrders.length === 0 ? (
                  <div className="bg-gray-50/30 p-12 lg:p-24 text-center rounded-[2rem] lg:rounded-[3rem] border border-dashed border-gray-200">
                    <ShoppingBag size={40} className="text-gray-100 mx-auto mb-6" />
                    <p className="text-secondary/40 font-serif italic text-xl mb-8">No pieces in your collection yet.</p>
                    <button onClick={() => navigate('/shop')} className="bg-primary text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px]">Explore Shop</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liveOrders.map(order => {
                      const statusInfo = getStatusInfo(order.status);
                      const isExpanded = expandedOrderId === order._id;
                      const StatusIcon = statusInfo.icon;
                      return (
                        <motion.div
                          key={order._id}
                          variants={itemVariants}
                          className={`bg-white border border-gray-100 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-sm transition-all duration-500 ${isExpanded ? 'shadow-xl ring-1 ring-primary/5' : ''}`}
                        >
                          <button
                            onClick={() => toggleOrder(order._id)}
                            className={`w-full px-6 lg:px-10 py-6 lg:py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors ${isExpanded ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex flex-wrap items-center gap-6 lg:gap-10">
                              <div>
                                <p className={`text-[7px] lg:text-[8px] uppercase tracking-widest font-bold ${isExpanded ? 'text-white/60' : 'text-gray-400'}`}>Order Ref</p>
                                <p className="text-[10px] lg:text-xs font-mono font-bold">#{order._id.slice(-8).toUpperCase()}</p>
                              </div>
                              <div>
                                <p className={`text-[7px] lg:text-[8px] uppercase tracking-widest font-bold ${isExpanded ? 'text-white/60' : 'text-gray-400'}`}>Investment</p>
                                <p className="text-[10px] lg:text-xs font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] uppercase tracking-widest font-bold ${isExpanded ? 'bg-white/10 text-white' : statusInfo.lightBg + ' ' + statusInfo.text}`}>
                                <StatusIcon size={12} /> {order.status}
                              </div>
                              <ChevronDown size={16} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 lg:p-8 space-y-6 border-t border-gray-50">
                                  {/* TIMELINE SECTION */}
                                  {order.status !== 'Cancelled' && (
                                    <div className="relative px-4 py-6 md:px-8 md:py-8 bg-gray-50/50 rounded-3xl border border-gray-100">
                                      {/* Desktop Line */}
                                      <div className="hidden md:block absolute left-16 right-16 top-[3rem] h-1 bg-gray-100 rounded-full">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${(getStatusIndex(order.status) / 3) * 100}%` }}
                                          transition={{ duration: 1.5, ease: "circOut" }}
                                          className="h-full bg-primaryContainer"
                                        ></motion.div>
                                      </div>

                                      {/* Mobile Line (Vertical) */}
                                      <div className="md:hidden absolute left-[2.95rem] top-10 bottom-10 w-0.5 bg-gray-100 rounded-full">
                                        <motion.div
                                          initial={{ height: 0 }}
                                          animate={{ height: `${(getStatusIndex(order.status) / 3) * 100}%` }}
                                          transition={{ duration: 1.5, ease: "circOut" }}
                                          className="w-full bg-primaryContainer"
                                        ></motion.div>
                                      </div>

                                      <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                                        {orderSteps.filter(s => s.key !== 'Cancelled').map((step, idx) => {
                                          const currentIdx = getStatusIndex(order.status);
                                          const isStepDone = currentIdx >= idx;
                                          const isActive = currentIdx === idx;
                                          return (
                                            <div key={step.key} className="flex flex-row md:flex-col items-center gap-4 md:gap-0">
                                              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center z-10 transition-all duration-500 shadow-lg
                                                ${isStepDone ? `${step.color} text-white` : 'bg-white border border-gray-100 text-gray-300'}`}>
                                                <step.icon size={16} />
                                                {isActive && (
                                                  <div className={`absolute inset-0 rounded-xl ${step.color} animate-ping opacity-20 scale-125`}></div>
                                                )}
                                              </div>
                                              <div className="flex flex-col md:items-center">
                                                <p className={`md:mt-3 text-[9px] md:text-[10px] uppercase tracking-widest font-bold transition-colors ${isStepDone ? 'text-primary' : 'text-gray-300'}`}>
                                                  {step.label}
                                                </p>
                                                <p className="md:hidden text-[7px] text-gray-400 font-sans tracking-widest mt-0.5">
                                                  {isStepDone ? (isActive ? 'Current' : 'Done') : 'Wait'}
                                                </p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {order.status === 'Cancelled' && (
                                    <div className="p-6 bg-red-50/50 border border-red-100 rounded-3xl flex flex-col items-center text-center">
                                      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-3 shadow-md">
                                        <AlertCircle size={24} />
                                      </div>
                                      <h4 className="font-serif text-xl text-red-900">Cancelled</h4>
                                      <p className="text-[10px] text-red-600/70 max-w-sm mt-1">This acquisition has been recorded in the archives.</p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                    <div className="xl:col-span-7 space-y-4">
                                      {order.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                          <img src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} className="w-12 h-16 object-cover rounded-lg border border-gray-100" alt="" />
                                          <div className="flex-grow">
                                            <h5 className="font-serif text-sm text-primary">{item.name}</h5>
                                            <p className="text-[8px] uppercase tracking-widest font-bold text-gray-400 mt-1">Size {item.size} • Qty {item.quantity}</p>
                                          </div>
                                          <p className="font-sans font-bold text-sm text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="xl:col-span-5 bg-gray-50/50 p-4 lg:p-6 rounded-2xl space-y-4">
                                      <div className="flex gap-3">
                                        <MapPin size={16} className="text-primary mt-0.5" />
                                        <div>
                                          <p className="text-[8px] uppercase font-bold text-gray-400">Destination</p>
                                          <p className="text-[10px] font-bold text-primary">{order.shippingInfo.address}, {order.shippingInfo.city}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-3 pt-4 border-t border-gray-200/50">
                                        <CreditCard size={16} className="text-primary mt-0.5" />
                                        <p className="text-[10px] font-bold text-primary">Transaction Secured</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'wishlist' ? (
              <motion.div
                key="wishlist"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                variants={containerVariants}
              >
                <h3 className="font-serif text-2xl lg:text-3xl text-primary flex items-center gap-4 mb-8 lg:mb-10">
                  Saved Collection
                  <span className="text-[10px] font-sans font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{wishlistItems.length}</span>
                </h3>
                {wishlistLoading ? (
                  <div className="py-20 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                    <div className="w-10 h-10 border-2 border-primaryContainer border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="bg-gray-50/30 p-12 lg:p-24 text-center rounded-[2rem] border border-dashed border-gray-200">
                    <Heart size={40} className="text-gray-100 mx-auto mb-6" />
                    <p className="text-secondary/40 font-serif italic text-xl">Your collection is empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                    {wishlistItems.map(p => (
                      <motion.div
                        key={p._id}
                        variants={itemVariants}
                        className="bg-white border border-gray-100 rounded-[1.25rem] lg:rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-700"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${p._id}`)}>
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.8 }}
                            src={p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`}
                            className="w-full h-full object-cover"
                            alt={p.name}
                          />
                          <button onClick={(e) => { e.stopPropagation(); removeFromWishlist(p._id); }} className="absolute top-3 right-3 lg:top-6 lg:right-6 w-8 h-8 lg:w-10 lg:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-xl lg:opacity-0 lg:group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                        </div>
                        <div className="p-4 lg:p-8 space-y-2 lg:space-y-4">
                          <h4 className="font-serif text-sm lg:text-xl text-primary truncate italic cursor-pointer" onClick={() => navigate(`/product/${p._id}`)}>{p.name}</h4>
                          <div className="flex justify-between items-center">
                            <p className="font-sans font-bold text-primary text-xs lg:text-lg">₹{p.price.toLocaleString('en-IN')}</p>
                            <button onClick={() => navigate(`/product/${p._id}`)} className="text-[7px] lg:text-[9px] uppercase tracking-widest font-bold text-primaryContainer border-b border-primaryContainer/20">View</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'bespoke' ? (
              <motion.div
                key="bespoke"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                variants={containerVariants}
              >
                <h3 className="font-serif text-2xl lg:text-3xl text-primary flex items-center gap-4 mb-8 lg:mb-10 italic">
                  Bespoke Consultations
                  <span className="text-[10px] font-sans font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{bespokeRequests.length}</span>
                </h3>

                {bespokeLoading ? (
                  <div className="py-20 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                    <div className="w-10 h-10 border-2 border-primaryContainer border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  </div>
                ) : bespokeRequests.length === 0 ? (
                  <div className="bg-gray-50/30 p-12 lg:p-24 text-center rounded-[2rem] border border-dashed border-gray-200">
                    <MessageSquare size={40} className="text-gray-100 mx-auto mb-6" />
                    <p className="text-secondary/40 font-serif italic text-xl">No custom design inquiries yet.</p>
                    <button onClick={() => navigate('/bespoke')} className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px]">Start Bespoke Project</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bespokeRequests.map(req => (
                      <motion.div
                        key={req._id}
                        variants={itemVariants}
                        className="bg-white border border-gray-100 rounded-[1.5rem] p-6 lg:p-10 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="space-y-4 flex-grow">
                            <div className="flex items-center justify-between">
                              <p className="text-[8px] uppercase tracking-widest font-bold text-gray-400">Request ID: #{req._id.slice(-6).toUpperCase()}</p>
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest
                                ${req.status === 'New' ? 'bg-blue-50 text-blue-600' :
                                  req.status === 'Accepted' ? 'bg-purple-50 text-purple-600' :
                                    req.status === 'Processing' ? 'bg-amber-50 text-amber-600' :
                                      req.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                                        'bg-green-50 text-green-600'}`}>
                                {req.status}
                              </span>
                            </div>
                            <h4 className="font-serif text-xl text-primary leading-tight">{req.requirement.length > 100 ? req.requirement.slice(0, 100) + '...' : req.requirement}</h4>

                            {req.images?.length > 0 && (
                              <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2">
                                {req.images.map((img, i) => (
                                  <img key={i} src={`http://localhost:5000${img}`} className="w-16 h-16 object-cover rounded-lg border border-gray-100" alt="" />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="md:w-64 space-y-4 pt-6 md:pt-0 md:pl-8 md:border-l border-gray-100">
                            <div>
                              <p className="text-[8px] uppercase font-bold text-gray-400 mb-1">Last Interaction</p>
                              <p className="text-[10px] text-primary flex items-center gap-2">
                                <Clock size={12} /> {new Date(req.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] uppercase font-bold text-gray-400 mb-1">Contact Status</p>
                              <div className="flex flex-wrap gap-2">
                                {req.contactStatus?.length > 0 ? req.contactStatus.map(method => (
                                  <span key={method} className="text-[8px] bg-gray-50 px-2 py-1 rounded-md text-gray-500 font-bold uppercase">{method}</span>
                                )) : <span className="text-[8px] italic text-gray-300">Awaiting Outreach</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/profile/bespoke/${req._id}`)}
                              className="w-full bg-primary text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-secondary transition-colors"
                            >
                              View Project Details
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                variants={containerVariants}
              >
                <h3 className="font-serif text-2xl text-primary mb-4 italic">Account Settings</h3>

                <motion.div
                  variants={itemVariants}
                  className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm max-w-xl"
                >
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (password !== confirmPassword) {
                        showAlert('Error', 'Passwords do not match');
                        return;
                      }
                      setUpdating(true);
                      try {
                        const updateData = { name };
                        if (password.trim() !== '') {
                          updateData.password = password;
                        }

                        console.log('Sending update profile request:', updateData);
                        const updated = await updateProfile(updateData);
                        console.log('Update success:', updated);

                        showAlert('Profile Updated', 'Your account details have been successfully updated.');
                        setPassword('');
                        setConfirmPassword('');
                      } catch (err) {
                        console.error('Update Profile Error:', err);
                        const msg = err.response?.data?.message || err.message || 'Failed to update profile';
                        showAlert('Error', msg);
                      } finally {
                        setUpdating(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 ml-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/5 transition-all outline-none text-sm"
                        placeholder="Your Name"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 ml-1">Email Address</label>
                      <input
                        type="email"
                        value={userInfo?.email}
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed outline-none text-sm"
                      />
                    </div>

                    <div className="pt-2 border-t border-gray-50 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 ml-1">Change Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/5 transition-all outline-none text-sm"
                            placeholder="New Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors focus:outline-none"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 ml-1">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/5 transition-all outline-none text-sm"
                            placeholder="Confirm Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors focus:outline-none"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-primaryContainer transition-all shadow-lg disabled:opacity-50 mt-2"
                    >
                      {updating ? 'Updating...' : 'Save Changes'}
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;

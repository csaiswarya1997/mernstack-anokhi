import React, { createContext, useState, useContext, useEffect } from 'react';
import API_URL from '../config';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('anokhi_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('anokhi_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: '',
    message: '',
    type: 'alert',
    onConfirm: null,
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel'
  });

  useEffect(() => {
    localStorage.setItem('anokhi_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('anokhi_orders', JSON.stringify(orders));
  }, [orders]);

  const showAlert = (title, message) => {
    setModalConfig({ show: true, title, message, type: 'alert', onConfirm: null });
  };

  const showConfirm = (title, message, onConfirm, confirmLabel = 'Confirm', cancelLabel = 'Cancel') => {
    setModalConfig({ show: true, title, message, type: 'confirm', onConfirm, confirmLabel, cancelLabel });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, show: false }));
  };

  const getCartItemId = (item) => item.cartItemId || `${item._id || item.id}-${item.size || 'M'}`;

  const addToCart = (product) => {
    const cartItemId = getCartItemId(product);
    const existingItem = cartItems.find(item => getCartItemId(item) === cartItemId);
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    const availableStock = product.stockBySize?.[product.size] || product.countInStock || 0;
    
    if (currentQty >= availableStock) {
      showAlert('Stock Limit Reached', `Sorry, we only have ${availableStock} pieces available in size ${product.size}.`);
      return;
    }
    
    if (existingItem) {
      setCartItems(prev => prev.map(item => 
        getCartItemId(item) === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems(prev => [...prev, { ...product, quantity: 1, id: product._id || product.id, size: product.size || 'M', cartItemId }]);
    }
    
    // Optional: Success alert
    // showAlert('Added to Bag', `${product.name} (Size ${product.size}) has been added to your shopping bag.`);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => getCartItemId(item) !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(cartItemId);
      return;
    }

    const itemToUpdate = cartItems.find(item => getCartItemId(item) === cartItemId);
    if (!itemToUpdate) return;

    const availableStock = itemToUpdate.stockBySize?.[itemToUpdate.size] || itemToUpdate.countInStock || 0;
    if (quantity > availableStock) {
      showAlert('Stock Limit', `Only ${availableStock} items are available.`);
      setCartItems(prev => prev.map(item => 
        getCartItemId(item) === cartItemId ? { ...item, quantity: availableStock } : item
      ));
      return;
    }

    setCartItems(prev => prev.map(item => 
      getCartItemId(item) === cartItemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCartItems([]);

  const placeOrder = async (shippingInfo, paymentResult = null) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({
          orderItems: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            image: item.image,
            size: item.size,
            productCode: item.productCode,
            price: item.price,
            product: item._id || item.id
          })),
          shippingInfo,
          totalPrice: cartTotal,
          paymentResult,
          isPaid: !!paymentResult
        })
      });
      
      const newOrder = await res.json();
      setOrders(prev => [newOrder, ...prev]);
      clearCart();
      return newOrder;
    } catch (err) {
      console.error('Error placing order:', err);
      showAlert('Order Error', 'There was a problem placing your order. Please try again.');
    }
  };

  const createPaymentOrder = async (amount) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        throw new Error('Please log in to complete your purchase.');
      }

      const res = await fetch(`${API_URL}/api/payment/order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ amount })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Server failed to initiate payment order.');
      }
      return data;
    } catch (err) {
      console.error('Error creating payment order:', err);
      showAlert('Payment Initialization Failed', err.message || 'Unable to initiate payment. Please try again.');
      throw err; // Re-throw to be caught by Checkout.jsx
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${API_URL}/api/payment/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify(paymentData)
      });
      return res.ok;
    } catch (err) {
      console.error('Error verifying payment:', err);
      return false;
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, orders, addToCart, removeFromCart, updateQuantity, 
      clearCart, placeOrder, createPaymentOrder, verifyPayment, cartTotal, cartCount,
      showAlert, showConfirm
    }}>
      {children}
      
      {/* Global Modal Component */}
      {modalConfig.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full p-8 text-center animate-fade-in-up">
            <h3 className="text-2xl font-serif text-primary mb-3">{modalConfig.title}</h3>
            <p className="font-sans text-secondary/60 text-sm mb-8 leading-relaxed">
              {modalConfig.message}
            </p>
            <div className="flex gap-4">
              {modalConfig.type === 'confirm' ? (
                <>
                  <button 
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-500 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-colors"
                  >
                    {modalConfig.cancelLabel}
                  </button>
                  <button 
                    onClick={() => {
                      if (modalConfig.onConfirm) modalConfig.onConfirm();
                      closeModal();
                    }}
                    className="flex-1 px-4 py-3 bg-primaryContainer text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-md"
                  >
                    {modalConfig.confirmLabel}
                  </button>
                </>
              ) : (
                <button 
                  onClick={closeModal}
                  className="w-full px-4 py-3 bg-primaryContainer text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-md"
                >
                  Got it
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

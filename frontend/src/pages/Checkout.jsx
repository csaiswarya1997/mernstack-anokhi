import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronRight, CreditCard, Truck, CheckCircle2, ShieldCheck, MapPin, Phone, Lock } from 'lucide-react';
import API_URL from '../config';

const Checkout = () => {
  const { cartItems, cartTotal, placeOrder, createPaymentOrder, verifyPayment, releasePaymentStock, showAlert } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Review & Payment
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showAddressConfirm, setShowAddressConfirm] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    country: 'India',
    state: '',
    city: '',
    postalCode: '',
    paymentMethod: 'ONLINE' // Default to Online only
  });

  const [apiCountries, setApiCountries] = useState([]);
  const [apiStates, setApiStates] = useState([]);
  const [apiCities, setApiCities] = useState([]);

  // Fetch Countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries');
        const data = await res.json();
        if (!data.error) setApiCountries(data.data.map(c => c.country));
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch States when Country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (!shippingInfo.country) return;
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: shippingInfo.country })
        });
        const data = await res.json();
        if (!data.error) {
          setApiStates(data.data.states);
        } else {
          setApiStates([]);
        }
      } catch (err) {
        console.error("Failed to fetch states", err);
      }
    };
    fetchStates();
  }, [shippingInfo.country]);

  // Fetch Cities when State changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!shippingInfo.state || !shippingInfo.country) return;
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: shippingInfo.country, state: shippingInfo.state })
        });
        const data = await res.json();
        if (!data.error) setApiCities(data.data);
        else setApiCities([]);
      } catch (err) {
        console.error("Failed to fetch cities", err);
      }
    };
    fetchCities();
  }, [shippingInfo.state, shippingInfo.country]);

  // Scroll to top when order is placed successfully
  useEffect(() => {
    if (orderPlaced) {
      window.scrollTo(0, 0);
    }
  }, [orderPlaced]);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address || !shippingInfo.phone || !shippingInfo.city || !shippingInfo.state || !shippingInfo.postalCode) {
        showAlert('Missing Info', 'Please fill in all required shipping details.');
        return;
      }
      setShowAddressConfirm(true);
    }
  };

  const confirmAddressAndProceed = () => {
    setShowAddressConfirm(false);
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      showAlert('Empty Cart', 'Your bag is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Fetch Razorpay Key ID dynamically from backend
      const keyRes = await fetch(`${API_URL}/api/payment/key`);
      if (!keyRes.ok) {
        throw new Error('Failed to fetch payment configuration.');
      }
      const { keyId } = await keyRes.json();

      // 2. Create Razorpay Order
      const { id: razorpayOrderId, amount, currency } = await createPaymentOrder(cartTotal);
      
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      // 3. Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Zaloura Studio',
        description: 'Artisanal Luxury Purchase',
        order_id: razorpayOrderId,
        handler: async (response) => {
          // 3. Verify Payment
          const isVerified = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (isVerified) {
            // 4. Create Order in Database
            const paymentResult = {
              id: response.razorpay_payment_id,
              status: 'COMPLETED',
              update_time: new Date().toISOString(),
              email_address: shippingInfo.email
            };
            
            const success = await placeOrder(shippingInfo, paymentResult);
            if (success) {
              setOrderPlaced(true);
            } else {
              setIsSubmitting(false);
              // Safe fallback: release stock if order failed to save in DB after payment verification
              await releasePaymentStock(cartItems);
            }
          } else {
            setIsSubmitting(false);
            showAlert('Payment Verification Failed', 'We could not verify your payment. Please contact support.');
            // Release stock on payment verification failure
            await releasePaymentStock(cartItems);
          }
        },
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          contact: shippingInfo.phone
        },
        theme: {
          color: '#84624D'
        },
        modal: {
          ondismiss: async () => {
            setIsSubmitting(false);
            // Release reserved stock if customer cancels checkout
            await releasePaymentStock(cartItems);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment flow error:', error);
      showAlert('Payment Error', error.message || 'There was a problem initiating your payment.');
      setIsSubmitting(false);
      // Release reserved stock if error occurred during initiation phase
      await releasePaymentStock(cartItems);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-5xl font-serif text-primary mb-4 tracking-tight">Order Confirmed!</h1>
        <p className="text-secondary/60 font-sans mb-12 max-w-sm mx-auto leading-relaxed">
          Your order has been placed successfully. A confirmation email has been sent to <strong>{shippingInfo.email}</strong>.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary text-white px-12 py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-2xl hover:bg-primaryContainer hover:-translate-y-1 transition-all"
        >
          Explore More Pieces
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-16 pt-4 md:pt-6 pb-24">
      {/* Checkout Progress */}
      <div className="flex items-center justify-center mb-16 gap-4">
        <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary' : 'text-gray-300'}`}>
          <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${step === 1 ? 'border-primary bg-primary text-white' : 'border-gray-200'}`}>1</span>
          <span className="text-[10px] uppercase tracking-widest font-bold">Shipping</span>
        </div>
        <div className="w-12 h-[1px] bg-gray-100"></div>
        <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary' : 'text-gray-300'}`}>
          <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${step === 2 ? 'border-primary bg-primary text-white' : 'border-gray-200'}`}>2</span>
          <span className="text-[10px] uppercase tracking-widest font-bold">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-12 animate-fade-in">
              <div className="space-y-8">
                <h2 className="text-3xl font-serif text-primary tracking-tight">Shipping Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400">First Name *</label>
                    <input required type="text" value={shippingInfo.firstName} onChange={e => setShippingInfo({ ...shippingInfo, firstName: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Last Name *</label>
                    <input required type="text" value={shippingInfo.lastName} onChange={e => setShippingInfo({ ...shippingInfo, lastName: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Email Address *</label>
                    <input required type="email" value={shippingInfo.email} onChange={e => setShippingInfo({ ...shippingInfo, email: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Phone Number *</label>
                    <input required type="tel" value={shippingInfo.phone} onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Country / Region *</label>
                  <select required value={shippingInfo.country} onChange={e => setShippingInfo({ ...shippingInfo, country: e.target.value, state: '', city: '' })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans">
                    <option value="">Select Country</option>
                    {apiCountries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400">State *</label>
                    <select required value={shippingInfo.state} onChange={e => setShippingInfo({ ...shippingInfo, state: e.target.value, city: '' })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans">
                      <option value="">Select State</option>
                      {apiStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400">City *</label>
                    <select required value={shippingInfo.city} onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans" disabled={!shippingInfo.state}>
                      <option value="">Select City</option>
                      {apiCities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400">PIN / Postal Code *</label>
                    <input required type="text" maxLength="10" value={shippingInfo.postalCode} onChange={e => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Detailed Address *</label>
                  <textarea required rows="2" value={shippingInfo.address} onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans resize-none" placeholder="House No, Building, Street, Area"></textarea>
                </div>
              </div>

              <button type="submit" className="w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-primaryContainer hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2">
                Continue to Payment <ChevronRight size={16} />
              </button>
            </form>
          ) : (
            <div className="space-y-12 animate-fade-in">
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <h2 className="text-3xl font-serif text-primary tracking-tight">Review & Payment</h2>
                  <button onClick={() => setStep(1)} className="text-[10px] uppercase font-bold text-primaryContainer border-b border-primaryContainer/20 pb-1">Edit Shipping</button>
                </div>

                {/* Shipping Summary Card */}
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <MapPin size={18} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Delivery Address</span>
                    </div>
                    <div className="font-sans text-sm text-secondary leading-relaxed">
                      <p className="font-bold text-primary text-base mb-1">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                      <p>{shippingInfo.address}</p>
                      <p>{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.postalCode}</p>
                      <p>{shippingInfo.country}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <Phone size={18} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Contact Info</span>
                    </div>
                    <div className="font-sans text-sm text-secondary space-y-1">
                      <p><strong>Email:</strong> {shippingInfo.email}</p>
                      <p><strong>Phone:</strong> {shippingInfo.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-6">
                  <h3 className="text-xl font-serif text-primary">Secure Payment</h3>
                  <div className="bg-primaryContainer/5 border-2 border-primaryContainer/20 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-primaryContainer shadow-md">
                      <CreditCard size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-lg font-bold text-primary mb-1">Online Payment Required</h4>
                      <p className="text-xs text-secondary/70 font-sans leading-relaxed">
                        To ensure the safety of our couriers and the integrity of our artisanal pieces, we currently only accept secure online payments via Razorpay (UPI, Cards, NetBanking).
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-primaryContainer bg-white px-4 py-2 rounded-full border border-primaryContainer/10 shadow-sm">
                      <Lock size={14} />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-8">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full bg-primaryContainer text-white py-6 rounded-xl font-bold uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-primary hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? 'Securing Transaction...' : <><Lock size={16} /> Complete Secure Payment — ₹{cartTotal.toLocaleString('en-IN')}</>}
                </button>
                <div className="flex items-center justify-center gap-4 text-gray-300 pt-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span className="text-[9px] uppercase tracking-widest font-bold">100% Secure</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Truck size={14} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">Tracked Shipping</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sticky top-32 space-y-8 shadow-sm">
            <h2 className="text-2xl font-serif text-primary border-b border-gray-50 pb-4">Order Summary</h2>

            <div className="space-y-6 max-h-[35vh] overflow-y-auto pr-4 scrollbar-hide">
              {cartItems.map(item => (
                <div key={item.cartItemId} className="flex gap-4">
                  <div className="w-16 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-primary truncate flex-1">{item.name}</p>
                      {item.productCode && (
                        <span className="text-[8px] font-mono font-bold text-primaryContainer bg-primaryContainer/5 px-1.5 py-0.5 rounded border border-primaryContainer/10">
                          #{item.productCode}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Size {item.size} • Qty {item.quantity}</p>
                    <p className="text-sm font-sans font-bold text-secondary mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50">
              <div className="flex justify-between text-xs text-secondary/60">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-secondary/60">
                <span>Shipping</span>
                <span className="text-green-600 font-bold uppercase tracking-widest">Complimentary</span>
              </div>
              <div className="flex justify-between font-bold text-2xl text-primary pt-4 border-t border-gray-100">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-xl flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                <Truck size={14} />
              </div>
              <p className="text-[10px] text-primary/70 font-sans italic leading-tight">
                Your artisanal order will be shipped via priority express courier.
              </p>
            </div>
          </div>
        </div>
        {/* Address Confirmation Modal */}
        {showAddressConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-champagne/30">
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 text-primaryContainer">
                  <div className="w-12 h-12 bg-primaryContainer/10 rounded-2xl flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <h3 className="text-2xl font-serif">Confirm Delivery Address</h3>
                </div>

                <div className="bg-surface/50 p-6 rounded-2xl border border-champagne/20 space-y-3">
                  <p className="text-primary font-bold text-lg">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                  <div className="space-y-1 text-secondary text-sm font-sans leading-relaxed">
                    <p>{shippingInfo.address}</p>
                    <p>{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.postalCode}</p>
                    <p className="font-bold text-[10px] uppercase tracking-widest text-secondary/40 pt-2">Contact: {shippingInfo.phone}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={confirmAddressAndProceed}
                    className="w-full bg-primaryContainer text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-primary transition-colors"
                  >
                    Confirm & Proceed to Payment
                  </button>
                  <button
                    onClick={() => setShowAddressConfirm(false)}
                    className="w-full bg-white text-secondary py-4 rounded-xl font-bold uppercase tracking-widest text-xs border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    Edit Address
                  </button>
                </div>
              </div>
              <div className="bg-surface py-3 px-8 text-center border-t border-champagne/10">
                <p className="text-[9px] uppercase tracking-tighter text-secondary/40 font-bold">Please ensure all details are correct for priority shipping</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;

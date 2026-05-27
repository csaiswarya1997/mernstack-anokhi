import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageSquare, ArrowLeft, Send, Edit3, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';

const Bespoke = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useCart();
  const { userInfo } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    requirement: ''
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      const fetchBespoke = async () => {
        try {
          const res = await fetch(`${API_URL}/api/bespoke/${id}`, {
            headers: { Authorization: `Bearer ${userInfo?.token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setFormData({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
              whatsapp: data.whatsapp,
              requirement: data.requirement
            });
            setImages(data.images);

            // Check if status is not 'New'
            if (data.status !== 'New') {
              showAlert('Cannot Edit', 'This request has already been processed and cannot be modified.');
              navigate('/profile');
            }
          }
        } catch (error) {
          console.error('Error fetching bespoke:', error);
        }
      };
      fetchBespoke();
    } else if (userInfo) {
      setFormData(prev => ({
        ...prev,
        firstName: userInfo.name?.split(' ')[0] || '',
        lastName: userInfo.name?.split(' ').slice(1).join(' ') || '',
        email: userInfo.email || ''
      }));
    }
  }, [id, userInfo, navigate]);

  // Scroll to top when bespoke request is submitted successfully
  useEffect(() => {
    if (isSubmitted) {
      window.scrollTo(0, 0);
    }
  }, [isSubmitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const body = { ...formData, images };
      if (userInfo && userInfo._id) {
        body.user = userInfo._id;
      }

      const url = isEditMode
        ? `${API_URL}/api/bespoke/${id}`
        : `${API_URL}/api/bespoke`;

      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        if (isEditMode) {
          showAlert('Updated', 'Your project inquiry has been updated successfully.');
          navigate(`/profile/bespoke/${id}`);
        } else {
          setIsSubmitted(true);
        }
      } else {
        const errorData = await res.json();
        showAlert('Error', errorData.message || 'Action failed. Please try again.');
      }
    } catch (error) {
      console.error('Failed to process request', error);
      showAlert('Connection Error', 'Failed to reach the server.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };
  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formDataUpload = new FormData();
    files.forEach((file) => {
      formDataUpload.append('images', file);
    });
    setUploading(true);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setImages(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('Upload failed', error);
      showAlert('Upload Error', 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="max-w-[1280px] mx-auto px-4 py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 size={32} />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4 tracking-tight">Request Received</h1>
        <p className="text-secondary/60 font-sans mb-12 max-w-sm mx-auto leading-relaxed">
          Our master artisans have received your requirements. We will contact you at <strong>{formData.email}</strong> shortly to discuss your custom piece.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/profile')}
          className="bg-primary text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all"
        >
          Go to Dashboard
        </motion.button>
      </motion.div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-16 pt-8 md:pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-3xl mx-auto"
        >
          <button
            onClick={() => setShowConfirmation(false)}
            className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-12 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to Form</span>
          </button>

          <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-sm">
            <div className="text-center mb-12">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primaryContainer block mb-2">Review Summary</span>
              <h2 className="text-3xl font-serif text-primary">Confirm Your Inquiry</h2>
              <p className="text-gray-400 text-xs mt-2">Please verify your details before sending.</p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8 border-b border-gray-50 pb-8">
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Full Name</p>
                  <p className="text-sm font-medium text-primary">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Contact Email</p>
                  <p className="text-sm font-medium text-primary">{formData.email}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Phone / WhatsApp</p>
                  <p className="text-sm font-medium text-primary">{formData.phone} / {formData.whatsapp}</p>
                </div>
              </div>

              <div>
                <p className="text-[9px] uppercase font-bold text-gray-400 mb-2">Inquiry Details</p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="text-sm text-secondary leading-relaxed italic">"{formData.requirement}"</p>
                </div>
              </div>

              {images.length > 0 && (
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-400 mb-3">Reference Images ({images.length})</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, i) => (
                      <img key={i} src={`${API_URL}${img}`} className="w-20 h-20 object-cover rounded-xl border border-gray-100" alt="" />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-4">
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl flex items-center justify-center gap-3 hover:bg-primaryContainer hover:-translate-y-1 transition-all"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={14} />
                      {isEditMode ? 'Confirm Changes' : 'Confirm & Submit'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="w-full bg-gray-50 text-gray-400 py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:text-gray-600 transition-colors"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-16 pt-8 md:pt-12 pb-24">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1 }}
            className="text-[10px] uppercase font-bold text-gray-400 block mb-4"
          >
            {isEditMode ? 'Refine Your Vision' : 'Tailored Elegance'}
          </motion.span>
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-serif text-primary tracking-tight italic">
            {isEditMode ? 'Edit Inquiry' : 'Bespoke Service'}
          </motion.h1>
          <motion.p variants={fadeInUp} className="mt-8 text-secondary/60 font-serif italic text-lg max-w-xl mx-auto leading-relaxed">
            {isEditMode
              ? 'Make adjustments to your existing project requirements below.'
              : 'Collaborate with our designers to create a one-of-a-kind garment that fits your unique measurements.'}
          </motion.p>
        </motion.div>

        <motion.form
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          onSubmit={handleSubmit}
          className="space-y-8 bg-white border border-gray-100 p-8 md:p-12 rounded-3xl shadow-sm"
        >
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400">First Name</label>
              <input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400">Last Name</label>
              <input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-gray-400">Email Address</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans" />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400">Phone Number</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans" placeholder="+91 ..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400">WhatsApp Number</label>
              <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans" placeholder="+91 ..." />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-gray-400">Inquiry Details</label>
            <textarea required rows="4" placeholder="Mention size details, color preferences, or specific design elements..." value={formData.requirement} onChange={e => setFormData({ ...formData, requirement: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-4 outline-none focus:border-primary transition-colors font-sans resize-none"></textarea>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <label className="text-[10px] uppercase font-bold text-gray-400 block">Reference Images (Optional)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <AnimatePresence>
                {images.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100"
                  >
                    <img src={`${API_URL}${img}`} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={14} className="rotate-45" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <label className={`aspect-square rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="text-gray-400 flex flex-col items-center">
                  <span className="text-xl mb-1">+</span>
                  <span className="text-[8px] uppercase tracking-widest font-bold">{uploading ? 'Uploading...' : 'Add Image'}</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={uploadFileHandler}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl flex items-center justify-center gap-3 hover:bg-primaryContainer transition-all disabled:opacity-50"
          >
            {isEditMode ? <Edit3 size={14} /> : <Send size={14} />}
            {isSubmitting ? 'Processing...' : (isEditMode ? 'Update Inquiry' : 'Review & Send Inquiry')}
          </motion.button>
        </motion.form>

        {!isEditMode && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div className="space-y-3">
              <h4 className="font-serif text-primary">Consultation</h4>
              <p className="text-xs text-gray-400 font-sans">Initial design discussion via email or phone call.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-serif text-primary">Measurement</h4>
              <p className="text-xs text-gray-400 font-sans">Guided sizing to ensure the perfect tailored fit.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-serif text-primary">Crafting</h4>
              <p className="text-xs text-gray-400 font-sans">Handmade production over 10-14 business days.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Bespoke;

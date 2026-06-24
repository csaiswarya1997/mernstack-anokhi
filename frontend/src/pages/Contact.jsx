import React, { useState } from 'react';
import API_URL from '../config';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Instagram,
  Send,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import artisanImg from '../assets/artisan-story.png';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState(null);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemSlideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  React.useEffect(() => {
    document.title = "Contact Zaloura | Premium Boutique Support in Thrissur, Kerala";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Get in touch with the team at Zaloura for custom bridal wear, bespoke couture orders, and help with kurtis and salwars. Contact Zaloura today.";
  }, []);

  React.useEffect(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', comment: '' });
        toast.success('Your message has been sent successfully.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin size={24} />,
      label: 'Zaloura Address',
      value: settings?.address || '123, Heritage Lane, Boutique District, Jaipur, Rajasthan 302001',
      link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.address || '')}`
    },
    {
      icon: <Phone size={24} />,
      label: 'Contact Number',
      value: settings?.phone || '+91 8921273858',
      link: `tel:${settings?.phone}`
    },
    {
      icon: <Mail size={24} />,
      label: 'Email Support',
      value: settings?.email || 'ZALOURA.IN@GMAIL.COM',
      link: `mailto:${settings?.email}`
    },
    {
      icon: <MessageCircle size={24} />,
      label: 'WhatsApp Contact',
      value: settings?.whatsapp || '+91 8921273858',
      link: `https://wa.me/${settings?.whatsapp?.replace(/\D/g, '')}`
    },
    {
      icon: <Instagram size={24} />,
      label: 'Instagram ID',
      value: settings?.instagram || '@maison_zaloura',
      link: `https://instagram.com/${settings?.instagram?.replace('@', '')}`
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="pt-4 md:pt-6 pb-8 bg-gray-50/50 border-b border-gray-100"
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1 }}
            className="text-[10px] uppercase font-bold text-gray-400 block mb-4"
          >
            Connect With Us
          </motion.span>
          <h1 className="text-5xl md:text-7xl font-serif text-primary tracking-tighter leading-tight italic">Contact Zaloura</h1>
          <p className="mt-8 text-secondary/60 font-serif italic text-xl max-w-2xl mx-auto leading-relaxed">
            Reach out to the Zaloura team for bespoke custom tailoring inquiries, order support, or general brand questions. We are here to help you own the elegance.
          </p>
        </div>
      </motion.div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Contact Details */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="lg:col-span-5 space-y-12"
          >
            <div>
              <motion.h2 variants={itemSlideIn} className="text-3xl font-serif text-primary mb-8 italic">Contact Details</motion.h2>
              <div className="space-y-8">
                {contactInfo.map((info, idx) => (
                  <motion.a
                    key={idx}
                    variants={itemSlideIn}
                    href={info.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-6 group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center transition-all text-primary group-hover:bg-primary group-hover:text-white group-hover:-translate-y-1"
                    >
                      {info.icon}
                    </motion.div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">{info.label}</p>
                      <p className="text-secondary font-sans text-sm group-hover:text-primary transition-colors">{info.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            <motion.div
              variants={itemSlideIn}
              className="p-10 bg-primary rounded-[2.5rem] text-white shadow-xl shadow-primary/20"
            >
              <img src={artisanImg} alt="Contact Zaloura Boutique" className="w-full h-48 object-cover rounded-2xl mb-6 shadow-md" />
              <h3 className="font-serif text-2xl mb-4 italic">Bespoke Consultations</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Private appointments are available for custom bridal and couture inquiries. Please reach out to schedule your session.
              </p>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em]">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Available {settings?.workingHours || '10 AM — 7 PM'}
              </div>
            </motion.div>
          </motion.div>

          {/* Enquiry Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-7"
          >
            <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-14 shadow-sm relative overflow-hidden">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
                    >
                      <CheckCircle2 size={40} />
                    </motion.div>
                    <h3 className="text-3xl font-serif text-primary mb-4 italic">Thank You</h3>
                    <p className="text-secondary/60 font-serif italic text-lg mb-10">Your enquiry has been received. Our team will contact you shortly.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary hover:text-primaryContainer transition-colors"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="mb-12">
                      <h2 className="text-3xl font-serif text-primary mb-2 italic">Enquire with us</h2>
                      <p className="text-secondary/40 text-sm italic">Please share your details below and we will get back to you.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Your Name</label>
                          <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border-b border-gray-200 py-4 outline-none focus:border-primary transition-colors bg-transparent font-sans text-sm"
                            placeholder="Full Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Email Address</label>
                          <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border-b border-gray-200 py-4 outline-none focus:border-primary transition-colors bg-transparent font-sans text-sm"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Contact Number</label>
                        <input
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full border-b border-gray-200 py-4 outline-none focus:border-primary transition-colors bg-transparent font-sans text-sm"
                          placeholder="+91 ..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Your Comment</label>
                        <textarea
                          required
                          rows="5"
                          value={formData.comment}
                          onChange={e => setFormData({ ...formData, comment: e.target.value })}
                          className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.5rem] px-6 py-5 outline-none focus:border-primary transition-colors font-sans text-sm resize-none"
                          placeholder="How can we help you?"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Send size={14} />
                            Post Enquiry
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;

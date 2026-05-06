import React, { useState, useEffect } from 'react';
import { Truck, RotateCcw, ShieldCheck, Globe } from 'lucide-react';

import { motion } from 'framer-motion';
import API_URL from '../config';

const Shipping = () => {
  const [settings, setSettings] = useState(null);

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
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-white"
    >
      {/* Hero Section */}
      <motion.div
        variants={itemVariants}
        className="pt-8 md:pt-12 pb-16 bg-gray-50/50 border-b border-gray-100"
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 block mb-4"
          >
            Concierge Services
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif text-primary tracking-tighter leading-tight italic"
          >
            L'Expédition
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-secondary/60 font-serif italic text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Everything you need to know about receiving your handcrafted Anokhi pieces.
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">

          {/* Shipping Section */}
          <div className="space-y-12">
            <motion.div variants={itemVariants} className="flex items-start gap-8">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                className="w-16 h-16 bg-primaryContainer/5 text-primaryContainer rounded-3xl flex items-center justify-center shrink-0 shadow-sm"
              >
                <Truck size={32} />
              </motion.div>
              <div>
                <h2 className="text-3xl font-serif text-primary mb-6 italic">Shipping Policy</h2>
                <div className="space-y-6 text-secondary/70 font-sans leading-relaxed whitespace-pre-wrap">
                  {settings?.shippingPolicy || (
                    <>
                      <p>
                        We offer complimentary standard shipping on all domestic orders within India. Each piece is handcrafted to order and typically ships within 7-10 business days.
                      </p>
                      <ul className="space-y-4 list-disc pl-5">
                        <li>Domestic Delivery: 3-5 business days after dispatch.</li>
                        <li>International Shipping: 10-15 business days via premium couriers (DHL/FedEx).</li>
                        <li>Express Shipping: Available upon request for urgent requirements.</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-8">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                className="w-16 h-16 bg-primaryContainer/5 text-primaryContainer rounded-3xl flex items-center justify-center shrink-0 shadow-sm"
              >
                <Globe size={32} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-serif text-primary mb-4 italic">International Delivery</h2>
                <div className="text-secondary/70 font-sans leading-relaxed whitespace-pre-wrap">
                  {settings?.internationalPolicy || "Anokhi ships worldwide. Please note that international orders may be subject to customs duties and taxes upon arrival in the destination country, which are the responsibility of the recipient."}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Returns Section */}
          <div className="space-y-12">
            <motion.div variants={itemVariants} className="flex items-start gap-8">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                className="w-16 h-16 bg-primaryContainer/5 text-primaryContainer rounded-3xl flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw size={32} />
              </motion.div>
              <div>
                <h2 className="text-3xl font-serif text-primary mb-6 italic">Returns & Exchanges</h2>
                <div className="space-y-6 text-secondary/70 font-sans leading-relaxed whitespace-pre-wrap">
                  {settings?.returnsPolicy || (
                    <>
                      <p>
                        As our garments are handcrafted and often made to order, we maintain a selective return policy to ensure sustainability and quality.
                      </p>
                      <ul className="space-y-4 list-disc pl-5">
                        <li>7-Day Return Window: Items must be unused, with all tags intact.</li>
                        <li>Exchanges: Size exchanges are complimentary for domestic orders.</li>
                        <li>Custom Orders: Bespoke and altered items are final sale.</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-8">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                className="w-16 h-16 bg-primaryContainer/5 text-primaryContainer rounded-3xl flex items-center justify-center shrink-0 shadow-sm"
              >
                <ShieldCheck size={32} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-serif text-primary mb-4 italic">Quality Assurance</h2>
                <div className="text-secondary/70 font-sans leading-relaxed whitespace-pre-wrap">
                  {settings?.qualityPolicy || "If you receive a damaged or defective piece, please contact our concierge team within 48 hours of delivery with photographic evidence for an immediate replacement."}
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Shipping;

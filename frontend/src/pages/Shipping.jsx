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

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  const shippingDefaults = [
    "At Zaloura, we carefully inspect and pack every product before dispatch to make sure it reaches you safely.",
    "Processing Timeline: Orders are usually processed within 1–3 business days after order confirmation.",
    "Estimated Delivery: Once the order is processed and shipped, the estimated delivery time is 7–15 working days, depending on your location and courier service availability.",
    "Delivery Variations: Delivery time may vary due to public holidays, weather conditions, courier delays, or other unavoidable situations.",
    "Status Tracking: Customers will receive order and shipping updates through WhatsApp, SMS, email, or website order tracking where available.",
    "Delivery Accuracy: Please make sure your delivery address and phone number are correct before placing the order. Zaloura will not be responsible for delays or failed delivery caused by incorrect address, unavailable customer, or courier issues."
  ];

  const returnsDefaults = [
    "Zaloura follows a No Return, No COD, and Limited Exchange Policy.",
    "Prepaid Requirement: We do not accept returns once the product is delivered. Cash on Delivery is not available. All orders must be prepaid.",
    "Exchange Conditions: Exchange is possible only if the product received is damaged, defective, or incorrect; the customer provides a clear, unedited, and original unboxing video; the issue is reported within 24 hours of delivery; the product is unused, unwashed, and in its original condition; and tags, packaging, and invoice are available.",
    "Unboxing Verification: Exchange requests without a proper unboxing video will not be accepted. The unboxing video must clearly show the sealed package being opened, the product condition, and any issue found. Edited, paused, cut, or unclear videos will not be considered valid proof.",
    "Exchange Exclusions: Exchange will not be accepted for size issues, color variation due to lighting/screen difference, change of mind, wrong address, or personal preference."
  ];

  const internationalDefaults = [
    "Currently, Zaloura does not provide international delivery directly through the website.",
    "WhatsApp Support: If any customer requires international delivery, they can contact us through WhatsApp before placing the order. Our team will check the product, location, shipping availability, delivery time, and charges, then confirm whether international delivery is possible.",
    "Duties & Taxes: International shipping charges, customs duty, import taxes, or any additional charges from the destination country must be paid by the customer.",
    "Transit Timeline: International delivery time may vary depending on the country, customs clearance, and courier service availability."
  ];

  const qualityDefaults = [
    "At Zaloura, we make sure every product is checked before packing and dispatch.",
    "Rigorous Inspection: Before delivery, we inspect the product for quality, damage, stitching/finishing, product condition, correct item & quantity, and packing safety.",
    "Quality Commitment: We assure that only checked and approved products are packed and delivered to customers.",
    "Slight Variations: Slight color differences may occur due to lighting, photography, or screen display settings. These are not considered product defects.",
    "Our Promise: Our goal is to deliver good-quality products with proper checking and safe packaging."
  ];

  const parsePolicyToPoints = (dbText, defaultTextArray) => {
    const rawText = dbText || defaultTextArray.join('\n');
    const paragraphs = rawText
      .split(/\n+/)
      .map(p => p.trim())
      .filter(Boolean);

    return (
      <div className="space-y-4 mt-4">
        {paragraphs.map((p, index) => {
          const isBullet = p.startsWith('-') || p.startsWith('*') || p.startsWith('•') || /^\d+\./.test(p);
          const cleaned = p.replace(/^[-*•\d+\.]\s*/, '');
          const colonIndex = cleaned.indexOf(':');
          const hasColon = colonIndex > 0 && colonIndex < 35;

          if (isBullet || hasColon) {
            let title = '';
            let description = cleaned;

            if (hasColon) {
              title = cleaned.substring(0, colonIndex).trim();
              description = cleaned.substring(colonIndex + 1).trim();
            }

            return (
              <div key={index} className="flex items-start gap-3 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primaryContainer mt-2 shrink-0" />
                <span className="text-secondary/70 font-sans text-sm leading-relaxed">
                  {title ? (
                    <>
                      <strong className="text-primary font-serif font-semibold italic mr-1">{title}:</strong>
                      {description}
                    </>
                  ) : (
                    cleaned
                  )}
                </span>
              </div>
            );
          }

          return (
            <p key={index} className="text-secondary/80 font-sans text-sm leading-relaxed">
              {p}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-white"
    >
      {/* Hero Section */}
      <motion.div
        variants={fadeInUp}
        className="pt-8 md:pt-12 pb-12 bg-gray-50/50 border-b border-gray-100"
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1 }}
            className="text-[10px] uppercase font-bold text-gray-400 block mb-4"
          >
            Concierge Services
          </motion.span>
          <h1 className="text-5xl md:text-7xl font-serif text-primary tracking-tighter leading-tight italic">
            L'Expédition
          </h1>
          <p className="mt-8 text-secondary/60 font-serif italic text-xl max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about receiving your handcrafted Zaloura pieces.
          </p>
        </div>
      </motion.div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-16 py-16">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-24"
        >

          {/* Shipping Section */}
          <div className="space-y-12">
            <motion.div variants={itemSlideIn} className="flex items-start gap-8">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                className="w-16 h-16 bg-primaryContainer/5 text-primaryContainer rounded-3xl flex items-center justify-center shrink-0 shadow-sm"
              >
                <Truck size={32} />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-3xl font-serif text-primary mb-6 italic">Shipping Policy</h2>
                {parsePolicyToPoints(settings?.shippingPolicy, shippingDefaults)}
              </div>
            </motion.div>

            <motion.div variants={itemSlideIn} className="flex items-start gap-8">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                className="w-16 h-16 bg-primaryContainer/5 text-primaryContainer rounded-3xl flex items-center justify-center shrink-0 shadow-sm"
              >
                <Globe size={32} />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-2xl font-serif text-primary mb-4 italic">International Delivery</h2>
                {parsePolicyToPoints(settings?.internationalPolicy, internationalDefaults)}
              </div>
            </motion.div>
          </div>

          {/* Returns Section */}
          <div className="space-y-12">
            <motion.div variants={itemSlideIn} className="flex items-start gap-8">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                className="w-16 h-16 bg-primaryContainer/5 text-primaryContainer rounded-3xl flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw size={32} />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-3xl font-serif text-primary mb-6 italic">Returns & Exchanges</h2>
                {parsePolicyToPoints(settings?.returnsPolicy, returnsDefaults)}
              </div>
            </motion.div>

            <motion.div variants={itemSlideIn} className="flex items-start gap-8">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                className="w-16 h-16 bg-primaryContainer/5 text-primaryContainer rounded-3xl flex items-center justify-center shrink-0 shadow-sm"
              >
                <ShieldCheck size={32} />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-2xl font-serif text-primary mb-4 italic">Quality Assurance</h2>
                {parsePolicyToPoints(settings?.qualityPolicy, qualityDefaults)}
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
};

export default Shipping;

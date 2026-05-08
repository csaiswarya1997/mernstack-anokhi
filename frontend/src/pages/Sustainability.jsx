import React from 'react';
import artisanImg from '../assets/artisan-story.png';
import { motion } from 'framer-motion';

const Sustainability = () => {
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
        staggerChildren: 0.2
      }
    }
  };

  const imageReveal = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.33, 1, 0.68, 1] } }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-16 pt-8 md:pt-12 pb-24">
      {/* Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="max-w-3xl mx-auto text-center mb-20"
      >
        <motion.span 
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1 }}
          className="text-[10px] uppercase font-bold text-gray-400 block mb-4"
        >
          Our Commitment
        </motion.span>
        <h1 className="text-5xl md:text-6xl font-serif text-primary mb-6 italic">Sustainability &amp; Ethics</h1>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-[1px] bg-primary/20 mx-auto mb-6"
        ></motion.div>
        <p className="text-lg text-secondary/60 font-sans italic">
          Our commitment to the planet and the people who make our clothes.
        </p>
      </motion.div>

      {/* Artisan Image + Ethical Sourcing Content */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
      >
        <motion.div variants={imageReveal} className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1.5 }}
            src={artisanImg}
            alt="Artisan at work"
            className="w-full aspect-[4/5] object-cover"
          />
          <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-700" />
        </motion.div>
        
        <motion.div variants={fadeInUp} className="space-y-6">
          <h2 className="text-3xl font-serif text-primary mb-6 italic">Ethical Sourcing</h2>
          <p className="text-secondary/70 font-sans leading-relaxed">
            At Zaloura, we believe true luxury means knowing exactly where and how your garments are made. We partner exclusively with artisans and small-scale manufacturers who provide fair wages and safe working conditions.
          </p>
          <p className="text-secondary/70 font-sans leading-relaxed">
            By supporting traditional craft techniques, we help preserve cultural heritage while empowering local communities.
          </p>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-8 border-t border-gray-100 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-primary"
          >
            <div className="w-10 h-[1px] bg-primary"></div>
            Crafted with Intent
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Sustainability;

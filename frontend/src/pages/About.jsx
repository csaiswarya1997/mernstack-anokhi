import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import artisanImg from '../assets/artisan-story.png';

const About = () => {
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
    <div className="overflow-hidden bg-white">
      {/* Header Banner */}
      <section className="relative py-24 md:py-32 bg-accent/5 border-b border-primary/5">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1 }}
            className="text-[10px] uppercase font-bold text-primary/60 block mb-6"
          >
            Maison Zaloura
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif text-primary mb-8 italic"
          >
            Our Story &amp; Philosophy
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-[1px] bg-primary/20 mx-auto mb-8"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-secondary/70 font-sans italic max-w-2xl mx-auto leading-relaxed"
          >
            Bridging age-old Indian textile heritage with contemporary style. Handcrafted elegance for the modern woman.
          </motion.p>
        </div>
      </section>

      {/* Brand Identity / Story Section */}
      <section className="py-20 max-w-[1280px] mx-auto px-4 md:px-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          {/* Image */}
          <motion.div variants={imageReveal} className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl">
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1.5 }}
              src={artisanImg}
              alt="Handcrafted embroidery at Zaloura"
              className="w-full aspect-[4/5] object-cover"
            />
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-700" />
            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl max-w-xs border border-white/20">
              <p className="text-[9px] uppercase tracking-widest font-bold text-primary mb-1">Our Heritage</p>
              <p className="text-xs font-serif italic text-secondary">Every weave tells a story of generations of Indian craftsmanship.</p>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div variants={fadeInUp} className="space-y-8">
            <div className="space-y-4">
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-primary/60 block">Est. 2024</span>
              <h2 className="text-4xl font-serif text-primary italic leading-tight">The Genesis of Zaloura</h2>
            </div>
            <p className="text-secondary/70 font-sans leading-relaxed text-sm md:text-base">
              Founded in Kerala, Zaloura emerged from a simple yet profound vision: to restore the dignity of traditional Indian weave and embroidery by integrating it seamlessly into the wardrobe of the modern woman. We felt a deep need for fashion that is not just aesthetically brilliant, but also rich with culture, ethical foundation, and individuality.
            </p>
            <p className="text-secondary/70 font-sans leading-relaxed text-sm md:text-base">
              Every kurti, salwar, and bespoke garment we create represents a perfect dialogue between our designers and the local master artisans. We preserve delicate heritage arts by transforming them into premium, wearable designs that are modern, elegant, and timeless.
            </p>
            <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-8">
              <div>
                <h4 className="text-2xl font-serif text-primary italic">100%</h4>
                <p className="text-[9px] uppercase tracking-widest font-bold text-secondary/40 mt-1">Handcrafted</p>
              </div>
              <div>
                <h4 className="text-2xl font-serif text-primary italic">Ethical</h4>
                <p className="text-[9px] uppercase tracking-widest font-bold text-secondary/40 mt-1">Sourcing &amp; Wages</p>
              </div>
              <div>
                <h4 className="text-2xl font-serif text-primary italic">Kerala</h4>
                <p className="text-[9px] uppercase tracking-widest font-bold text-secondary/40 mt-1">Design Studio</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-accent/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="text-center mb-16">
            <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-primary/60 block mb-4">Our Foundations</span>
            <h2 className="text-4xl font-serif text-primary italic">The Pillars of Maison Zaloura</h2>
            <div className="w-20 h-[1px] bg-primary/20 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Value 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-10 rounded-[2rem] shadow-xl border border-primary/5 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-8 text-primary">
                <Sparkles size={20} />
              </div>
              <h3 className="font-serif text-xl text-primary mb-4 italic">Bespoke Atelier</h3>
              <p className="text-xs text-secondary/60 leading-relaxed font-sans">
                Our bespoke services are built on the belief that clothing should conform to your unique identity and silhouette. We offer customized pattern design, fabric curation, and tailoring to ensure a flawless, personalized experience.
              </p>
            </motion.div>

            {/* Value 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-10 rounded-[2rem] shadow-xl border border-primary/5 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-8 text-primary">
                <Heart size={20} />
              </div>
              <h3 className="font-serif text-xl text-primary mb-4 italic">Artisanal Dedication</h3>
              <p className="text-xs text-secondary/60 leading-relaxed font-sans">
                By hiring expert weavers and artisans, we support high craftsmanship and ensure slow, meticulous production. Every product is carefully audited before it reaches your hands, ensuring premium luxury standards.
              </p>
            </motion.div>

            {/* Value 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white p-10 rounded-[2rem] shadow-xl border border-primary/5 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-8 text-primary">
                <RefreshCw size={20} />
              </div>
              <h3 className="font-serif text-xl text-primary mb-4 italic">Sustainable Devotion</h3>
              <p className="text-xs text-secondary/60 leading-relaxed font-sans">
                We design with longevity in mind. By rejecting fast-fashion trend cycles, we create investment pieces made from organic fibers and responsibly sourced cottons and silks that age beautifully and last a lifetime.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-24 bg-secondary text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-accent/60 block mb-6">Designed For You</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 italic">Experience Zaloura Custom Atelier</h2>
          <p className="text-white/70 font-sans text-sm md:text-base max-w-xl mx-auto mb-12 leading-relaxed">
            Let us draft a dream outfit tailored specifically for you. Explore our custom bespoke service or shop our curated seasonal collections.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/bespoke"
              className="bg-primary text-white px-10 py-4 rounded-full font-sans uppercase tracking-widest text-[10px] font-bold hover:bg-accent hover:text-secondary transition-all shadow-2xl flex items-center gap-3"
            >
              Start Bespoke Request <ArrowRight size={14} />
            </Link>
            <Link
              to="/shop"
              className="bg-transparent border border-white/20 text-white px-10 py-4 rounded-full font-sans uppercase tracking-widest text-[10px] font-bold hover:bg-white hover:text-primary transition-all"
            >
              Explore Shop
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

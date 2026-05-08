import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Star, Quote, ChevronRight } from 'lucide-react';
import API_URL from '../config';

// Import images
import heroImg from '../assets/hero-main.png';
import kurtiImg from '../assets/category-kurti.png';
import salwarImg from '../assets/category-salwar.png';
import artisanImg from '../assets/artisan-story.png';

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef([]);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        const sorted = data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
        setLatestProducts(sorted);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestProducts();
  }, []);

  // Re-run observer whenever products finish loading so new DOM elements are picked up
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    // Small delay so React has painted the new nodes
    const timer = setTimeout(() => {
      const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
      revealElements.forEach(el => observer.observe(el));
    }, 100);

    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [latestProducts]);

  return (
    <div className="overflow-hidden">
      {/* Cinematic Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Zaloura Hero"
            className="w-full h-full object-cover scale-105 animate-[ken-burns_20s_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-16 w-full">
          <div className="max-w-2xl reveal-left">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/60 block mb-6">Maison Zaloura — Est. 2024</span>
            <h1 className="text-6xl md:text-8xl font-serif text-white mb-8 leading-[1.1] italic">
              L'Art de <br />
              <span className="text-champagne not-italic">Vivre Tradition</span>
            </h1>
            <p className="text-xl text-white/70 font-sans mb-12 max-w-lg leading-relaxed italic">
              Discover a curated collection where heritage craftsmanship meets contemporary elegance.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/shop" className="bg-white text-primary px-10 py-4 rounded-full font-sans uppercase tracking-widest text-[10px] font-bold hover:bg-champagne hover:-translate-y-1 transition-all shadow-2xl flex items-center gap-3">
                Explore Collection <ArrowRight size={14} />
              </Link>
              <Link to="/bespoke" className="bg-transparent border border-white/30 text-white px-10 py-4 rounded-full font-sans uppercase tracking-widest text-[10px] font-bold hover:bg-white hover:text-primary transition-all backdrop-blur-sm">
                Bespoke Atelier
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 reveal-up delay-1000">
          <span className="text-[8px] uppercase tracking-[0.4em] text-white/40 font-bold">Scroll to discover</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/40 to-transparent"></div>
        </div>
      </section>

      {/* Featured Collections / Categories */}
      <section className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="text-center mb-20 reveal-up">
            <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6 italic">Les Catégories</h2>
            <div className="w-24 h-[1px] bg-primary/20 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Kurtis */}
            <Link to="/category/Kurti" className="group relative overflow-hidden rounded-[2.5rem] aspect-[4/5] reveal-left">
              <img src={kurtiImg} alt="Kurtis" className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-12 left-12 right-12">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-bold block mb-2">Collection</span>
                <h3 className="text-4xl font-serif text-white mb-6 italic">Les Kurtis</h3>
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>

            {/* Salwars */}
            <Link to="/category/Salwar" className="group relative overflow-hidden rounded-[2.5rem] aspect-[4/5] reveal-right">
              <img src={salwarImg} alt="Salwars" className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-12 left-12 right-12">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-bold block mb-2">Collection</span>
                <h3 className="text-4xl font-serif text-white mb-6 italic">Les Salwars</h3>
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals with Slider feel */}
      <section className="pb-22 bg-secondaryContainer/30">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8 reveal-up">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-serif text-primary mb-4 italic">Nouvelles Arrivées</h2>
              <p className="text-secondary/60 font-sans italic">The latest treasures from our Jaipur atelier.</p>
            </div>
            <Link to="/shop" className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-primary hover:text-primaryContainer transition-colors">
              Discover All <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"><ArrowRight size={14} /></div>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="w-12 h-12 border-2 border-primaryContainer border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {latestProducts.map((product, idx) => (
                <div
                  key={product._id || product.id}
                  className="reveal-up"
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Philosophy / Story Section */}
      <section className="relative py-48 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={artisanImg} alt="Philosophy" className="w-full h-full object-cover parallax-bg brightness-[0.3]" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="max-w-3xl mx-auto text-center reveal-scale">
            <Quote className="text-champagne/40 w-16 h-16 mx-auto mb-12" />
            <h2 className="text-4xl md:text-6xl font-serif text-white mb-12 leading-tight italic">
              "Every thread tells a story of <span className="text-champagne">dedication</span>, every pattern a piece of <span className="text-champagne">history</span>."
            </h2>
            <p className="text-white/60 font-sans text-lg mb-16 leading-relaxed max-w-2xl mx-auto italic">
              We bridge the gap between ancient textile arts and the modern woman's lifestyle. Our pieces are not just garments; they are wearable art.
            </p>
            <Link to="/sustainability" className="inline-block border-b border-champagne text-champagne px-2 py-4 font-sans uppercase tracking-[0.4em] text-[10px] font-bold hover:text-white hover:border-white transition-all">
              Discover Our Philosophy
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges / Values */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="text-center reveal-up">
              <div className="w-16 h-16 bg-secondaryContainer/50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Star className="text-primaryContainer" size={24} />
              </div>
              <h4 className="font-serif text-xl text-primary mb-4 italic">Artisanal Quality</h4>
              <p className="text-xs text-secondary/50 font-sans leading-relaxed">Each piece is handcrafted by master artisans in Jaipur using traditional techniques.</p>
            </div>
            <div className="text-center reveal-up transition-delay-200">
              <div className="w-16 h-16 bg-secondaryContainer/50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Star className="text-primaryContainer" size={24} />
              </div>
              <h4 className="font-serif text-xl text-primary mb-4 italic">Ethical Sourcing</h4>
              <p className="text-xs text-secondary/50 font-sans leading-relaxed">We ensure fair wages and sustainable working conditions for all our partners.</p>
            </div>
            <div className="text-center reveal-up transition-delay-400">
              <div className="w-16 h-16 bg-secondaryContainer/50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Star className="text-primaryContainer" size={24} />
              </div>
              <h4 className="font-serif text-xl text-primary mb-4 italic">Timeless Design</h4>
              <p className="text-xs text-secondary/50 font-sans leading-relaxed">Collections designed to transcend seasons and remain relevant for years to come.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 bg-primary">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 text-center reveal-scale">
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-champagne/60 block mb-8">Le Journal de Zaloura</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-12 italic">Join the Inner Circle</h2>
          <p className="text-white/60 font-serif italic text-lg mb-16 max-w-xl mx-auto">
            Receive exclusive updates on new collections, private sales, and the stories behind our craft.
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/5 border border-white/20 rounded-full px-8 py-4 text-white outline-none focus:border-champagne transition-colors font-sans text-sm"
            />
            <button className="bg-champagne text-primary px-8 py-4 rounded-full font-sans uppercase tracking-widest text-[10px] font-bold hover:bg-white transition-all shadow-xl">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(-1%, -1%); }
        }
      `}} />
    </div>
  );
};

export default Home;

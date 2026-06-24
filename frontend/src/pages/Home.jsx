import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Star, Quote, ChevronRight } from 'lucide-react';
import API_URL from '../config';

// Import images
import heroImg from '../assets/hero-main-hd.png';
import kurtiImgHero from '../assets/hero-kurti-hd.png';
import coordImgHero from '../assets/hero-coord-hd.png';
import girlsImgHero from '../assets/hero-girls-hd.png';
import kurtiImg from '../assets/category-kurti.png';
import salwarImg from '../assets/category-salwar.png';
import artisanImg from '../assets/artisan-story.png';

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: heroImg,
      subtitle: "EST. 2024",
      titlePart1: "Zaloura",
      titlePart2: "Wear Elegance",
      description: "Discover a curated collection where heritage craftsmanship meets contemporary elegance.",
      ctaText: "Explore Collection",
      ctaLink: "/zaloura-ethnic-wear",
      position: "object-top"
    },
    {
      image: kurtiImgHero,
      subtitle: "HERITAGE COUTURE",
      titlePart1: "Artisanal",
      titlePart2: "Kurtis & Salwars",
      description: "Indulge in handpicked, premium kurtis and gorgeous traditional salwar ensembles.",
      ctaText: "Shop Collection",
      ctaLink: "/zaloura-ethnic-wear",
      position: "object-top"
    },
    {
      image: coordImgHero,
      subtitle: "MODERN ATELIER",
      titlePart1: "Premium",
      titlePart2: "Co-ord Sets",
      description: "Redefine comfort and style with our contemporary silk co-ord sets.",
      ctaText: "Explore Co-ords",
      ctaLink: "/zaloura-bespoke",
      position: "object-top"
    },
    {
      image: girlsImgHero,
      subtitle: "MAISON ZALOURA STORIES",
      titlePart1: "Celebrate",
      titlePart2: "Togetherness",
      description: "Designed for life's beautiful moments. Share the joy of handcrafted premium ethnic and fusion wear.",
      ctaText: "Explore Festive",
      ctaLink: "/zaloura-ethnic-wear",
      position: "object-[center_75%]"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

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
      const revealElements = document.querySelectorAll('[class*="reveal-"]');
      revealElements.forEach(el => observer.observe(el));
    }, 100);

    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [latestProducts]);

  return (
    <div className="overflow-hidden">
      {/* Cinematic Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-28 md:pt-32 pb-12">
        {/* Background Slider Stack */}
        <div className="absolute inset-0 z-0">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.image}
                alt={`Zaloura Hero Slide ${idx + 1}`}
                className={`w-full h-full object-cover ${slide.position} scale-105 ${
                  idx === currentSlide ? 'animate-[ken-burns_20s_infinite_alternate]' : ''
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/40 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Slide Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-16 w-full">
          <div className="max-w-2xl reveal-left active">

            <h1 className="text-6xl md:text-8xl font-serif text-white mb-8 leading-[1.1] italic transition-all duration-1000 ease-in-out">
              {slides[currentSlide].titlePart1} <br />
              <span className="text-primary not-italic">{slides[currentSlide].titlePart2}</span>
            </h1>
            <p className="text-xl text-white/70 font-sans mb-12 max-w-lg leading-relaxed italic transition-all duration-1000 ease-in-out">
              {slides[currentSlide].description}
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                to={slides[currentSlide].ctaLink}
                className="bg-white text-primary px-10 py-4 rounded-full font-sans uppercase tracking-widest text-[10px] font-bold hover:bg-champagne hover:-translate-y-1 transition-all shadow-2xl flex items-center gap-3 reveal-scale"
              >
                {slides[currentSlide].ctaText} <ArrowRight size={14} />
              </Link>
              <Link
                to="/zaloura-bespoke"
                className="bg-transparent border border-white/30 text-white px-10 py-4 rounded-full font-sans uppercase tracking-widest text-[10px] font-bold hover:bg-white hover:text-primary transition-all backdrop-blur-sm reveal-scale"
              >
                Bespoke Atelier
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Indicators / Navigation Dots */}
        <div className="absolute bottom-12 right-4 md:right-16 z-20 flex gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20 reveal-up delay-1000 active">
          <span className="text-[8px] uppercase tracking-[0.4em] text-white/40 font-bold">Scroll to discover</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/40 to-transparent"></div>
        </div>
      </section>

      {/* Brand Introduction Banner for Google SEO */}
      <section className="py-20 bg-accent/5 border-b border-primary/5 text-center">
        <div className="max-w-4xl mx-auto px-6 font-sans">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary/60 block mb-4 reveal-left-top">Welcome to Zaloura</span>
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6 italic reveal-left-top">
            Ethnic Fashion, Kurtis, Salwars & Bespoke Atelier
          </h2>
          <p className="text-secondary/70 leading-relaxed text-sm md:text-base max-w-2xl mx-auto mb-4 reveal-right">
            Zaloura is a Kerala-based ethnic fashion brand offering kurtis, salwars, bespoke outfits, and sustainable atelier collections.
          </p>
          <p className="text-secondary/60 leading-relaxed text-xs md:text-sm max-w-2xl mx-auto reveal-right">
            Shop elegant women’s wear from Zaloura, including handcrafted ethnic wear, custom tailoring, and occasion-ready styles.
          </p>
        </div>
      </section>

      {/* Featured Collections / Categories */}
      <section className="py-12 bg-accent/20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6 italic reveal-left-top">Les Catégories</h2>
            <div className="w-24 h-[1px] bg-primary/20 mx-auto reveal-left-top"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Link to="/zaloura-kurtis" className="group relative overflow-hidden rounded-[2.5rem] aspect-[4/5] reveal-left shadow-2xl">
              <img src={kurtiImg} alt="Kurtis" className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-12 left-12 right-12">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-bold block mb-2">Collection</span>
                <h3 className="text-4xl font-serif text-white mb-6 italic">Les Kurtis</h3>
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
 
            {/* Salwars */}
            <Link to="/zaloura-salwars" className="group relative overflow-hidden rounded-[2.5rem] aspect-[4/5] reveal-right shadow-2xl">
              <img src={salwarImg} alt="Salwars" className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
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
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-serif text-primary mb-4 italic reveal-left-top">Nouvelles Arrivées</h2>
              <p className="text-secondary/60 font-sans italic reveal-right">The latest treasures from our India atelier.</p>
            </div>
            <Link to="/zaloura-ethnic-wear" className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-primary hover:text-primary transition-colors reveal-scale">
              Discover All <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"><ArrowRight size={14} /></div>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {latestProducts.map((product, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={product._id || product.id}
                    className={isEven ? "reveal-left" : "reveal-right"}
                    style={{ transitionDelay: `${idx * 150}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Philosophy / Story Section */}
      <section className="relative py-48 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={artisanImg} alt="Philosophy" className="w-full h-full object-cover parallax-bg brightness-[0.5]" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="text-accent/40 w-16 h-16 mx-auto mb-12 reveal-scale" />
            <h2 className="text-4xl md:text-6xl font-serif text-white mb-12 leading-tight italic reveal-left-top">
              "Every thread tells a story of <span className="text-accent">dedication</span>, every pattern a piece of <span className="text-accent">history</span>."
            </h2>
            <p className="text-white/80 font-sans text-lg mb-12 leading-relaxed max-w-2xl mx-auto italic reveal-right">
              We bridge the gap between ancient textile arts and the modern woman's lifestyle. Our pieces are not just garments; they are wearable art.
            </p>
            <Link to="/zaloura-sustainability" className="inline-block border-b border-accent text-accent px-2 py-4 font-sans uppercase tracking-[0.4em] text-[10px] font-bold hover:text-white hover:border-white transition-all reveal-scale">
              Discover Our Philosophy
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges / Values */}
      <section className="py-12 bg-accent/20 border-b border-primary/5">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="text-center reveal-left">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Star className="text-primary" size={24} />
              </div>
              <h4 className="font-serif text-xl text-primary mb-4 italic">Artisanal Quality</h4>
              <p className="text-xs text-secondary/50 font-sans leading-relaxed">Each piece is handcrafted by master artisans in India using traditional techniques.</p>
            </div>
            <div className="text-center reveal-top delay-200">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Star className="text-primary" size={24} />
              </div>
              <h4 className="font-serif text-xl text-primary mb-4 italic">Ethical Sourcing</h4>
              <p className="text-xs text-secondary/50 font-sans leading-relaxed">We ensure fair wages and sustainable working conditions for all our partners.</p>
            </div>
            <div className="text-center reveal-right delay-500">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Star className="text-primary" size={24} />
              </div>
              <h4 className="font-serif text-xl text-primary mb-4 italic">Timeless Design</h4>
              <p className="text-xs text-secondary/50 font-sans leading-relaxed">Collections designed to transcend seasons and remain relevant for years to come.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-secondary border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-accent/60 block mb-8 reveal-left-top">Le Journal de Zaloura</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-12 italic reveal-left-top">Join the Inner Circle</h2>
          <p className="text-white/60 font-serif italic text-lg mb-12 max-w-xl mx-auto reveal-right">
            Receive exclusive updates on new collections, private sales, and the stories behind our craft.
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/5 border border-white/20 rounded-full px-8 py-4 text-white outline-none focus:border-accent transition-colors font-sans text-sm"
            />
            <button className="bg-primary text-white px-8 py-4 rounded-full font-sans uppercase tracking-widest text-[10px] font-bold hover:bg-accent hover:text-secondary transition-all shadow-xl reveal-scale">
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

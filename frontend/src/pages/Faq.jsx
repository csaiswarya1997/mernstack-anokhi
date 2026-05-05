import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I determine my size?",
      answer: "We provide a detailed size guide on each product page. Our fits are designed to be comfortable yet structured. If you are between sizes, we recommend sizing up for traditional wear. You can also contact us for bespoke measurements."
    },
    {
      question: "Can I customize a design?",
      answer: "Yes, we offer a Bespoke Customization service. You can request changes to necklines, sleeve lengths, or provide your specific measurements through our Bespoke portal."
    },
    {
      question: "What fabrics do you use?",
      answer: "We primarily work with high-quality natural fibers including handloom cotton, Chanderi silk, and organic linens. Our fabrics are sourced ethically from artisan clusters across India."
    },
    {
      question: "How should I care for my Anokhi garments?",
      answer: "Most of our handcrafted pieces require delicate care. We recommend dry cleaning for silks and hand-washing in cold water for cottons. Always air dry in shade to preserve the colors."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by location and are calculated at checkout."
    },
    {
      question: "What is your return policy for international orders?",
      answer: "Currently, we only accept returns and exchanges for domestic orders within India. International sales are final, but we ensure rigorous quality checks before dispatch."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="pt-8 md:pt-12 pb-16 bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 block mb-4">Support Center</span>
          <h1 className="text-5xl md:text-7xl font-serif text-primary tracking-tighter leading-tight italic">Questions & Réponses</h1>
          <p className="mt-8 text-secondary/60 font-serif italic text-xl max-w-2xl mx-auto leading-relaxed">
            Find answers to frequently asked questions about our collections and services.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-24">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-100 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/50"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-8 text-left bg-white transition-colors hover:bg-gray-50/50"
              >
                <span className="font-serif text-xl text-primary italic">{faq.question}</span>
                <div className={`p-2 rounded-full transition-all duration-300 ${openIndex === index ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                </div>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-8 pt-0 text-secondary/70 font-sans leading-relaxed border-t border-gray-50">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-primary rounded-[3rem] text-center text-white relative overflow-hidden">
          <HelpCircle className="absolute -top-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
          <h3 className="text-3xl font-serif mb-4 italic">Still have questions?</h3>
          <p className="text-white/60 text-sm mb-10 max-w-md mx-auto">
            Our concierge team is available to assist you with any specific inquiries you may have.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-white text-primary px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-champagne transition-colors"
          >
            Contact Concierge
          </a>
        </div>
      </div>
    </div>
  );
};

export default Faq;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const SpecialsPage = () => {
  const navigate = useNavigate();

  const featuredSpecials = [
    {
      id: 'aura-ritual',
      title: 'Aura Signature Ritual',
      price: 295,
      originalPrice: 380,
      duration: '180 min',
      description: 'The ultimate luxury experience. Combines our signature precision cut, exfoliating scalp therapy, custom glossing/blowout, and a mini illuminating gold facial.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjHFvOUoUFzcS9fm-il0JQPCA529pBB_3DI0qY_gtHtKGy-8P54l0Ij2n9cm_XfVbJtKWqRffeY0Gebziv7yabVA4sYAz60Afcf_jfe2euUjzXZycXbIrrBhZZotrOTfxM4F5psFcW1wp_ROehfPfemcY1A7KiiH5Gr5_kkhR7OMqSN5VwtVLCwnEvIttzOUzdb8z9OM02DuNnl8meiv58KhlablTAOIyu5AGEZAQ6C1tTtnA0x4BeWDe6hWoaJ2whOo0ui8vu0tM',
      tag: 'Bestseller'
    },
    {
      id: 'radiance-ritual',
      title: 'Radiance Glow Ritual',
      price: 220,
      originalPrice: 290,
      duration: '120 min',
      description: 'A curated skincare package. Includes the AURA Gold Facial with lymphatic drainage, paired with a custom botanical scalp detox treatment.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvGqJJhJfl3oryTxJ4NTGDQk_hGgPiWyaGdCmLT6swfrmx92XjM8cdjgQrcplCCMUlwENIzIcwShdQZMaQvEa7H1xrWYcxZD8Dm4Xaq4dnUTmAyv77JgTsoa_iNsSCE8NDTMqtN6N_4X4vtsOeGigRyXrbI4vNUGNuVUzWHhcIquAqIhRgotWXgMXq3lu49QfppNbVm70cxVe3EcUYctXnCPCgdwVZhrosYoCDNc7dIoqDtlz-agMh',
      tag: 'Limited Time'
    },
    {
      id: 'harmony-ritual',
      title: 'Harmony Stress Release',
      price: 195,
      originalPrice: 245,
      duration: '90 min',
      description: 'Find your inner peace. Deep tissue release massage paired with warm stones and essential oils to soothe persistent muscle tension.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZP8x5hbWIZPo53SXW-FV4ON4iRXdVRPpfnY7_pgN-UhrLKEpMAXkph1rJGNiRPmzeNflVLaOw2nAkqC1DUVhP03WXqOoIHngLTbhcY9VgjG-0w2TE82lc7TumpUgcLqII_LyeiRE9lH0yQzHXysvcNNl75x7EHm7eqyLXd2TCzFgECWhl36wNzpazjFSaBs67PhC13vC1hHPcdzzX5nae2xPzFyGYB7Sjfb7JYWBoYD9aU1G3mBs4',
      tag: 'Seasonal Special'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased pb-24">
      {/* Header */}
      <header className="bg-surface sticky top-0 z-50 w-full shadow-sm border-b border-outline-variant/30">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop h-20 flex items-center justify-between">
          <span 
            onClick={() => navigate('/')} 
            className="font-display-lg text-[24px] md:text-display-lg text-primary tracking-widest uppercase cursor-pointer"
          >
            AURA
          </span>
          <nav className="hidden md:flex items-center gap-8 font-label-lg">
            <span className="text-secondary hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/')}>Explore</span>
            <span className="text-primary border-b-2 border-primary pb-1 cursor-pointer">Specials</span>
            <span className="text-secondary hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/about')}>About</span>
          </nav>
          <div className="flex items-center gap-4">
            <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-lg hover:bg-primary-container transition-all" onClick={() => navigate('/search')}>Book Now</button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative py-16 md:py-24 px-margin-mobile md:px-margin-desktop bg-[#FDF2F0] text-center overflow-hidden border-b border-outline-variant/20">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="font-label-lg text-primary uppercase tracking-[0.2em] font-semibold">Bespoke Self-Care</span>
          <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface leading-tight">Curated Specials & Rituals</h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Experience our premium treatments through custom wellness rituals designed for ultimate restoration, offered at special pricing.
          </p>
        </div>
      </section>

      {/* Specials List */}
      <main className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredSpecials.map((ritual) => (
            <div 
              key={ritual.id} 
              className="bg-white rounded-xl overflow-hidden shadow-md border border-outline-variant/30 flex flex-col soft-glow-hover"
            >
              <div className="h-56 relative overflow-hidden bg-surface-container">
                <img src={ritual.image} alt={ritual.title} className="w-full h-full object-cover" />
                <span className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full font-label-md text-xs uppercase tracking-wider shadow-sm font-semibold">
                  {ritual.tag}
                </span>
                <span className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-md font-label-md text-xs font-semibold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {ritual.duration}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow space-y-4">
                <h3 className="font-headline-md text-2xl text-on-surface">{ritual.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant flex-grow line-clamp-4">
                  {ritual.description}
                </p>
                <div className="flex justify-between items-end pt-4 border-t border-outline-variant/20">
                  <div>
                    <span className="text-body-sm text-outline-variant line-through block">${ritual.originalPrice}</span>
                    <span className="font-headline-lg text-3xl text-primary font-bold">${ritual.price}</span>
                  </div>
                  <button 
                    onClick={() => navigate('/search')}
                    className="bg-primary-container text-white px-5 py-2.5 rounded-lg font-label-lg text-sm uppercase tracking-wider hover:bg-primary transition-colors flex items-center gap-1.5"
                  >
                    Book Ritual
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promotion Callout */}
        <div className="bg-surface-container-low p-8 md:p-12 rounded-2xl border border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="font-headline-md text-2xl text-on-surface">Looking for a personalized gift?</h3>
            <p className="font-body-md text-on-surface-variant">
              Treat your loved ones to an Aura gift card. Fully customizable with personalized messages, redeemable at any of our partner salons.
            </p>
          </div>
          <button className="w-full md:w-auto bg-primary text-on-primary px-8 py-3.5 rounded-lg font-label-lg text-label-lg uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap shadow-md">
            Purchase Gift Card
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary-container dark:bg-surface-container full-width border-t border-outline-variant/20">
        <div className="max-w-[1200px] mx-auto px-margin-desktop py-8 text-center text-body-sm text-secondary">
          <p>© 2024 AURA Wellness & Beauty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SpecialsPage;

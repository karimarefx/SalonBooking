import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, searchLocation, setSearchLocation, clientInfo } = useBooking();
  
  // Local state initialized from context
  const [queryInput, setQueryInput] = useState(searchQuery || '');
  const [locationInput, setLocationInput] = useState(searchLocation || '');
  const [mobileQueryInput, setMobileQueryInput] = useState(searchQuery || '');

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(queryInput);
    setSearchLocation(locationInput);
    navigate(`/search?query=${encodeURIComponent(queryInput)}&location=${encodeURIComponent(locationInput)}`);
  };

  const handleMobileSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(mobileQueryInput);
    setSearchLocation(searchLocation || 'New York');
    navigate(`/search?query=${encodeURIComponent(mobileQueryInput)}&location=${encodeURIComponent(searchLocation || 'New York')}`);
  };

  return (
    <div className="min-h-screen bg-background text-on-background pb-[80px] md:pb-0">
      {/* Top Navigation Bar */}
      <header className="bg-surface dark:bg-surface-container-lowest sticky top-0 z-50 w-full shadow-sm border-b border-outline-variant/30">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Desktop Brand */}
            <a 
              className="hidden md:block font-display-lg text-display-lg text-primary dark:text-primary-fixed-dim tracking-tight" 
              href="#"
            >
              AURA
            </a>
            {/* Mobile Brand */}
            <a 
              className="md:hidden font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight" 
              href="#"
            >
              AURA
            </a>
            
            {/* Desktop Menu links (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center gap-6 font-body-md text-body-md">
              <button className="text-primary font-semibold border-b-2 border-primary pb-1 hover:text-primary-container transition-colors duration-300" onClick={() => navigate('/')}>Explore</button>
              <button className="text-secondary font-medium hover:text-primary-container transition-colors duration-300" onClick={() => navigate('/specials')}>Specials</button>
              <button className="text-secondary font-medium hover:text-primary-container transition-colors duration-300" onClick={() => navigate('/about')}>About</button>
            </nav>
          </div>

          {/* Desktop Right Actions & Buttons */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 font-body-md">
              {clientInfo?.email ? (
                <button className="text-primary font-semibold hover:text-primary-container transition-colors duration-300" onClick={() => navigate('/owner/dashboard')}>Owner Dashboard</button>
              ) : (
                <button className="text-primary font-medium hover:text-primary-container transition-colors duration-300" onClick={() => navigate('/owner/portal')}>List Your Salon</button>
              )}
              {clientInfo?.email ? (
                <button className="text-secondary font-medium hover:text-primary-container transition-colors duration-300" onClick={() => navigate('/account/bookings')}>{clientInfo.name || 'Account'}</button>
              ) : (
                <button className="text-secondary font-medium hover:text-primary-container transition-colors duration-300" onClick={() => navigate('/login')}>Sign In</button>
              )}
            </div>
            
            {/* Icons visible on both Desktop and Mobile */}
            <div className="flex items-center gap-3">
              <button aria-label="calendar_today" onClick={() => navigate(clientInfo?.email ? '/account/bookings' : '/login')} className="text-secondary hover:text-primary-container active:scale-95 transition-transform duration-200 focus:outline-none">
                <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_today</span>
              </button>
              <button aria-label="account_circle" onClick={() => navigate(clientInfo?.email ? '/account/bookings' : '/login')} className="text-secondary hover:text-primary-container active:scale-95 transition-transform duration-200 focus:outline-none">
                <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 0" }}>account_circle</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        {/* DESKTOP LAYOUT (md:above) */}
        <div className="hidden md:block">
          {/* Desktop Hero Section */}
          <section className="relative pt-24 pb-32 px-margin-desktop overflow-hidden">
            <div className="max-w-[1200px] mx-auto grid grid-cols-12 gap-gutter items-center">
              <div className="col-span-6 z-10 space-y-8">
                <h1 className="font-display-lg text-display-lg text-on-surface leading-[56px]">Your Beauty,<br />Reimagined.</h1>
                <p className="font-body-lg text-body-lg text-secondary max-w-md">Discover and book premium salon and spa services effortlessly. Curated elegance for your self-care journey.</p>
                <form onSubmit={handleSearchSubmit} className="bg-surface-container-lowest p-4 rounded-xl soft-glow-shadow flex gap-4 max-w-xl border border-outline-variant/10">
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-tertiary">search</span>
                    <input 
                      className="w-full pl-12 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition-colors" 
                      placeholder="Service (e.g. Balayage)" 
                      type="text"
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-tertiary">location_on</span>
                    <input 
                      className="w-full pl-12 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition-colors" 
                      placeholder="Location" 
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="bg-primary-container hover:bg-primary text-on-primary px-8 py-3 rounded-lg font-label-lg text-label-lg transition-colors h-12 flex items-center justify-center min-w-[120px]">
                    Search
                  </button>
                </form>
              </div>
              <div className="col-span-6 relative rounded-2xl overflow-hidden h-[600px] soft-glow-shadow">
                <img 
                  alt="High-end modern salon interior" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1EHAFF58rXVX5UmTyUaDJBdTA4yZqryBapAMev7JB8MFxQuqyT70AaLX6eVrCwVkPoXnm_sw7E33n5GjSlUwNpRSkvh-XqIMy4gkG-fJPYz5YdPrNvvZn_hWT0KXHb3nCCknEA_04OjFcUDrM26dHemlTWKBYZcjMIlyf093pxXh9O6Xi2wZ1JVT8SAhTWyXtFw6n-gEIMJYHGpawXVefQwIrGzIj_EElc5FEXReXawsG0hXwfAU8Are2duYGN5WXjFfKqyqM80A"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/20 to-transparent"></div>
              </div>
            </div>
          </section>

          {/* Desktop Featured Salons */}
          <section className="py-stack-lg bg-[#FDF2F0] px-margin-desktop">
            <div className="max-w-[1200px] mx-auto">
              <div className="flex justify-between items-end mb-stack-md">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Curated Experiences</h2>
                  <p className="font-body-md text-body-md text-secondary">Discover our most celebrated partner salons.</p>
                </div>
                <a className="flex items-center gap-2 text-primary hover:text-primary-container font-label-lg transition-colors" href="#">
                  View All <span className="material-symbols-outlined text-[18px] block">arrow_forward</span>
                </a>
              </div>
              <div className="grid grid-cols-3 gap-gutter">
                {/* Salon Card 1 */}
                <div 
                  onClick={() => navigate('/salon/maison-de-beaute')}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden soft-glow-shadow-hover flex flex-col cursor-pointer border border-outline-variant/30"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      alt="Minimalist salon detail" 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVSB8Ghcx2_iQPCnwdBPhqRVs1HLBrA3i7r7yCVcDlET_xrzwriQdiER_-F4965huo4jdH8RXv9Jp1fvRxpY-obBW2d5VNVtbWNdUgQ432sCb4EiadNi4Cs83hGJ5yQmcJjIGMIbMkN14uu1ZzZLq0AGZPL13Eb_DQTDVjVHubKyNVYy-8fSIQiiwMzngwH7sCGFgw5lS1rRe3LZMIcovkpnkigkX2arLKqXyezec78DVWRZLJJGXaAtCi9EeyqKL08_8iNHRDRb4"
                    />
                    <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary-container block" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">4.9</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Maison de Beauté</h3>
                    <div className="flex items-center gap-1 text-secondary mb-4 font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[16px] block">location_on</span>
                      <span>Beverly Hills, CA</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-[#FDF2F0] text-on-secondary-fixed-variant rounded-full font-label-md text-label-md">Hair</span>
                      <span className="px-3 py-1 bg-[#FDF2F0] text-on-secondary-fixed-variant rounded-full font-label-md text-label-md">Color</span>
                    </div>
                    <button className="mt-auto w-full py-3 border border-outline text-on-surface hover:border-primary-container hover:text-primary-container rounded-lg font-label-lg text-label-lg transition-colors">
                      View Salon
                    </button>
                  </div>
                </div>

                {/* Salon Card 2 */}
                <div 
                  onClick={() => navigate('/salon/aura-studio')}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden soft-glow-shadow-hover flex flex-col cursor-pointer border border-outline-variant/30"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      alt="Spa treatment room" 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7iQdyViHL-DS2hBkYJuEfKIwsLWS7l4Z_8IR9JTSBcGlU2IG_0pifzMS_E1Hb4SRkeU74LM4zVkq7OyrTP42IbxLFVYpbczz-cfXRxNs5mepMwrCfa9axva5zhzBsM8lsBNS_dGEpI1v8Ie1puUxwD4QbPNiQlwb5bgEPBJ8yES5Yc91gz3VkuI10FAN8vCKg1MTRno9YILHtdhq4ySaJw_kL0kVEfIONQyoqdrV-_r94UuA6CMrXj5MYfh5rdA9K_vZkqt7l-7Y"
                    />
                    <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary-container block" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">4.8</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Lumina Spa</h3>
                    <div className="flex items-center gap-1 text-secondary mb-4 font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[16px] block">location_on</span>
                      <span>West Hollywood, CA</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-[#FDF2F0] text-on-secondary-fixed-variant rounded-full font-label-md text-label-md">Facials</span>
                      <span className="px-3 py-1 bg-[#FDF2F0] text-on-secondary-fixed-variant rounded-full font-label-md text-label-md">Massage</span>
                    </div>
                    <button className="mt-auto w-full py-3 border border-outline text-on-surface hover:border-primary-container hover:text-primary-container rounded-lg font-label-lg text-label-lg transition-colors">
                      View Salon
                    </button>
                  </div>
                </div>

                {/* Salon Card 3 */}
                <div 
                  onClick={() => navigate('/salon/maison-de-beaute')}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden soft-glow-shadow-hover flex flex-col cursor-pointer border border-outline-variant/30"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      alt="Nail salon detail" 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGFFlb1w2fUT84br9tkl-z4gnpGheEw6Yvvc0X-ugz9COgAFmPhYM3J5GMGBg4eeNYfiecz8dhH_oDhpx8So-U_cEGPjT1Cllk0tSn8pgrdSeuBlGYuCFvBWGb0rb9xtwJL28MLegsvzAmy6AkCnLUgoA_H9g8IWku7iJI0cQb-ZD4-4Ue3pd8JAokftBHFnKYLGM-W6bryAafkeq2REZx7Vw9T5dS4hxc56DXa9WmNyQvWkQPTRq_KJn8oJFEG4o8BotuNsO-gQc"
                    />
                    <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary-container block" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">5.0</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">The Polished Pearl</h3>
                    <div className="flex items-center gap-1 text-secondary mb-4 font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[16px] block">location_on</span>
                      <span>Santa Monica, CA</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-[#FDF2F0] text-on-secondary-fixed-variant rounded-full font-label-md text-label-md">Nails</span>
                    </div>
                    <button className="mt-auto w-full py-3 border border-outline text-on-surface hover:border-primary-container hover:text-primary-container rounded-lg font-label-lg text-label-lg transition-colors">
                      View Salon
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Desktop Call to Action */}
          <section className="py-stack-lg px-margin-desktop">
            <div className="max-w-[1000px] mx-auto bg-surface-container-lowest rounded-2xl overflow-hidden soft-glow-shadow border border-outline-variant/30">
              <div className="grid grid-cols-2">
                <div className="p-12 flex flex-col justify-center">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Elevate Your Business</h2>
                  <p className="font-body-md text-body-md text-secondary mb-8">Join the AURA network and connect with discerning clients seeking premium beauty and wellness experiences. Manage bookings effortlessly.</p>
                  <button 
                    onClick={() => navigate(clientInfo?.email ? '/owner/dashboard' : '/owner/portal')}
                    className="bg-primary-container hover:bg-primary text-on-primary px-8 py-3 rounded-lg font-label-lg text-label-lg transition-colors w-fit h-12 flex items-center justify-center"
                  >
                    List Your Salon
                  </button>
                </div>
                <div className="relative min-h-[350px]">
                  <img 
                    alt="Salon owner working" 
                    className="absolute inset-0 w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB34be63Ac-txjP5B_Q1tpJ-S7NkdWQg92r-QQ014IWNTKoHLusqeauXrx7rK9IKqhh9xpa35uRquuF2sDsfKkUQNVKg0kfRqwBjypHclrp_HSLj11lvqi6QnM4DcNr8V7rP_5k5y3-sY2wzqnb_a4TDh6BnABa_HaZSBrJBfvBhFW5bmAsORPXjD1eU1bg5BQ18xA0XBjGUgBPSZWLdU4VqQVGXyAzbQ-9nFgDRpkCQyghHDQXNOZeOjD5yQ7QEQ5aEJYxbtnBi88"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* MOBILE LAYOUT (md:below) */}
        <div className="md:hidden block">
          {/* Mobile Hero Section */}
          <section className="px-margin-mobile pt-stack-md pb-stack-sm text-center">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">Elevate Your Wellness</h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant mb-6 px-4">Book premium salons and spas seamlessly.</p>
            {/* Mobile Search Bar */}
            <form onSubmit={handleMobileSearchSubmit} className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">search</span>
              </div>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-full py-3 pl-12 pr-4 text-body-md text-on-surface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary-container focus:border-primary-container shadow-sm transition-all" 
                placeholder="Search treatments, salons, or areas..." 
                type="text"
                value={mobileQueryInput}
                onChange={(e) => setMobileQueryInput(e.target.value)}
              />
              <button type="submit" className="absolute inset-y-1 right-1 bg-primary-container text-on-primary rounded-full px-4 font-label-md hover:bg-primary transition-colors">
                Find
              </button>
            </form>
          </section>

          {/* Mobile Category Chips (Horizontal Scroll) */}
          <section className="pl-margin-mobile py-stack-sm overflow-x-auto no-scrollbar">
            <div className="flex gap-3 pr-margin-mobile w-max">
              <button className="bg-primary-container text-on-primary font-label-md px-5 py-2 rounded-full whitespace-nowrap shadow-sm">All</button>
              <button className="bg-secondary-container text-on-secondary-container font-label-md px-5 py-2 rounded-full whitespace-nowrap hover:bg-secondary-fixed transition-colors">Massage</button>
              <button className="bg-secondary-container text-on-secondary-container font-label-md px-5 py-2 rounded-full whitespace-nowrap hover:bg-secondary-fixed transition-colors">Facials</button>
              <button className="bg-secondary-container text-on-secondary-container font-label-md px-5 py-2 rounded-full whitespace-nowrap hover:bg-secondary-fixed transition-colors">Hair Styling</button>
              <button className="bg-secondary-container text-on-secondary-container font-label-md px-5 py-2 rounded-full whitespace-nowrap hover:bg-secondary-fixed transition-colors">Nails</button>
            </div>
          </section>

          {/* Mobile Featured Destinations */}
          <section className="px-margin-mobile py-stack-md">
            <div className="flex justify-between items-end mb-6">
              <h2 className="font-headline-md text-headline-md text-on-background">Featured Destinations</h2>
              <a className="font-label-md text-primary-container hover:text-primary" href="#">View All</a>
            </div>
             <div className="flex flex-col gap-6">
              {/* Salon Card 1 */}
              <article 
                onClick={() => navigate('/salon/aura-studio')}
                className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:soft-glow transition-shadow duration-300 border border-outline-variant/20 cursor-pointer"
              >
                <div className="h-48 w-full bg-surface-variant relative">
                  <img 
                    alt="Luxury Spa Interior" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHiMyHd6bibgPvnMzq-lOhXKT9c2CGGm7A1hHhstgvha4D2_bgPa357FAeB7khske8ZpPREHR0uPduCAHbC6ZqacxuKYSznXFwSMS9pVwgc1i2N-2N47Wfn3s4JJ1-bjr6ft0n18M0zEE2_-10ymYVGSATyHiVJS8WhVzMavLnFjyWhoSzZhK7VHu2hbl9WmBCjmPzDMDrIWx-vdoogT5wGTh9gugFnOwDBGmvxZZ4dh5jFYG_RD0oGMzz6p-RfSTPkClqSGFSXyE"
                  />
                  <button className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full p-2 text-on-surface hover:text-primary-container transition-colors" onClick={(e) => e.stopPropagation()}>
                    <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-headline-md text-headline-lg-mobile text-on-background">Lumina Aesthetics</h3>
                    <div className="flex items-center text-primary-container">
                      <span className="material-symbols-outlined text-[18px] block" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-label-md text-on-surface ml-1">4.9</span>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-outline block">location_on</span>
                    Downtown District • 1.2 mi
                  </p>
                  <div className="flex gap-2">
                    <span className="bg-surface-container text-on-surface-variant font-label-md px-2 py-1 rounded">Skincare</span>
                    <span className="bg-surface-container text-on-surface-variant font-label-md px-2 py-1 rounded">$$$</span>
                  </div>
                </div>
              </article>

              {/* Salon Card 2 */}
              <article 
                onClick={() => navigate('/salon/maison-de-beaute')}
                className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:soft-glow transition-shadow duration-300 border border-outline-variant/20 cursor-pointer"
              >
                <div className="h-48 w-full bg-surface-variant relative">
                  <img 
                    alt="Modern Hair Salon" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8wbr5YQEZuSarMXodIfYUS6Diyi3j2IBcKVWWNfdbEuQKDXqnc-gcfxjOJh8rq1r2ya-KIVOvvl1oSMhV5XmkMOaLlGfCVjfaGGR9SRXxUNL4iPydux71XxbowRQuL2mYl9f6DHuhw4VTj6QVEvKjZ19axU41dYtY_CeLQL1U-wfznLjBoAEElMoeF1q0CF8gLZ_E4ECk-ke4J8LxLVlFSdsm4tHdZ6JwMW33z-N-f9JTaZRsVBc3bAZBqIWmxpqarEe5WBQXm5Y"
                  />
                  <button className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full p-2 text-on-surface hover:text-primary-container transition-colors" onClick={(e) => e.stopPropagation()}>
                    <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-headline-md text-headline-lg-mobile text-on-background">Atelier Hair Studio</h3>
                    <div className="flex items-center text-primary-container">
                      <span className="material-symbols-outlined text-[18px] block" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-label-md text-on-surface ml-1">4.8</span>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-outline block">location_on</span>
                    Westside Village • 3.5 mi
                  </p>
                  <div className="flex gap-2">
                    <span className="bg-surface-container text-on-surface-variant font-label-md px-2 py-1 rounded">Hair</span>
                    <span className="bg-surface-container text-on-surface-variant font-label-md px-2 py-1 rounded">$$</span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* Mobile CTA Section */}
          <section className="px-margin-mobile py-stack-lg text-center bg-surface-container-low border-y border-outline-variant/20">
            <h3 className="font-headline-md text-headline-md text-on-background mb-2">Own a Premium Salon?</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 max-w-sm mx-auto">Join our curated network of top-tier wellness professionals and elevate your business.</p>
            <button 
              onClick={() => navigate(clientInfo?.email ? '/owner/dashboard' : '/owner/portal')}
              className="w-full bg-primary-container text-on-primary rounded-lg px-8 py-3 h-[48px] font-label-lg hover:bg-primary transition-colors duration-300 shadow-sm active:scale-95"
            >
              List Your Salon
            </button>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      {/* Desktop Footer */}
      <footer className="hidden md:block bg-secondary-container dark:bg-surface-container full-width bottom-0 border-t border-outline-variant/20 flat no shadows">
        <div className="max-w-[1200px] mx-auto px-margin-desktop py-stack-lg flex justify-between items-start gap-gutter">
          <div className="flex flex-col gap-4 max-w-sm">
            <span className="font-display-lg-mobile text-display-lg-mobile text-primary dark:text-primary-fixed-dim">AURA</span>
            <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant">Curating modern elegance for your beauty journey.</p>
            <div className="flex gap-4 mt-2">
              <a className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container rounded-full p-1" href="#">
                <span className="material-symbols-outlined text-[20px] block">photo_camera</span>
              </a>
              <a className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container rounded-full p-1" href="#">
                <span className="material-symbols-outlined text-[20px] block">alternate_email</span>
              </a>
            </div>
          </div>
          <div className="flex gap-16 font-body-sm text-body-sm">
            <div className="flex flex-col gap-3">
              <span className="text-on-secondary-container font-bold mb-1">Company</span>
              <a className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container w-fit" href="#">Contact Us</a>
              <a className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container w-fit" href="#">Salon Partnerships</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-on-secondary-container font-bold mb-1">Legal</span>
              <a className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container w-fit" href="#">Privacy Policy</a>
              <a className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container w-fit" href="#">Terms of Service</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-on-secondary-container font-bold mb-1">Stay Connected</span>
              <a className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container w-fit" href="#">Newsletter</a>
            </div>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-margin-desktop pb-stack-md">
          <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-70">© 2024 AURA Wellness. Designed for modern elegance.</p>
        </div>
      </footer>

      {/* Mobile Footer */}
      <footer className="md:hidden block bg-secondary-container full-width bottom-0 border-t border-outline-variant/20 pb-20">
        <div className="max-w-[1200px] mx-auto px-margin-mobile py-stack-lg flex flex-col gap-gutter">
          <div>
            <div className="font-display-lg-mobile text-display-lg-mobile text-primary mb-4">AURA</div>
            <p className="font-body-sm text-body-sm text-on-secondary-container max-w-xs">
              © 2024 AURA Wellness. Designed for modern elegance.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <a className="font-body-sm text-body-sm text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container" href="#">Contact Us</a>
            <a className="font-body-sm text-body-sm text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container" href="#">Salon Partnerships</a>
            <a className="font-body-sm text-body-sm text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container" href="#">Privacy Policy</a>
            <a className="font-body-sm text-body-sm text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container" href="#">Terms of Service</a>
            <a className="font-body-sm text-body-sm text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container" href="#">Newsletter</a>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Visible below 768px only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-surface-container-lowest border-t border-outline-variant/20 z-50 px-6 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <ul className="flex justify-between items-center">
          {/* Active: Explore */}
          <li className="flex-1 flex flex-col items-center justify-center text-primary cursor-pointer">
            <span className="material-symbols-outlined text-[24px] mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
            <span className="font-label-md text-[10px] font-semibold">Explore</span>
          </li>
          {/* Inactive: Specials */}
          <li className="flex-1 flex flex-col items-center justify-center text-secondary hover:text-primary-container transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[24px] mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>local_offer</span>
            <span className="font-label-md text-[10px]">Specials</span>
          </li>
          {/* Inactive: Bookings */}
          <li className="flex-1 flex flex-col items-center justify-center text-secondary hover:text-primary-container transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[24px] mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_today</span>
            <span className="font-label-md text-[10px]">Bookings</span>
          </li>
          {/* Inactive: Profile */}
          <li className="flex-1 flex flex-col items-center justify-center text-secondary hover:text-primary-container transition-colors cursor-pointer" onClick={() => navigate('/login')}>
            <span className="material-symbols-outlined text-[24px] mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>account_circle</span>
            <span className="font-label-md text-[10px]">Profile</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default LandingPage;

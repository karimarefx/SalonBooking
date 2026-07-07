import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { haversineDistance } from '../utils/locationUtils';

const LandingPage = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, searchLocation, setSearchLocation, fetchSalons } = useBooking();
  const { isAuthenticated } = useAuth();
  
  // Geolocation
  const { lat: userLat, lng: userLng, permissionState } = useGeolocation();
  const isLocationAvailable = userLat !== null && userLng !== null;

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local state initialized from context
  const [queryInput, setQueryInput] = useState(searchQuery || '');
  const [locationInput, setLocationInput] = useState(searchLocation || '');
  const [mobileQueryInput, setMobileQueryInput] = useState(searchQuery || '');

  useEffect(() => {
    const getSalons = async () => {
      try {
        const data = await fetchSalons();
        setSalons(data || []);
      } catch (err) {
        console.error('Error fetching salons on landing page:', err);
      } finally {
        setLoading(false);
      }
    };
    getSalons();
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(queryInput);
    setSearchLocation(locationInput);
    navigate(`/search?query=${encodeURIComponent(queryInput)}&location=${encodeURIComponent(locationInput)}`);
  };

  const handleMobileSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(mobileQueryInput);
    setSearchLocation(searchLocation || 'Cairo');
    navigate(`/search?query=${encodeURIComponent(mobileQueryInput)}&location=${encodeURIComponent(searchLocation || 'Cairo')}`);
  };

  // Process salons to sort by proximity if available, otherwise by rating
  const salonsWithDistance = salons.map((s) => {
    if (isLocationAvailable && s.latitude !== null && s.longitude !== null) {
      const distance = haversineDistance(
        parseFloat(userLat),
        parseFloat(userLng),
        parseFloat(s.latitude),
        parseFloat(s.longitude)
      );
      return { ...s, distance };
    }
    return { ...s, distance: null };
  });

  const displaySalons = [...salonsWithDistance]
    .sort((a, b) => {
      if (isLocationAvailable) {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      }
      return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
    })
    .slice(0, 3);

  return (
    <div className="bg-background text-on-background">
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
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                    {isLocationAvailable ? 'Salons Near You' : 'Curated Experiences'}
                  </h2>
                  <p className="font-body-md text-body-md text-secondary">
                    {isLocationAvailable 
                      ? 'Discover premium wellness experiences just a short distance away.' 
                      : 'Discover our most celebrated partner salons.'}
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/search')}
                  className="flex items-center gap-2 text-primary hover:text-primary-container font-label-lg transition-colors cursor-pointer"
                >
                  View All <span className="material-symbols-outlined text-[18px] block">arrow_forward</span>
                </button>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <span className="text-secondary">Loading premium experiences...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                  {displaySalons.map((s) => (
                    <div 
                      key={s.id}
                      onClick={() => navigate(`/salon/${s.id}`)}
                      className="bg-surface-container-lowest rounded-xl overflow-hidden soft-glow-shadow-hover flex flex-col cursor-pointer border border-outline-variant/30 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(197,160,89,0.15)] group"
                    >
                      <div className="h-48 relative overflow-hidden">
                        <img 
                          alt={s.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          src={s.image_url}
                        />
                        <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-[16px] text-primary block" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="font-label-md text-label-md text-on-surface font-semibold">{s.rating}</span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-semibold group-hover:text-primary transition-colors">{s.name}</h3>
                        <div className="flex items-center gap-1 text-secondary mb-4 font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-[16px] block">location_on</span>
                          <span>{s.location}</span>
                          {s.distance !== null && (
                            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary font-semibold rounded text-xs">
                              {s.distance.toFixed(1)} km away
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {s.tags && s.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="px-3 py-1 bg-secondary-container text-on-secondary-fixed-variant rounded-full font-label-md text-label-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button className="mt-auto w-full py-3 bg-primary-container text-on-primary hover:bg-primary rounded-lg font-label-lg text-label-lg transition-colors font-semibold">
                          View Salon
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Desktop Call to Action */}
          <section className="py-stack-lg px-margin-desktop">
            <div className="max-w-[1000px] mx-auto bg-surface-container-lowest rounded-2xl overflow-hidden soft-glow-shadow border border-outline-variant/30">
              <div className="grid grid-cols-2">
                <div className="p-12 flex flex-col justify-center">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Elevate Your Business</h2>
                  <p className="font-body-md text-body-md text-secondary mb-8">Join the Miraia network and connect with discerning clients seeking premium beauty and wellness experiences. Manage bookings effortlessly.</p>
                  <button 
                    onClick={() => navigate(isAuthenticated ? '/owner/dashboard' : '/owner/portal')}
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
              <h2 className="font-headline-md text-headline-md text-on-background">
                {isLocationAvailable ? 'Featured Nearby' : 'Featured Destinations'}
              </h2>
              <button 
                onClick={() => navigate('/search')}
                className="font-label-md text-primary-container hover:text-primary cursor-pointer"
              >
                View All
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <span className="text-secondary text-sm">Loading premium experiences...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {displaySalons.map((s) => (
                  <article 
                    key={s.id}
                    onClick={() => navigate(`/salon/${s.id}`)}
                    className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:soft-glow transition-shadow duration-300 border border-outline-variant/20 cursor-pointer"
                  >
                    <div className="h-48 w-full bg-surface-variant relative">
                      <img 
                        alt={s.name} 
                        className="w-full h-full object-cover" 
                        src={s.image_url}
                      />
                      <button className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full p-2 text-on-surface hover:text-primary-container transition-colors" onClick={(e) => e.stopPropagation()}>
                        <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-headline-md text-headline-lg-mobile text-on-background font-semibold">{s.name}</h3>
                        <div className="flex items-center text-primary">
                          <span className="material-symbols-outlined text-[18px] block" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="font-label-md text-on-surface ml-1 font-semibold">{s.rating}</span>
                        </div>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-outline block">location_on</span>
                        <span>{s.location}</span>
                        {s.distance !== null && (
                          <span className="ml-1 text-primary font-semibold">
                            • {s.distance.toFixed(1)} km away
                          </span>
                        )}
                      </p>
                      <div className="flex gap-2">
                        {s.tags && s.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="bg-surface-container text-on-surface-variant font-label-md px-2.5 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Mobile CTA Section */}
          <section className="px-margin-mobile py-stack-lg text-center bg-surface-container-low border-y border-outline-variant/20">
            <h3 className="font-headline-md text-headline-md text-on-background mb-2">Own a Premium Salon?</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 max-w-sm mx-auto">Join our curated network of top-tier wellness professionals and elevate your business.</p>
            <button 
              onClick={() => navigate(isAuthenticated ? '/owner/dashboard' : '/owner/portal')}
              className="w-full bg-primary-container text-on-primary rounded-lg px-8 py-3 h-[48px] font-label-lg hover:bg-primary transition-colors duration-300 shadow-sm active:scale-95"
            >
              List Your Salon
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { haversineDistance, geocodeAddress } from '../utils/locationUtils';

const salonsData = [
  {
    id: 'maison-de-beaute',
    desktopName: 'Maison de Beauté',
    mobileName: 'Lumière Hair',
    locationDesktop: 'Soho, Manhattan • 0.8 mi',
    locationMobile: '2.5 mi • Westside',
    aboutDesktop: 'An exclusive sanctuary offering bespoke color and precision cutting. Experience unparalleled luxury in the heart of Soho with our master stylists.',
    aboutMobile: 'Holistic boutique specializing in premium styles, extensions, and organic treatments. Professional services with a luxurious touch.',
    desktopImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjHFvOUoUFzcS9fm-il0JQPCA529pBB_3DI0qY_gtHtKGy-8P54l0Ij2n9cm_XfVbJtKWqRffeY0Gebziv7yabVA4sYAz60Afcf_jfe2euUjzXZycXbIrrBhZZotrOTfxM4F5psFcW1wp_ROehfPfemcY1A7KiiH5Gr5_kkhR7OMqSN5VwtVLCwnEvIttzOUzdb8z9OM02DuNnl8meiv58KhlablTAOIyu5AGEZAQ6C1tTtnA0x4BeWDe6hWoaJ2whOo0ui8vu0tM',
    mobileImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVCze6kZLty_0Bmrj6koOAilWlJpjL59mLZFYUxwWw1OIvaHKlpT1f7LqtqsNYn6Nyegt49jdjbXD-4VMSJ1o0mF5f2VxQmJPXPfqtd3jYJJqRhVeVK0_46J0Ycp--FAyPuTgB_u4kCe4UE9h4aVcGiM4ffScxAx8sxKy0c8iJ2EhhtsnvAIPpHoOjqrfwkZSTIN0uTOexr6kOXgTtxgzJbqpCvjzZvjV7jKRTyF5NFPa3E0lCf3M66sYJA1TXygjfJqFT2JUs-FM',
    rating: '4.9',
    reviews: '84',
    tags: ['Balayage Specialist', 'Extensions', 'Olaplex', 'Haircut', 'Color', 'Highlights'],
    nextAvailable: 'Tomorrow, 10:00 AM',
    nextAvailableMobile: 'Today, 3:30 PM',
    priceInfo: '$$$ • Haircuts from $150',
    priceInfoMobile: 'from $65'
  },
  {
    id: 'aura-studio',
    desktopName: 'Aura Atelier',
    mobileName: 'AURA Studio',
    locationDesktop: 'Tribeca, Manhattan • 1.2 mi',
    locationMobile: '1.2 mi • Downtown',
    aboutDesktop: 'Where artistry meets wellness. Our holistic approach ensures not just beautiful hair, but a rejuvenating experience utilizing organic, sustainably sourced products.',
    aboutMobile: 'A modern, high-end hair studio featuring minimalist decor and elegant styling stations. Serene, professional and sophisticated wellness experiences.',
    desktopImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYtWqmrU_PEdXrU4UF6K2acuMradFY2IuOsE0TZTXUiShdbnCg680Y5a-zVGdV8osXSPRK7D-SQ_hGk4bYQdMxi-0Ls50rp4xjko_awWKkC-y3owP9cgk1NPrqBye6xZ7gEoTGPSXJmeDbilzXg5e-JBEMTO9I50eSxhSoT46uGvLvHpTamyuRyNQqTDg19kTrPlBx7E32tSn5tMNkS_VVistCXErX_d3R14sUYzvpr3vSZhq39B60P5NXH_64OzsBzCOMWN5o1VU',
    mobileImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm-EYAa-xTQNlC7SCPVLdxy-DUxF8kXjvqF0AOmV5C9emopIrZ4x3yV15Cok-Ir2Zm-7izxK104i0I4q8vn58hzuWJt8TItPZHqyJPlA-ftq_Dv85V6CG4seKrw2UYIxYn6bb52GUfMaBpQNIGVbUL7TONVe45lyXdTwU_11vPpkRcvogqyponuXYkyFUqDqQeQeyZ1iEctRWCYuqGFrHlgcOo4U2lRsqJV0PdOCYil90Qbb29Sbq6Aj_Mx4LzDoVkX67cUHIxfE8',
    rating: '4.8',
    reviews: '128',
    tags: ['Organic Color', 'Scalp Therapy', 'Cut & Style', 'Haircut', 'Color', 'Treatments'],
    nextAvailable: 'Today, 3:30 PM',
    nextAvailableMobile: 'Tomorrow, 10:00 AM',
    priceInfo: '$$$ • Haircuts from $130',
    priceInfoMobile: 'from $85'
  }
];

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParamsState] = useSearchParams();
  const { searchQuery, setSearchQuery, searchLocation, setSearchLocation, fetchSalons } = useBooking();
  const { isAuthenticated } = useAuth();
  
  // Geolocation
  const { lat: browserLat, lng: browserLng, permissionState } = useGeolocation();
  const [customCoords, setCustomCoords] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Local state for filters and UI toggle
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'name', 'reviews', 'distance'
  const [activeTag, setActiveTag] = useState(''); // filter by tag

  // Sync parameters from context or URL search params
  const [queryInput, setQueryInput] = useState(searchParams.get('query') || searchQuery || '');
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || searchLocation || '');

  const geocodeLocationText = async (text) => {
    if (!text || !text.trim()) {
      setCustomCoords(null);
      return;
    }
    setIsGeocoding(true);
    try {
      const coords = await geocodeAddress(text);
      setCustomCoords(coords);
    } catch (err) {
      console.error('Geocoding failed for text:', text, err);
      setCustomCoords(null);
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    const loadSalons = async () => {
      try {
        setLoading(true);
        const data = await fetchSalons();
        setSalons(data || []);
      } catch (err) {
        console.error('Failed to load salons from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSalons();
  }, []);

  useEffect(() => {
    const q = searchParams.get('query');
    const loc = searchParams.get('location');
    if (q !== null) {
      setSearchQuery(q);
      setQueryInput(q);
    }
    if (loc !== null) {
      setSearchLocation(loc);
      setLocationInput(loc);
      geocodeLocationText(loc);
    }
  }, [searchParams]);

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setSearchQuery(queryInput);
    setSearchLocation(locationInput);
    setSearchParamsState({ query: queryInput, location: locationInput });
    await geocodeLocationText(locationInput);
  };

  const handleSalonSelect = (id) => {
    navigate(`/salon/${id}`);
  };

  const currentQuery = searchParams.get('query') || searchQuery || '';
  const currentLocation = searchParams.get('location') || searchLocation || '';

  const activeLat = customCoords?.lat ?? browserLat;
  const activeLng = customCoords?.lng ?? browserLng;
  const isLocationAvailable = activeLat !== null && activeLng !== null;

  // Automatically default to distance sorting if location is available and we haven't selected anything else yet
  useEffect(() => {
    if (isLocationAvailable && sortBy === 'rating' && !searchParams.get('sort')) {
      setSortBy('distance');
    }
  }, [isLocationAvailable]);

  // Collect all unique tags from loaded salons for filter pills
  const allTags = [...new Set(salons.flatMap(s => s.tags || []))].sort();

  const salonsWithDistance = salons.map((s) => {
    if (activeLat !== null && activeLng !== null && s.latitude !== null && s.longitude !== null) {
      const distance = haversineDistance(
        parseFloat(activeLat),
        parseFloat(activeLng),
        parseFloat(s.latitude),
        parseFloat(s.longitude)
      );
      return { ...s, distance };
    }
    return { ...s, distance: null };
  });

  const filteredSalons = salonsWithDistance
    .filter(s => {
      // Text search
      if (currentQuery) {
        const q = currentQuery.toLowerCase();
        const nameMatch = s.name && s.name.toLowerCase().includes(q);
        const aboutMatch = s.about && s.about.toLowerCase().includes(q);
        const tagMatch = s.tags && s.tags.some(tag => tag.toLowerCase().includes(q));
        if (!nameMatch && !aboutMatch && !tagMatch) return false;
      }
      // Location filter: if we have geocoded coordinates, we don't strictly require string matching
      if (currentLocation && !customCoords) {
        const loc = currentLocation.toLowerCase();
        if (s.location && !s.location.toLowerCase().includes(loc)) return false;
      }
      // Tag filter
      if (activeTag) {
        if (!s.tags || !s.tags.includes(activeTag)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'distance' && isLocationAvailable) {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      }
      if (sortBy === 'rating') return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      if (sortBy === 'reviews') return (b.reviews || 0) - (a.reviews || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased flex flex-col">
      
      {/* Search & Filter Header Area (inside the page content) */}
      <div className="w-full bg-surface-container-lowest border-b border-outline-variant/30 py-4 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop">
          {/* Desktop Search Bar Row */}
          <div className="hidden md:flex items-center justify-between gap-6">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-surface border border-outline-variant/50 rounded-full px-6 py-2.5 max-w-xl flex-1 shadow-sm focus-within:border-primary-container transition-all">
              <span className="material-symbols-outlined text-outline">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 p-0 font-body-md text-body-md text-on-surface w-1/2 outline-none" 
                placeholder="Service (e.g. Balayage)" 
                type="text" 
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
              />
              <div className="h-5 w-px bg-outline-variant/50 mx-2"></div>
              <span className="material-symbols-outlined text-outline">location_on</span>
              <input 
                className="bg-transparent border-none focus:ring-0 p-0 font-body-md text-body-md text-on-surface flex-1 outline-none" 
                placeholder="Location or City" 
                type="text" 
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
              <button type="submit" className="bg-primary-container text-on-primary font-label-md px-5 py-1.5 rounded-full hover:bg-primary transition-colors">
                Search
              </button>
            </form>

            {/* List/Map Mode Toggles */}
            <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant/30 shadow-inner">
              <button 
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all flex items-center gap-1 ${viewMode === 'list' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
                onClick={() => setViewMode('list')}
              >
                <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span> List
              </button>
              <button 
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all flex items-center gap-1 ${viewMode === 'map' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
                onClick={() => setViewMode('map')}
              >
                <span className="material-symbols-outlined text-[16px]">map</span> Map
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Row */}
          <div className="md:hidden flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                  <input 
                    className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-full font-body-sm text-body-sm text-on-surface border-none focus:ring-1 focus:ring-primary-container outline-none" 
                    placeholder="Search treatments or salons..." 
                    type="text" 
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                  />
                </div>
              </form>
              <button 
                aria-label="Filters" 
                className="text-on-surface p-2.5 bg-surface-container border border-outline-variant/30 rounded-full hover:bg-surface-container-high transition-colors relative"
                onClick={() => setIsFilterDrawerOpen(true)}
              >
                <span className="material-symbols-outlined block text-[20px]">tune</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {filteredSalons.length} {filteredSalons.length === 1 ? 'salon' : 'salons'} found
              </p>
              
              <div className="flex bg-surface-container rounded-full p-0.5 border border-outline-variant/30">
                <button 
                  className={`px-3 py-1 rounded-full font-label-md text-xs transition-all ${viewMode === 'list' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant'}`}
                  onClick={() => setViewMode('list')}
                >
                  List
                </button>
                <button 
                  className={`px-3 py-1 rounded-full font-label-md text-xs transition-all ${viewMode === 'map' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant'}`}
                  onClick={() => setViewMode('map')}
                >
                  Map
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Tag Scrollbar */}
          <div className="flex items-center justify-between gap-4 mt-4 border-t border-outline-variant/10 pt-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
              <button
                onClick={() => setActiveTag('')}
                className={`shrink-0 px-4 py-1 rounded-full border font-label-md text-label-md transition-colors ${!activeTag ? 'border-primary-container bg-secondary-container text-on-secondary-container font-semibold' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary'}`}
              >
                All Services
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                  className={`shrink-0 px-4 py-1 rounded-full border font-label-md text-label-md transition-colors ${activeTag === tag ? 'border-primary-container bg-secondary-container text-on-secondary-container font-semibold' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg py-1 px-3 font-body-sm text-sm outline-none focus:border-primary cursor-pointer"
              >
                {isLocationAvailable && <option value="distance">Nearest</option>}
                <option value="rating">Top Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-stack-md lg:py-stack-lg flex flex-col lg:flex-row gap-gutter relative">
        
        {/* DESKTOP FILTER SIDEBAR (Hidden on Mobile) */}
        <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col gap-8 sticky top-[100px] h-fit">
          <div className="border-b border-surface-variant pb-6">
            <h3 className="font-label-lg text-label-lg text-on-surface mb-4 tracking-wide uppercase">Services</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input defaultChecked className="w-4 h-4 rounded-sm border-outline-variant text-primary-container focus:ring-primary-container bg-transparent" type="checkbox" />
                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">Haircut &amp; Styling</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input defaultChecked className="w-4 h-4 rounded-sm border-outline-variant text-primary-container focus:ring-primary-container bg-transparent" type="checkbox" />
                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">Color &amp; Highlights</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded-sm border-outline-variant text-primary-container focus:ring-primary-container bg-transparent" type="checkbox" />
                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">Extensions</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded-sm border-outline-variant text-primary-container focus:ring-primary-container bg-transparent" type="checkbox" />
                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">Treatments</span>
              </label>
            </div>
          </div>
          <div className="border-b border-surface-variant pb-6">
            <h3 className="font-label-lg text-label-lg text-on-surface mb-4 tracking-wide uppercase">Price Range</h3>
            <div className="flex gap-2">
              <button className="flex-1 py-2 border border-outline-variant rounded-DEFAULT font-label-md text-label-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors">$$</button>
              <button className="flex-1 py-2 border border-primary bg-primary-fixed text-on-primary-fixed rounded-DEFAULT font-label-md text-label-md transition-colors">$$$</button>
              <button className="flex-1 py-2 border border-outline-variant rounded-DEFAULT font-label-md text-label-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors">$$$$</button>
            </div>
          </div>
          <div className="border-b border-surface-variant pb-6">
            <h3 className="font-label-lg text-label-lg text-on-surface mb-4 tracking-wide uppercase">Rating</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input defaultChecked className="w-4 h-4 border-outline-variant text-primary-container focus:ring-primary-container bg-transparent" name="rating" type="radio" />
                <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                  4.5+ <span className="material-symbols-outlined text-[16px] text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 border-outline-variant text-primary-container focus:ring-primary-container bg-transparent" name="rating" type="radio" />
                <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                  4.0+ <span className="material-symbols-outlined text-[16px] text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* DESKTOP MAIN RESULTS (and Mobile List View) */}
        <section className={`flex-1 flex-col gap-6 ${viewMode === 'list' ? 'flex' : 'hidden md:flex'}`}>
          
          {/* Breadcrumb / Back button */}
          <div className="hidden md:flex items-center gap-2 text-body-sm text-on-surface-variant">
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/')}>Home</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Search Results</span>
          </div>

          {/* Header Summary for Desktop */}
          <div className="hidden md:flex items-center justify-between mb-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {filteredSalons.length} {filteredSalons.length === 1 ? 'Premium Salon' : 'Premium Salons'} {locationInput ? `in ${locationInput}` : 'Near You'}
            </h1>
            <div className="flex items-center gap-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none focus:ring-0 p-0 font-label-md text-label-md text-primary cursor-pointer pr-4 outline-none"
              >
                {isLocationAvailable && <option value="distance">Nearest</option>}
                <option value="rating">Top Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Desktop Result Cards / Mobile Cards List */}
          <div className="flex flex-col gap-6">
            
            {filteredSalons.map(s => (
              <article key={s.id} className="flex flex-col sm:flex-row bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant/30 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(197,160,89,0.15)] group">
                <div 
                  className="sm:w-[280px] h-56 sm:h-auto relative overflow-hidden shrink-0 cursor-pointer"
                  onClick={() => handleSalonSelect(s.id)}
                >
                  {/* Desktop/Mobile Image */}
                  <img 
                    alt={s.name} 
                    className="hidden md:block w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={s.image_url}
                  />
                  <img 
                    alt={s.name} 
                    className="md:hidden w-full h-full object-cover" 
                    src={s.image_url}
                  />
                  <button aria-label="Like" className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors" onClick={(e) => e.stopPropagation()}>
                    <span className="material-symbols-outlined text-[20px] block">favorite</span>
                  </button>
                  {/* Mobile Rating badge overlay */}
                  <div className="md:hidden absolute bottom-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-on-surface flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-primary-container block" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {s.rating} ({s.reviews})
                    {s.distance !== null && (
                      <span className="ml-1 pl-1 border-l border-outline-variant text-primary font-semibold">
                        {s.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between cursor-pointer" onClick={() => handleSalonSelect(s.id)}>
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      {/* Salon Title (Desktop vs Mobile names) */}
                      <h2 
                        className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors font-semibold"
                      >
                        <span>{s.name}</span>
                      </h2>
                      <div className="hidden md:flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-DEFAULT">
                        <span className="material-symbols-outlined text-[16px] text-primary-container block" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">{s.rating}</span>
                      </div>
                      {/* Mobile price tag */}
                      <div className="md:hidden text-right">
                        <span className="font-label-md text-[10px] text-on-surface-variant block font-medium">from</span>
                        <p className="font-body-lg text-body-lg text-on-surface font-medium">
                          {s.id === 'aura-studio' ? '$85' : '$65'}
                        </p>
                      </div>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] block">location_on</span> 
                      <span>{s.location}</span>
                      {s.distance !== null && (
                        <span className="ml-2 px-2.5 py-0.5 bg-primary/10 text-primary font-semibold rounded-full text-xs">
                          {s.distance.toFixed(1)} km away
                        </span>
                      )}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-4">
                      <span>{s.about}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {s.tags && s.tags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} className="px-3 py-1 bg-secondary-container text-on-secondary-fixed-variant rounded-full font-label-md text-label-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-surface-variant gap-4 sm:gap-0" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">Next available</span>
                      <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                        <span>{s.id === 'aura-studio' ? 'Today, 3:30 PM' : 'Tomorrow, 10:00 AM'}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <span className="font-label-md text-label-md text-on-surface-variant hidden sm:block font-medium">
                        {s.id === 'aura-studio' ? '$$$ • Haircuts from $130' : '$$$ • Haircuts from $140'}
                      </span>
                      <button 
                        className="w-full sm:w-auto px-6 py-3 bg-primary-container text-on-primary font-label-lg text-label-lg rounded-DEFAULT hover:bg-inverse-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container font-semibold"
                        onClick={() => handleSalonSelect(s.id)}
                      >
                        <span className="hidden md:inline">Book Now</span>
                        <span className="md:hidden">View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {filteredSalons.length === 0 && (
              <div className="bg-white rounded-xl border border-outline-variant/30 soft-glow p-8 text-center max-w-md mx-auto space-y-4 my-12 shadow-sm w-full flex flex-col items-center">
                <span className="material-symbols-outlined text-outline text-5xl">search_off</span>
                <h4 className="font-headline-md text-[20px] text-on-surface font-semibold">No salons found</h4>
                <p className="text-body-sm text-on-surface-variant">No salons found — try a different search (e.g. "Haircut", "Balayage", "Atelier").</p>
                <button 
                  onClick={() => { setQueryInput(''); setLocationInput(''); setSearchParamsState({ query: '', location: '' }); }}
                  className="bg-primary-container text-on-primary px-6 py-2.5 rounded font-label-md text-label-md hover:bg-primary transition-colors cursor-pointer font-semibold uppercase tracking-wider"
                >
                  Clear Search
                </button>
              </div>
            )}

          </div>

          {/* Load More Button */}
          <div className="mt-8 flex justify-center">
            <button className="px-8 py-3 border border-outline-variant text-on-surface font-label-lg text-label-lg rounded-DEFAULT hover:bg-surface-container-low transition-colors">
              Load More Salons
            </button>
          </div>

        </section>

        {/* MOBILE MAP VIEW (Visible below 768px and when mode is Map) */}
        <div className={`md:hidden flex-1 relative h-[calc(100vh-210px)] w-full bg-surface-container-highest ${viewMode === 'map' ? 'block' : 'hidden'}`}>
          <img 
            className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMavBh6KOAcaQovMsOL0ktgdsgjzueNzloUbfZ_rrWOM2zFYiIrMFpnuBatOlSUeYjc8GTiy02DxY_bxUPDSWBRdbSqItw4EcIQTXK3a_KZZvSSJ_HLA7M25GC_QgMAcTiBwzv9Gimj2hn3wbckPQDNlgdi9R_iUcZTADP0dryy2vp6HRPuL0uKqYF736XkKxHh0sTI5ulgDTITFqZEFhvvvAaOmC4CSMkhpi720LCOIDfVeQEOfpsJR6o5XfP2xZjDGDd5fp3pW4"
            alt="Simulated map background"
          />
          {/* Map Pin 1 */}
          <div className="absolute top-[30%] left-[40%] cursor-pointer group" onClick={() => handleSalonSelect('aura-studio')}>
            <div className="w-10 h-10 bg-primary-container text-on-primary rounded-full flex items-center justify-center shadow-lg relative z-10">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-surface-container-lowest p-2 rounded-lg shadow-lg w-40 z-20">
              <p className="font-label-md text-label-md text-on-surface font-semibold">AURA Studio</p>
              <p className="text-xs text-on-surface-variant">4.9 ★ • from $85</p>
            </div>
          </div>
          {/* Map Pin 2 */}
          <div className="absolute top-[55%] left-[60%] cursor-pointer group" onClick={() => handleSalonSelect('maison-de-beaute')}>
            <div className="w-8 h-8 bg-surface-container-lowest text-on-surface rounded-full flex items-center justify-center shadow-md border border-outline-variant relative z-10">
              <span className="material-symbols-outlined text-[16px]">storefront</span>
            </div>
          </div>
          {/* Recenter Button */}
          <button className="absolute bottom-6 right-6 w-12 h-12 bg-surface-container-lowest rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-center text-on-surface hover:text-primary transition-colors">
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>

      </main>

      {/* MOBILE FILTER DRAWER & OVERLAY */}
      <div 
        className={`fixed inset-0 bg-on-background/40 z-50 backdrop-blur-[2px] transition-opacity duration-300 ${isFilterDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsFilterDrawerOpen(false)}
      ></div>
      <div 
        className={`fixed bottom-0 left-0 right-0 max-h-[751px] bg-surface-container-lowest rounded-t-3xl z-50 flex flex-col shadow-[0_-8px_30px_rgb(0,0,0,0.1)] md:max-w-[500px] md:mx-auto transition-transform duration-300 transform ${isFilterDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="w-full flex justify-center pt-4 pb-2" onClick={() => setIsFilterDrawerOpen(false)}>
          <div className="w-12 h-1.5 bg-surface-variant rounded-full cursor-pointer"></div>
        </div>
        <div className="px-margin-mobile pb-4 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Filters</h2>
          <button className="text-on-surface-variant hover:text-on-surface" onClick={() => setIsFilterDrawerOpen(false)}>
            <span className="material-symbols-outlined block">close</span>
          </button>
        </div>
        <div className="overflow-y-auto px-margin-mobile py-stack-md flex flex-col gap-stack-md flex-1">
          <div>
            <h3 className="font-label-lg text-label-lg text-on-surface mb-3 uppercase tracking-wider">Sort By</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="sort"
                  checked={sortBy === 'rating'}
                  onChange={() => setSortBy('rating')}
                  className="text-primary-container focus:ring-primary-container" 
                />
                <span className="font-body-md text-body-md text-on-surface">Top Rated / Recommended</span>
              </label>
              {isLocationAvailable && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sort"
                    checked={sortBy === 'distance'}
                    onChange={() => setSortBy('distance')}
                    className="text-primary-container focus:ring-primary-container" 
                  />
                  <span className="font-body-md text-body-md text-on-surface">Distance (Nearest first)</span>
                </label>
              )}
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="sort"
                  checked={sortBy === 'reviews'}
                  onChange={() => setSortBy('reviews')}
                  className="text-primary-container focus:ring-primary-container" 
                />
                <span className="font-body-md text-body-md text-on-surface">Most Reviewed</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="sort"
                  checked={sortBy === 'name'}
                  onChange={() => setSortBy('name')}
                  className="text-primary-container focus:ring-primary-container" 
                />
                <span className="font-body-md text-body-md text-on-surface">Name A-Z</span>
              </label>
            </div>
          </div>
          <hr className="border-outline-variant/30"/>
          <div>
            <h3 className="font-label-lg text-label-lg text-on-surface mb-3 uppercase tracking-wider">Price Range</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Min</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                  <input className="w-full bg-surface-container border-none rounded-lg pl-8 pr-3 py-2 font-body-md text-body-md focus:ring-1 focus:ring-primary-container outline-none" placeholder="0" type="number" />
                </div>
              </div>
              <div className="flex-1">
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Max</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                  <input className="w-full bg-surface-container border-none rounded-lg pl-8 pr-3 py-2 font-body-md text-body-md focus:ring-1 focus:ring-primary-container outline-none" placeholder="200+" type="number" />
                </div>
              </div>
            </div>
          </div>
          <hr className="border-outline-variant/30"/>
          <div>
            <h3 className="font-label-lg text-label-lg text-on-surface mb-3 uppercase tracking-wider">Services</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-full border border-primary-container bg-secondary-container font-label-md text-label-md text-on-secondary-container">Haircut</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-on-surface-variant">Color</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-on-surface-variant">Highlights</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-on-surface-variant">Extensions</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-on-surface-variant">Styling</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-on-surface-variant">Treatment</button>
            </div>
          </div>
        </div>
        <div className="p-margin-mobile border-t border-outline-variant/30 flex gap-4 bg-surface-container-lowest rounded-b-3xl">
          <button className="flex-1 py-3 rounded-lg border border-outline text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-colors" onClick={() => setIsFilterDrawerOpen(false)}>
            Clear All
          </button>
          <button className="flex-1 py-3 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-colors shadow-sm" onClick={() => setIsFilterDrawerOpen(false)}>
            Apply Filters
          </button>
        </div>
      </div>

    </div>
  );
};

export default SearchResultsPage;

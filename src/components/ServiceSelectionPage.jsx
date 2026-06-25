import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const salonServices = {
  'maison-de-beaute': [
    {
      category: 'Haircut & Styling',
      items: [
        { name: 'Signature Haircut', price: 95, duration: 60, desc: 'Our master stylists provide a personalized consultation, followed by a luxury wash, precision cut, and signature blowout finish.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9KMCVZhBF5MNZ0aPhlOfI-ig4B-y-KmDP6jIeW0aTYqxNpQl6mF31hSEslIPpruWkNJAIWbczrZE0AUFJog05Y3cN7B9LcORhbyi7KyAP6w6K8yTNPKACVkO0xu3BUVDv-zNpiJhbbQTpi0BEHNnrgoTjCu347oAjRB4eHOoSWvLjyex5ZyxQYOlkBVsjJjzJsMu5IiTM9_TnI5pfq63N_JNp3UenRUMPKxQIWv-S3mJspWtZG9rb' },
        { name: 'Blowout & Style', price: 65, duration: 45, desc: 'The ultimate refreshing experience. Includes an exfoliating scalp massage, luxury conditioning, and professional styling of your choice.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDrv5Ocv6QlT1A0itqXBLuXIMjd8tKnDSA9Z8R9SNr5Lj4IBCqjfcb18oczjW5iNpPPt8qf7eN3cf8NeppqD-4y1RdgXBlv0DVBlY-5uhWbqRCILRHeD13G2_3lA9Fhu0bXezT4bNwEhpOnC3g0Y-ZPdM15e-9iAV3MBpBIqCJAP2hvw-i4MB9bcWSoMYmB-LcUerBuZrZaHd6Br7EN_2FuBIKSAVK4zbpm9ke1neIbcbps_eW2Ke8' },
        { name: 'Couture Cut', price: 65, duration: 75, desc: 'Tailored style designed to enhance your natural features and structure.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS3P7LbzFUnytvRRqAEjeBIi79L54mNQk5kXkU-sFwkfgPEmPoX4ZaP5ZWgQxFXBpH0ObsEbCToggjGRtsaXto0hGG-A9aAWn0KWG5pzqslh-t1F9ki-KTeS273vqkGv5v28JCMfk47VQMakFcC8Aw5PWBWNti446rjSSPD7bZcfGtSBKfMMEbvodne_5r5pFkmMLnIhBg_tBuZdqERex_3tlsSb5czfM_OJoIGjALmmqujd4Qh64x' }
      ]
    },
    {
      category: 'Color & Highlights',
      items: [
        { name: 'Balayage Artistry', price: 245, duration: 180, desc: 'Custom hand-painted highlights for a natural, sun-kissed look. Includes a gloss toner and deep restorative treatment.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGE9PkQrPTu2_vAA0jq33F7fU56t7auJyCWgKx71-SSDQY3eo4dz3IlsGJsAt_9hW3eLGOoUoGngAA7z1QB5ViZuLAbzqwdjX7kadFMzAp8X7dqDTxq6Zs3aGohK0f4BDc1EMxoVTO4bVNFktVArYzWZDOgBL5VLNgEOrv-aUAe7AyKWASxFM_V_p98Jykdg8WoGixjepmewzI6N3d2ccwJ714_2X9WaFjS0sBUTvmfFoHBk2fSW4e' },
        { name: 'Signature Color', price: 140, duration: 90, desc: 'Full custom single-process color to enrich tones and offer seamless blending.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwrzpzHWs-53xt3GqB1t-1rcFyMYeaCJV-IFnqycgupFXyCgq2N_kFNhgNygY6gbK2BGfPLnf4LYSLt3DBDE6spQvMaZRc3WHj-cM-5DTIACNAUt7sJvm-eW97SMrfSD5pMkWM4UNh3ptKZBPf96-w145hl5I5dOBJIG4-m6jBbBu4mauJBRxfdErMEKZnRTQR3fTWxlYKVuDsHte5GYdl-aLeuJk3YBNsgP9N2EHyQzGNEiH-1maP' }
      ]
    },
    {
      category: 'Treatments',
      items: [
        { name: 'Scalp Detox', price: 185, duration: 60, desc: 'Deep purifying scalp therapy designed to promote hair health and restore shine.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwZjLW1cgQNLj9oUOgULe95mDJT45UmFsRb1vO6EWnPixsDvkP9pnm6wKggt12o_TpFmxF_E984xmJyC3mJY8Exm8LvEROZFM2Zh-GvMDv0r8OkLL4Oeo-SU2gvQl_7GjT9yLagxF6eSn-w2Keuj_uvvqT5-GYpXN9guAYyq_DQIAD0z_eMr4KI0IfetiUsx_OMwTAbEAG0u4GqadrJtPoWv5PUuVp2MrD4cjFgDXe0N6iXziEvFDN' },
        { name: 'AURA Gold Facial', price: 145, duration: 60, desc: 'Our signature illuminating treatment using 24k gold leaf and lymphatic drainage.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvGqJJhJfl3oryTxJ4NTGDQk_hGgPiWyaGdCmLT6swfrmx92XjM8cdjgQrcplCCMUlwENIzIcwShdQZMaQvEa7H1xrWYcxZD8Dm4Xaq4dnUTmAyv77JgTsoa_iNsSCE8NDTMqtN6N_4X4vtsOeGigRyXrbI4vNUGNuVUzWHhcIquAqIhRgotWXgMXq3lu49QfppNbVm70cxVe3EcUYctXnCPCgdwVZhrosYoCDNc7dIoqDtlz-agMh' },
        { name: 'Deep Tissue Release', price: 180, duration: 90, desc: 'Targeted pressure for chronic muscle tension and stress relief.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZP8x5hbWIZPo53SXW-FV4ON4iRXdVRPpfnY7_pgN-UhrLKEpMAXkph1rJGNiRPmzeNflVLaOw2nAkqC1DUVhP03WXqOoIHngLTbhcY9VgjG-0w2TE82lc7TumpUgcLqII_LyeiRE9lH0yQzHXysvcNNl75x7EHm7eqyLXd2TCzFgECWhl36wNzpazjFSaBs67PhC13vC1hHPcdzzX5nae2xPzFyGYB7Sjfb7JYWBoYD9aU1G3mBs4' }
      ]
    }
  ],
  'aura-studio': [
    {
      category: 'Haircut & Styling',
      items: [
        { name: 'Cut & Style', price: 85, duration: 75, desc: 'Precision haircut customized to your face shape and hair texture, complete with signature styling.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS3P7LbzFUnytvRRqAEjeBIi79L54mNQk5kXkU-sFwkfgPEmPoX4ZaP5ZWgQxFXBpH0ObsEbCToggjGRtsaXto0hGG-A9aAWn0KWG5pzqslh-t1F9ki-KTeS273vqkGv5v28JCMfk47VQMakFcC8Aw5PWBWNti446rjSSPD7bZcfGtSBKfMMEbvodne_5r5pFkmMLnIhBg_tBuZdqERex_3tlsSb5czfM_OJoIGjALmmqujd4Qh64x' },
        { name: 'Red Carpet Blowout', price: 65, duration: 45, desc: 'Intense volume and shine styling for your most important events.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoxxQSzt2aGnAUrku1jRR64WOHyBTUrMOVWD0_sFO6vRJm3lfC-K0sPt6OiEely791aRwt-AsSN2eprc-HCHviyk8p6mYQ7QFFhExibvQEixq9JDt6otYFmzkh6bgjiFDt90a4cg-Hkw1_-xdLQ1L6c_hRgQ7UzybyHFu0SewqWoACOvpJd14Ra38oAyREI16CnsA51f95yj73wUH8VQrQwDNfik-Pm7ph5PjcO0sGKpCIIUrDX632' }
      ]
    },
    {
      category: 'Color & Highlights',
      items: [
        { name: 'Organic Color', price: 130, duration: 90, desc: 'Full premium single-process color using certified organic, non-toxic formulations.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwrzpzHWs-53xt3GqB1t-1rcFyMYeaCJV-IFnqycgupFXyCgq2N_kFNhgNygY6gbK2BGfPLnf4LYSLt3DBDE6spQvMaZRc3WHj-cM-5DTIACNAUt7sJvm-eW97SMrfSD5pMkWM4UNh3ptKZBPf96-w145hl5I5dOBJIG4-m6jBbBu4mauJBRxfdErMEKZnRTQR3fTWxlYKVuDsHte5GYdl-aLeuJk3YBNsgP9N2EHyQzGNEiH-1maP' },
        { name: 'Balayage & Glow', price: 210, duration: 150, desc: 'Hand-painted highlights for a sun-kissed, natural dimension look.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQW6g8Tc34rpLRaE7BEd9i5VylzgJUY_P3O1i3wfiGxNOLOdIuIdgwPc6TDD65GxUQ7jRoGBGLbhUqKbT5EqI4_v29OtMfYD83K2jZQN07rTsTGNInG-xEUItTneZEC9PGR82SlYYCBSt4CzLTcLseHqFMyvkCuCJpB8tCFz6JOQLkvtQSzFYiQGVNiR9s8wlDm5sbk4pdftH-t36tAY7A_zoneJB1_0vFGFShEhfC4PNcMiPRoUWk' }
      ]
    },
    {
      category: 'Treatments',
      items: [
        { name: 'Scalp Therapy', price: 110, duration: 60, desc: 'Holistic scalp treatments with customized botanical serums for ultimate scalp health.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwZjLW1cgQNLj9oUOgULe95mDJT45UmFsRb1vO6EWnPixsDvkP9pnm6wKggt12o_TpFmxF_E984xmJyC3mJY8Exm8LvEROZFM2Zh-GvMDv0r8OkLL4Oeo-SU2gvQl_7GjT9yLagxF6eSn-w2Keuj_uvvqT5-GYpXN9guAYyq_DQIAD0z_eMr4KI0IfetiUsx_OMwTAbEAG0u4GqadrJtPoWv5PUuVp2MrD4cjFgDXe0N6iXziEvFDN' }
      ]
    }
  ]
};

const ServiceSelectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedServices, setSelectedServices, fetchSalonById, fetchServicesBySalon } = useBooking();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQueryLocal, setSearchQueryLocal] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const salonData = await fetchSalonById(id);
        const servicesData = await fetchServicesBySalon(id);
        setSalon(salonData);
        setServices(servicesData || []);
      } catch (err) {
        console.error('Error loading service selection details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const salonName = salon?.name || 'Sanctuary';

  // Group services by category dynamically
  const categoriesMap = {};
  services.forEach(service => {
    const cat = service.category || 'Treatments';
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = [];
    }
    categoriesMap[cat].push({
      id: service.id,
      name: service.name,
      price: parseFloat(service.price),
      duration: parseInt(service.duration) || 60,
      desc: service.description || '',
      img: service.image || ''
    });
  });

  const categoriesData = Object.keys(categoriesMap).map(catName => ({
    category: catName,
    items: categoriesMap[catName]
  }));


  // Toggle selected service
  const handleToggleService = (item) => {
    const exists = selectedServices.some(s => s.name === item.name);
    let updated;
    if (exists) {
      updated = selectedServices.filter(s => s.name !== item.name);
    } else {
      updated = [...selectedServices, item];
      showToast(`${item.name} added to booking`);
    }
    setSelectedServices(updated);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  const selectedCount = selectedServices.length;
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const handleContinue = () => {
    if (selectedCount > 0) {
      navigate(`/salon/${id}/booking/datetime`);
    }
  };

  // Get filtered items
  const getFilteredItems = () => {
    let items = [];
    categoriesData.forEach(cat => {
      if (activeCategory === 'All' || cat.category === activeCategory) {
        cat.items.forEach(item => {
          if (searchQueryLocal === '' || item.name.toLowerCase().includes(searchQueryLocal.toLowerCase()) || item.desc.toLowerCase().includes(searchQueryLocal.toLowerCase())) {
            items.push({ ...item, categoryName: cat.category });
          }
        });
      }
    });
    return items;
  };

  const filteredItems = getFilteredItems();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-4">
        <span className="animate-spin material-symbols-outlined text-4xl text-primary">sync</span>
        <p className="font-body-lg text-secondary">Loading sanctuary treatments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased pb-32">
      
      {/* MAIN CONTAINER */}
      <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
        
        {/* BREADCRUMB (Desktop Only) */}
        <div className="hidden md:flex items-center gap-2 text-body-sm text-on-surface-variant mb-8">
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/')}>Home</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/search')}>Search Results</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/salon/${id}`)}>{salonName}</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Select Services</span>
        </div>

        {/* PROGRESS TRACKER */}
        <div className="w-full max-w-3xl mx-auto mb-10 md:mb-16">
          <div className="flex justify-between items-center mb-4">
            <span className="text-primary font-label-lg text-label-lg uppercase tracking-wider font-semibold">Step 1: Select Service</span>
            <span className="text-outline font-label-lg text-label-lg">Step 2: Specialist & Time</span>
            <span className="text-outline font-label-lg text-label-lg">Step 3: Confirm Booking</span>
          </div>
          <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary-container w-1/3 transition-all duration-700 ease-out"></div>
          </div>
        </div>

        {/* DESKTOP LAYOUT SHIFT AND STRUCTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* CATEGORIES SIDEBAR / HORIZONTAL PILLS */}
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div>
              <h2 className="font-headline-md text-headline-md mb-2">{salonName}</h2>
              <p className="text-body-sm text-on-surface-variant">Choose one or multiple treatments below.</p>
            </div>

            {/* Desktop Sidebar Categories List */}
            <div className="hidden lg:flex flex-col space-y-2">
              <button 
                onClick={() => setActiveCategory('All')}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-left font-semibold transition-all ${activeCategory === 'All' ? 'bg-secondary-container text-on-secondary-container' : 'hover:bg-surface-container text-on-surface-variant'}`}
              >
                <span>All Services</span>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              {categoriesData.map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveCategory(cat.category)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all group ${activeCategory === cat.category ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'hover:bg-surface-container text-on-surface-variant hover:text-primary'}`}
                >
                  <span className="group-hover:text-primary">{cat.category}</span>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary">chevron_right</span>
                </button>
              ))}
            </div>

            {/* Mobile Category Scrollable Chips */}
            <div className="lg:hidden w-full overflow-x-auto no-scrollbar -mx-margin-mobile px-margin-mobile">
              <div className="flex gap-3 w-max">
                <button 
                  onClick={() => setActiveCategory('All')}
                  className={`flex-none px-6 py-2 rounded-full font-label-lg text-label-lg transition-all ${activeCategory === 'All' ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container'}`}
                >
                  All
                </button>
                {categoriesData.map((cat, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveCategory(cat.category)}
                    className={`flex-none px-6 py-2 rounded-full font-label-lg text-label-lg transition-all ${activeCategory === cat.category ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container'}`}
                  >
                    {cat.category.replace(' & Styling', '').replace(' & Highlights', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Studio Policy Panel */}
            <div className="p-6 rounded-xl bg-secondary-fixed/30 border border-outline-variant/30 hidden lg:block">
              <p className="font-label-lg text-label-lg text-primary mb-2 uppercase tracking-wide">Studio Policy</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Please arrive 10 minutes prior to your appointment. Cancellations require 24-hour notice.</p>
            </div>
          </aside>

          {/* MAIN SERVICE LISTS */}
          <div className="lg:col-span-9 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b border-outline-variant">
              <div>
                <p className="text-primary font-label-lg uppercase tracking-widest mb-1">Menu</p>
                <h1 className="font-headline-lg text-headline-lg">Select Your Experience</h1>
              </div>
              
              {/* Service Search Input */}
              <div className="mt-4 md:mt-0 relative w-full md:w-64">
                <input 
                  className="w-full pl-10 pr-4 py-2 border-b border-outline-variant bg-transparent focus:border-primary focus:ring-0 transition-colors outline-none" 
                  placeholder="Search services..." 
                  type="text"
                  value={searchQueryLocal}
                  onChange={(e) => setSearchQueryLocal(e.target.value)}
                />
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline">search</span>
              </div>
            </div>

            {/* Services Grid/List */}
            <div className="space-y-8">
              {categoriesData.map((cat, cIdx) => {
                // Determine if we have matching items under this category
                const catItems = filteredItems.filter(item => item.categoryName === cat.category);
                if (catItems.length === 0) return null;

                return (
                  <div key={cIdx} className="pt-2">
                    <h3 className="font-label-lg text-label-lg text-outline uppercase tracking-widest mb-4">{cat.category}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {catItems.map((item, iIdx) => {
                        const isSelected = selectedServices.some(s => s.name === item.name);
                        return (
                          <div 
                            key={iIdx} 
                            onClick={() => handleToggleService(item)}
                            className={`group cursor-pointer bg-surface border rounded-xl p-6 transition-all duration-300 hover:border-primary/50 soft-glow-hover flex flex-col md:flex-row gap-6 ${isSelected ? 'border-primary bg-secondary-fixed/10 selected' : 'border-outline-variant/30'}`}
                          >
                            <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-surface-container-high shadow-sm">
                              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={item.img} alt={item.name} />
                            </div>
                            <div className="flex-grow flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start mb-2 gap-4">
                                  <h4 className="font-headline-md text-[20px] text-on-surface leading-snug">{item.name}</h4>
                                  <div className="text-right flex-shrink-0">
                                    <p className="font-semibold text-primary">From ${item.price}</p>
                                    <p className="text-body-sm text-outline">{item.duration} min</p>
                                  </div>
                                </div>
                                <p className="text-body-sm text-on-surface-variant max-w-xl line-clamp-2 md:line-clamp-none">{item.desc}</p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div className={`flex items-center gap-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                  <span className="text-primary font-semibold text-body-sm">Selected</span>
                                </div>
                                <div className="md:hidden flex items-center text-primary font-label-lg gap-1">
                                  {isSelected ? 'Remove' : 'Add'} 
                                  <span className="material-symbols-outlined text-[18px]">
                                    {isSelected ? 'remove_circle' : 'add_circle'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="py-12 text-center text-on-surface-variant">
                  No services found matching "{searchQueryLocal}".
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* SELECTION BAR / FOOTER (State-preserving and viewport responsive) */}
      
      {/* Desktop Sticky Selection Bar */}
      <section 
        className={`hidden md:block fixed bottom-0 left-0 right-0 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-surface-container transition-transform duration-500 ease-in-out z-40 ${selectedCount > 0 ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="max-w-container-max mx-auto px-margin-desktop h-24 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-md text-outline uppercase">Selected Services ({selectedCount})</span>
            <span className="font-headline-md text-[18px] text-on-surface truncate max-w-md">
              {selectedServices.map(s => s.name).join(', ')}
            </span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col text-right">
              <span className="font-label-md text-outline uppercase">Est. Price</span>
              <span className="font-headline-md text-[18px] text-primary">${totalPrice}</span>
            </div>
            <button 
              className="bg-primary text-on-primary font-label-lg text-label-lg px-8 h-12 rounded-lg transition-all active:scale-95 flex items-center gap-2 hover:bg-primary-container disabled:bg-surface-variant disabled:text-outline cursor-pointer"
              onClick={handleContinue}
              disabled={selectedCount === 0}
            >
              Continue to Specialist
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Selection Bar */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md px-margin-mobile py-6 flex items-center justify-between border-t border-outline-variant/30 z-40 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
        <div className="flex-grow">
          <p className="font-body-sm text-body-sm text-on-surface-variant">Selected: <span className="font-semibold text-primary">{selectedCount} service{selectedCount !== 1 ? 's' : ''}</span></p>
          <p className="font-label-lg text-label-lg text-on-surface">${totalPrice.toFixed(2)}</p>
        </div>
        <button 
          onClick={handleContinue}
          disabled={selectedCount === 0}
          className={`px-8 py-3 font-label-lg text-label-lg rounded-full transition-all duration-300 ${selectedCount > 0 ? 'bg-primary-container text-white opacity-100 cursor-pointer' : 'bg-outline-variant text-on-primary opacity-50 cursor-not-allowed'}`}
        >
          Next
        </button>
      </footer>

      {/* Mobile Selection Toast Notification */}
      <div 
        className={`fixed bottom-28 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-full font-label-md text-label-md transition-all duration-500 shadow-xl z-50 ${toastMessage ? 'opacity-100 translate-y-[-10px]' : 'opacity-0 pointer-events-none'}`}
      >
        {toastMessage}
      </div>

    </div>
  );
};

export default ServiceSelectionPage;

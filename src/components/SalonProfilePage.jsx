import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const SalonProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchSalonById, fetchServicesBySalon, fetchSpecialistsBySalon, clientInfo } = useBooking();

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define salon details based on URL id
  const isAura = id === 'aura-studio';

  useEffect(() => {
    const loadSalonData = async () => {
      try {
        setLoading(true);
        const salonData = await fetchSalonById(id);
        const servicesData = await fetchServicesBySalon(id);
        const specialistsData = await fetchSpecialistsBySalon(id);

        setSalon(salonData);
        setServices(servicesData || []);
        setSpecialists(specialistsData || []);
      } catch (err) {
        console.error('Failed to load salon details from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSalonData();
  }, [id]);

  const handleBookClick = () => {
    navigate(`/salon/${id}/services`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-4">
        <span className="animate-spin material-symbols-outlined text-4xl text-primary">sync</span>
        <p className="font-body-lg text-secondary">Loading sanctuary details...</p>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-outline">search_off</span>
        <p className="font-body-lg text-secondary">Sanctuary not found</p>
        <button onClick={() => navigate('/search')} className="bg-primary-container text-white px-6 py-2 rounded-lg font-label-lg hover:bg-primary transition-colors">
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased pb-[80px] md:pb-0">
      
      {/* HEADER (Sticky for both viewports) */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header h-20 border-b border-outline-variant/30">
        <nav className="flex justify-between items-center px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto h-full">
          <div className="flex items-center gap-12">
            <button 
              onClick={() => navigate('/search')} 
              className="md:hidden w-10 h-10 flex items-center justify-start text-on-surface"
              aria-label="Go Back"
            >
              <span className="material-symbols-outlined block">arrow_back_ios</span>
            </button>
            <a 
              className="font-display-lg text-display-lg text-primary tracking-widest uppercase cursor-pointer"
              onClick={() => navigate('/')}
            >
              AURA
            </a>
            <div className="hidden md:flex items-center gap-8 font-label-lg">
              <button className="text-primary border-b-2 border-primary pb-1 transition-colors duration-300" onClick={() => navigate('/search')}>Salons</button>
              <button className="text-secondary pb-1 hover:text-primary transition-colors duration-300" onClick={() => navigate(`/salon/${id}/services`)}>Services</button>
              <button className="text-secondary pb-1 hover:text-primary transition-colors duration-300" onClick={() => navigate(`/salon/${id}/booking/datetime`)}>Specialists</button>
              <button className="text-secondary pb-1 hover:text-primary transition-colors duration-300" onClick={() => navigate('/specials')}>Offers</button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {clientInfo?.email ? (
              <button className="hidden md:block font-label-lg text-label-lg text-secondary hover:text-primary transition-colors" onClick={() => navigate('/owner/dashboard')}>Owner Dashboard</button>
            ) : (
              <button className="hidden md:block font-label-lg text-label-lg text-secondary hover:text-primary transition-colors" onClick={() => navigate('/login')}>Login</button>
            )}
            <button className="md:hidden w-10 h-10 flex items-center justify-end text-on-surface" aria-label="Share">
              <span className="material-symbols-outlined block">share</span>
            </button>
            <button 
              className="hidden md:block bg-primary-container text-on-primary px-8 py-3 rounded-full font-label-lg text-label-lg hover:opacity-90 transition-opacity"
              onClick={handleBookClick}
            >
              Book Now
            </button>
          </div>
        </nav>
      </header>

      {/* MAIN VIEW */}
      <main className="pt-20">
        
        {/* DESKTOP LAYOUT (md:above) */}
        <div className="hidden md:block">
          
          {/* Breadcrumb / Back button */}
          <div className="max-w-container-max mx-auto px-margin-desktop pt-6 flex items-center gap-2 text-body-sm text-on-surface-variant">
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/')}>Home</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/search')}>Search Results</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">{salon.name}</span>
          </div>
          
          {/* Hero & Interior Gallery */}
          <section className="w-full max-w-container-max mx-auto px-margin-desktop pb-stack-lg pt-4">
            <div className="flex flex-col gap-stack-sm mb-stack-md">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[20px] block">location_on</span>
                <span className="font-label-lg text-label-lg uppercase tracking-widest">{salon.location}</span>
              </div>
              <h1 className="font-display-lg text-display-lg md:text-[64px] text-on-surface leading-tight">{salon.name}</h1>
              <p className="font-body-lg text-body-lg text-secondary max-w-2xl">{salon.about}</p>
            </div>
            
            {/* Bento Gallery */}
            <div className="grid grid-cols-12 gap-gutter h-[600px] md:h-[700px]">
              <div className="col-span-8 h-full rounded-xl overflow-hidden relative group">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9IQM4A0tyNLLJQBLJKHYbekjL3jhR9kY6f3MR77M370Ii_YHzp-x-luJMPiAYL6Z5kXaoLYKx8QpN2ZTSb4DDQ72j63zbH2DZeECyXqlNhtVDwqnsu1mh2a2yw5bjAdD3kUgXVPwXCbTz98khejOha35DhGBUmdd4jsfBmDoNumYDzZfS1VUfhIPyRXsKNmqTQ5kBa9ePFAymajaxuB1MNZIe6uHT7wDWs4t2L-oLBheR8v__c4zz" 
                  alt="Gallery 1"
                />
              </div>
              <div className="col-span-4 flex flex-col gap-gutter h-full">
                <div className="h-1/2 rounded-xl overflow-hidden relative group">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdTTZbadtsbEQBuySekR_agdCVvJsemKPfJvDSe-1Pq7_hz8JXPgpSA9ELKEnpTOMzzCJprUOC6il_wNXSkSqIN3o6VJq5ABXwhUFlSdmrzysn-RY9nVMc16ZlZ9QZl3gafuUVFQqv5XHa8oJSSMmkf5RulYB53MxXvPXoTaCilnuMXkN9456cjG1qX0LIZZyIAEywtzdVJxAOX-dbARdmsCHMojjPcbDVGGJ__zpHKqnjzD_OlZzH" 
                    alt="Gallery 2"
                  />
                </div>
                <div className="h-1/2 rounded-xl overflow-hidden relative group">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxw4e5VCLKhm4FRCt9CwiA5Y1kiVtLbd5Z7oFE-3bL-NSZoi8NRrDABWo1lO8Jps9omIly0nV1b66J7C36MeUeOJfAxmNzhCycK1MVKUt0Omp5C4m6ZX-s0lUDgDJVl21mxfrg9xRiixGRRXZPB2RCjtjcOEQa8Hh3-6QSxhhSuvwaypePjf82b_sPTYl1Xtzq5p7m6ApIO2rYUDp5wetcxMAIY02qfjvPHh_I5fEwhNpRkgDnhAxS" 
                    alt="Gallery 3"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="bg-secondary-container/30 py-stack-lg">
            <div className="w-full max-w-container-max mx-auto px-margin-desktop grid grid-cols-2 gap-stack-lg items-center">
              <div className="relative">
                <div className="aspect-[4/5] rounded-xl overflow-hidden soft-glow">
                  <img 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfyXOBjoKWDlmKyQzkw06iLe63KK8_l3NsP17NkWjVmijSuGfcuzlfXDAZZBpjhoIi23HrEkyVPESZVZsnLxKMXgnospRmCy07CfVW8htTHBCKg7VA1oSZcXMYnZYBf43esr3Oc1LH5cR4pxQMnP8WpOCJ-_Qocz9ZZL-_ADHAGf9Uyy8w9zpF3vLDAy2sn-W3_iKcSWpS2l0SaBWbJ5LMe8xYTUVhq6GQR_vDhlOMpaxekSFdEnyu" 
                    alt="About"
                  />
                </div>
                <div className="absolute -bottom-8 -right-8 bg-surface p-8 rounded-xl soft-glow hidden lg:block max-w-[240px]">
                  <p className="font-display-lg text-primary text-[48px] leading-none mb-2">15+</p>
                  <p className="font-label-lg text-label-lg text-secondary uppercase tracking-tighter">Years of Mastery in French Beauty</p>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">The Luxury Approach</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{salon.description}</p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <span className="flex items-center gap-2 py-2 px-4 rounded-full bg-surface border border-outline-variant text-secondary font-label-md">
                    <span className="material-symbols-outlined text-[18px] block">workspace_premium</span> Certified Experts
                  </span>
                  <span className="flex items-center gap-2 py-2 px-4 rounded-full bg-surface border border-outline-variant text-secondary font-label-md">
                    <span className="material-symbols-outlined text-[18px] block">eco</span> Organic Products
                  </span>
                  <span className="flex items-center gap-2 py-2 px-4 rounded-full bg-surface border border-outline-variant text-secondary font-label-md">
                    <span className="material-symbols-outlined text-[18px] block">verified</span> Award Winning
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Services Teaser */}
          <section className="w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg">
            <div className="flex justify-between items-end mb-stack-lg gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Curated Services</h2>
                <p className="text-secondary font-body-md">Refined treatments tailored to your unique essence.</p>
              </div>
              <div className="flex gap-2 p-1 bg-surface-container rounded-full border border-outline-variant/30">
                <button className="px-6 py-2 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg">All</button>
                <button className="px-6 py-2 rounded-full text-secondary hover:text-primary font-label-lg text-label-lg transition-colors">Hair</button>
                <button className="px-6 py-2 rounded-full text-secondary hover:text-primary font-label-lg text-label-lg transition-colors">Color</button>
                <button className="px-6 py-2 rounded-full text-secondary hover:text-primary font-label-lg text-label-lg transition-colors">Treatments</button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-gutter">
              {services.map((svc, i) => (
                <div key={i} className="group bg-surface rounded-xl overflow-hidden soft-glow transition-all duration-500 hover:-translate-y-2 border border-outline-variant/10">
                  <div className="h-64 overflow-hidden relative">
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={svc.image} alt={svc.name} />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary font-label-lg shadow-sm">
                      ${typeof svc.price === 'number' ? svc.price.toFixed(0) : svc.price}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-headline-md text-headline-md text-on-surface">{svc.name}</h3>
                      <span className="text-secondary font-label-md">{svc.duration}</span>
                    </div>
                    <p className="text-secondary font-body-md line-clamp-2">Premium custom treatment using botanical formulations tailored to you.</p>
                    <button 
                      className="mt-4 w-full py-4 border border-primary-container text-primary font-label-lg text-label-lg rounded-lg hover:bg-primary-container hover:text-on-primary transition-all duration-300"
                      onClick={handleBookClick}
                    >
                      Select Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Specialists Teaser */}
          <section className="w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg border-t border-outline-variant/20">
            <div className="flex items-center justify-between mb-stack-md">
              <h2 className="font-headline-lg text-headline-lg">Our Specialists</h2>
              <a className="text-primary font-label-lg flex items-center gap-2 group" href="#">
                Meet the Team <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform block">arrow_forward</span>
              </a>
            </div>
            <div className="flex gap-gutter overflow-x-auto pb-8 scrollbar-hide">
              {specialists.map((sp, i) => (
                <div key={i} className="flex-shrink-0 w-72 flex flex-col items-center text-center group">
                  <div className="w-48 h-48 rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-primary-container p-1 group-hover:scale-105 transition-transform duration-500">
                    <img className="w-full h-full object-cover rounded-full" src={sp.image} alt={sp.name} />
                  </div>
                  <h4 className="font-headline-md text-headline-md">{sp.name}</h4>
                  <p className="text-secondary font-label-md uppercase tracking-wider">{sp.title}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* MOBILE LAYOUT (md:below) */}
        <div className="md:hidden block">
          
          {/* Mobile Hero Slider */}
          <section className="relative w-full overflow-hidden">
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-2 px-margin-mobile py-4">
              <div className="flex-shrink-0 w-[85vw] h-80 rounded-xl overflow-hidden snap-center soft-glow">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbp9yh0LrKy4I8mVn3Gu6ER5l2lRr7oAciJzJNhgUvjFjDqhhBrUwxU-xiOUjGjPLylweElHLqJ6qEj4KHQ_adc5ZnGQKu4rmHYQoZx6o9KHVaolvBg2jVlvEcj8zCqlzPcShac13jSOqixaG8OCaVX_FsY8sG__JLODY6uaJdKfAsz-FhxxYyFC-qS6T2GXIMSWLzfV--iciAqAQ48I-iVOgUFX1efWPltFAF36uXZyePvzdzWqSR" 
                  alt="Gallery 1"
                />
              </div>
              <div className="flex-shrink-0 w-[85vw] h-80 rounded-xl overflow-hidden snap-center soft-glow">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYafUvwC0i9KywWzJHS3V8hC7uDsIFBEOCReJNfOULw0JUiGy9P2KtUTFoPVr01bOWGULhZuxUw2-rL9gDy7NJ7vpwNizFMiYrGx7506YcXX22QsyFbQPYbalxdWZV0u13CNEwlnkA-AKCRkbOs7HCxrbHSihps_gMolCFXhdrsILUFXiYTIL9aI1mQo_MG7mGJrJf8UjZT79iRbM7OWuUhJhUkCjtpKCiCD8RjlMb5tkiL3-ZvXRY" 
                  alt="Gallery 2"
                />
              </div>
              <div className="flex-shrink-0 w-[85vw] h-80 rounded-xl overflow-hidden snap-center soft-glow">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZWY8Zv1TqAW_2uke17-T9Uab7pKPbFBSEoI9dFcnQ2pckCtLBvucASUggD3qLExJptdkJUdEmCLIEmiI9v1OwDexxOefqCTCobH4vtZIFWfvcactmF0qRlnloRwfTxZGGuYCPIhnMvXRmHXXppnr0mkVLb0OMJ_4n-_4HXT8fgMaqkV1jLMdq7ewrrSUwf7BLm1AyYtFOCIBPsgDUSpwS_ARrHEWAR29XPKk49c7VeDFz_Sr6b6yQ" 
                  alt="Gallery 3"
                />
              </div>
            </div>
            <div className="absolute bottom-8 right-8 bg-on-primary/90 px-3 py-1 rounded-full text-label-md text-on-surface-variant flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[16px] block">image</span>
              1/3
            </div>
          </section>

          {/* Mobile Identity */}
          <section className="px-margin-mobile mt-stack-md">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{salon.name}</h2>
                <p className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] block">location_on</span>
                  {salon.location}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center text-primary">
                  <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-lg ml-1">{salon.rating}</span>
                </div>
                <span className="text-label-md text-on-surface-variant">({salon.reviews} reviews)</span>
              </div>
            </div>

            {/* Mobile Call / Directions */}
            <div className="grid grid-cols-2 gap-gutter mt-stack-md">
              <a className="flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-lg text-on-surface font-label-lg active:bg-secondary-container transition-colors" href="tel:+33123456789">
                <span className="material-symbols-outlined block">call</span> Call
              </a>
              <a className="flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-lg text-on-surface font-label-lg active:bg-secondary-container transition-colors" href="#">
                <span className="material-symbols-outlined block">near_me</span> Directions
              </a>
            </div>
          </section>

          {/* Mobile Category Chips */}
          <section className="mt-stack-lg">
            <div className="flex overflow-x-auto hide-scrollbar gap-3 px-margin-mobile">
              <button className="flex-shrink-0 px-6 py-2 bg-primary text-on-primary rounded-full font-label-lg soft-glow">All</button>
              <button className="flex-shrink-0 px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-lg">Facials</button>
              <button className="flex-shrink-0 px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-lg">Massage</button>
              <button className="flex-shrink-0 px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-lg">Nails</button>
              <button className="flex-shrink-0 px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-lg">Hair</button>
            </div>
          </section>

          {/* Mobile Popular Services */}
          <section className="px-margin-mobile mt-stack-lg space-y-gutter">
            <h3 className="font-headline-md text-headline-md text-on-surface">Popular Services</h3>
            {services.map((svc, i) => (
              <div key={i} className="bg-surface-container-low rounded-xl p-stack-sm flex gap-4 soft-glow border border-transparent active:border-primary-container transition-all">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" src={svc.image} alt={svc.name} />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-label-lg text-on-surface">{svc.name}</h4>
                    <p className="text-body-sm text-on-surface-variant line-clamp-1">Luxury {svc.duration} session.</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-headline-md text-primary text-headline-md">
                      ${typeof svc.price === 'number' ? svc.price.toFixed(0) : svc.price}
                    </span>
                    <button 
                      className="text-primary font-label-lg flex items-center gap-1"
                      onClick={handleBookClick}
                    >
                      Add <span className="material-symbols-outlined text-[18px] block">add_circle</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Mobile Location Map */}
          <section className="px-margin-mobile mt-stack-lg mb-8">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-sm">Location</h3>
            <div className="w-full h-48 rounded-xl overflow-hidden soft-glow relative grayscale-[0.5]">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2ix0EOlelQYtltyeZ3LzhKjr6EYS5LyPt3qfMRHoKWw4ehFBSBekvSe6sQrStT_tzfzFdg0jxdYRA7j9QmVCUk9y3M3KZSGEu80CKx-yTyioO3sqqzOCCpIl05vdo6K_xdZuhbOPdIAdB8DAVthM4S2ZPj5QvdO8-9YEV5bUktWB9ROT6dLSbYWyVOwMzy7CkPn0bi-pLTpVtd6QP3gQX6vGJPbS5ah9R2DKU0qAGJ4CAJypQb9ef"
                alt="Map Pin Location"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-on-primary rounded-full flex items-center justify-center soft-glow shadow-sm">
                  <span className="material-symbols-outlined text-primary block" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-body-md text-on-surface">{isAura ? '124 Grand St, New York' : '18 Mercer St, New York'}</p>
            <p className="text-body-sm text-on-surface-variant">Closed • Opens 10:00 AM Tue</p>
          </section>

          {/* Sticky Mobile Booking bar */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-outline-variant/30 px-margin-mobile py-6 flex items-center justify-between shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div>
              <span className="text-label-md text-on-surface-variant block">Total Estimate</span>
              <span className="text-headline-md font-headline-md text-on-surface">$0.00</span>
            </div>
            <button 
              className="bg-primary-container text-on-primary-container px-8 h-14 rounded-lg font-label-lg flex items-center justify-center gap-2 soft-glow active:scale-95 transition-all"
              onClick={handleBookClick}
            >
              Book Now
              <span className="material-symbols-outlined block">calendar_month</span>
            </button>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="hidden md:block bg-surface-container-low border-t border-outline-variant/20 mt-12">
        <div className="flex justify-between items-center px-margin-desktop py-stack-lg w-full max-w-container-max mx-auto">
          <div className="flex flex-col items-start gap-4">
            <span className="font-headline-md text-headline-md text-primary tracking-widest uppercase">AURA</span>
            <p className="text-secondary font-body-sm max-w-xs">Connecting you with the world's most exceptional beauty and wellness destinations.</p>
          </div>
          <div className="flex gap-8">
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">About AURA</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Careers</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Us</a>
          </div>
          <div className="flex flex-col items-end gap-2 font-body-sm text-secondary">
            <p>© 2024 AURA Wellness &amp; Beauty.</p>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-[20px] block cursor-pointer">share</span>
              <span className="material-symbols-outlined text-[20px] block cursor-pointer">favorite</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Visible below 768px only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-surface-container-lowest border-t border-outline-variant/20 z-50 px-6 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <ul className="flex justify-between items-center">
          <li className="flex-1 flex flex-col items-center justify-center text-secondary hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/search')}>
            <span className="material-symbols-outlined text-[24px] mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
            <span className="font-label-md text-[10px]">Explore</span>
          </li>
          <li className="flex-1 flex flex-col items-center justify-center text-secondary hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[24px] mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>local_offer</span>
            <span className="font-label-md text-[10px]">Specials</span>
          </li>
          <li className="flex-1 flex flex-col items-center justify-center text-secondary hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/search')}>
            <span className="material-symbols-outlined text-[24px] mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_today</span>
            <span className="font-label-md text-[10px]">Bookings</span>
          </li>
          <li className="flex-1 flex flex-col items-center justify-center text-secondary hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/login')}>
            <span className="material-symbols-outlined text-[24px] mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>account_circle</span>
            <span className="font-label-md text-[10px]">Profile</span>
          </li>
        </ul>
      </nav>

    </div>
  );
};

export default SalonProfilePage;

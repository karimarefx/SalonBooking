import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { supabase } from '../supabaseClient';
import PhotoGallery from './gallery/PhotoGallery';
import { formatPrice } from '../utils/currency';

const SalonProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchSalonById, fetchServicesBySalon, fetchSpecialistsBySalon, clientInfo } = useBooking();

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsList, setReviewsList] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFormHoverRating, setReviewFormHoverRating] = useState(0);

  const defaultImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA9IQM4A0tyNLLJQBLJKHYbekjL3jhR9kY6f3MR77M370Ii_YHzp-x-luJMPiAYL6Z5kXaoLYKx8QpN2ZTSb4DDQ72j63zbH2DZeECyXqlNhtVDwqnsu1mh2a2yw5bjAdD3kUgXVPwXCbTz98khejOha35DhGBUmdd4jsfBmDoNumYDzZfS1VUfhIPyRXsKNmqTQ5kBa9ePFAymajaxuB1MNZIe6uHT7wDWs4t2L-oLBheR8v__c4zz",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCdTTZbadtsbEQBuySekR_agdCVvJsemKPfJvDSe-1Pq7_hz8JXPgpSA9ELKEnpTOMzzCJprUOC6il_wNXSkSqIN3o6VJq5ABXwhUFlSdmrzysn-RY9nVMc16ZlZ9QZl3gafuUVFQqv5XHa8oJSSMmkf5RulYB53MxXvPXoTaCilnuMXkN9456cjG1qX0LIZZyIAEywtzdVJxAOX-dbARdmsCHMojjPcbDVGGJ__zpHKqnjzD_OlZzH",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCxw4e5VCLKhm4FRCt9CwiA5Y1kiVtLbd5Z7oFE-3bL-NSZoi8NRrDABWo1lO8Jps9omIly0nV1b66J7C36MeUeOJfAxmNzhCycK1MVKUt0Omp5C4m6ZX-s0lUDgDJVl21mxfrg9xRiixGRRXZPB2RCjtjcOEQa8Hh3-6QSxhhSuvwaypePjf82b_sPTYl1Xtzq5p7m6ApIO2rYUDp5wetcxMAIY02qfjvPHh_I5fEwhNpRkgDnhAxS"
  ];

  // Define salon details based on URL id
  const isDefaultStudio = id === 'aura-studio';

  useEffect(() => {
    const loadSalonData = async () => {
      try {
        setLoading(true);
        const salonData = await fetchSalonById(id);
        const servicesData = await fetchServicesBySalon(id);
        const specialistsData = await fetchSpecialistsBySalon(id);

        // Fetch photos
        const { data: photosData, error: photosErr } = await supabase
          .from('salon_photos')
          .select('*')
          .eq('salon_id', id)
          .order('display_order', { ascending: true });

        // Fetch reviews
        const { data: reviewsData, error: reviewsErr } = await supabase
          .from('reviews')
          .select('*')
          .eq('salon_id', id)
          .order('created_at', { ascending: false });

        setSalon(salonData);
        setServices(servicesData || []);
        setSpecialists(specialistsData || []);
        if (!photosErr) {
          setPhotos(photosData || []);
        }
        if (!reviewsErr) {
          setReviewsList(reviewsData || []);
        }
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

  const totalReviewsCount = reviewsList.length > 0 ? reviewsList.length : (salon?.reviews || 0);
  const averageRating = reviewsList.length > 0
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
    : (salon?.rating || 4.8);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.email) {
      alert('Please fill in your name and email.');
      return;
    }
    setSubmittingReview(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            salon_id: id,
            client_name: reviewForm.name,
            client_email: reviewForm.email,
            rating: reviewForm.rating,
            comment: reviewForm.comment
          }
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setReviewsList([data[0], ...reviewsList]);
      }
      setIsReviewModalOpen(false);
      setReviewForm({ name: '', email: '', rating: 5, comment: '' });
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
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
        <button onClick={() => navigate('/search')} className="bg-primary-container text-on-primary px-6 py-2 rounded-lg font-label-lg hover:bg-primary transition-colors">
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body-md antialiased">
      
      {/* MAIN VIEW */}
      <main>
        
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
            <PhotoGallery photos={photos} defaultImages={defaultImages} />
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
                      {formatPrice(svc.price)}
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

          {/* Reviews Section */}
          <ReviewsSection 
            reviewsList={reviewsList} 
            averageRating={averageRating} 
            totalReviewsCount={totalReviewsCount} 
            onWriteReview={() => setIsReviewModalOpen(true)} 
          />

        </div>

        {/* MOBILE LAYOUT (md:below) */}
        <div className="md:hidden block">
          
          {/* Mobile Hero Slider */}
          <section className="relative w-full overflow-hidden pt-2">
            <PhotoGallery photos={photos} defaultImages={defaultImages} />
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
                  <span className="font-label-lg ml-1">{averageRating}</span>
                </div>
                <span className="text-label-md text-on-surface-variant">({totalReviewsCount} reviews)</span>
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
                      {formatPrice(svc.price)}
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
            <p className="mt-4 text-body-md text-on-surface">{isDefaultStudio ? 'Road 9, Maadi, Cairo' : '26 July St, Zamalek, Cairo'}</p>
            <p className="text-body-sm text-on-surface-variant">Closed • Opens 10:00 AM Tue</p>
          </section>

          {/* Reviews Section */}
          <div className="pb-24">
            <ReviewsSection 
              reviewsList={reviewsList} 
              averageRating={averageRating} 
              totalReviewsCount={totalReviewsCount} 
              onWriteReview={() => setIsReviewModalOpen(true)} 
            />
          </div>

          {/* Sticky Mobile Booking bar */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-outline-variant/30 px-margin-mobile py-6 flex items-center justify-between shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div>
              <span className="text-label-md text-on-surface-variant block">Total Estimate</span>
              <span className="text-headline-md font-headline-md text-on-surface">0 EGP</span>
            </div>
            <button 
              className="bg-primary-container text-on-primary px-8 h-14 rounded-lg font-label-lg flex items-center justify-center gap-2 soft-glow active:scale-95 transition-all"
              onClick={handleBookClick}
            >
              Book Now
              <span className="material-symbols-outlined block">calendar_month</span>
            </button>
          </div>

         </div>

      </main>

      {/* WRITE A REVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 relative">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline-md text-headline-md text-on-surface">Share Your Experience</h3>
            <p className="text-body-sm text-on-surface-variant">Your feedback helps us maintain our sanctuary standards.</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider">Your Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (reviewFormHoverRating || reviewForm.rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        onMouseEnter={() => setReviewFormHoverRating(star)}
                        onMouseLeave={() => setReviewFormHoverRating(0)}
                        className="text-primary focus:outline-none transition-transform active:scale-125"
                      >
                        <span className="material-symbols-outlined text-[32px] block" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>
                          star
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yasmin Ali"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:border-primary outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yasmin@domain.com"
                  value={reviewForm.email}
                  onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:border-primary outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider">Review Comments</label>
                <textarea
                  placeholder="Describe your styling experience..."
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:border-primary outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-lg font-semibold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[20px]">sync</span>
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// --- REUSABLE REVIEWS SECTION COMPONENT ---
const ReviewsSection = ({ reviewsList, averageRating, totalReviewsCount, onWriteReview }) => {
  const distribution = [0, 0, 0, 0, 0];
  reviewsList.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating - 1]++;
    }
  });

  const getPercent = (stars) => {
    if (reviewsList.length === 0) return stars === 5 ? '100%' : '0%';
    const count = distribution[stars - 1];
    return `${((count / reviewsList.length) * 100).toFixed(0)}%`;
  };

  return (
    <section className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg border-t border-outline-variant/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Customer Reviews</h2>
          <p className="text-secondary font-body-md mt-1">Real feedback from verified guest experiences.</p>
        </div>
        <button
          onClick={onWriteReview}
          className="px-6 py-3 bg-primary text-on-primary font-label-lg rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">rate_review</span>
          Write a Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Summary Card */}
        <div className="md:col-span-4 bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 flex flex-col items-center text-center">
          <p className="text-7xl font-bold text-primary leading-none">{averageRating}</p>
          <div className="flex items-center text-primary mt-3 gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => {
              const fill = s <= Math.round(averageRating);
              return (
                <span key={s} className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}` }}>
                  star
                </span>
              );
            })}
          </div>
          <p className="text-body-sm text-outline mt-2">Based on {totalReviewsCount} reviews</p>
        </div>

        {/* Stars Breakdown */}
        <div className="md:col-span-4 space-y-2 w-full">
          {[5, 4, 3, 2, 1].map((stars) => {
            const pct = getPercent(stars);
            return (
              <div key={stars} className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                <span className="w-3 text-right font-medium">{stars}</span>
                <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <div className="flex-grow h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: pct }} />
                </div>
                <span className="w-10 text-right text-outline">{pct}</span>
              </div>
            );
          })}
        </div>

        {/* Individual Comments */}
        <div className="md:col-span-4 space-y-4 max-h-[350px] overflow-y-auto pr-2 w-full">
          {reviewsList.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline mb-2 block">chat_bubble_outline</span>
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            reviewsList.map((review, rIdx) => {
              const initials = review.client_name ? review.client_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'G';
              return (
                <div key={rIdx} className="bg-surface p-4 rounded-xl border border-outline-variant/10 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-body-sm text-on-surface">{review.client_name}</p>
                        <div className="flex items-center text-primary text-[14px]">
                          {[1, 2, 3, 4, 5].map((s) => {
                            const fill = s <= review.rating;
                            return (
                              <span key={s} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}` }}>
                                star
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-outline">
                      {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-body-sm text-on-surface-variant leading-relaxed pl-12">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default SalonProfilePage;

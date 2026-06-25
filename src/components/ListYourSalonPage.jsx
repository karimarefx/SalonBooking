import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { geocodeAddress } from '../utils/locationUtils';

const ListYourSalonPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');

  const [salonId, setSalonId] = useState('');
  const [salonName, setSalonName] = useState('');
  const [location, setLocation] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [description, setDescription] = useState('');
  const [about, setAbout] = useState('');
  const [tagsString, setTagsString] = useState('Hair, Nails, Skincare');
  const [imageUrl, setImageUrl] = useState('');

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!email || !password || !ownerName) {
      alert('Please fill in all owner details.');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!salonId || !salonName || !location || !description || !about) {
      alert('Please fill in all salon details.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Geocode the address
      let latitude = null;
      let longitude = null;
      try {
        const coords = await geocodeAddress(streetAddress || location);
        if (coords) {
          latitude = coords.lat;
          longitude = coords.lng;
        }
      } catch (geoErr) {
        console.error('Failed to geocode address:', geoErr);
      }

      // 1. Create owner user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: ownerName,
            role: 'owner'
          }
        }
      });

      if (authError) {
        alert('Authentication Error: ' + authError.message);
        setIsSubmitting(false);
        return;
      }

      // 2. Format salon details
      const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
      const cleanSalonId = salonId.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const fallbackImg = imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYtWqmrU_PEdXrU4UF6K2acuMradFY2IuOsE0TZTXUiShdbnCg680Y5a-zVGdV8osXSPRK7D-SQ_hGk4bYQdMxi-0Ls50rp4xjko_awWKkC-y3owP9cgk1NPrqBye6xZ7gEoTGPSXJmeDbilzXg5e-JBEMTO9I50eSxhSoT46uGvLvHpTamyuRyNQqTDg19kTrPlBx7E32tSn5tMNkS_VVistCXErX_d3R14sUYzvpr3vSZhq39B60P5NXH_64OzsBzCOMWN5o1VU';

      const newSalon = {
        id: cleanSalonId,
        name: salonName,
        location: location,
        rating: 5.0,
        reviews: 1,
        about: about,
        description: description,
        image_url: fallbackImg,
        tags: tags,
        owner_email: email,
        latitude: latitude,
        longitude: longitude
      };

      // 3. Insert into public.salons
      const { error: dbError } = await supabase
        .from('salons')
        .insert([newSalon]);

      if (dbError) {
        alert('Database Error: ' + dbError.message);
        setIsSubmitting(false);
        return;
      }

      // The Supabase auth session is set, AuthContext will pick it up automatically
      // No need to manually sync clientInfo — just navigate to dashboard
      navigate('/owner/dashboard');

    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased">

      {/* Main portal grid */}
      <main className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Marketing benefits */}
        <section className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
          <span className="font-label-lg text-primary uppercase tracking-[0.2em] font-semibold">Aura for Business</span>
          <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface leading-tight">Elevate Your Salon & Reach Discerning Clients.</h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Join a curated marketplace designed for premium beauty and wellness businesses. Gain tools to manage appointments, specialists, and growth effortlessly.
          </p>

          <div className="space-y-6 pt-4">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary text-3xl font-light">groups</span>
              <div>
                <h4 className="font-label-lg text-lg text-on-surface font-semibold">Premium Exposure</h4>
                <p className="text-body-sm text-on-surface-variant">Get displayed to high-intent clients seeking top-tier aesthetic experiences.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary text-3xl font-light">calendar_month</span>
              <div>
                <h4 className="font-label-lg text-lg text-on-surface font-semibold">Effortless Scheduling</h4>
                <p className="text-body-sm text-on-surface-variant">An automated calendar that tracks reservations, specialist workloads, and statuses.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary text-3xl font-light">monitoring</span>
              <div>
                <h4 className="font-label-lg text-lg text-on-surface font-semibold">Business Intelligence</h4>
                <p className="text-body-sm text-on-surface-variant">Detailed revenue reports, popular services breakdown, and booking trends.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Step Registration Form */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-outline-variant/30 soft-glow shadow-lg p-6 md:p-10">
          
          {/* Progress Tracker */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/20">
            <div>
              <span className="text-xs uppercase tracking-wider text-outline">Step {step} of 2</span>
              <h2 className="font-headline-md text-2xl text-on-surface mt-0.5">
                {step === 1 ? 'Owner Account Credentials' : 'Salon Business Details'}
              </h2>
            </div>
            <div className="flex gap-2">
              <span className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-primary' : 'bg-outline-variant'}`}></span>
              <span className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-primary' : 'bg-outline-variant'}`}></span>
            </div>
          </div>

          {step === 1 ? (
            /* STEP 1: Owner account details */
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="space-y-2">
                <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="ownerName">Full Name</label>
                <input 
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                  id="ownerName" 
                  placeholder="Isabella Rossi" 
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="email">Email Address</label>
                <input 
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                  id="email" 
                  placeholder="you@salon.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="password">Password (Min 6 chars)</label>
                <input 
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                  id="password" 
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-lg text-label-lg uppercase tracking-widest hover:opacity-95 transition-opacity cursor-pointer font-semibold shadow-sm flex items-center justify-center gap-2"
              >
                <span>Continue to Salon Info</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          ) : (
            /* STEP 2: Salon business profile */
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="salonName">Salon Name</label>
                  <input 
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                    id="salonName" 
                    placeholder="Luxe Beauty Lounge" 
                    type="text"
                    required
                    value={salonName}
                    onChange={(e) => {
                      setSalonName(e.target.value);
                      if (!salonId) {
                        setSalonId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="salonId">Unique URL slug</label>
                  <input 
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none text-primary font-semibold" 
                    id="salonId" 
                    placeholder="luxe-beauty-lounge" 
                    type="text"
                    required
                    value={salonId}
                    onChange={(e) => setSalonId(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="location">Neighborhood / Area (for display)</label>
                <input 
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                  id="location" 
                  placeholder="Flatiron, Manhattan" 
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="streetAddress">Full Street Address (for distance/geocoding)</label>
                <input 
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                  id="streetAddress" 
                  placeholder="123 Fifth Ave, New York, NY 10010" 
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="description">Short Bio / Punchline</label>
                <input 
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                  id="description" 
                  placeholder="Where modern aesthetics meet sustainable wellness." 
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="about">Detailed Description (About)</label>
                <textarea 
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none h-24 resize-none" 
                  id="about" 
                  placeholder="Describe your salon, facilities, services, sanitation, organic brands..." 
                  required
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="tagsString">Categories / Tags (comma separated)</label>
                  <input 
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                    id="tagsString" 
                    placeholder="Massage, Haircut, Facial" 
                    type="text"
                    value={tagsString}
                    onChange={(e) => setTagsString(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="imageUrl">Banner Image URL (Optional)</label>
                  <input 
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                    id="imageUrl" 
                    placeholder="https://example.com/salon.jpg" 
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-1/3 border border-outline text-on-surface-variant py-4 rounded-lg font-label-lg text-label-lg uppercase tracking-wider hover:bg-surface-container transition-colors cursor-pointer font-semibold shadow-sm active:scale-95"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-2/3 bg-primary text-on-primary py-4 rounded-lg font-label-lg text-label-lg uppercase tracking-widest hover:opacity-95 transition-opacity cursor-pointer font-semibold shadow-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-white text-sm">sync</span>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <span>List My Salon</span>
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </section>
      </main>

    </div>
  );
};

export default ListYourSalonPage;

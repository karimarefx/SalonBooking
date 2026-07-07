import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { geocodeAddress } from '../utils/locationUtils';

const EGYPTIAN_CITIES = [
  'Cairo', 'New Cairo', 'Maadi', 'Zamalek', 'Heliopolis',
  'Giza', '6th of October', 'Sheikh Zayed',
  'Alexandria', 'Mansoura', 'Tanta', 'Hurghada', 'Sahel'
];

const DEFAULT_SERVICES = [
  { name: 'Signature Haircut', price: 350, duration: '60 min', category: 'Haircut & Styling', description: 'Precision cut, wash, and style by a master stylist.' },
  { name: 'Hair Blowout', price: 200, duration: '45 min', category: 'Haircut & Styling', description: 'Wash, conditioning, and professional styling.' },
  { name: 'Gel Manicure', price: 250, duration: '45 min', category: 'Nails', description: 'Nail shaping, cuticle care, and gel polish finish.' },
  { name: 'Relaxing Facial', price: 400, duration: '60 min', category: 'Skincare', description: 'Hydrating scalp massage and deep cleansing facial treatment.' }
];

const DEFAULT_SPECIALISTS = [
  { name: 'Amira Kamel', title: 'Master Stylist', rating: 5.0 },
  { name: 'Youssef Mansour', title: 'Nail Artist', rating: 4.9 }
];

const SalonOnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Salon Details, 2: Services, 3: Specialists, 4: Review
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states - Step 1: Salon
  const [salonName, setSalonName] = useState('');
  const [salonId, setSalonId] = useState('');
  const [locationCity, setLocationCity] = useState('Cairo');
  const [streetAddress, setStreetAddress] = useState('');
  const [description, setDescription] = useState('');
  const [about, setAbout] = useState('');
  const [tagsString, setTagsString] = useState('Hair, Nails, Styling');
  const [imageUrl, setImageUrl] = useState('');

  // Form states - Step 2: Services
  const [selectedDefaultServices, setSelectedDefaultServices] = useState([0, 1]); // default checked
  const [customServices, setCustomServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', price: '', duration: '45', category: 'Haircut & Styling', description: '' });

  // Form states - Step 3: Specialists
  const [selectedDefaultSpecialists, setSelectedDefaultSpecialists] = useState([0, 1]);
  const [customSpecialists, setCustomSpecialists] = useState([]);
  const [newSpecialist, setNewSpecialist] = useState({ name: '', title: '' });

  // Navigation validation
  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!salonName || !salonId || !locationCity || !streetAddress || !description || !about) {
      alert('Please fill out all required fields.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    const totalServicesCount = selectedDefaultServices.length + customServices.length;
    if (totalServicesCount === 0) {
      alert('Please select or add at least one service for your menu.');
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = () => {
    const totalSpecsCount = selectedDefaultSpecialists.length + customSpecialists.length;
    if (totalSpecsCount === 0) {
      alert('Please select or add at least one specialist for your salon.');
      return;
    }
    setStep(4);
  };

  // Add custom elements
  const addCustomService = (e) => {
    e.preventDefault();
    if (!newService.name || !newService.price) {
      alert('Please enter service name and price.');
      return;
    }
    setCustomServices([...customServices, { ...newService, price: parseFloat(newService.price), duration: newService.duration + ' min' }]);
    setNewService({ name: '', price: '', duration: '45', category: 'Haircut & Styling', description: '' });
  };

  const addCustomSpecialist = (e) => {
    e.preventDefault();
    if (!newSpecialist.name || !newSpecialist.title) {
      alert('Please enter specialist name and title.');
      return;
    }
    setCustomSpecialists([...customSpecialists, { ...newSpecialist, rating: 5.0 }]);
    setNewSpecialist({ name: '', title: '' });
  };

  const handlePublish = async () => {
    if (!user?.email) {
      alert('You must be signed in to create a salon.');
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. Geocode address
      let latitude = 30.0444; // Cairo fallback
      let longitude = 31.2357;
      try {
        const coords = await geocodeAddress(`${streetAddress}, ${locationCity}, Egypt`);
        if (coords) {
          latitude = coords.lat;
          longitude = coords.lng;
        }
      } catch (geoErr) {
        console.error('Failed to geocode:', geoErr);
      }

      const cleanSalonId = salonId.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      const fallbackImg = imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYtWqmrU_PEdXrU4UF6K2acuMradFY2IuOsE0TZTXUiShdbnCg680Y5a-zVGdV8osXSPRK7D-SQ_hGk4bYQdMxi-0Ls50rp4xjko_awWKkC-y3owP9cgk1NPrqBye6xZ7gEoTGPSXJmeDbilzXg5e-JBEMTO9I50eSxhSoT46uGvLvHpTamyuRyNQqTDg19kTrPlBx7E32tSn5tMNkS_VVistCXErX_d3R14sUYzvpr3vSZhq39B60P5NXH_64OzsBzCOMWN5o1VU';

      const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);

      // 2. Insert Salon
      const { error: salonError } = await supabase.from('salons').insert([{
        id: cleanSalonId,
        name: salonName,
        location: `${locationCity}, Egypt`,
        rating: 5.0,
        reviews: 0,
        about,
        description,
        image_url: fallbackImg,
        tags,
        owner_email: user.email,
        latitude,
        longitude
      }]);

      if (salonError) throw salonError;

      // 3. Compile and Insert Services
      const servicesToInsert = [
        ...selectedDefaultServices.map(idx => DEFAULT_SERVICES[idx]),
        ...customServices
      ].map(s => ({
        salon_id: cleanSalonId,
        name: s.name,
        price: s.price,
        duration: s.duration,
        category: s.category,
        description: s.description,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9KMCVZhBF5MNZ0aPhlOfI-ig4B-y-KmDP6jIeW0aTYqxNpQl6mF31hSEslIPpruWkNJAIWbczrZE0AUFJog05Y3cN7B9LcORhbyi7KyAP6w6K8yTNPKACVkO0xu3BUVDv-zNpiJhbbQTpi0BEHNnrgoTjCu347oAjRB4eHOoSWvLjyex5ZyxQYOlkBVsjJjzJsMu5IiTM9_TnI5pfq63N_JNp3UenRUMPKxQIWv-S3mJspWtZG9rb'
      }));

      const { error: servicesError } = await supabase.from('services').insert(servicesToInsert);
      if (servicesError) throw servicesError;

      // 4. Compile and Insert Specialists
      const defaultSchedule = {
        monday:    { enabled: true,  start: '09:00', end: '18:00' },
        tuesday:   { enabled: true,  start: '09:00', end: '18:00' },
        wednesday: { enabled: true,  start: '09:00', end: '18:00' },
        thursday:  { enabled: true,  start: '09:00', end: '18:00' },
        friday:    { enabled: true,  start: '09:00', end: '18:00' },
        saturday:  { enabled: true,  start: '10:00', end: '16:00' },
        sunday:    { enabled: false, start: '09:00', end: '18:00' },
      };

      const specialistsToInsert = [
        ...selectedDefaultSpecialists.map(idx => DEFAULT_SPECIALISTS[idx]),
        ...customSpecialists
      ].map(sp => ({
        salon_id: cleanSalonId,
        name: sp.name,
        title: sp.title,
        rating: sp.rating,
        schedule: defaultSchedule,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA11Dqp17R4H87N_xWha2fwH4Y82r5R7K2HKtCjPBGDFA76caP_JbNGcW_F0zxJOQRn11IBA5RQ5FsHWTOY4WGaAbdqh3A2Fnqyq0576tEVulHfjWvO73nWPyrVPbDJlZ47jAttprfx3IilQp9_5KLz1CrHd5Tu7a-qEr8ZP7VIKe7jAT42Sa-4FRz-EUXakFgO6VoNB3oz0vsWEC6g9uWrID_5qoVIpW2oFLqebflGF3eDSPJSDunH'
      }));

      const { error: specialistsError } = await supabase.from('specialists').insert(specialistsToInsert);
      if (specialistsError) throw specialistsError;

      alert('🎉 Congratulations! Your salon is now live on Miraia!');
      navigate('/owner/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to launch salon: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased pb-32">
      <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
        
        {/* PROGRESS TRACKER */}
        <div className="w-full max-w-2xl mx-auto mb-10 text-center">
          <span className="font-label-lg text-primary uppercase tracking-[0.2em] font-semibold text-xs">Salon Setup Wizard</span>
          <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface mt-2 mb-8">Register Your Sanctuary</h1>
          
          <div className="flex justify-between items-center max-w-md mx-auto mb-4 text-xs font-semibold text-on-surface-variant">
            <span className={step >= 1 ? 'text-primary font-bold' : ''}>1. Details</span>
            <span className={step >= 2 ? 'text-primary font-bold' : ''}>2. Services</span>
            <span className={step >= 3 ? 'text-primary font-bold' : ''}>3. Specialists</span>
            <span className={step >= 4 ? 'text-primary font-bold' : ''}>4. Review</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-outline-variant/30 soft-glow shadow-md p-6 md:p-10">

          {/* STEP 1: SALON DETAILS */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-6">
              <h2 className="font-headline-md text-2xl text-on-surface border-b border-outline-variant/20 pb-3">About Your Business</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant">Salon Name</label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none"
                    placeholder="E.g. Atelier Miraia"
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
                  <label className="block font-label-lg text-label-lg text-on-surface-variant">Unique URL Slug</label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-primary font-semibold outline-none"
                    placeholder="e.g. atelier-miraia"
                    type="text"
                    required
                    value={salonId}
                    onChange={(e) => setSalonId(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant">City</label>
                  <select
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 font-body-md text-on-surface outline-none"
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                  >
                    {EGYPTIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant">Street Address (for client map sorting)</label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none"
                    placeholder="E.g. 15 Street 9, Maadi"
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-label-lg text-label-lg text-on-surface-variant">Oneliner Slogan</label>
                <input
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none"
                  placeholder="Where elegance meets holistic hair artistry"
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-label-lg text-label-lg text-on-surface-variant">Detailed Biography (About)</label>
                <textarea
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none h-24 resize-none"
                  placeholder="Tell clients about your aesthetics, specialities, organic products, coffee bar..."
                  required
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant">Aesthetic Tags (comma separated)</label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none"
                    placeholder="Hair, Balayage, Manicure, Skincare"
                    type="text"
                    value={tagsString}
                    onChange={(e) => setTagsString(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant">Cover Image URL (Optional)</label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none"
                    placeholder="https://example.com/cover.jpg"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-lg text-label-lg uppercase tracking-wider hover:opacity-95 cursor-pointer font-semibold shadow-sm active:scale-98 transition-transform flex items-center justify-center gap-2"
              >
                <span>Define Your Menu</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          )}

          {/* STEP 2: SERVICES */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-headline-md text-2xl text-on-surface border-b border-outline-variant/20 pb-3">Service Menu</h2>
              
              {/* Default presets */}
              <div className="space-y-3">
                <p className="font-label-lg text-on-surface-variant">Select standard services to launch with:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DEFAULT_SERVICES.map((s, idx) => {
                    const isChecked = selectedDefaultServices.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedDefaultServices(selectedDefaultServices.filter(i => i !== idx));
                          } else {
                            setSelectedDefaultServices([...selectedDefaultServices, idx]);
                          }
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-start ${isChecked ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-outline'}`}
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-on-surface text-sm">{s.name}</p>
                          <p className="text-xs text-outline">{s.duration} • {s.price} EGP</p>
                          <p className="text-[11px] text-on-surface-variant leading-snug">{s.description}</p>
                        </div>
                        <span className="material-symbols-outlined text-primary font-bold text-lg select-none">
                          {isChecked ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom services list */}
              {customServices.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-outline-variant/15">
                  <p className="font-label-lg text-on-surface-variant">Your custom services:</p>
                  <div className="space-y-2">
                    {customServices.map((cs, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-surface-container rounded-lg">
                        <div>
                          <span className="font-semibold text-sm text-on-surface">{cs.name}</span>
                          <span className="text-xs text-secondary ml-3">({cs.category}) • {cs.duration} • {cs.price} EGP</span>
                        </div>
                        <button
                          onClick={() => setCustomServices(customServices.filter((_, idx) => idx !== i))}
                          className="text-error hover:bg-error-container p-1 rounded-full"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form to add custom service */}
              <form onSubmit={addCustomService} className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/35 space-y-4 pt-4 mt-6">
                <p className="font-label-lg text-primary font-bold text-xs uppercase tracking-wider">Add Custom Service</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    className="bg-white border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-sm outline-none focus:border-primary"
                    placeholder="Service Name (e.g. Balayage)"
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  />
                  <input
                    className="bg-white border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-sm outline-none focus:border-primary"
                    placeholder="Price (EGP)"
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <input
                      className="bg-white border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-sm outline-none focus:border-primary w-24"
                      placeholder="Mins"
                      type="number"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    />
                    <select
                      className="bg-white border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-xs outline-none focus:border-primary flex-1"
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    >
                      <option value="Haircut & Styling">Haircut</option>
                      <option value="Nails">Nails</option>
                      <option value="Skincare">Skincare</option>
                      <option value="Treatments">Treatments</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-secondary text-white font-label-lg text-xs px-5 py-2.5 rounded-lg font-semibold hover:bg-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Add Service</span>
                </button>
              </form>

              <div className="flex gap-4 pt-6 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 border border-outline text-on-surface-variant py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-surface-container"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="w-2/3 bg-primary text-on-primary py-3 rounded-lg font-semibold uppercase tracking-wider hover:opacity-95 flex items-center justify-center gap-2"
                >
                  <span>Add Salon Specialists</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SPECIALISTS */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-headline-md text-2xl text-on-surface border-b border-outline-variant/20 pb-3">Specialists</h2>
              
              <div className="space-y-3">
                <p className="font-label-lg text-on-surface-variant">Choose initial team specialists to display:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DEFAULT_SPECIALISTS.map((sp, idx) => {
                    const isChecked = selectedDefaultSpecialists.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedDefaultSpecialists(selectedDefaultSpecialists.filter(i => i !== idx));
                          } else {
                            setSelectedDefaultSpecialists([...selectedDefaultSpecialists, idx]);
                          }
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${isChecked ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-outline'}`}
                      >
                        <div>
                          <p className="font-semibold text-on-surface text-sm">{sp.name}</p>
                          <p className="text-xs text-outline">{sp.title}</p>
                        </div>
                        <span className="material-symbols-outlined text-primary font-bold text-lg select-none">
                          {isChecked ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom specialists list */}
              {customSpecialists.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-outline-variant/15">
                  <p className="font-label-lg text-on-surface-variant">Your custom specialists:</p>
                  <div className="space-y-2">
                    {customSpecialists.map((sp, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-surface-container rounded-lg">
                        <div>
                          <span className="font-semibold text-sm text-on-surface">{sp.name}</span>
                          <span className="text-xs text-secondary ml-3">{sp.title}</span>
                        </div>
                        <button
                          onClick={() => setCustomSpecialists(customSpecialists.filter((_, idx) => idx !== i))}
                          className="text-error hover:bg-error-container p-1 rounded-full"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form to add custom specialist */}
              <form onSubmit={addCustomSpecialist} className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/35 space-y-4 pt-4 mt-6">
                <p className="font-label-lg text-primary font-bold text-xs uppercase tracking-wider">Add Custom Specialist</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="bg-white border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-sm outline-none focus:border-primary"
                    placeholder="Specialist Name (e.g. Hana M.)"
                    type="text"
                    value={newSpecialist.name}
                    onChange={(e) => setNewSpecialist({ ...newSpecialist, name: e.target.value })}
                  />
                  <input
                    className="bg-white border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-sm outline-none focus:border-primary"
                    placeholder="Title (e.g. Balayage Expert)"
                    type="text"
                    value={newSpecialist.title}
                    onChange={(e) => setNewSpecialist({ ...newSpecialist, title: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-secondary text-white font-label-lg text-xs px-5 py-2.5 rounded-lg font-semibold hover:bg-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Add Specialist</span>
                </button>
              </form>

              <div className="flex gap-4 pt-6 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 border border-outline text-on-surface-variant py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-surface-container"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep3}
                  className="w-2/3 bg-primary text-on-primary py-3 rounded-lg font-semibold uppercase tracking-wider hover:opacity-95 flex items-center justify-center gap-2"
                >
                  <span>Review Details</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PUBLISH */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-headline-md text-2xl text-on-surface border-b border-outline-variant/20 pb-3">Final Review</h2>
              
              <div className="space-y-4 text-on-surface-variant font-body-sm">
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-outline-variant/10">
                  <span className="font-semibold text-on-surface">Salon Name:</span>
                  <span className="col-span-2 font-medium">{salonName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-outline-variant/10">
                  <span className="font-semibold text-on-surface">Location:</span>
                  <span className="col-span-2 font-medium">{locationCity}, Egypt ({streetAddress})</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-outline-variant/10">
                  <span className="font-semibold text-on-surface">Categories:</span>
                  <span className="col-span-2 font-medium">{tagsString}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-outline-variant/10">
                  <span className="font-semibold text-on-surface">Total Services:</span>
                  <span className="col-span-2 font-medium">{selectedDefaultServices.length + customServices.length} Treatments</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-outline-variant/10">
                  <span className="font-semibold text-on-surface">Total Specialists:</span>
                  <span className="col-span-2 font-medium">{selectedDefaultSpecialists.length + customSpecialists.length} Experts</span>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex gap-3 items-start mt-6">
                <span className="material-symbols-outlined text-primary text-xl font-light">info</span>
                <p className="text-xs text-on-surface-variant leading-snug">
                  By clicking "Publish Salon", your profile will be registered and displayed instantly in search results for {locationCity} and surrounding areas.
                </p>
              </div>

              <div className="flex gap-4 pt-6 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-1/3 border border-outline text-on-surface-variant py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-surface-container"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="w-2/3 bg-primary text-on-primary py-3 rounded-lg font-semibold uppercase tracking-wider hover:opacity-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-white text-sm">sync</span>
                      <span>Launching...</span>
                    </>
                  ) : (
                    <>
                      <span>Publish Salon</span>
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SalonOnboardingPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const DateTimePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedServices, 
    selectedSpecialist, 
    setSelectedSpecialist, 
    selectedDate, 
    setSelectedDate, 
    selectedTime, 
    setSelectedTime,
    fetchSalonById,
    fetchSpecialistsBySalon
  } = useBooking();

  const [salon, setSalon] = useState(null);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const salonData = await fetchSalonById(id);
        const specialistsData = await fetchSpecialistsBySalon(id);
        setSalon(salonData);
        setSpecialists(specialistsData || []);
      } catch (err) {
        console.error('Error loading specialist selection details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const salonName = salon?.name || 'Sanctuary';

  // Default date selection to "Dec 6" or current if not set
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate('Friday, Dec 6');
    }
    if (!selectedSpecialist) {
      setSelectedSpecialist({ name: 'Any Specialist', title: 'Earliest availability' });
    }
    if (!selectedTime) {
      setSelectedTime('01:00 PM');
    }
  }, [selectedDate, selectedSpecialist, selectedTime, setSelectedDate, setSelectedSpecialist, setSelectedTime]);

  const totalServicePrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const tax = totalServicePrice * 0.08; // 8% tax
  const totalAmount = totalServicePrice + tax;

  const handleConfirm = () => {
    if (selectedSpecialist && selectedDate && selectedTime) {
      navigate(`/salon/${id}/booking/confirm`);
    }
  };

  const handleBack = () => {
    navigate(`/salon/${id}/services`);
  };

  const calendarDays = [
    { day: '28', current: false }, { day: '29', current: false }, { day: '30', current: false },
    { day: '1', current: true }, { day: '2', current: true }, { day: '3', current: true },
    { day: '4', current: true }, { day: '5', current: true }, { day: '6', current: true },
    { day: '7', current: true }, { day: '8', current: true }, { day: '9', current: true },
    { day: '10', current: true }, { day: '11', current: true }
  ];

  const timeSlots = [
    { time: '09:00 AM', period: 'Morning', icon: 'light_mode' },
    { time: '10:30 AM', period: 'Morning', icon: 'light_mode' },
    { time: '11:15 AM', period: 'Morning', icon: 'light_mode' },
    { time: '01:00 PM', period: 'Afternoon', icon: 'sunny' },
    { time: '02:30 PM', period: 'Afternoon', icon: 'sunny' },
    { time: '04:00 PM', period: 'Afternoon', icon: 'sunny' },
    { time: '05:30 PM', period: 'Afternoon', icon: 'sunny', disabled: true }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-4">
        <span className="animate-spin material-symbols-outlined text-4xl text-primary">sync</span>
        <p className="font-body-lg text-secondary">Loading sanctuary specialists...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased pb-32">
      
      {/* DESKTOP HEADER */}
      <header className="hidden md:block bg-surface dark:bg-on-surface w-full top-0 sticky z-50 border-b border-outline-variant/30">
        <nav className="flex justify-between items-center px-margin-desktop w-full max-w-container-max mx-auto h-20">
          <span 
            onClick={() => navigate('/')} 
            className="font-display-lg text-display-lg text-primary tracking-widest uppercase cursor-pointer"
          >
            AURA
          </span>
          <nav className="hidden md:flex gap-gutter items-center">
            <span className="font-label-lg text-label-lg text-secondary cursor-pointer" onClick={() => navigate('/search')}>Salons</span>
            <span className="font-label-lg text-label-lg text-secondary cursor-pointer" onClick={handleBack}>Services</span>
            <span className="font-label-lg text-label-lg text-primary border-b-2 border-primary pb-1 cursor-pointer">Specialists</span>
            <span className="font-label-lg text-label-lg text-secondary cursor-pointer">Offers</span>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="font-label-lg text-label-lg text-secondary px-4 py-2 hover:text-primary transition-colors">Login</button>
            <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-lg text-label-lg uppercase tracking-wider hover:opacity-90 transition-all">Book Now</button>
          </div>
        </nav>
      </header>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 z-50 bg-surface h-16 flex items-center px-margin-mobile border-b border-outline-variant/10 shadow-sm">
        <button onClick={handleBack} className="w-10 h-10 flex items-center justify-start text-secondary">
          <span className="material-symbols-outlined font-light">arrow_back_ios</span>
        </button>
        <div className="flex-grow text-center">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight">AURA</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-end text-secondary">
          <span className="material-symbols-outlined">info</span>
        </button>
      </header>

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
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={handleBack}>Select Services</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Select Specialist & Time</span>
        </div>

        {/* PROGRESS TRACKER */}
        <div className="w-full max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-primary font-label-lg text-label-lg">STEP 2: SPECIALIST & TIME</span>
            <span className="text-outline font-label-lg text-label-lg">STEP 3: CONFIRM BOOKING</span>
          </div>
          <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3 transition-all duration-700 ease-out"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* LEFT SECTION: Picker Content */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* SPECIALIST PICKER */}
            <section className="space-y-4">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Choose a Specialist</h2>
              
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                {/* Any Specialist Option */}
                <button 
                  onClick={() => setSelectedSpecialist({ name: 'Any Specialist', title: 'Earliest availability' })}
                  className={`flex-shrink-0 w-44 h-64 rounded-lg border-2 p-4 text-center transition-all hover:soft-glow snap-start flex flex-col items-center justify-center cursor-pointer ${selectedSpecialist?.name === 'Any Specialist' ? 'border-primary bg-primary-container/10' : 'border-outline-variant bg-surface'}`}
                >
                  <div className="w-20 h-20 rounded-full bg-on-primary flex items-center justify-center mb-4 border border-outline-variant">
                    <span className="material-symbols-outlined text-[32px] text-primary">groups</span>
                  </div>
                  <p className="font-label-lg text-primary font-semibold">Any Specialist</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Earliest availability</p>
                </button>

                {/* Team Specialists */}
                {specialists.map((sp, idx) => {
                  const isSpSelected = selectedSpecialist?.name === sp.name;
                  return (
                    <button 
                      key={idx}
                      onClick={() => setSelectedSpecialist(sp)}
                      className={`flex-shrink-0 w-48 h-64 rounded-lg border p-0 hover:border-primary group transition-all hover:soft-glow snap-start text-left overflow-hidden cursor-pointer ${isSpSelected ? 'border-primary bg-primary-container/10 ring-4 ring-primary-container/10' : 'border-outline-variant bg-surface'}`}
                    >
                      <div className="h-1/2 w-full bg-surface-container overflow-hidden relative">
                        <img className={`w-full h-full object-cover transition-all duration-500 ${isSpSelected ? '' : 'grayscale group-hover:grayscale-0'}`} src={sp.image || sp.img} alt={sp.name} />
                        {isSpSelected && (
                          <div className="absolute bottom-2 right-2 bg-primary-container text-white rounded-full p-1 border border-white">
                            <span className="material-symbols-outlined text-[16px] block" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-label-lg text-on-surface font-semibold">{sp.name}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{sp.title}</p>
                        <div className="flex items-center mt-2 text-primary">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-[12px] font-semibold ml-1">{sp.rating}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* DATE & TIME PICKER PANEL */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              
              {/* Calendar Grid */}
              <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline-md text-headline-md">Select Date</h3>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
                    <button className="p-2 rounded-full hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <span className="font-label-lg text-primary uppercase tracking-widest font-semibold">December 2024</span>
                </div>
                <div className="grid grid-cols-7 gap-y-2 text-center text-on-surface-variant">
                  <div className="font-label-md text-label-md py-2">Mo</div>
                  <div className="font-label-md text-label-md py-2">Tu</div>
                  <div className="font-label-md text-label-md py-2">We</div>
                  <div className="font-label-md text-label-md py-2">Th</div>
                  <div className="font-label-md text-label-md py-2">Fr</div>
                  <div className="font-label-md text-label-md py-2">Sa</div>
                  <div className="font-label-md text-label-md py-2">Su</div>
                  
                  {calendarDays.map((d, index) => {
                    const dateVal = `Friday, Dec ${d.day}`;
                    const isDaySelected = selectedDate === dateVal || (d.day === '6' && selectedDate === 'Friday, Dec 6');
                    
                    if (!d.current) {
                      return <div key={index} className="py-3 text-outline/40">{d.day}</div>;
                    }
                    return (
                      <div 
                        key={index} 
                        onClick={() => setSelectedDate(`Friday, Dec ${d.day}`)}
                        className={`py-3 font-body-md rounded-lg cursor-pointer transition-colors ${isDaySelected ? 'bg-primary text-on-primary shadow-md font-semibold' : 'hover:bg-white text-on-surface'}`}
                      >
                        {d.day}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30 flex flex-col">
                <h3 className="font-headline-md text-headline-md mb-6">Available Times</h3>
                
                <div className="space-y-6 flex-grow">
                  {/* Morning Slots */}
                  <div>
                    <p className="text-label-md text-outline uppercase tracking-widest mb-3 flex items-center gap-2 font-semibold">
                      <span className="material-symbols-outlined text-[16px]">light_mode</span> Morning
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.filter(t => t.period === 'Morning').map((t, idx) => {
                        const isTimeSelected = selectedTime === t.time;
                        return (
                          <button
                            key={idx}
                            disabled={t.disabled}
                            onClick={() => setSelectedTime(t.time)}
                            className={`py-3 px-4 rounded-lg transition-all text-center border font-label-lg text-label-lg cursor-pointer ${isTimeSelected ? 'bg-primary text-on-primary border-primary shadow-md' : 'bg-white text-on-surface border-outline-variant hover:border-primary'}`}
                          >
                            {t.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Afternoon Slots */}
                  <div>
                    <p className="text-label-md text-outline uppercase tracking-widest mb-3 flex items-center gap-2 font-semibold">
                      <span className="material-symbols-outlined text-[16px]">sunny</span> Afternoon
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.filter(t => t.period === 'Afternoon').map((t, idx) => {
                        const isTimeSelected = selectedTime === t.time;
                        if (t.disabled) {
                          return (
                            <button
                              key={idx}
                              disabled
                              className="py-3 px-4 opacity-40 bg-surface-container text-on-surface-variant rounded-lg text-center cursor-not-allowed line-through font-label-lg text-label-lg"
                            >
                              {t.time}
                            </button>
                          );
                        }
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedTime(t.time)}
                            className={`py-3 px-4 rounded-lg transition-all text-center border font-label-lg text-label-lg cursor-pointer ${isTimeSelected ? 'bg-primary text-on-primary border-primary shadow-md' : 'bg-white text-on-surface border-outline-variant hover:border-primary'}`}
                          >
                            {t.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </section>

          </div>

          {/* RIGHT COLUMN: Booking Summary Sticky */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl soft-glow border border-primary-container/20 overflow-hidden shadow-sm">
              <div className="bg-primary/5 p-6 border-b border-outline-variant/30">
                <h3 className="font-headline-md text-headline-md text-primary font-semibold">Booking Summary</h3>
              </div>
              <div className="p-6 space-y-6">
                
                {/* Selected Services Info */}
                <div className="space-y-4">
                  <p className="text-label-md text-outline uppercase tracking-widest mb-2 font-semibold">Selected Treatments</p>
                  {selectedServices.map((svc, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-3 border-b border-outline-variant/20 last:border-b-0 last:pb-0">
                      <div className="w-16 h-16 rounded-lg bg-secondary-container flex-shrink-0 overflow-hidden">
                        <img className="w-full h-full object-cover" src={svc.img || svc.image} alt={svc.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-label-lg text-on-surface font-semibold truncate">{svc.name}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{svc.duration} Minutes • ${svc.price}</p>
                      </div>
                    </div>
                  ))}
                  {selectedServices.length === 0 && (
                    <p className="text-body-sm text-outline-variant">No treatments selected. Please go back.</p>
                  )}
                </div>

                {/* Selected Specialist */}
                <div className="pt-4 border-t border-outline-variant/20">
                  <p className="text-label-md text-outline uppercase tracking-widest mb-2 font-semibold">Specialist</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">person_check</span>
                      <span className="font-body-md text-on-surface">{selectedSpecialist ? selectedSpecialist.name : 'Not selected'}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Date/Time */}
                <div className="pt-4 border-t border-outline-variant/20">
                  <p className="text-label-md text-outline uppercase tracking-widest mb-2 font-semibold">Date & Time</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">calendar_today</span>
                      <span className="font-body-md text-on-surface">{selectedDate} • {selectedTime}</span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-outline-variant/20 space-y-2">
                  <div className="flex justify-between font-body-sm text-on-surface-variant">
                    <span>Service Fee</span>
                    <span>${totalServicePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-body-sm text-on-surface-variant">
                    <span>Taxes (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-label-lg text-lg pt-2 text-on-surface border-t border-outline-variant/20 font-semibold">
                    <span>Total Amount</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Continue Action */}
                <button 
                  onClick={handleConfirm}
                  disabled={!selectedSpecialist || !selectedDate || !selectedTime || selectedServices.length === 0}
                  className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-lg text-label-lg hover:opacity-90 shadow-lg hover:soft-glow transition-all active:scale-[0.98] disabled:bg-surface-variant disabled:text-outline cursor-pointer font-semibold uppercase tracking-wider"
                >
                  Confirm & Continue
                </button>
                
                <p className="text-center text-body-sm text-on-surface-variant px-4">
                  You won't be charged yet. You can cancel up to 24 hours in advance.
                </p>
              </div>
            </div>
          </aside>

        </div>

      </main>

      {/* MOBILE STICKY FOOTER */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 px-margin-mobile py-6 z-40 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-container-max mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Selected Slot</p>
              <p className="font-label-lg text-label-lg font-semibold text-on-surface">
                {selectedDate.replace('Friday, ', '')}, {selectedTime} with {selectedSpecialist?.name.split(' ')[0]}
              </p>
            </div>
            <div className="text-right">
              <p className="font-headline-md text-headline-md text-primary font-bold">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
          <button 
            onClick={handleConfirm}
            disabled={!selectedSpecialist || !selectedDate || !selectedTime || selectedServices.length === 0}
            className="w-full bg-primary-container text-white py-4 rounded-full font-label-lg text-label-lg tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] disabled:bg-surface-variant disabled:text-outline cursor-pointer"
          >
            REVIEW BOOKING
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default DateTimePage;

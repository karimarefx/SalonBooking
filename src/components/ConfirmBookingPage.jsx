import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { supabase } from '../supabaseClient';
import { formatPrice, PHONE_PLACEHOLDER } from '../utils/currency';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const parseTimeToMinutes = (timeString) => {
  if (!timeString) return 0;
  const [timeStr, period] = timeString.split(' ');
  let [h, m] = timeStr.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + (m || 0);
};

const hhmmToMinutes = (hhmm) => {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const ConfirmBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedServices, 
    selectedSpecialist, 
    selectedDate, 
    selectedTime, 
    clientInfo, 
    setClientInfo,
    fetchSalonById,
    createBookingInDb
  } = useBooking();

  const [isProcessing, setIsProcessing] = useState(false);
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSalon = async () => {
      try {
        setLoading(true);
        const data = await fetchSalonById(id);
        setSalon(data);
      } catch (err) {
        console.error('Error loading salon in confirmation:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSalon();
  }, [id]);

  const salonName = salon?.name || 'Sanctuary';
  const salonLocation = salon?.location || 'New York';

  const totalServicePrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const tax = totalServicePrice * 0.08; // 8% tax
  const totalAmount = totalServicePrice + tax;

  const handleInputChange = (field, value) => {
    setClientInfo({
      ...clientInfo,
      [field]: value
    });
  };

  const handleConfirmBooking = async (e) => {
    if (e) e.preventDefault();
    if (!clientInfo.name || !clientInfo.phone || !clientInfo.email) {
      alert('Please enter your Name, Email, and Phone Number to confirm your booking.');
      return;
    }
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.email)) {
      alert('Please enter a valid email address. You will need it to view or cancel your booking later.');
      return;
    }

    setIsProcessing(true);

    try {
      // The new DateTimePage stores date as YYYY-MM-DD — use directly.
      // Fallback handles old format "Mon, Dec 6" just in case.
      let bookingDateDb = selectedDate || new Date().toISOString().split('T')[0];
      try {
        if (selectedDate && !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
          // Old format: "Friday, Dec 6" or "Mon, Dec 6"
          const cleanDateStr = selectedDate.includes(',') ? selectedDate.split(',')[1].trim() : selectedDate.trim();
          const parts = cleanDateStr.split(' ');
          const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
          const monthNum = months[parts[0]];
          const dayNum = parseInt(parts[1]);
          const yearNum = new Date().getFullYear();
          const parsedDate = new Date(yearNum, monthNum, dayNum);
          if (!isNaN(parsedDate.getTime())) {
            bookingDateDb = parsedDate.toISOString().split('T')[0];
          }
        }
      } catch (err) {
        console.error('Failed to parse date:', err);
      }

      // Compute total service duration in minutes for slot blocking
      const totalDurationMins = selectedServices.reduce((sum, svc) => {
        const match = typeof svc.duration === 'string' ? svc.duration.match(/\d+/) : null;
        return sum + (match ? parseInt(match[0]) : 60);
      }, 0) || 60;

      // --- Optimistic Availability Concurrency Check ---
      const startTimeMins = parseTimeToMinutes(selectedTime || '12:00 PM');
      const endTimeMins = startTimeMins + totalDurationMins;
      const dateObj = new Date(bookingDateDb + 'T00:00:00');
      const dayKey = DAY_KEYS[dateObj.getDay()];
      const defaultOpen = { enabled: true, start: '09:00', end: '18:00' };

      // 1. Fetch all specialists for this salon to verify availability
      const { data: specialists } = await supabase
        .from('specialists')
        .select('*')
        .eq('salon_id', id);

      if (!specialists || specialists.length === 0) {
        throw new Error('No specialists registered for this salon.');
      }

      // 2. Fetch all bookings for this date (excluding cancelled ones)
      const { data: activeBookings } = await supabase
        .from('bookings')
        .select('specialist_id, booking_time, slot_duration_minutes, selected_services')
        .eq('salon_id', id)
        .eq('booking_date', bookingDateDb)
        .not('status', 'eq', 'Cancelled');

      // Group bookings by specialist
      const bookingsBySp = {};
      activeBookings?.forEach(b => {
        if (!b.specialist_id) return;
        if (!bookingsBySp[b.specialist_id]) {
          bookingsBySp[b.specialist_id] = [];
        }
        const bStart = parseTimeToMinutes(b.booking_time);
        let bDuration = b.slot_duration_minutes || 60;
        if (!b.slot_duration_minutes && b.selected_services) {
          bDuration = (b.selected_services || []).reduce((sum, svc) => {
            const match = typeof svc.duration === 'string' ? svc.duration.match(/\d+/) : null;
            return sum + (match ? parseInt(match[0]) : 60);
          }, 0) || 60;
        }
        bookingsBySp[b.specialist_id].push({ start: bStart, duration: bDuration });
      });

      let finalSpecialistId = null;

      if (selectedSpecialist && selectedSpecialist.id) {
        // Specific Specialist selected
        const sp = specialists.find(s => s.id === selectedSpecialist.id);
        if (!sp) throw new Error('Selected specialist no longer exists.');

        const spSchedule = sp.schedule || {};
        const daySchedule = spSchedule[dayKey] || defaultOpen;

        if (!daySchedule.enabled) {
          throw new Error('The specialist is not working on the selected day.');
        }

        const spStart = hhmmToMinutes(daySchedule.start);
        const spEnd = hhmmToMinutes(daySchedule.end);

        if (startTimeMins < spStart || endTimeMins > spEnd) {
          throw new Error('The selected time falls outside of the specialist\'s working hours.');
        }

        const spBookings = bookingsBySp[sp.id] || [];
        const isOverlapping = spBookings.some(b => {
          return !(endTimeMins <= b.start || startTimeMins >= b.start + b.duration);
        });

        if (isOverlapping) {
          alert('We\'re sorry, this slot was just booked by someone else. Please go back and select a new time.');
          setIsProcessing(false);
          return;
        }

        finalSpecialistId = sp.id;
      } else {
        // "Any Specialist" selected -> find first available specialist
        const availableSp = specialists.find(sp => {
          const spSchedule = sp.schedule || {};
          const daySchedule = spSchedule[dayKey] || defaultOpen;

          if (!daySchedule.enabled) return false;

          const spStart = hhmmToMinutes(daySchedule.start);
          const spEnd = hhmmToMinutes(daySchedule.end);

          if (startTimeMins < spStart || endTimeMins > spEnd) return false;

          const spBookings = bookingsBySp[sp.id] || [];
          const isOverlapping = spBookings.some(b => {
            return !(endTimeMins <= b.start || startTimeMins >= b.start + b.duration);
          });

          return !isOverlapping;
        });

        if (!availableSp) {
          alert('We\'re sorry, no specialists are available at this time. Please go back and select a different slot.');
          setIsProcessing(false);
          return;
        }

        finalSpecialistId = availableSp.id;
      }

      const bookingData = {
        salon_id: id,
        specialist_id: finalSpecialistId,
        selected_services: selectedServices,
        booking_date: bookingDateDb,
        booking_time: selectedTime || '12:00 PM',
        client_name: clientInfo.name,
        client_email: clientInfo.email.trim().toLowerCase(),
        client_phone: clientInfo.phone,
        notes: clientInfo.notes || '',
        total_price: totalAmount,
        slot_duration_minutes: totalDurationMins,
        status: 'Confirmed'
      };

      await createBookingInDb(bookingData);
      setIsProcessing(false);
      navigate('/booking/success');
    } catch (err) {
      console.error('Failed to confirm booking in DB:', err);
      alert('Failed to save booking: ' + err.message);
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate(`/salon/${id}/booking/datetime`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-4">
        <span className="animate-spin material-symbols-outlined text-4xl text-primary">sync</span>
        <p className="font-body-lg text-secondary">Preparing your booking sanctuary details...</p>
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
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/salon/${id}/services`)}>Select Services</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={handleBack}>Specialist & Time</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Review & Confirm</span>
        </div>

        {/* PROGRESS TRACKER */}
        <div className="w-full max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label-md text-label-md text-primary uppercase font-semibold">Review & Confirm</span>
            <span className="font-label-md text-label-md text-secondary">Step 3 of 3</span>
          </div>
          <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-primary-container w-[100%] transition-all duration-700"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* LEFT COLUMN: Client Contact Forms */}
          <div className="lg:col-span-7 space-y-8">
            
            <section className="space-y-3">
              <h1 className="font-headline-lg text-headline-lg text-on-surface leading-tight">Finalize Your Visit</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Please provide your contact details to secure your appointment. We'll send a confirmation and a reminder 24 hours before your visit.</p>
            </section>

            <form onSubmit={handleConfirmBooking} className="bg-surface-container-lowest p-6 md:p-8 rounded-xl soft-glow border border-outline-variant/30 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="font-label-lg text-label-lg text-on-surface-variant" htmlFor="full-name">Full Name</label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none"
                    id="full-name"
                    placeholder="E.g. Isabella Rossi"
                    type="text"
                    required
                    value={clientInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="font-label-lg text-label-lg text-on-surface-variant" htmlFor="phone">Phone Number</label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none"
                    id="phone"
                    placeholder={PHONE_PLACEHOLDER}
                    type="tel"
                    required
                    value={clientInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

              </div>

              {/* Email Address — full width, required for booking lookup */}
              <div className="space-y-2">
                <label className="font-label-lg text-label-lg text-on-surface-variant" htmlFor="email">
                  Email Address <span className="text-primary font-semibold">*</span>
                </label>
                <input
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none"
                  id="email"
                  placeholder="your@email.com"
                  type="email"
                  required
                  value={clientInfo.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">info</span>
                  You'll use this email to view or cancel your booking later — no account needed.
                </p>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <label className="font-label-lg text-label-lg text-on-surface-variant" htmlFor="notes">Special Requests (Optional)</label>
                <textarea 
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface resize-none outline-none" 
                  id="notes" 
                  placeholder="Tell us about any preferences, sensitivities, or requirements..." 
                  rows="3"
                  value={clientInfo.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>

              <button type="submit" className="hidden"></button>
            </form>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-container-low border border-surface-variant/20">
              <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'wght' 300" }}>info</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                By clicking "Confirm Booking," you agree to our <a className="text-primary underline font-medium" href="#">Cancellation Policy</a>. Appointments cancelled within 24 hours may be subject to a fee.
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Booking Summary Card */}
          <aside className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="sticky top-24 bg-surface-container-lowest rounded-xl soft-glow overflow-hidden border border-outline-variant/30 shadow-sm">
              
              {/* Image Header with Title */}
              <div className="h-48 w-full relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent z-10"></div>
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnlox59AKQdl-GIDIw0BpKjWaroXTj3OzTECHHzi1ud1zfYx8gmTiyGWJ10jvys3H_YAeflJYmtmcZ_o9VuGh79g5JOsZ6bcb_XcdQOi6ojMDF7Rh7mTQNUgwpaEjuymt7He7k_qK2y9GjGgZPPchfYtiBX_07X0_csV3I41SzP1StX2PGU0PD3l2EsHmt-7Ci4chD8Xw65_gqQ9Gdlpco47DsPfjcitOK_4Lg81KcXp5JqF_Tj3ry"
                  alt="Luxury Salon Interior"
                />
                <div className="absolute bottom-4 left-6 z-20">
                  <h3 className="font-headline-md text-headline-md text-white font-semibold">Booking Summary</h3>
                </div>
              </div>

              {/* Details List */}
              <div className="p-6 space-y-6">
                
                {/* Services summary */}
                <div className="luxury-border pb-4 space-y-3">
                  <p className="font-label-md text-label-md text-primary uppercase tracking-widest font-semibold">Treatments</p>
                  {selectedServices.map((svc, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-headline-md text-[18px] text-on-surface leading-snug">{svc.name}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{svc.duration} Minutes</p>
                      </div>
                      <span className="font-headline-md text-[18px] text-primary flex-shrink-0">{formatPrice(svc.price)}</span>
                    </div>
                  ))}
                  {selectedServices.length === 0 && (
                    <p className="text-body-sm text-outline-variant">No treatments selected.</p>
                  )}
                </div>

                {/* Salon / Specialist / Date / Time Grid */}
                <div className="grid grid-cols-2 gap-6">
                  
                  {/* Salon */}
                  <div className="space-y-1">
                    <p className="font-label-md text-label-md text-primary uppercase tracking-widest font-semibold">Salon</p>
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-secondary text-sm">location_on</span>
                      <p className="font-body-md truncate">{salonName}</p>
                    </div>
                  </div>

                  {/* Specialist */}
                  <div className="space-y-1">
                    <p className="font-label-md text-label-md text-primary uppercase tracking-widest font-semibold">Specialist</p>
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-secondary text-sm">person</span>
                      <p className="font-body-md truncate">{selectedSpecialist ? selectedSpecialist.name : 'Any Specialist'}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <p className="font-label-md text-label-md text-primary uppercase tracking-widest font-semibold">Date</p>
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-secondary text-sm">calendar_today</span>
                      <p className="font-body-md">{selectedDate ? selectedDate.replace('Friday, ', '') : 'Oct 24, 2024'}</p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="space-y-1">
                    <p className="font-label-md text-label-md text-primary uppercase tracking-widest font-semibold">Time</p>
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-secondary text-sm">schedule</span>
                      <p className="font-body-md">{selectedTime || '11:30 AM'}</p>
                    </div>
                  </div>

                </div>

                {/* Total */}
                <div className="bg-surface-container p-4 rounded-lg flex justify-between items-center">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">Total Amount</span>
                  <span className="font-headline-lg text-headline-lg text-primary font-bold">{formatPrice(totalAmount)}</span>
                </div>

                {/* Confirm Action Button */}
                <button 
                  onClick={handleConfirmBooking}
                  disabled={isProcessing || !clientInfo.name || !clientInfo.phone || selectedServices.length === 0}
                  className="w-full bg-primary text-on-primary h-14 rounded-lg font-label-lg text-label-lg uppercase tracking-[0.2em] hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:bg-surface-variant disabled:text-outline cursor-pointer font-semibold shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin material-symbols-outlined">sync</span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Booking</span>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>

              </div>

            </div>
          </aside>

        </div>

      </main>

      {/* MOBILE FIXED BOTTOM ACTION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-margin-mobile border-t border-outline-variant/10 shadow-[0_-8px_24px_rgba(0,0,0,0.04)] z-40">
        <button 
          onClick={handleConfirmBooking}
          disabled={isProcessing || !clientInfo.name || !clientInfo.phone || selectedServices.length === 0}
          className="w-full bg-primary-container text-on-primary font-label-lg text-label-lg py-4 rounded-lg flex justify-center items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:bg-surface-variant disabled:text-outline cursor-pointer font-semibold"
        >
          {isProcessing ? (
            <>
              <span className="animate-spin material-symbols-outlined text-on-primary">sync</span>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Book Now</span>
              <span className="material-symbols-outlined text-on-primary">chevron_right</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default ConfirmBookingPage;

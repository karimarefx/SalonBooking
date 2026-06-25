import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { supabase } from '../supabaseClient';

// ---------- Helpers ----------
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const toMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
};

const SLOT_INTERVAL = 30; // minutes between each slot option

// Generate all 30-min slots between start and end time strings
const generateSlots = (startStr, endStr, totalDurationMins, bookedSlots) => {
  const startMins = toMinutes(startStr);
  const endMins = toMinutes(endStr);
  const slots = [];
  for (let t = startMins; t + totalDurationMins <= endMins; t += SLOT_INTERVAL) {
    const timeLabel = fromMinutes(t);
    const isBooked = bookedSlots.some(b => {
      const bStart = toMinutes(b.start);
      const bEnd = bStart + b.duration;
      // Block if this slot overlaps with an existing booking
      return !(t + totalDurationMins <= bStart || t >= bEnd);
    });
    slots.push({ time: timeLabel, raw: t, blocked: isBooked });
  }
  return slots;
};

// ---------- Component ----------
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
    fetchSpecialistsBySalon,
  } = useBooking();

  const [salon, setSalon] = useState(null);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date()); // current month view
  const [selectedDateObj, setSelectedDateObj] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [salonData, specialistsData] = await Promise.all([
          fetchSalonById(id),
          fetchSpecialistsBySalon(id),
        ]);
        setSalon(salonData);
        setSpecialists(specialistsData || []);

        // Default to first available date (today or next available)
        if (!selectedDate) {
          const todayStr = new Date().toISOString().split('T')[0];
          setSelectedDate(todayStr);
          setSelectedDateObj(new Date());
        }
        if (!selectedSpecialist) {
          setSelectedSpecialist({ id: null, name: 'Any Specialist', title: 'Earliest availability', schedule: null });
        }
      } catch (err) {
        console.error('Error loading DateTimePage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Calculate total service duration in minutes
  const totalDurationMins = selectedServices.reduce((sum, svc) => {
    const match = typeof svc.duration === 'string' ? svc.duration.match(/\d+/) : null;
    return sum + (match ? parseInt(match[0]) : 60);
  }, 0) || 60;

  // Fetch existing bookings and compute available slots
  const loadAvailability = useCallback(async () => {
    if (!selectedDate || !selectedSpecialist) return;

    setAvailabilityLoading(true);
    try {
      // Determine schedule for the selected specialist
      const dateObj = new Date(selectedDate + 'T00:00:00');
      const dayKey = DAY_KEYS[dateObj.getDay()];

      let schedule = null;
      if (selectedSpecialist.id && selectedSpecialist.schedule) {
        schedule = selectedSpecialist.schedule;
      } else if (selectedSpecialist.id) {
        // Fetch fresh from DB
        const { data } = await supabase
          .from('specialists')
          .select('schedule')
          .eq('id', selectedSpecialist.id)
          .single();
        schedule = data?.schedule;
      }

      // Default open schedule if none set
      const defaultOpen = { enabled: true, start: '09:00', end: '18:00' };
      const daySchedule = schedule ? (schedule[dayKey] || defaultOpen) : defaultOpen;

      if (!daySchedule.enabled) {
        // Day off — no slots
        setSlots([]);
        setSelectedTime('');
        setAvailabilityLoading(false);
        return;
      }

      // Fetch existing confirmed bookings for this specialist on this date
      let query = supabase
        .from('bookings')
        .select('booking_time, slot_duration_minutes, selected_services')
        .eq('salon_id', id)
        .eq('booking_date', selectedDate)
        .not('status', 'eq', 'Cancelled');

      if (selectedSpecialist.id) {
        query = query.eq('specialist_id', selectedSpecialist.id);
      }

      const { data: existingBookings } = await query;

      // Build booked slot objects { start (mins), duration (mins) }
      const bookedSlots = (existingBookings || []).map(b => {
        const [timeStr, period] = b.booking_time ? b.booking_time.split(' ') : ['12:00', 'PM'];
        let [h, m] = (timeStr || '12:00').split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        const startMins = h * 60 + (m || 0);
        // Duration: from stored column or compute from selected_services
        let duration = b.slot_duration_minutes || 60;
        if (!b.slot_duration_minutes && b.selected_services) {
          duration = (b.selected_services || []).reduce((sum, svc) => {
            const match = typeof svc.duration === 'string' ? svc.duration.match(/\d+/) : null;
            return sum + (match ? parseInt(match[0]) : 60);
          }, 0) || 60;
        }
        return { start: startMins, duration };
      });

      const generated = generateSlots(daySchedule.start, daySchedule.end, totalDurationMins, bookedSlots);
      setSlots(generated);

      // Clear selected time if it's now blocked
      if (selectedTime) {
        const stillAvail = generated.find(s => s.time === selectedTime && !s.blocked);
        if (!stillAvail) setSelectedTime('');
      }
    } catch (err) {
      console.error('Error loading availability:', err);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [selectedDate, selectedSpecialist?.id, totalDurationMins, id]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // ---------- Calendar helpers ----------
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isSpecialistAvailableOnDate = (dateObj) => {
    if (!selectedSpecialist?.schedule) return true;
    const dayKey = DAY_KEYS[dateObj.getDay()];
    return selectedSpecialist.schedule[dayKey]?.enabled !== false;
  };

  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
  const monthName = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleDayClick = (day) => {
    const d = new Date(calendarYear, calendarMonth, day);
    if (d < today) return;
    const dateStr = d.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedDateObj(d);
    setSelectedTime('');
  };

  const handleSpecialistSelect = (sp) => {
    setSelectedSpecialist(sp);
    setSelectedTime('');
  };

  const handleConfirm = () => {
    if (selectedSpecialist && selectedDate && selectedTime) {
      navigate(`/salon/${id}/booking/confirm`);
    }
  };

  const handleBack = () => navigate(`/salon/${id}/services`);

  const salonName = salon?.name || 'Sanctuary';
  const totalServicePrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price || 0), 0);
  const tax = totalServicePrice * 0.08;
  const totalAmount = totalServicePrice + tax;

  const morningSlots = slots.filter(s => s.raw < 720); // before noon
  const afternoonSlots = slots.filter(s => s.raw >= 720 && s.raw < 1020); // noon to 5PM
  const eveningSlots = slots.filter(s => s.raw >= 1020); // 5PM+

  const selectedDateDisplay = selectedDateObj
    ? selectedDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : selectedDate;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-4">
        <span className="animate-spin material-symbols-outlined text-4xl text-primary">sync</span>
        <p className="font-body-lg text-secondary">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased pb-32">
      <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
        {/* BREADCRUMB */}
        <div className="hidden md:flex items-center gap-2 text-body-sm text-on-surface-variant mb-8">
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/')}>Home</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/search')}>Search Results</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/salon/${id}`)}>{salonName}</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={handleBack}>Select Services</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Specialist & Time</span>
        </div>

        {/* PROGRESS TRACKER */}
        <div className="w-full max-w-3xl mx-auto mb-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-primary font-label-lg text-label-lg">STEP 2: SPECIALIST & TIME</span>
            <span className="text-outline font-label-lg text-label-lg">STEP 3: CONFIRM BOOKING</span>
          </div>
          <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3 transition-all duration-700 ease-out"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

          {/* LEFT SECTION */}
          <div className="lg:col-span-8 space-y-10">

            {/* SPECIALIST PICKER */}
            <section className="space-y-4">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Choose a Specialist</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">

                {/* Any Specialist */}
                <button
                  onClick={() => handleSpecialistSelect({ id: null, name: 'Any Specialist', title: 'Earliest availability', schedule: null })}
                  className={`flex-shrink-0 w-44 h-64 rounded-lg border-2 p-4 text-center transition-all hover:soft-glow snap-start flex flex-col items-center justify-center cursor-pointer ${selectedSpecialist?.name === 'Any Specialist' ? 'border-primary bg-primary-container/10' : 'border-outline-variant bg-surface'}`}
                >
                  <div className="w-20 h-20 rounded-full bg-on-primary flex items-center justify-center mb-4 border border-outline-variant">
                    <span className="material-symbols-outlined text-[32px] text-primary">groups</span>
                  </div>
                  <p className="font-label-lg text-primary font-semibold">Any Specialist</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Earliest availability</p>
                </button>

                {/* Team Specialists */}
                {specialists.map((sp) => {
                  const isSpSelected = selectedSpecialist?.id === sp.id;
                  return (
                    <button
                      key={sp.id}
                      onClick={() => handleSpecialistSelect(sp)}
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
                          <span className="text-[12px] font-semibold ml-1">{parseFloat(sp.rating || 5).toFixed(1)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* DATE & TIME PICKER PANEL */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">

              {/* Calendar */}
              <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline-md text-headline-md">Select Date</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))}
                      className="p-2 rounded-full hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button
                      onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))}
                      className="p-2 rounded-full hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <span className="font-label-lg text-primary uppercase tracking-widest font-semibold">{monthName}</span>
                </div>
                <div className="grid grid-cols-7 gap-y-2 text-center text-on-surface-variant">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="font-label-md text-label-md py-2 text-xs font-semibold">{d}</div>
                  ))}
                  {/* Empty cells for first day offset */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const d = new Date(calendarYear, calendarMonth, day);
                    d.setHours(0, 0, 0, 0);
                    const dateStr = d.toISOString().split('T')[0];
                    const isPast = d < today;
                    const isSelected = selectedDate === dateStr;
                    const isToday = d.getTime() === today.getTime();
                    const isOff = !isSpecialistAvailableOnDate(d);

                    return (
                      <div
                        key={day}
                        onClick={() => !isPast && !isOff && handleDayClick(day)}
                        className={`py-2 font-body-md rounded-lg transition-colors relative
                          ${isSelected ? 'bg-primary text-on-primary shadow-md font-semibold' : ''}
                          ${isToday && !isSelected ? 'ring-2 ring-primary text-primary font-semibold' : ''}
                          ${isPast || isOff ? 'text-outline/30 cursor-not-allowed' : 'hover:bg-white cursor-pointer text-on-surface'}
                        `}
                      >
                        {day}
                        {isOff && !isPast && (
                          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-error block" title="Day off" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-headline-md text-headline-md">Available Times</h3>
                  {selectedDateDisplay && (
                    <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">{selectedDateDisplay}</span>
                  )}
                </div>

                {availabilityLoading ? (
                  <div className="flex-grow flex flex-col items-center justify-center gap-2">
                    <span className="animate-spin material-symbols-outlined text-2xl text-primary">sync</span>
                    <p className="text-xs text-on-surface-variant">Checking availability...</p>
                  </div>
                ) : !selectedDate ? (
                  <div className="flex-grow flex flex-col items-center justify-center gap-2 text-center">
                    <span className="material-symbols-outlined text-3xl text-outline font-light">calendar_month</span>
                    <p className="text-sm text-on-surface-variant">Select a date to see available times</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center gap-2 text-center">
                    <span className="material-symbols-outlined text-3xl text-outline font-light">event_busy</span>
                    <p className="text-sm text-on-surface-variant font-semibold">Not available</p>
                    <p className="text-xs text-outline">This specialist is off or fully booked on this day.<br/>Try another date or specialist.</p>
                  </div>
                ) : (
                  <div className="space-y-5 flex-grow overflow-y-auto max-h-80">
                    {[
                      { label: 'Morning', icon: 'light_mode', slots: morningSlots },
                      { label: 'Afternoon', icon: 'sunny', slots: afternoonSlots },
                      { label: 'Evening', icon: 'nights_stay', slots: eveningSlots },
                    ].filter(g => g.slots.length > 0).map(group => (
                      <div key={group.label}>
                        <p className="text-label-md text-outline uppercase tracking-widest mb-3 flex items-center gap-2 font-semibold">
                          <span className="material-symbols-outlined text-[16px]">{group.icon}</span> {group.label}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {group.slots.map((t) => {
                            const isSelected = selectedTime === t.time;
                            if (t.blocked) {
                              return (
                                <button key={t.raw} disabled className="py-3 px-4 opacity-35 bg-surface-container text-on-surface-variant rounded-lg text-center cursor-not-allowed line-through font-label-lg text-label-lg text-sm">
                                  {t.time}
                                </button>
                              );
                            }
                            return (
                              <button
                                key={t.raw}
                                onClick={() => setSelectedTime(t.time)}
                                className={`py-3 px-4 rounded-lg transition-all text-center border font-label-lg text-label-lg text-sm cursor-pointer ${isSelected ? 'bg-primary text-on-primary border-primary shadow-md' : 'bg-white text-on-surface border-outline-variant hover:border-primary'}`}
                              >
                                {t.time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Booking Summary */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl soft-glow border border-primary-container/20 overflow-hidden shadow-sm">
              <div className="bg-primary/5 p-6 border-b border-outline-variant/30">
                <h3 className="font-headline-md text-headline-md text-primary font-semibold">Booking Summary</h3>
              </div>
              <div className="p-6 space-y-6">

                {/* Selected Services */}
                <div className="space-y-4">
                  <p className="text-label-md text-outline uppercase tracking-widest mb-2 font-semibold">Selected Treatments</p>
                  {selectedServices.map((svc, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-3 border-b border-outline-variant/20 last:border-b-0 last:pb-0">
                      <div className="w-16 h-16 rounded-lg bg-secondary-container flex-shrink-0 overflow-hidden">
                        <img className="w-full h-full object-cover" src={svc.img || svc.image} alt={svc.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-label-lg text-on-surface font-semibold truncate">{svc.name}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{svc.duration} • ${parseFloat(svc.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {selectedServices.length === 0 && (
                    <p className="text-body-sm text-outline-variant">No treatments selected. Please go back.</p>
                  )}
                </div>

                {/* Specialist */}
                <div className="pt-4 border-t border-outline-variant/20">
                  <p className="text-label-md text-outline uppercase tracking-widest mb-2 font-semibold">Specialist</p>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">person_check</span>
                    <span className="font-body-md text-on-surface">{selectedSpecialist?.name || 'Not selected'}</span>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="pt-4 border-t border-outline-variant/20">
                  <p className="text-label-md text-outline uppercase tracking-widest mb-2 font-semibold">Date & Time</p>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                    <span className="font-body-md text-on-surface">
                      {selectedDate ? `${selectedDateDisplay} • ${selectedTime || 'No time selected'}` : 'Not selected'}
                    </span>
                  </div>
                  {totalDurationMins > 0 && (
                    <p className="text-xs text-on-surface-variant mt-1 ml-8">Duration: {totalDurationMins} min</p>
                  )}
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
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {selectedDate && selectedTime ? `${selectedDateDisplay} • ${selectedTime}` : 'Select a date & time'}
              </p>
              <p className="font-label-lg text-label-lg font-semibold text-on-surface">
                {selectedSpecialist?.name || 'No specialist selected'}
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

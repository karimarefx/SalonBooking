import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const { 
    selectedServices, 
    selectedSpecialist, 
    selectedDate, 
    selectedTime, 
    clientInfo,
    resetBooking
  } = useBooking();

  const totalServicePrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const tax = totalServicePrice * 0.08;
  const totalAmount = totalServicePrice + tax;

  const handleGoToBookings = () => {
    // Navigate to bookings page
    navigate('/account/bookings');
  };

  const handleAddToCalendar = () => {
    // Add mock add-to-calendar action (alert or calendar invite download)
    alert('Mock Action: Booking details added to your calendar!');
  };

  const handleBackToHome = () => {
    resetBooking();
    navigate('/');
  };

  // Safe defaults if visited directly without context selection
  const salonName = selectedServices.length > 0 ? "Maison de Beauté" : "Maison de Beauté";
  const dateStr = selectedDate || "Friday, Dec 6";
  const timeStr = selectedTime || "01:00 PM";
  const specialistName = selectedSpecialist ? selectedSpecialist.name : "Elena Vance";
  const serviceList = selectedServices.length > 0 ? selectedServices.map(s => s.name).join(', ') : "Signature Haircut";

  return (
    <div className="bg-background text-on-surface font-body-md antialiased">
      {/* MAIN CONTAINER */}
      <main className="flex items-center justify-center py-12 md:py-16 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* SUCCESS RECEIPT CARD */}
        <div className="w-full max-w-lg bg-white rounded-2xl border border-outline-variant/30 soft-glow overflow-hidden shadow-lg p-6 md:p-10 space-y-8">
          
          {/* Header Status & Icon */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-primary text-5xl font-light" style={{ fontVariationSettings: "'wght' 200" }}>check_circle</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-display-lg text-headline-lg md:text-[32px] text-on-surface font-semibold leading-tight">Your booking is confirmed!</h2>
              <p className="font-body-md text-on-surface-variant max-w-sm mx-auto">
                Thank you, <strong>{clientInfo.name || 'valued guest'}</strong>. We look forward to seeing you.
              </p>
            </div>
          </div>

          {/* Details Summary Block */}
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 space-y-4 text-body-sm">
            <h3 className="font-label-md text-outline uppercase tracking-wider font-semibold border-b border-outline-variant/20 pb-2">Appointment Summary</h3>
            
            {/* Salon Details */}
            <div className="flex justify-between items-start gap-4">
              <span className="text-on-surface-variant shrink-0">Salon</span>
              <span className="font-semibold text-on-surface text-right">{salonName}</span>
            </div>

            {/* Service Details */}
            <div className="flex justify-between items-start gap-4">
              <span className="text-on-surface-variant shrink-0">Service</span>
              <span className="font-semibold text-on-surface text-right">{serviceList}</span>
            </div>

            {/* Specialist Details */}
            <div className="flex justify-between items-start gap-4">
              <span className="text-on-surface-variant shrink-0">Specialist</span>
              <span className="font-semibold text-on-surface text-right">{specialistName}</span>
            </div>

            {/* Date Details */}
            <div className="flex justify-between items-start gap-4">
              <span className="text-on-surface-variant shrink-0">Date</span>
              <span className="font-semibold text-on-surface text-right">{dateStr}</span>
            </div>

            {/* Time Details */}
            <div className="flex justify-between items-start gap-4">
              <span className="text-on-surface-variant shrink-0">Time</span>
              <span className="font-semibold text-on-surface text-right">{timeStr}</span>
            </div>

            {/* Email */}
            {clientInfo.email && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-on-surface-variant shrink-0">Booking Email</span>
                <span className="font-semibold text-primary text-right">{clientInfo.email}</span>
              </div>
            )}

            {/* Amount Details */}
            <div className="flex justify-between items-start gap-4 pt-3 border-t border-outline-variant/20 font-semibold text-body-md">
              <span className="text-on-surface">Estimated Total</span>
              <span className="text-primary font-bold">
                ${totalAmount > 0 ? totalAmount.toFixed(2) : '156.60'}
              </span>
            </div>
          </div>

          {/* Email reminder callout */}
          {clientInfo.email && (
            <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">mail</span>
              <div>
                <p className="font-semibold text-on-surface text-sm">Save your email to manage this booking</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Use <strong className="text-primary">{clientInfo.email}</strong> on the "My Bookings" page to view or cancel this appointment anytime — no account needed.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons (Wired up) */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/account/bookings${clientInfo.email ? `?email=${encodeURIComponent(clientInfo.email)}` : ''}`)}
              className="w-full bg-primary-container text-white py-4 rounded-lg font-label-lg text-label-lg hover:bg-primary transition-colors cursor-pointer font-semibold shadow-sm active:scale-95 text-center block uppercase tracking-widest"
            >
              View my bookings
            </button>
            <button
              onClick={handleAddToCalendar}
              className="w-full border border-primary-container text-primary py-4 rounded-lg font-label-lg text-label-lg hover:bg-primary-container/5 transition-colors cursor-pointer font-semibold shadow-sm active:scale-95 text-center block uppercase tracking-widest"
            >
              Add to calendar
            </button>
            <button
              onClick={handleBackToHome}
              className="w-full text-secondary hover:text-primary transition-colors cursor-pointer font-label-lg text-label-lg text-center underline pt-2"
            >
              Back to Home
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};

export default BookingSuccessPage;

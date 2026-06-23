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
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased flex flex-col justify-between">
      
      {/* DESKTOP HEADER */}
      <header className="hidden md:block bg-surface dark:bg-on-surface w-full top-0 sticky z-50 border-b border-outline-variant/30">
        <nav className="flex justify-between items-center px-margin-desktop w-full max-w-container-max mx-auto h-20">
          <div className="flex items-center gap-12">
            <span 
              onClick={handleBackToHome} 
              className="font-display-lg text-display-lg text-primary tracking-widest uppercase cursor-pointer"
            >
              AURA
            </span>
            <div className="flex items-center space-x-8 font-label-lg">
              <span className="text-secondary pb-1 hover:text-primary transition-colors cursor-pointer" onClick={handleBackToHome}>Home</span>
              <span className="text-secondary pb-1 hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/search')}>Salons</span>
              <span className="text-secondary pb-1 hover:text-primary transition-colors cursor-pointer">Services</span>
              <span className="text-secondary pb-1 hover:text-primary transition-colors cursor-pointer">Specialists</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="font-label-lg text-label-lg text-secondary px-4 py-2 hover:text-primary transition-colors">Login</button>
            <button className="bg-primary text-on-primary font-label-lg text-label-lg px-6 py-3 rounded-lg hover:bg-primary-container transition-all active:opacity-80">Book Now</button>
          </div>
        </nav>
      </header>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 z-50 bg-surface h-16 flex items-center px-margin-mobile border-b border-outline-variant/10 shadow-sm">
        <div className="flex-grow text-center">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight" onClick={handleBackToHome}>AURA</h1>
        </div>
        <button onClick={handleBackToHome} className="p-2 text-secondary absolute right-4">
          <span className="material-symbols-outlined font-light">close</span>
        </button>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow flex items-center justify-center py-12 md:py-16 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* SUCCESS RECEIPT CARD */}
        <div className="w-full max-w-lg bg-white rounded-2xl border border-outline-variant/30 soft-glow overflow-hidden shadow-lg p-6 md:p-10 space-y-8">
          
          {/* Header Status & Icon */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-primary text-5xl font-light" style={{ fontVariationSettings: "'wght' 200" }}>check_circle</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-display-lg text-headline-lg md:text-[32px] text-on-surface font-semibold leading-tight">Your booking is confirmed</h2>
              <p className="font-body-md text-on-surface-variant max-w-sm mx-auto">
                Thank you for booking with AURA. A confirmation email and SMS reminder details have been sent.
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

            {/* Amount Details */}
            <div className="flex justify-between items-start gap-4 pt-3 border-t border-outline-variant/20 font-semibold text-body-md">
              <span className="text-on-surface">Estimated Total</span>
              <span className="text-primary font-bold">
                ${totalAmount > 0 ? totalAmount.toFixed(2) : '156.60'}
              </span>
            </div>
          </div>

          {/* Action Buttons (Wired up) */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleGoToBookings}
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

      {/* FOOTER */}
      <footer className="bg-surface-container-low dark:bg-inverse-surface border-t border-outline-variant/10 py-6 md:py-8">
        <div className="max-w-container-max mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center text-body-sm text-secondary gap-4">
          <span className="font-display-lg text-[20px] text-primary tracking-widest uppercase">AURA</span>
          <p>© 2024 AURA Wellness & Beauty. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default BookingSuccessPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { 
    clientInfo,
    fetchBookingsByEmail,
    deleteBookingFromDb
  } = useBooking();

  const [dbBookings, setDbBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    if (!clientInfo.email) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchBookingsByEmail(clientInfo.email);
      setDbBookings(data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [clientInfo.email]);

  const handleCancelBooking = async (id) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await deleteBookingFromDb(id);
        alert('Your appointment has been successfully cancelled.');
        loadBookings();
      } catch (err) {
        console.error(err);
        alert('Failed to cancel booking.');
      }
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Group bookings
  const upcomingBookings = dbBookings.filter(b => {
    const bDate = new Date(b.booking_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    return bDate >= today && b.status !== 'Cancelled';
  });

  const pastBookings = dbBookings.filter(b => {
    const bDate = new Date(b.booking_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    return bDate < today || b.status === 'Cancelled' || b.status === 'Completed';
  });


  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased flex flex-col justify-between">
      
      {/* DESKTOP HEADER */}
      <header className="hidden md:block bg-surface w-full top-0 sticky z-50 border-b border-outline-variant/30">
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
              <span className="text-primary border-b-2 border-primary pb-1 cursor-pointer">My Bookings</span>
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
        <button onClick={handleBackToHome} className="p-2 -ml-2 text-secondary">
          <span className="material-symbols-outlined font-light">arrow_back</span>
        </button>
        <div className="flex-grow text-center">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight">AURA</h1>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 w-full space-y-12">
        
        {/* PAGE HEADER */}
        <div>
          <h2 className="font-display-lg text-headline-lg md:text-[36px] text-on-surface font-semibold">My Bookings</h2>
          <p className="font-body-md text-on-surface-variant">View and manage your upcoming or past appointments.</p>
        </div>

        {/* SECTION: UPCOMING BOOKINGS */}
        <section className="space-y-6">
          <h3 className="font-headline-md text-headline-md border-b border-outline-variant/20 pb-2">Upcoming Visits</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            
            {/* Live bookings from database */}
            {upcomingBookings.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-outline-variant/30 soft-glow p-6 space-y-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-secondary-container text-on-secondary-container text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded">{b.status}</span>
                      <h4 className="font-headline-md text-[20px] text-on-surface mt-3">{b.salons?.name || 'Aura Atelier'}</h4>
                      <p className="text-body-sm text-on-surface-variant mt-1">{b.salons?.location || 'Tribeca, Manhattan'}</p>
                    </div>
                    <span className="font-headline-md text-[20px] text-primary font-bold">${parseFloat(b.total_price || 0).toFixed(2)}</span>
                  </div>

                  <div className="space-y-2 text-body-sm text-on-surface-variant">
                    <div>
                      <p className="text-outline uppercase font-semibold text-[10px] tracking-wider">Services</p>
                      <p className="font-semibold text-on-surface">
                        {Array.isArray(b.selected_services) ? b.selected_services.map(s => s.name).join(', ') : 'Custom Treatment'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-outline uppercase font-semibold text-[10px] tracking-wider">Specialist</p>
                        <p className="font-semibold text-on-surface">{b.specialists?.name || 'Any Specialist'}</p>
                      </div>
                      <div>
                        <p className="text-outline uppercase font-semibold text-[10px] tracking-wider">Date & Time</p>
                        <p className="font-semibold text-on-surface">
                          {new Date(b.booking_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {b.booking_time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/20 flex gap-4 mt-auto">
                  <button 
                    onClick={() => handleCancelBooking(b.id)} 
                    className="px-5 py-2.5 border border-error text-error rounded hover:bg-error-container/10 font-label-md text-label-md transition-colors cursor-pointer font-semibold uppercase tracking-wider"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State for Upcoming Visits */}
            {!loading && clientInfo.email && upcomingBookings.length === 0 && (
              <div className="col-span-2 bg-white rounded-xl border border-outline-variant/30 soft-glow p-8 text-center max-w-md mx-auto space-y-4 w-full shadow-sm">
                <span className="material-symbols-outlined text-outline text-5xl">event_busy</span>
                <h4 className="font-headline-md text-[20px] text-on-surface font-semibold">No Upcoming Visits</h4>
                <p className="text-body-sm text-on-surface-variant">You don't have any appointments scheduled. Discover premium treatments to book your next visit.</p>
                <button onClick={handleBackToHome} className="bg-primary-container text-white px-6 py-2.5 rounded font-label-md text-label-md hover:bg-primary transition-colors cursor-pointer">
                  Book Now
                </button>
              </div>
            )}

            {/* Unauthenticated State */}
            {!clientInfo.email && (
              <div className="col-span-2 bg-white rounded-xl border border-outline-variant/30 soft-glow p-8 text-center max-w-md mx-auto space-y-4 w-full shadow-sm flex flex-col items-center">
                <span className="material-symbols-outlined text-outline text-5xl">lock</span>
                <h4 className="font-headline-md text-[20px] text-on-surface font-semibold">Please Sign In</h4>
                <p className="text-body-sm text-on-surface-variant">You must be signed in to view your appointments and schedule premium self-care.</p>
                <button onClick={() => navigate('/login', { state: { from: { pathname: '/account/bookings' } } })} className="bg-primary-container text-white px-8 py-3 rounded-lg font-label-lg hover:bg-primary transition-colors cursor-pointer uppercase font-semibold tracking-wider">
                  Sign In
                </button>
              </div>
            )}

            {loading && (
              <div className="col-span-2 text-center py-12 flex flex-col items-center gap-2">
                <span className="animate-spin material-symbols-outlined text-3xl text-primary">sync</span>
                <p className="text-body-sm text-on-surface-variant">Loading your appointments...</p>
              </div>
            )}

          </div>
        </section>

        {/* SECTION: PAST BOOKINGS */}
        <section className="space-y-6">
          <h3 className="font-headline-md text-headline-md border-b border-outline-variant/20 pb-2">Past Bookings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {pastBookings.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-outline-variant/30 opacity-80 p-6 space-y-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-surface-container text-on-surface-variant text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded">{b.status}</span>
                    <h4 className="font-headline-md text-[18px] text-on-surface mt-3">{b.salons?.name || 'Maison de Beauté'}</h4>
                    <p className="text-body-sm text-on-surface-variant mt-1">{b.salons?.location || 'Soho, Manhattan'}</p>
                  </div>
                  <span className="font-headline-md text-[18px] text-primary font-bold">${parseFloat(b.total_price || 0).toFixed(2)}</span>
                </div>

                <div className="space-y-2 text-body-sm text-on-surface-variant border-t border-outline-variant/10 pt-4">
                  <div>
                    <p className="text-outline uppercase font-semibold text-[10px] tracking-wider">Services</p>
                    <p className="font-semibold text-on-surface">
                      {Array.isArray(b.selected_services) ? b.selected_services.map(s => s.name).join(', ') : 'Custom Treatment'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-outline uppercase font-semibold text-[10px] tracking-wider">Specialist</p>
                      <p className="font-semibold text-on-surface">{b.specialists?.name || 'Any Specialist'}</p>
                    </div>
                    <div>
                      <p className="text-outline uppercase font-semibold text-[10px] tracking-wider">Date & Time</p>
                      <p className="font-semibold text-on-surface">
                        {new Date(b.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {b.booking_time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {clientInfo.email && pastBookings.length === 0 && !loading && (
              <p className="col-span-2 text-center text-body-sm text-on-surface-variant py-8">No past appointments found.</p>
            )}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-surface-container-low dark:bg-inverse-surface border-t border-outline-variant/10 py-6">
        <div className="max-w-container-max mx-auto px-margin-desktop flex justify-between items-center text-body-sm text-secondary">
          <span className="font-display-lg text-[20px] text-primary tracking-widest uppercase">AURA</span>
          <p>© 2024 AURA Wellness & Beauty. All rights reserved.</p>
        </div>
      </footer>
      
    </div>
  );
};

export default MyBookingsPage;

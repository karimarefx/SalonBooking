import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async (lookupEmail) => {
    if (!lookupEmail.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, salons(name, location), specialists(name)')
        .eq('client_email', lookupEmail.trim().toLowerCase())
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    await fetchBookings(email);
  };

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      fetchBookings(emailParam);
    }
  }, [searchParams]);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Cancelled' })
        .eq('id', id);
      if (error) throw error;
      // Refresh list
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b)
      );
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter(b => {
    const bDate = new Date(b.booking_date);
    return bDate >= today && b.status !== 'Cancelled' && b.status !== 'Completed';
  });

  const pastBookings = bookings.filter(b => {
    const bDate = new Date(b.booking_date);
    return bDate < today || b.status === 'Cancelled' || b.status === 'Completed';
  });

  const statusColors = {
    Confirmed: 'bg-primary-fixed text-on-primary-fixed',
    Pending: 'bg-secondary-container text-on-secondary-container',
    Completed: 'bg-surface-container text-secondary',
    Cancelled: 'bg-error-container text-on-error-container',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return dateStr; }
  };

  const BookingCard = ({ booking }) => {
    const isUpcoming = upcomingBookings.some(b => b.id === booking.id);
    const services = Array.isArray(booking.selected_services) ? booking.selected_services : [];

    return (
      <div className={`bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden transition-all duration-200 ${isUpcoming ? 'soft-glow' : 'opacity-80'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <div>
            <p className="font-semibold text-on-surface text-base">{booking.salons?.name || 'Salon'}</p>
            <p className="text-xs text-on-surface-variant">{booking.salons?.location}</p>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${statusColors[booking.status] || 'bg-surface text-secondary'}`}>
            {booking.status}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-0.5">
            <p className="text-[10px] text-outline font-semibold uppercase tracking-wider">Date & Time</p>
            <p className="font-medium text-on-surface">{formatDate(booking.booking_date)}</p>
            <p className="text-sm text-on-surface-variant">{booking.booking_time}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-outline font-semibold uppercase tracking-wider">Specialist</p>
            <p className="font-medium text-on-surface">{booking.specialists?.name || 'Any Available'}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-outline font-semibold uppercase tracking-wider">Total</p>
            <p className="font-bold text-primary text-lg">${parseFloat(booking.total_price).toFixed(2)}</p>
          </div>
        </div>

        {/* Services */}
        {services.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-[10px] text-outline font-semibold uppercase tracking-wider mb-1.5">Services</p>
            <div className="flex flex-wrap gap-2">
              {services.map((svc, i) => (
                <span key={i} className="bg-surface-container text-on-surface-variant text-xs px-2.5 py-1 rounded-full">
                  {svc.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {isUpcoming && (
          <div className="px-6 pb-5">
            <button
              onClick={() => handleCancel(booking.id)}
              disabled={cancellingId === booking.id}
              className="text-sm font-semibold text-error border border-error/30 hover:bg-error-container transition-colors px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              {cancellingId === booking.id ? (
                <><span className="animate-spin material-symbols-outlined text-sm">sync</span>Cancelling...</>
              ) : (
                <><span className="material-symbols-outlined text-sm">cancel</span>Cancel Appointment</>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased">
      <main className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-12">

        {/* Page Title */}
        <div className="mb-10 text-center">
          <span className="font-label-lg text-primary uppercase tracking-[0.2em] font-semibold text-xs">Appointments</span>
          <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface mt-2">My Bookings</h1>
          <p className="text-on-surface-variant mt-2">Enter the email address you used when booking to view your appointments.</p>
        </div>

        {/* Email Lookup Form */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 md:p-8 mb-10">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline font-light">mail</span>
              <input
                id="lookup-email"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSubmitted(false); }}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl font-body-md text-on-surface outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label-lg uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <><span className="animate-spin material-symbols-outlined text-sm">sync</span>Looking up...</>
              ) : (
                <><span className="material-symbols-outlined text-sm">search</span>Find Bookings</>
              )}
            </button>
          </form>
          {errorMsg && (
            <p className="mt-3 text-red-600 text-sm">{errorMsg}</p>
          )}
        </div>

        {/* Results */}
        {submitted && (
          <>
            {bookings.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <span className="material-symbols-outlined text-6xl text-outline font-light">calendar_month</span>
                <h3 className="font-headline-md text-xl text-on-surface">No bookings found</h3>
                <p className="text-on-surface-variant">No appointments are linked to <strong>{email}</strong>.</p>
                <button
                  onClick={() => navigate('/search')}
                  className="mt-4 bg-primary text-on-primary px-8 py-3 rounded-xl font-label-lg uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Book a Visit
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Upcoming */}
                {upcomingBookings.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">upcoming</span>
                      <h2 className="font-headline-md text-xl text-on-surface font-semibold">Upcoming</h2>
                      <span className="bg-primary text-on-primary text-xs px-2.5 py-0.5 rounded-full font-semibold">{upcomingBookings.length}</span>
                    </div>
                    <div className="space-y-4">
                      {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                    </div>
                  </section>
                )}

                {/* Past */}
                {pastBookings.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary">history</span>
                      <h2 className="font-headline-md text-xl text-on-surface font-semibold">Past & Cancelled</h2>
                    </div>
                    <div className="space-y-4">
                      {pastBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MyBookingsPage;

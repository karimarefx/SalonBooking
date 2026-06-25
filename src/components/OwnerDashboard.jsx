import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import PhotoUploader from './gallery/PhotoUploader';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, bookings, services, specialists, settings
  const [loading, setLoading] = useState(true);
  const [salon, setSalon] = useState(null);
  
  // Data lists
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);

  // Form modals state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ name: '', price: '', duration: '', category: 'Treatments', description: '', image: '' });

  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState(null);
  const [specialistForm, setSpecialistForm] = useState({ name: '', title: '', rating: '5.0', image: '' });

  // Reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Specialist schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleSpecialist, setScheduleSpecialist] = useState(null);
  const [scheduleForm, setScheduleForm] = useState(null);

  // Settings form state
  const [salonForm, setSalonForm] = useState({ name: '', location: '', description: '', about: '', tagsString: '', image_url: '' });

  const [actionLoading, setActionLoading] = useState(false);

  // Filter states
  const [bookingFilterStatus, setBookingFilterStatus] = useState('All');
  const [bookingFilterSpecialist, setBookingFilterSpecialist] = useState('All');

  // Load all dashboard data
  const loadDashboardData = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('*')
        .eq('owner_email', user.email)
        .maybeSingle();

      if (salonError) throw salonError;

      if (salonData) {
        setSalon(salonData);
        setSalonForm({
          name: salonData.name || '',
          location: salonData.location || '',
          description: salonData.description || '',
          about: salonData.about || '',
          tagsString: (salonData.tags || []).join(', '),
          image_url: salonData.image_url || ''
        });

        // 2. Fetch bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*, specialists(name)')
          .eq('salon_id', salonData.id)
          .order('booking_date', { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData || []);

        // 3. Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('salon_id', salonData.id)
          .order('category', { ascending: true });

        if (servicesError) throw servicesError;
        setServices(servicesData || []);

        // 4. Fetch specialists
        const { data: specialistsData, error: specialistsError } = await supabase
          .from('specialists')
          .select('*')
          .eq('salon_id', salonData.id);

        if (specialistsError) throw specialistsError;
        setSpecialists(specialistsData || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.email]);

  // Auth Guard — handled by OwnerRoute, this is a fallback
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-6 p-margin-mobile">
        <span className="material-symbols-outlined text-6xl text-primary font-light">lock</span>
        <div className="text-center space-y-2 max-w-sm">
          <h2 className="font-headline-lg text-2xl font-semibold">Dashboard Access Protected</h2>
          <p className="text-body-sm text-on-surface-variant">Please log in to your Salon Owner account to manage your business.</p>
        </div>
        <button onClick={() => navigate('/login')} className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-lg uppercase tracking-wider hover:opacity-90">
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-4">
        <span className="animate-spin material-symbols-outlined text-4xl text-primary">sync</span>
        <p className="font-body-lg text-secondary">Loading sanctuary dashboard data...</p>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-6 p-margin-mobile">
        <span className="material-symbols-outlined text-6xl text-outline font-light">storefront</span>
        <div className="text-center space-y-2 max-w-sm">
          <h2 className="font-headline-lg text-2xl font-semibold">No Salon Registered</h2>
          <p className="text-body-sm text-on-surface-variant">You haven't listed a salon under this account yet.</p>
        </div>
        <button onClick={() => navigate('/owner/portal')} className="bg-primary-container text-white px-8 py-3.5 rounded-lg font-label-lg uppercase tracking-wider hover:bg-primary transition-colors">
          Register Your Salon Now
        </button>
      </div>
    );
  }

  // Analytics Computation
  const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
  const totalRevenue = activeBookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const averageRating = parseFloat(salon.rating || 5.0).toFixed(1);

  // Filtered Bookings list
  const filteredBookings = bookings.filter(b => {
    const statusMatch = bookingFilterStatus === 'All' || b.status === bookingFilterStatus;
    const specialistMatch = bookingFilterSpecialist === 'All' || b.specialist_id === bookingFilterSpecialist;
    return statusMatch && specialistMatch;
  });

  // Action: Update Booking Status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    if (!confirm(`Mark this booking as ${newStatus}?`)) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
      if (error) throw error;
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Open Reschedule Modal
  const handleOpenReschedule = (booking) => {
    setRescheduleBooking(booking);
    setRescheduleDate(booking.booking_date);
    setRescheduleTime(booking.booking_time);
    setShowRescheduleModal(true);
  };

  // Action: Confirm Reschedule
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      alert('Please select a new date and time.');
      return;
    }
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('bookings')
        .update({ booking_date: rescheduleDate, booking_time: rescheduleTime, status: 'Confirmed' })
        .eq('id', rescheduleBooking.id);
      if (error) throw error;
      setShowRescheduleModal(false);
      setRescheduleBooking(null);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to reschedule booking: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Open Specialist Schedule Modal
  const handleOpenSchedule = (specialist) => {
    const defaultSchedule = {
      monday:    { enabled: true,  start: '09:00', end: '18:00' },
      tuesday:   { enabled: true,  start: '09:00', end: '18:00' },
      wednesday: { enabled: true,  start: '09:00', end: '18:00' },
      thursday:  { enabled: true,  start: '09:00', end: '18:00' },
      friday:    { enabled: true,  start: '09:00', end: '18:00' },
      saturday:  { enabled: true,  start: '10:00', end: '16:00' },
      sunday:    { enabled: false, start: '09:00', end: '18:00' },
    };
    setScheduleSpecialist(specialist);
    setScheduleForm(specialist.schedule || defaultSchedule);
    setShowScheduleModal(true);
  };

  // Action: Save Specialist Schedule
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('specialists')
        .update({ schedule: scheduleForm })
        .eq('id', scheduleSpecialist.id);
      if (error) throw error;
      setShowScheduleModal(false);
      setScheduleSpecialist(null);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to save schedule: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const DAY_LABELS = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ];

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price || !serviceForm.duration) {
      alert('Please fill in Name, Price, and Duration.');
      return;
    }
    try {
      setActionLoading(true);
      const payload = {
        name: serviceForm.name,
        price: parseFloat(serviceForm.price),
        duration: serviceForm.duration + ' min',
        category: serviceForm.category,
        description: serviceForm.description,
        image: serviceForm.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9KMCVZhBF5MNZ0aPhlOfI-ig4B-y-KmDP6jIeW0aTYqxNpQl6mF31hSEslIPpruWkNJAIWbczrZE0AUFJog05Y3cN7B9LcORhbyi7KyAP6w6K8yTNPKACVkO0xu3BUVDv-zNpiJhbbQTpi0BEHNnrgoTjCu347oAjRB4eHOoSWvLjyex5ZyxQYOlkBVsjJjzJsMu5IiTM9_TnI5pfq63N_JNp3UenRUMPKxQIWv-S3mJspWtZG9rb',
        salon_id: salon.id
      };

      if (editingService) {
        // Edit Mode
        const { error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', editingService.id);
        if (error) throw error;
        alert('Service updated successfully.');
      } else {
        // Add Mode
        const { error } = await supabase
          .from('services')
          .insert([payload]);
        if (error) throw error;
        alert('New service added successfully.');
      }

      setShowServiceModal(false);
      setEditingService(null);
      setServiceForm({ name: '', price: '', duration: '', category: 'Treatments', description: '', image: '' });
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Error saving service: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Delete Service
  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
      if (error) throw error;
      alert('Service deleted successfully.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete service: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Add / Edit Specialist Submit
  const handleSpecialistSubmit = async (e) => {
    e.preventDefault();
    if (!specialistForm.name || !specialistForm.title) {
      alert('Please fill in Name and Title.');
      return;
    }
    try {
      setActionLoading(true);
      const payload = {
        name: specialistForm.name,
        title: specialistForm.title,
        rating: parseFloat(specialistForm.rating || 5.0),
        image: specialistForm.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA11Dqp17R4H87N_xWha2fwH4Y82r5R7K2HKtCjPBGDFA76caP_JbNGcW_F0zxJOQRn11IBA5RQ5FsHWTOY4WGaAbdqh3A2Fnqyq0576tEVulHfjWvO73nWPyrVPbDJlZ47jAttprfx3IilQp9_5KLz1CrHd5Tu7a-qEr8ZP7VIKe7jAT42Sa-4FRz-EUXakFgO6VoNB3oz0vsWEC6g9uWrID_5qoVIpW2oFLqebflGF3eDSPJSDunH',
        salon_id: salon.id
      };

      if (editingSpecialist) {
        // Edit Mode
        const { error } = await supabase
          .from('specialists')
          .update(payload)
          .eq('id', editingSpecialist.id);
        if (error) throw error;
        alert('Specialist updated successfully.');
      } else {
        // Add Mode
        const { error } = await supabase
          .from('specialists')
          .insert([payload]);
        if (error) throw error;
        alert('New specialist added successfully.');
      }

      setShowSpecialistModal(false);
      setEditingSpecialist(null);
      setSpecialistForm({ name: '', title: '', rating: '5.0', image: '' });
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Error saving specialist: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Delete Specialist
  const handleDeleteSpecialist = async (specialistId) => {
    if (!confirm('Are you sure you want to remove this specialist?')) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('specialists')
        .delete()
        .eq('id', specialistId);
      if (error) throw error;
      alert('Specialist removed successfully.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to remove specialist: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Update Salon Settings
  const handleUpdateSalonSettings = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const tags = salonForm.tagsString.split(',').map(t => t.trim()).filter(Boolean);
      const { error } = await supabase
        .from('salons')
        .update({
          name: salonForm.name,
          location: salonForm.location,
          description: salonForm.description,
          about: salonForm.about,
          image_url: salonForm.image_url,
          tags: tags
        })
        .eq('id', salon.id);

      if (error) throw error;
      alert('Salon settings updated successfully.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to save settings: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased">
      {/* Main dashboard content */}
      <div className="max-w-[1200px] w-full mx-auto px-margin-mobile md:px-margin-desktop py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 bg-white p-4 rounded-xl border border-outline-variant/30 space-y-1 shadow-sm">
          <div className="p-3 border-b border-outline-variant/25 mb-3">
            <h3 className="font-headline-md text-lg text-on-surface font-bold truncate">{salon.name}</h3>
            <p className="text-xs text-on-surface-variant truncate">{salon.location}</p>
          </div>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'overview' ? 'bg-primary text-white font-semibold' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span>Overview & Analytics</span>
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${activeTab === 'bookings' ? 'bg-primary text-white font-semibold' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">calendar_today</span>
              <span>Manage Bookings</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'services' ? 'bg-primary text-white font-semibold' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined text-lg">spa</span>
            <span>Services Menu</span>
          </button>
          <button 
            onClick={() => setActiveTab('specialists')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'specialists' ? 'bg-primary text-white font-semibold' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined text-lg">badge</span>
            <span>Team Specialists</span>
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'gallery' ? 'bg-primary text-white font-semibold' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined text-lg">photo_library</span>
            <span>Gallery</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-primary text-white font-semibold' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            <span>Salon Settings</span>
          </button>
        </aside>

        {/* Tab content panels */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-outline uppercase tracking-wider">Total Bookings</span>
                  <span className="font-headline-lg text-4xl text-on-surface mt-2 font-bold">{bookings.length}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-outline uppercase tracking-wider">Pending Bookings</span>
                  <span className="font-headline-lg text-4xl text-primary mt-2 font-bold">{pendingCount}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-outline uppercase tracking-wider">Total Revenue</span>
                  <span className="font-headline-lg text-4xl text-primary mt-2 font-bold">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-outline uppercase tracking-wider">Average Rating</span>
                  <span className="font-headline-lg text-4xl text-on-surface mt-2 font-bold flex items-center gap-1.5">
                    {averageRating} <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </span>
                </div>
              </div>

              {/* Recent bookings list */}
              <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/25 flex justify-between items-center">
                  <h3 className="font-headline-md text-lg text-on-surface font-semibold">Recent Reservations</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-xs text-primary font-semibold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-body-sm">
                    <thead>
                      <tr className="bg-surface-container-low text-outline uppercase tracking-wider font-semibold border-b border-outline-variant/20 text-[10px]">
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Date / Time</th>
                        <th className="px-6 py-3">Specialist</th>
                        <th className="px-6 py-3">Price</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id} className="hover:bg-surface-container-lowest">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-on-surface">{booking.client_name}</p>
                            <p className="text-xs text-on-surface-variant">{booking.client_phone}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium">{booking.booking_date}</p>
                            <p className="text-xs text-outline">{booking.booking_time}</p>
                          </td>
                          <td className="px-6 py-4">{booking.specialists?.name || 'Any Specialist'}</td>
                          <td className="px-6 py-4 font-semibold text-primary">${parseFloat(booking.total_price).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold ${booking.status === 'Cancelled' ? 'bg-error-container text-on-error-container' : booking.status === 'Completed' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-fixed text-on-primary-fixed'}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">No reservations found yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Filter controls */}
              <div className="bg-white p-4 rounded-xl border border-outline-variant/20 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-outline uppercase">Status</label>
                    <select 
                      value={bookingFilterStatus} 
                      onChange={(e) => setBookingFilterStatus(e.target.value)}
                      className="block w-40 bg-surface border border-outline-variant rounded-md py-1.5 px-3 font-body-sm focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-outline uppercase">Specialist</label>
                    <select 
                      value={bookingFilterSpecialist} 
                      onChange={(e) => setBookingFilterSpecialist(e.target.value)}
                      className="block w-40 bg-surface border border-outline-variant rounded-md py-1.5 px-3 font-body-sm focus:outline-none"
                    >
                      <option value="All">All Specialists</option>
                      {specialists.map(sp => (
                        <option key={sp.id} value={sp.id}>{sp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">Found {filteredBookings.length} booking(s)</span>
              </div>

              {/* Bookings table */}
              <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-body-sm">
                  <thead>
                    <tr className="bg-surface-container-low text-outline uppercase tracking-wider font-semibold border-b border-outline-variant/20 text-[10px]">
                      <th className="px-6 py-3">Client details</th>
                      <th className="px-6 py-3">Date / Time</th>
                      <th className="px-6 py-3">Treatments</th>
                      <th className="px-6 py-3">Specialist</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-surface-container-lowest">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-on-surface">{booking.client_name}</p>
                          <p className="text-xs text-on-surface-variant">{booking.client_email}</p>
                          <p className="text-xs text-on-surface-variant font-medium">{booking.client_phone}</p>
                          {booking.notes && <p className="text-xs bg-surface p-1.5 rounded text-outline mt-1 italic">"{booking.notes}"</p>}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold">{booking.booking_date}</p>
                          <p className="text-xs text-outline">{booking.booking_time}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {Array.isArray(booking.selected_services) ? (
                              booking.selected_services.map((svc, i) => (
                                <p key={i} className="text-xs font-medium text-on-surface">• {svc.name}</p>
                              ))
                            ) : (
                              <p className="text-xs font-medium">Generic treatment</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">{booking.specialists?.name || 'Any Specialist'}</td>
                        <td className="px-6 py-4 font-semibold text-primary">${parseFloat(booking.total_price).toFixed(2)}</td>
                        <td className="px-6 py-4 space-y-1.5">
                          {booking.status === 'Confirmed' && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'Completed')}
                                className="block w-full text-center bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-white text-[10px] font-semibold py-1 rounded uppercase tracking-wider"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleOpenReschedule(booking)}
                                className="block w-full text-center bg-surface-container hover:bg-primary/10 text-on-surface-variant text-[10px] font-semibold py-1 rounded uppercase tracking-wider"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'Cancelled')}
                                className="block w-full text-center border border-error hover:bg-error text-error hover:text-white text-[10px] font-semibold py-1 rounded uppercase tracking-wider"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleUpdateBookingStatus(booking.id, 'Confirmed')}
                                className="block w-full text-center bg-primary-container hover:bg-primary text-white text-[10px] font-semibold py-1 rounded uppercase tracking-wider"
                              >
                                Confirm
                              </button>
                            </>
                          )}
                          {(booking.status === 'Completed' || booking.status === 'Cancelled') && (
                            <span className={`block w-full text-center text-[10px] font-semibold py-1 uppercase tracking-wider rounded ${booking.status === 'Completed' ? 'bg-surface text-secondary' : 'bg-surface text-error'}`}>
                              {booking.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">No matching reservations found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-outline-variant/20 shadow-sm">
                <div>
                  <h3 className="font-headline-md text-lg text-on-surface font-semibold">Services Menu</h3>
                  <p className="text-xs text-on-surface-variant">Manage treatments and pricing listed on your profile.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingService(null);
                    setServiceForm({ name: '', price: '', duration: '', category: 'Treatments', description: '', image: '' });
                    setShowServiceModal(true);
                  }}
                  className="bg-primary text-on-primary text-xs font-label-lg uppercase tracking-wider px-5 py-2.5 rounded-lg hover:opacity-90 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Add Service
                </button>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((svc) => (
                  <div key={svc.id} className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between soft-glow-hover">
                    <div className="h-40 relative bg-surface-container overflow-hidden">
                      <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 right-3 bg-secondary-container text-on-secondary-container text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                        {svc.category}
                      </span>
                    </div>
                    <div className="p-5 flex-grow space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-headline-md text-lg text-on-surface font-semibold leading-snug">{svc.name}</h4>
                        <div className="text-right">
                          <p className="font-semibold text-primary">${parseFloat(svc.price).toFixed(2)}</p>
                          <p className="text-xs text-outline font-medium">{svc.duration}</p>
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">{svc.description}</p>
                    </div>
                    <div className="px-5 py-4 bg-surface-container-low border-t border-outline-variant/15 flex gap-3">
                      <button 
                        onClick={() => {
                          setEditingService(svc);
                          setServiceForm({
                            name: svc.name,
                            price: svc.price,
                            duration: (svc.duration || '').replace(' min', '').replace(' minutes', '').trim(),
                            category: svc.category || 'Treatments',
                            description: svc.description || '',
                            image: svc.image || ''
                          });
                          setShowServiceModal(true);
                        }}
                        className="flex-1 text-center border border-outline hover:bg-surface-container text-on-surface-variant font-label-lg text-xs py-2 rounded-lg"
                      >
                        Edit Service
                      </button>
                      <button 
                        onClick={() => handleDeleteService(svc.id)}
                        className="border border-error/30 text-error hover:bg-error-container hover:text-on-error-container font-label-lg text-xs px-3.5 rounded-lg flex items-center justify-center"
                        title="Delete Service"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SPECIALISTS */}
          {activeTab === 'specialists' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-outline-variant/20 shadow-sm">
                <div>
                  <h3 className="font-headline-md text-lg text-on-surface font-semibold">Team Specialists</h3>
                  <p className="text-xs text-on-surface-variant">Manage profiles of stylists, directors, and treatments experts.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingSpecialist(null);
                    setSpecialistForm({ name: '', title: '', rating: '5.0', image: '' });
                    setShowSpecialistModal(true);
                  }}
                  className="bg-primary text-on-primary text-xs font-label-lg uppercase tracking-wider px-5 py-2.5 rounded-lg hover:opacity-90 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Add Specialist
                </button>
              </div>

              {/* Specialists List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {specialists.map((sp) => (
                  <div key={sp.id} className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between soft-glow-hover text-center">
                    <div className="h-44 bg-surface-container overflow-hidden relative">
                      <img src={sp.image} alt={sp.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-[10px] font-semibold text-on-surface">{parseFloat(sp.rating || 5.0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <h4 className="font-label-lg text-base text-on-surface font-semibold">{sp.name}</h4>
                      <p className="text-xs text-on-surface-variant">{sp.title}</p>
                    </div>
                    <div className="p-4 border-t border-outline-variant/15 flex gap-2">
                      <button
                        onClick={() => handleOpenSchedule(sp)}
                        className="flex items-center justify-center gap-1 border border-primary/30 hover:bg-primary/10 text-primary font-label-lg text-xs px-2.5 rounded-lg"
                        title="Set weekly schedule"
                      >
                        <span className="material-symbols-outlined text-sm">schedule</span>
                      </button>
                      <button 
                        onClick={() => {
                          setEditingSpecialist(sp);
                          setSpecialistForm({
                            name: sp.name,
                            title: sp.title,
                            rating: sp.rating.toString(),
                            image: sp.image || ''
                          });
                          setShowSpecialistModal(true);
                        }}
                        className="flex-grow text-center border border-outline hover:bg-surface-container text-on-surface-variant font-label-lg text-xs py-2 rounded-lg"
                      >
                        Edit Info
                      </button>
                      <button 
                        onClick={() => handleDeleteSpecialist(sp.id)}
                        className="border border-error/30 text-error hover:bg-error-container hover:text-on-error-container font-label-lg text-xs px-2.5 rounded-lg flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GALLERY */}
          {activeTab === 'gallery' && (
            <PhotoUploader salonId={salon.id} />
          )}

          {/* TAB 5: SALON SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 md:p-8 rounded-xl border border-outline-variant/30 shadow-sm space-y-6">
              <div>
                <h3 className="font-headline-md text-xl text-on-surface font-semibold">Salon Profile Settings</h3>
                <p className="text-xs text-on-surface-variant">Update the public brand details displayed to Aura clients.</p>
              </div>

              <form onSubmit={handleUpdateSalonSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-label-lg text-label-lg text-on-surface-variant">Salon Name</label>
                    <input 
                      className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                      type="text"
                      required
                      value={salonForm.name}
                      onChange={(e) => setSalonForm({ ...salonForm, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-label-lg text-label-lg text-on-surface-variant">Location Address</label>
                    <input 
                      className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                      type="text"
                      required
                      value={salonForm.location}
                      onChange={(e) => setSalonForm({ ...salonForm, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant">Punchy Description</label>
                  <input 
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                    type="text"
                    required
                    value={salonForm.description}
                    onChange={(e) => setSalonForm({ ...salonForm, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant">Detailed About Sanctuary</label>
                  <textarea 
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none h-32 resize-none" 
                    required
                    value={salonForm.about}
                    onChange={(e) => setSalonForm({ ...salonForm, about: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-label-lg text-label-lg text-on-surface-variant">Tags (comma separated)</label>
                    <input 
                      className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                      type="text"
                      value={salonForm.tagsString}
                      onChange={(e) => setSalonForm({ ...salonForm, tagsString: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-label-lg text-label-lg text-on-surface-variant">Profile Banner Image URL</label>
                    <input 
                      className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
                      type="text"
                      value={salonForm.image_url}
                      onChange={(e) => setSalonForm({ ...salonForm, image_url: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="w-full md:w-auto bg-primary text-on-primary px-8 py-3.5 rounded-lg font-label-lg text-label-lg uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm font-semibold cursor-pointer active:scale-95"
                >
                  {actionLoading ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* SERVICE MODAL POPUP */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-outline-variant/30 shadow-2xl p-6 md:p-8 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline-md text-xl text-on-surface font-semibold">
                {editingService ? 'Edit Treatment' : 'Add Treatment Service'}
              </h3>
              <button 
                onClick={() => setShowServiceModal(false)}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-label-lg text-xs text-on-surface-variant">Service Name</label>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors" 
                  placeholder="E.g. Couture Cut & Style"
                  type="text" 
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-label-lg text-xs text-on-surface-variant">Price ($)</label>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors" 
                    placeholder="95.00"
                    type="number" 
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-label-lg text-xs text-on-surface-variant">Duration (minutes)</label>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors" 
                    placeholder="60"
                    type="number" 
                    required
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="block font-label-lg text-xs text-on-surface-variant">Category</label>
                  <select 
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors" 
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                  >
                    <option value="Haircut & Styling">Haircut & Styling</option>
                    <option value="Color & Highlights">Color & Highlights</option>
                    <option value="Treatments">Treatments</option>
                    <option value="Nails">Nails</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-label-lg text-xs text-on-surface-variant">Description</label>
                <textarea 
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors h-20 resize-none" 
                  placeholder="Detail the steps, products used, and benefits..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="block font-label-lg text-xs text-on-surface-variant">Image URL (Optional)</label>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors" 
                  placeholder="https://example.com/service.jpg"
                  type="text" 
                  value={serviceForm.image}
                  onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                />
              </div>

              <button 
                type="submit"
                disabled={actionLoading}
                className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-label-lg uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-1.5"
              >
                {actionLoading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-white text-xs">sync</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Service</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SPECIALIST MODAL POPUP */}
      {showSpecialistModal && (
        <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-outline-variant/30 shadow-2xl p-6 md:p-8 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline-md text-xl text-on-surface font-semibold">
                {editingSpecialist ? 'Edit Specialist' : 'Add Team Specialist'}
              </h3>
              <button 
                onClick={() => setShowSpecialistModal(false)}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSpecialistSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-label-lg text-xs text-on-surface-variant">Full Name</label>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors" 
                  placeholder="Elena Vance"
                  type="text" 
                  required
                  value={specialistForm.name}
                  onChange={(e) => setSpecialistForm({ ...specialistForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-label-lg text-xs text-on-surface-variant">Title</label>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors" 
                    placeholder="E.g. Creative Director"
                    type="text" 
                    required
                    value={specialistForm.title}
                    onChange={(e) => setSpecialistForm({ ...specialistForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-label-lg text-xs text-on-surface-variant">Initial Rating</label>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors" 
                    placeholder="5.0"
                    type="number" 
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={specialistForm.rating}
                    onChange={(e) => setSpecialistForm({ ...specialistForm, rating: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-label-lg text-xs text-on-surface-variant">Profile Photo URL (Optional)</label>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors" 
                  placeholder="https://example.com/photo.jpg"
                  type="text" 
                  value={specialistForm.image}
                  onChange={(e) => setSpecialistForm({ ...specialistForm, image: e.target.value })}
                />
              </div>

              <button 
                type="submit"
                disabled={actionLoading}
                className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-label-lg uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-1.5"
              >
                {actionLoading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-white text-xs">sync</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Specialist</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {showRescheduleModal && rescheduleBooking && (
        <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-outline-variant/30 shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <h3 className="font-headline-md text-xl text-on-surface font-semibold">Reschedule Booking</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{rescheduleBooking.client_name}</p>
              </div>
              <button onClick={() => setShowRescheduleModal(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-label-lg text-xs text-on-surface-variant">New Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="block font-label-lg text-xs text-on-surface-variant">New Time</label>
                <input
                  type="time"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-2.5 px-3 font-body-sm outline-none focus:border-primary transition-colors"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-label-lg uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-1.5"
              >
                {actionLoading ? (
                  <><span className="animate-spin material-symbols-outlined text-white text-xs">sync</span><span>Saving...</span></>
                ) : (
                  <span>Confirm Reschedule</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SPECIALIST SCHEDULE MODAL */}
      {showScheduleModal && scheduleSpecialist && scheduleForm && (
        <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-outline-variant/30 shadow-2xl p-6 md:p-8 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <h3 className="font-headline-md text-xl text-on-surface font-semibold">Weekly Schedule</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{scheduleSpecialist.name}</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              {DAY_LABELS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4 py-2 border-b border-outline-variant/10 last:border-0">
                  <div className="w-10">
                    <span className="text-xs font-bold text-on-surface-variant uppercase">{label}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={scheduleForm[key]?.enabled ?? false}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, [key]: { ...prev[key], enabled: e.target.checked } }))}
                    />
                    <div className="w-10 h-5 bg-outline-variant peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                  {scheduleForm[key]?.enabled && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-lg py-1.5 px-2 font-body-sm outline-none focus:border-primary text-xs"
                        value={scheduleForm[key]?.start || '09:00'}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, [key]: { ...prev[key], start: e.target.value } }))}
                      />
                      <span className="text-xs text-on-surface-variant">to</span>
                      <input
                        type="time"
                        className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-lg py-1.5 px-2 font-body-sm outline-none focus:border-primary text-xs"
                        value={scheduleForm[key]?.end || '18:00'}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, [key]: { ...prev[key], end: e.target.value } }))}
                      />
                    </div>
                  )}
                  {!scheduleForm[key]?.enabled && (
                    <span className="text-xs text-outline italic flex-1">Day off</span>
                  )}
                </div>
              ))}
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-label-lg uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-1.5 mt-4"
              >
                {actionLoading ? (
                  <><span className="animate-spin material-symbols-outlined text-white text-xs">sync</span><span>Saving...</span></>
                ) : (
                  <span>Save Schedule</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerDashboard;

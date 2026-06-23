import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../supabaseClient';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const resetBooking = () => {
    setSelectedServices([]);
    setSelectedSpecialist(null);
    setSelectedDate('');
    setSelectedTime('');
    setClientInfo({
      name: '',
      email: '',
      phone: '',
      notes: ''
    });
  };

  // Supabase Database Methods
  const fetchSalons = async () => {
    const { data, error } = await supabase
      .from('salons')
      .select('*');
    if (error) throw error;
    return data;
  };

  const fetchSalonById = async (id) => {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  };

  const fetchServicesBySalon = async (salonId) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId);
    if (error) throw error;
    return data;
  };

  const fetchSpecialistsBySalon = async (salonId) => {
    const { data, error } = await supabase
      .from('specialists')
      .select('*')
      .eq('salon_id', salonId);
    if (error) throw error;
    return data;
  };

  const createBookingInDb = async (bookingData) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();
    if (error) throw error;
    return data[0];
  };

  const fetchBookingsByEmail = async (email) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, salons(name, location), specialists(name)')
      .eq('client_email', email)
      .order('booking_date', { ascending: false });
    if (error) throw error;
    return data;
  };

  const deleteBookingFromDb = async (id) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    if (error) throw error;
  };

  return (
    <BookingContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchLocation,
        setSearchLocation,
        selectedServices,
        setSelectedServices,
        selectedSpecialist,
        setSelectedSpecialist,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        clientInfo,
        setClientInfo,
        resetBooking,
        // Database operations
        fetchSalons,
        fetchSalonById,
        fetchServicesBySalon,
        fetchSpecialistsBySalon,
        createBookingInDb,
        fetchBookingsByEmail,
        deleteBookingFromDb
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};


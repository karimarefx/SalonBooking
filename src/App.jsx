import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import LandingPage from './components/LandingPage';
import SearchResultsPage from './components/SearchResultsPage';
import SalonProfilePage from './components/SalonProfilePage';
import ServiceSelectionPage from './components/ServiceSelectionPage';
import DateTimePage from './components/DateTimePage';
import ConfirmBookingPage from './components/ConfirmBookingPage';
import BookingSuccessPage from './components/BookingSuccessPage';
import MyBookingsPage from './components/MyBookingsPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ListYourSalonPage from './components/ListYourSalonPage';
import OwnerDashboard from './components/OwnerDashboard';
import SpecialsPage from './components/SpecialsPage';
import AboutPage from './components/AboutPage';
import NotFoundPage from './components/NotFoundPage';

function App() {
  return (
    <BookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/salon/:id" element={<SalonProfilePage />} />
          <Route path="/salon/:id/services" element={<ServiceSelectionPage />} />
          <Route path="/salon/:id/booking/datetime" element={<DateTimePage />} />
          <Route path="/salon/:id/booking/confirm" element={<ConfirmBookingPage />} />
          <Route path="/booking/success" element={<BookingSuccessPage />} />
          <Route path="/account/bookings" element={<MyBookingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/owner/portal" element={<ListYourSalonPage />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/specials" element={<SpecialsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </BookingProvider>
  );
}

export default App;

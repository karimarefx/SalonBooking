import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import OwnerRoute from './components/OwnerRoute';
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
import AboutPage from './components/AboutPage';
import NotFoundPage from './components/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <Routes>
            {/* Public customer routes */}
            <Route path="/" element={<Layout footerVariant="full"><LandingPage /></Layout>} />
            <Route path="/search" element={<Layout footerVariant="full"><SearchResultsPage /></Layout>} />
            <Route path="/salon/:id" element={<Layout footerVariant="full"><SalonProfilePage /></Layout>} />
            <Route path="/salon/:id/services" element={<Layout footerVariant="simple"><ServiceSelectionPage /></Layout>} />
            <Route path="/salon/:id/booking/datetime" element={<Layout footerVariant="simple"><DateTimePage /></Layout>} />
            <Route path="/salon/:id/booking/confirm" element={<Layout footerVariant="simple"><ConfirmBookingPage /></Layout>} />
            <Route path="/booking/success" element={<Layout hideNavbar={true} footerVariant="none"><BookingSuccessPage /></Layout>} />
            <Route path="/account/bookings" element={<Layout footerVariant="full"><MyBookingsPage /></Layout>} />
            <Route path="/about" element={<Layout footerVariant="full"><AboutPage /></Layout>} />

            {/* Owner / auth routes */}
            <Route path="/login" element={<Layout hideNavbar={true} footerVariant="none"><LoginPage /></Layout>} />
            <Route path="/signup" element={<Layout hideNavbar={true} footerVariant="none"><SignupPage /></Layout>} />
            <Route path="/owner/portal" element={<Layout footerVariant="simple"><ListYourSalonPage /></Layout>} />
            <Route
              path="/owner/dashboard"
              element={
                <OwnerRoute>
                  <Layout hideNavbar={true} footerVariant="none">
                    <OwnerDashboard />
                  </Layout>
                </OwnerRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Layout footerVariant="simple"><NotFoundPage /></Layout>} />
          </Routes>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;


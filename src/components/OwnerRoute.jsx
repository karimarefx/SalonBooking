import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * OwnerRoute — wraps routes that require a logged-in salon owner.
 * - While auth is loading: shows a full-screen spinner
 * - If not authenticated: redirects to /login with return path stored in state
 * - If authenticated: renders children
 */
const OwnerRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <span className="animate-spin material-symbols-outlined text-4xl text-primary">sync</span>
        <p className="font-body-lg text-secondary">Verifying your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default OwnerRoute;

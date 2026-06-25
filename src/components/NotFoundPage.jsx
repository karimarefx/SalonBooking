import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased py-12 px-margin-mobile">

      {/* 404 Card */}
      <main className="w-full max-w-md mx-auto my-8 bg-white rounded-2xl border border-outline-variant/30 soft-glow overflow-hidden shadow-lg p-6 md:p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <span className="material-symbols-outlined text-primary text-5xl font-light">explore_off</span>
        </div>
        
        <div className="space-y-2">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Page Not Found</h2>
          <p className="font-body-md text-on-surface-variant">
            The page you are looking for doesn't exist or has been moved. Let's get you back to elegance.
          </p>
        </div>

        <button 
          onClick={handleBackToHome}
          className="w-full bg-primary-container text-white py-4 rounded-lg font-label-lg text-label-lg uppercase tracking-widest hover:bg-primary transition-colors cursor-pointer font-semibold shadow-sm active:scale-95"
        >
          Back to Home
        </button>
      </main>
    </div>
  );
};

export default NotFoundPage;

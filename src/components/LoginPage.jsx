import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { supabase } from '../supabaseClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientInfo, setClientInfo } = useBooking();

  const [email, setEmail] = useState(clientInfo.email || '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Identify where the user navigated from, default to home
  const from = location.state?.from?.pathname || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in both email and password fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const user = data.user;
      setClientInfo(prev => ({
        ...prev,
        email: user.email,
        name: user.user_metadata?.full_name || user.email.split('@')[0].replace('.', ' ')
      }));
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      alert('An error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased flex flex-col justify-between py-12 px-margin-mobile">
      
      {/* Header / Brand */}
      <div className="text-center">
        <span 
          onClick={() => navigate('/')} 
          className="font-display-lg text-display-lg text-primary tracking-widest uppercase cursor-pointer"
        >
          AURA
        </span>
      </div>

      {/* Login Card */}
      <main className="w-full max-w-md mx-auto my-8 bg-white rounded-2xl border border-outline-variant/30 soft-glow overflow-hidden shadow-lg p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Welcome Back</h2>
          <p className="font-body-sm text-on-surface-variant">Sign in to your AURA account to manage bookings.</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="email">Email Address</label>
            <input 
              className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
              id="email" 
              placeholder="you@example.com" 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-label-lg text-label-lg text-on-surface-variant" htmlFor="password">Password</label>
              <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
            <input 
              className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
              id="password" 
              placeholder="••••••••" 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary-container text-white py-4 rounded-lg font-label-lg text-label-lg uppercase tracking-widest hover:bg-primary transition-colors cursor-pointer font-semibold shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin material-symbols-outlined">sync</span>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Link to Signup */}
        <div className="text-center pt-2">
          <p className="text-body-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              state={{ from: location.state?.from }}
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <div className="text-center font-body-sm text-secondary">
        <p>© 2024 AURA Wellness & Beauty. All rights reserved.</p>
      </div>

    </div>
  );
};

export default LoginPage;

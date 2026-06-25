import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { supabase } from '../supabaseClient';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setClientInfo } = useBooking();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Identify where the user navigated from, default to home
  const from = location.state?.from?.pathname || '/';

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Please fill in all the fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        alert(error.message);
        return;
      }

      const user = data.user;
      setClientInfo(prev => ({
        ...prev,
        name: name,
        email: email
      }));
      alert('Account created successfully!');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      alert('An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased py-12 px-margin-mobile">
      {/* Signup Card */}
      <main className="w-full max-w-md mx-auto my-8 bg-white rounded-2xl border border-outline-variant/30 soft-glow overflow-hidden shadow-lg p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Create Account</h2>
          <p className="font-body-sm text-on-surface-variant">Sign up to Miraia to manage your premium beauty services.</p>
        </div>

        <form onSubmit={handleSignupSubmit} className="space-y-6">
          {/* Name field */}
          <div className="space-y-2">
            <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="name">Full Name</label>
            <input 
              className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none" 
              id="name" 
              placeholder="E.g. Isabella Rossi" 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="password">Password</label>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center pt-2">
          <p className="text-body-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link 
              to="/login" 
              state={{ from: location.state?.from }}
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignupPage;

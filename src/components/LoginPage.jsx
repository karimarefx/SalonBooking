import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Where to go after login (defaults to owner dashboard)
  const from = location.state?.from?.pathname || '/owner/dashboard';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please fill in both email and password fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      // AuthContext picks up the session change automatically
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/owner/dashboard`,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setForgotSent(true);
      }
    } catch (err) {
      setErrorMsg('Failed to send reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased py-12 px-margin-mobile">
      {/* Login or Forgot Password Card */}
      <main className="w-full max-w-md mx-auto my-8 bg-white rounded-2xl border border-outline-variant/30 soft-glow overflow-hidden shadow-lg p-6 md:p-8 space-y-6">

        {showForgot ? (
          /* ---- Forgot Password Panel ---- */
          <>
            <div className="text-center space-y-2">
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Reset Password</h2>
              <p className="font-body-sm text-on-surface-variant">Enter your email and we'll send a reset link.</p>
            </div>

            {forgotSent ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center space-y-2">
                <span className="material-symbols-outlined text-green-600 text-3xl">mark_email_read</span>
                <p className="text-green-700 font-semibold">Check your inbox!</p>
                <p className="text-sm text-green-600">A password reset link has been sent to <strong>{forgotEmail}</strong>.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="forgot-email">Email Address</label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none"
                    id="forgot-email"
                    placeholder="you@example.com"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-container text-white py-4 rounded-lg font-label-lg text-label-lg uppercase tracking-widest hover:bg-primary transition-colors cursor-pointer font-semibold shadow-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><span className="animate-spin material-symbols-outlined">sync</span><span>Sending...</span></>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                onClick={() => { setShowForgot(false); setForgotSent(false); setErrorMsg(''); }}
                className="text-primary font-semibold hover:underline text-sm"
              >
                ← Back to Sign In
              </button>
            </div>
          </>
        ) : (
          /* ---- Login Panel ---- */
          <>
            <div className="text-center space-y-2">
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Owner Sign In</h2>
              <p className="font-body-sm text-on-surface-variant">Sign in to access your salon dashboard.</p>
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
                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotEmail(email); setErrorMsg(''); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-0 font-body-md text-on-surface outline-none pr-10"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-3 text-secondary hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl font-light">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-container text-white py-4 rounded-lg font-label-lg text-label-lg uppercase tracking-widest hover:bg-primary transition-colors cursor-pointer font-semibold shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><span className="animate-spin material-symbols-outlined">sync</span><span>Signing In...</span></>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-body-sm text-on-surface-variant">
                Don't have an account?{' '}
                <Link
                  to="/owner/portal"
                  className="text-primary font-semibold hover:underline"
                >
                  Register your salon
                </Link>
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default LoginPage;

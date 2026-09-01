import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff, AlertCircle, LogIn, UserPlus, MailCheck, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import { JournalLogo } from './JournalLogo';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from '../firebase';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setResendStatus(null);
    setIsGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Google authenticated accounts are automatically email verified
      const loggedInUser: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Friend',
        email: fbUser.email || '',
        avatarUrl: fbUser.photoURL || undefined,
        avatarId: fbUser.photoURL ? undefined : 'panda',
        companionName: 'Luna',
        companionAvatarId: 'mint-leaf',
        isGuest: false,
        themePreference: 'teal-quill',
        createdAt: new Date().toISOString(),
      };
      onLogin(loggedInUser);
    } catch (err: any) {
      const code = err?.code || '';

      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User voluntarily dismissed or closed the Google sign-in window
        console.log('Google sign-in popup was dismissed by user.');
        setErrorMessage(null);
      } else if (code === 'auth/popup-blocked') {
        console.warn('Google sign-in popup blocked:', err);
        setErrorMessage('Sign-in popup was blocked by browser. Please allow popups for this site.');
      } else if (code === 'auth/account-exists-with-different-credential') {
        console.warn('Account exists with different credential:', err);
        setErrorMessage('An account already exists with this email using a different sign-in method.');
      } else {
        console.error('Google Sign-In error:', code, err);
        setErrorMessage(err?.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResendStatus(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const fbUser = userCredential.user;

        // Check if email is verified
        if (!fbUser.emailVerified) {
          // Block access, sign out immediately, and display verification screen
          try {
            await sendEmailVerification(fbUser);
          } catch (e) {
            // Ignore rate limits on resend during login check
          }
          await signOut(auth);
          setVerificationEmail(fbUser.email || trimmedEmail);
          setIsLoading(false);
          return;
        }

        // Email is verified -> Proceed to dashboard
        const loggedInUser: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || trimmedEmail.split('@')[0] || 'Friend',
          email: fbUser.email || trimmedEmail,
          avatarId: 'panda',
          companionName: 'Luna',
          companionAvatarId: 'mint-leaf',
          isGuest: false,
          themePreference: 'teal-quill',
          createdAt: new Date().toISOString(),
        };
        onLogin(loggedInUser);
      } else {
        // Sign Up Mode
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        const fbUser = userCredential.user;

        // Send verification email
        await sendEmailVerification(fbUser);

        // Do not sign them in automatically - sign out immediately
        await signOut(auth);

        // Show verification screen
        setVerificationEmail(fbUser.email || trimmedEmail);
      }
    } catch (err: any) {
      const code = err?.code || '';
      console.error('Firebase auth error:', code, err?.message);

      if (authMode === 'signin') {
        if (
          code === 'auth/invalid-credential' ||
          code === 'auth/user-not-found' ||
          code === 'auth/wrong-password' ||
          code === 'auth/invalid-email'
        ) {
          setErrorMessage('Email or password is incorrect');
        } else if (code === 'auth/too-many-requests') {
          setErrorMessage('Too many failed attempts. Please try again in a few moments.');
        } else {
          setErrorMessage('Email or password is incorrect');
        }
      } else {
        if (code === 'auth/email-already-in-use') {
          setErrorMessage('User already exists. Please sign in');
        } else if (code === 'auth/weak-password') {
          setErrorMessage('Password should be at least 6 characters.');
        } else if (code === 'auth/invalid-email') {
          setErrorMessage('Please enter a valid email address.');
        } else {
          setErrorMessage(err?.message || 'Failed to create account. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!verificationEmail || !password) {
      setResendStatus('Please return to login to resend verification.');
      return;
    }
    setIsResending(true);
    setResendStatus(null);
    try {
      // Re-authenticate briefly to send verification email
      const userCredential = await signInWithEmailAndPassword(auth, verificationEmail, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      setResendStatus('Verification email resent successfully!');
    } catch (err: any) {
      console.error('Resend email error:', err);
      setResendStatus('Could not resend right now. Please try logging in.');
    } finally {
      setIsResending(false);
    }
  };

  const handleReturnToLogin = () => {
    setVerificationEmail(null);
    setAuthMode('signin');
    setErrorMessage(null);
    setResendStatus(null);
  };

  return (
    <div
      id="nightday-login-container"
      className="min-h-screen w-full bg-[#FCF8F9] flex items-center justify-center p-4 sm:p-6 font-sans text-stone-800"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#FFFFFF] border border-[#F2D7E0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden"
      >
        {/* Decorative spine accent */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-teal-500 to-teal-700" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 pl-2">
          <JournalLogo size="lg" showText={false} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#134E4A] font-serif">
              NightDay
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-xs mx-auto leading-relaxed font-journal">
              Your mindful journal with caring reflections & serene ambient music.
            </p>
          </div>
        </div>

        {verificationEmail ? (
          /* Email Verification Screen */
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pl-2 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shadow-xs">
              <MailCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-[#134E4A] font-serif">
                Verify Your Email
              </h2>
              <p id="email-verification-message" className="text-stone-700 text-sm leading-relaxed px-2">
                We have sent you a verification email to <span className="font-semibold text-teal-800 break-all">{verificationEmail}</span>. Please verify it and log in.
              </p>
            </div>

            {resendStatus && (
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
                {resendStatus}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                id="verification-login-btn"
                type="button"
                onClick={handleReturnToLogin}
                className="w-full bg-[#134E4A] hover:bg-[#0F3F3C] text-white font-medium py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>

              {password && (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="text-xs text-stone-500 hover:text-teal-700 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{isResending ? 'Resending email...' : 'Resend verification email'}</span>
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* Sign In / Sign Up Form */
          <>
            {/* Continue with Google Option */}
            <div className="pl-1 space-y-3">
              <button
                id="google-signin-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-white hover:bg-stone-50 border border-stone-200/90 hover:border-stone-300 text-stone-800 font-medium py-2.5 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                {isGoogleLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-stone-300 border-t-teal-700 rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-stone-600">Connecting to Google...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="font-semibold text-stone-700">Continue with Google</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center py-1">
                <div className="w-full border-t border-stone-200" />
                <span className="bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-stone-400 absolute">
                  or with email
                </span>
              </div>
            </div>

            {/* Auth Mode Tabs (Sign In / Sign Up) */}
            <div className="flex rounded-2xl bg-stone-100/80 p-1 border border-stone-200/70">
              <button
                type="button"
                id="auth-tab-signin"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                id="auth-tab-signup"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Error Alert Box */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </motion.div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pl-1">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 bg-stone-50/50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 bg-stone-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full bg-[#134E4A] hover:bg-[#0F3F3C] text-white font-medium py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Sign In to Journal' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Switch Mode Prompt */}
            <div className="text-center pt-1 border-t border-stone-100">
              {authMode === 'signin' ? (
                <p className="text-xs text-stone-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage(null);
                    }}
                    className="text-teal-700 font-semibold hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-xs text-stone-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMessage(null);
                    }}
                    className="text-teal-700 font-semibold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </>
        )}

        {/* Privacy Sanctuary Note */}
        <div className="text-center">
          <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>Private, secure sanctuary for your daily reflections</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};



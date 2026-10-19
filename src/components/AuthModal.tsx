import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  firebaseSignOut,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  getFirebaseConfig,
} from '../services/firebase';
import type { User } from '../services/firebase';
import { sound } from '../services/soundService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogoutSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogoutSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(false);

  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [configJsonInput, setConfigJsonInput] = useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setErrorMsg('Authentication service unavailable. Please check your connection or custom config.');
      return;
    }
    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      sound.playLevelUp();
      onLoginSuccess(result.user);
      onClose();
    } catch (e: unknown) {
      const err = e as { message?: string; code?: string };
      if (err.code === 'auth/unauthorized-domain') {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'domain';
        setErrorMsg(
          `Domain "${hostname}" is not yet in Firebase Authorized Domains. To use Google Sign-In here, add "${hostname}" in Firebase Console > Authentication > Settings > Authorized Domains. Note: Your routines and XP are still 100% safely saved in local offline mode!`
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup was closed before completing.');
      } else {
        setErrorMsg(err.message || 'Google sign-in was cancelled or encountered an issue.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setErrorMsg('Authentication service unavailable. Please check your connection or custom config.');
      return;
    }
    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        sound.playLevelUp();
        onLoginSuccess(result.user);
        onClose();
      } else if (authMode === 'signup') {
        // Create Account & Automatically Send Verification Email
        const result = await createUserWithEmailAndPassword(auth, email, password);
        sound.playCheck();
        try {
          await sendEmailVerification(result.user);
        } catch (verifErr) {
          console.warn('Email verification send issue:', verifErr);
        }
        setVerificationPendingEmail(email);
        onLoginSuccess(result.user);
      }
    } catch (e: unknown) {
      const err = e as { message?: string; code?: string };
      if (err.code === 'auth/unauthorized-domain') {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'domain';
        setErrorMsg(
          `Domain "${hostname}" is not yet in Firebase Authorized Domains. Add "${hostname}" in Firebase Console > Authentication > Settings > Authorized Domains.`
        );
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Incorrect email or password. Please try again or click "Forgot password?".');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Please switch to Sign In.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please check your details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setErrorMsg('Authentication service unavailable. Please check your connection.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address to receive the password reset link.');
      return;
    }

    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      sound.playCheck();
      setInfoMsg(`✉️ Password reset email sent to ${email.trim()}! Please check your inbox and spam folder.`);
    } catch (e: unknown) {
      const err = e as { message?: string; code?: string };
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(err.message || 'Failed to send reset link. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth?.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setInfoMsg('✉️ A new verification link has been sent to your email.');
      setResendCooldown(true);
      setTimeout(() => setResendCooldown(false), 30000);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to resend verification email. Please try again in a few moments.');
    }
  };

  const handleCheckVerification = async () => {
    if (!auth?.currentUser) return;
    setIsLoading(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        sound.playLevelUp();
        setInfoMsg('🎉 Email verified successfully! Your account is active.');
        setVerificationPendingEmail(null);
        onLoginSuccess(auth.currentUser);
      } else {
        setErrorMsg('Email not verified yet. Please click the link inside your email, then check again.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Could not verify status. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setVerificationPendingEmail(null);
      onLogoutSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '450px' }}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}
                >
                  ☁️
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {currentUser ? 'Your Cloud Account' : authMode === 'forgot' ? 'Reset Password' : 'Save Your Progress'}
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {currentUser ? 'Cloud backup active' : authMode === 'forgot' ? 'Recover your account access' : 'Sync your tasks across all devices'}
                  </p>
                </div>
              </div>
              <button className="btn-icon" onClick={onClose} aria-label="Close modal">
                ✕
              </button>
            </div>

            {/* Verification Sent Banner (Shown right after Account Creation) */}
            {verificationPendingEmail ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-sun-light)',
                    color: 'var(--accent-sun)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    margin: '0 auto 12px',
                  }}
                >
                  ✉️
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Check Your Inbox!
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  We sent a verification link to <strong>{verificationPendingEmail}</strong>. Please click the link to confirm your address and protect your account.
                </p>

                {infoMsg && (
                  <div style={{ padding: '8px 12px', background: 'var(--success-light)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 700 }}>
                    {infoMsg}
                  </div>
                )}

                {errorMsg && (
                  <div style={{ padding: '8px 12px', background: 'var(--accent-fire-light)', color: 'var(--accent-fire)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '14px' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
                    onClick={handleCheckVerification}
                    disabled={isLoading}
                  >
                    <span>{isLoading ? 'Checking...' : "I've Clicked the Link → Verify Status"}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', padding: '9px', fontSize: '0.82rem' }}
                    onClick={handleResendVerification}
                    disabled={resendCooldown}
                  >
                    <span>{resendCooldown ? 'Sent! Wait 30s to resend' : 'Resend Verification Email'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', padding: '9px', fontSize: '0.82rem', marginTop: '6px' }}
                    onClick={onClose}
                  >
                    <span>Continue into App</span>
                  </button>
                </div>
              </div>
            ) : currentUser ? (
              /* Logged in profile view */
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-sun-light)',
                    color: 'var(--xp-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    margin: '0 auto 12px',
                    border: '2px solid var(--xp-gold)',
                  }}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                    />
                  ) : (
                    (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {currentUser.displayName || 'Rhythm Explorer'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  {currentUser.email}
                </p>

                {/* Email verification status badge */}
                {currentUser.email && !currentUser.emailVerified && !currentUser.providerData.some((p) => p.providerId === 'google.com') && (
                  <div
                    style={{
                      background: 'var(--accent-sun-light)',
                      border: '1px solid var(--accent-sun)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      marginBottom: '16px',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--accent-sun)', marginBottom: '4px' }}>
                      <span>⚠️</span>
                      <span>Email Not Verified Yet</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Please verify your email address to secure your account.
                    </p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={handleResendVerification}
                        disabled={resendCooldown}
                      >
                        Resend Email
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={handleCheckVerification}
                        disabled={isLoading}
                      >
                        Check Status
                      </button>
                    </div>
                  </div>
                )}

                {infoMsg && (
                  <div style={{ padding: '8px 12px', background: 'var(--success-light)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 700 }}>
                    {infoMsg}
                  </div>
                )}

                <div
                  style={{
                    background: 'var(--success-light)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    marginBottom: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>✓</span>
                  <span>All progress & streaks automatically synced to cloud</span>
                </div>

                <button
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', color: 'var(--accent-fire)', borderColor: 'var(--accent-fire)' }}
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            ) : authMode === 'forgot' ? (
              /* Password Reset Form */
              <div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.45 }}>
                  Forgot your password? Enter your email below and we'll send you a password reset link.
                </p>

                <form onSubmit={handlePasswordReset}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reset-email">Email Address</label>
                    <input
                      id="reset-email"
                      type="email"
                      className="form-input"
                      placeholder="yourname@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  {infoMsg && (
                    <div style={{ padding: '8px 12px', background: 'var(--success-light)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '12px', fontWeight: 700 }}>
                      {infoMsg}
                    </div>
                  )}

                  {errorMsg && (
                    <div
                      style={{
                        padding: '8px 12px',
                        background: 'var(--accent-fire-light)',
                        color: 'var(--accent-fire)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        marginBottom: '12px',
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '10px' }}
                    disabled={isLoading}
                  >
                    <span>{isLoading ? 'Sending...' : 'Send Password Reset Link'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                  >
                    <span>← Back to Sign In</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Sign In & Sign Up Form */
              <div>
                {/* Friendly Non-Overwhelming Info Banner */}
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                    lineHeight: 1.4,
                  }}
                >
                  💡 <strong>Why create an account?</strong> Keep your daily streak, XP, and custom tasks safely backed up so you can log in on your phone, tablet, or computer anytime.
                </div>

                {/* Tab switch: Sign In vs Create Account */}
                <div
                  style={{
                    display: 'flex',
                    background: 'var(--bg-surface-subtle)',
                    padding: '3px',
                    borderRadius: 'var(--radius-full)',
                    marginBottom: '16px',
                    gap: '4px',
                  }}
                >
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: authMode === 'signin' ? 'var(--bg-surface)' : 'transparent',
                      color: authMode === 'signin' ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: authMode === 'signin' ? 'var(--shadow-sm)' : 'none',
                      border: authMode === 'signin' ? '1px solid var(--border-subtle)' : 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                  >
                    Sign In
                  </button>

                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: authMode === 'signup' ? 'var(--bg-surface)' : 'transparent',
                      color: authMode === 'signup' ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: authMode === 'signup' ? 'var(--shadow-sm)' : 'none',
                      border: authMode === 'signup' ? '1px solid var(--border-subtle)' : 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                  >
                    Create Account
                  </button>
                </div>

                {/* Google One-Click Button */}
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '11px',
                    marginBottom: '14px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    gap: '10px',
                  }}
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '14px 0',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                  <span style={{ padding: '0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or with email</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                </div>

                {/* Email & Password Form */}
                <form onSubmit={handleEmailAuth}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="auth-email">Email Address</label>
                    <input
                      id="auth-email"
                      type="email"
                      className="form-input"
                      placeholder="yourname@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label" htmlFor="auth-password">Password</label>
                      {authMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('forgot');
                            setErrorMsg(null);
                            setInfoMsg(null);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                            marginBottom: '4px',
                          }}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      id="auth-password"
                      type="password"
                      className="form-input"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {authMode === 'signup' && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      🔒 We'll send a verification link to this email to ensure nobody signs up with your address by mistake.
                    </div>
                  )}

                  {infoMsg && (
                    <div style={{ padding: '8px 12px', background: 'var(--success-light)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '12px', fontWeight: 700 }}>
                      {infoMsg}
                    </div>
                  )}

                  {errorMsg && (
                    <div
                      style={{
                        padding: '8px 12px',
                        background: 'var(--accent-fire-light)',
                        color: 'var(--accent-fire)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        marginBottom: '12px',
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                    disabled={isLoading}
                  >
                    <span>{isLoading ? 'Connecting...' : authMode === 'signin' ? 'Sign In to My Account' : 'Create Free Account & Verify'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* Cloud Config / Advanced Settings Drawer */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                }}
              >
                <span>⚙️ Cloud Project Settings & Local Mode</span>
                <span>{showConfigDrawer ? '▲' : '▼'}</span>
              </button>

              {showConfigDrawer && (
                <div style={{ marginTop: '12px', textAlign: 'left', background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <strong>Active Project:</strong> {getFirebaseConfig()?.projectId || 'Default (rhythm-quest-cf3d8)'}
                  </p>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.75rem' }}>
                    Paste your own Firebase configuration JSON below to connect to your personal Firebase backend, or leave default:
                  </p>
                  <textarea
                    rows={4}
                    value={configJsonInput}
                    onChange={(e) => setConfigJsonInput(e.target.value)}
                    placeholder='{"apiKey": "...", "projectId": "...", "authDomain": "..."}'
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      marginBottom: '8px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(configJsonInput);
                          if (!parsed.apiKey || !parsed.projectId) {
                            setErrorMsg('Config JSON must contain at least "apiKey" and "projectId".');
                            return;
                          }
                          saveCustomFirebaseConfig(parsed);
                          setInfoMsg('Custom Firebase credentials saved! Please refresh to connect.');
                          setConfigJsonInput('');
                        } catch {
                          setErrorMsg('Invalid JSON format. Please paste valid JSON.');
                        }
                      }}
                    >
                      Save Custom Config
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                      onClick={() => {
                        clearCustomFirebaseConfig();
                        setInfoMsg('Reset to default project credentials.');
                      }}
                    >
                      Reset to Default
                    </button>
                  </div>
                  <div style={{ marginTop: '10px', padding: '8px', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontSize: '0.75rem' }}>
                    🔒 <strong>100% Offline Capable:</strong> If you do not sign in, all routines, XP, soundscapes, timers, and AI breakdowns are saved locally on this device.
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

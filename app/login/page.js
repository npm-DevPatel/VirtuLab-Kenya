'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, AuthErrorCodes } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import SiteNav from '@/components/Nav';
import styles from '../auth.module.css';

// ── Map Firebase error codes to plain, specific messages ───
function firebaseErrorMessage(code) {
  switch (code) {
    case AuthErrorCodes.INVALID_EMAIL:
    case 'auth/invalid-email':
    case AuthErrorCodes.USER_DELETED:
    case 'auth/user-not-found':
    case AuthErrorCodes.INVALID_PASSWORD:
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/network-request-failed':
      return 'Network error - check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment before trying again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

function validate(fields) {
  const errors = {};
  if (!fields.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!fields.password) {
    errors.password = 'Enter your password.';
  }
  return errors;
}

export default function LoginPage() {
  const router = useRouter();

  const [fields, setFields] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    if (formError) setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setFormError('');

    try {
      await signInWithEmailAndPassword(auth, fields.email.trim(), fields.password);
      setSubmitted(true);
      setTimeout(() => router.push('/experiments'), 700);
    } catch (err) {
      setSubmitting(false);
      setFormError(firebaseErrorMessage(err.code));
    }
  }

  return (
    <>
      <SiteNav />
      <main className={styles.authPage}>
        <div className={styles.authCard}>
          <header className={styles.authHeader}>
            <h1 className={styles.authTitle}>Log in.</h1>
            <p className={`text-muted ${styles.authSub}`}>
              Welcome back. Enter your details to continue.
            </p>
          </header>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
            aria-label="Log in form"
          >
            {/* Form-level error */}
            {formError && (
              <div className={styles.formErrorBanner} role="alert">
                {formError}
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                value={fields.email}
                onChange={handleChange}
                disabled={submitting || submitted}
                aria-describedby={errors.email ? 'err-login-email' : undefined}
              />
              {errors.email && (
                <span id="err-login-email" className="form-error" role="alert">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label htmlFor="login-password" className="form-label">Password</label>
                <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`form-input${errors.password ? ' error' : ''}`}
                value={fields.password}
                onChange={handleChange}
                disabled={submitting || submitted}
                aria-describedby={errors.password ? 'err-login-password' : undefined}
              />
              {errors.password && (
                <span id="err-login-password" className="form-error" role="alert">{errors.password}</span>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={submitting || submitted}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <Spinner /> Logging in…
                </>
              ) : submitted ? (
                'Done - redirecting…'
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <p className={styles.switchLink}>
            Don&rsquo;t have an account?{' '}
            <Link href="/signup">Create one - it&rsquo;s free.</Link>
          </p>
        </div>
      </main>
    </>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.spinner}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M8 2 A6 6 0 0 1 14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

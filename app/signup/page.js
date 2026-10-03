'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  AuthErrorCodes,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import SiteNav from '@/components/Nav';
import styles from '../auth.module.css';

// ── Field-level validation (runs before Firebase) ──────────
function validate(fields) {
  const errors = {};
  if (!fields.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!fields.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!fields.password) {
    errors.password = 'Enter a password.';
  } else if (fields.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
}

// ── Map Firebase error codes to plain, specific messages ───
function firebaseErrorMessage(code) {
  switch (code) {
    case AuthErrorCodes.EMAIL_EXISTS:
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Log in instead.';
    case AuthErrorCodes.INVALID_EMAIL:
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case AuthErrorCodes.WEAK_PASSWORD:
    case 'auth/weak-password':
      return 'Password must be at least 8 characters.';
    case 'auth/network-request-failed':
      return 'Network error - check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment before trying again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function SignUpPage() {
  const router = useRouter();

  const [fields, setFields] = useState({
    fullName: '',
    email: '',
    password: '',
    school: '',
    role: 'student',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');   // top-level Firebase errors
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((f) => ({ ...f, [name]: value }));
    // Clear field-level error on edit
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    if (formError) setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // 1 - Client-side validation
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      // 2 - Create the Firebase account
      const credential = await createUserWithEmailAndPassword(
        auth,
        fields.email.trim(),
        fields.password,
      );

      // 3 - Attach the display name (school & role stored for future Supabase/Firestore use)
      await updateProfile(credential.user, {
        displayName: fields.fullName.trim(),
      });

      // 4 - Success
      setSubmitted(true);
      // Brief pause so the success state is visible, then redirect to catalogue
      setTimeout(() => router.push('/experiments'), 700);
    } catch (err) {
      setSubmitting(false);
      const msg = firebaseErrorMessage(err.code);
      // "email already in use" is field-level; everything else is form-level
      if (
        err.code === 'auth/email-already-in-use' ||
        err.code === AuthErrorCodes.EMAIL_EXISTS
      ) {
        setErrors({ email: msg });
      } else {
        setFormError(msg);
      }
    }
  }

  return (
    <>
      <SiteNav />
      <main className={styles.authPage}>
        <div className={styles.authCard}>
          <header className={styles.authHeader}>
            <h1 className={styles.authTitle}>Create your account.</h1>
            <p className={`text-muted ${styles.authSub}`}>
              Free for students and teachers. No card required.
            </p>
          </header>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
            aria-label="Sign up form"
          >
            {/* Form-level error (Firebase / network) */}
            {formError && (
              <div className={styles.formErrorBanner} role="alert">
                {formError}
              </div>
            )}

            {/* Full name */}
            <div className="form-group">
              <label htmlFor="signup-fullName" className="form-label">Full name</label>
              <input
                id="signup-fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                className={`form-input${errors.fullName ? ' error' : ''}`}
                value={fields.fullName}
                onChange={handleChange}
                disabled={submitting || submitted}
                aria-describedby={errors.fullName ? 'err-fullName' : undefined}
              />
              {errors.fullName && (
                <span id="err-fullName" className="form-error" role="alert">
                  {errors.fullName}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="signup-email" className="form-label">Email address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                value={fields.email}
                onChange={handleChange}
                disabled={submitting || submitted}
                aria-describedby={errors.email ? 'err-email' : undefined}
              />
              {errors.email && (
                <span id="err-email" className="form-error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="signup-password" className="form-label">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`form-input${errors.password ? ' error' : ''}`}
                value={fields.password}
                onChange={handleChange}
                disabled={submitting || submitted}
                aria-describedby={errors.password ? 'err-password' : undefined}
              />
              {errors.password && (
                <span id="err-password" className="form-error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            {/* School (optional) */}
            <div className="form-group">
              <label htmlFor="signup-school" className="form-label">
                School{' '}
                <span className={`text-muted ${styles.optionalTag}`}>(optional)</span>
              </label>
              <input
                id="signup-school"
                name="school"
                type="text"
                autoComplete="organization"
                className="form-input"
                value={fields.school}
                onChange={handleChange}
                disabled={submitting || submitted}
              />
            </div>

            {/* Role */}
            <div className="form-group">
              <fieldset className={styles.roleFieldset} disabled={submitting || submitted}>
                <legend className={`form-label ${styles.roleLegend}`}>I am a</legend>
                <div className={styles.roleOptions}>
                  <label className={styles.roleOption}>
                    <input
                      id="role-student"
                      type="radio"
                      name="role"
                      value="student"
                      checked={fields.role === 'student'}
                      onChange={handleChange}
                      className={styles.roleRadio}
                    />
                    <span className={styles.roleLabel}>Student</span>
                  </label>
                  <label className={styles.roleOption}>
                    <input
                      id="role-teacher"
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={fields.role === 'teacher'}
                      onChange={handleChange}
                      className={styles.roleRadio}
                    />
                    <span className={styles.roleLabel}>Teacher</span>
                  </label>
                </div>
              </fieldset>
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              className="btn btn-primary"
              disabled={submitting || submitted}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <Spinner /> Creating account…
                </>
              ) : submitted ? (
                'Done - redirecting…'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className={styles.switchLink}>
            Already have an account?{' '}
            <Link href="/login">Log in.</Link>
          </p>
        </div>
      </main>
    </>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={styles.spinner}
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M8 2 A6 6 0 0 1 14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

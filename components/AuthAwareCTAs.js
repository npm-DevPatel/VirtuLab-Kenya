'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export function HeroCtas({ className, btnPrimaryClass, btnSecondaryClass }) {
  const { user, loading } = useAuth();
  const loggedIn = !!user;

  return (
    <div className={className}>
      {loading ? (
        <span>Loading...</span>
      ) : loggedIn ? (
        <Link href="/experiments" className={btnPrimaryClass}>Go to Dashboard</Link>
      ) : (
        <>
          <Link href="/signup" className={btnPrimaryClass}>Create Your Account</Link>
          <Link href="/experiments" className={btnSecondaryClass}>Browse Experiments</Link>
        </>
      )}
    </div>
  );
}

export function CtaStrip({ sectionClass, containerClass, headingClass, subClass, btnClass }) {
  const { user, loading } = useAuth();
  const loggedIn = !!user;

  if (loading || loggedIn) return null;

  return (
    <section className={sectionClass} aria-label="Sign up call to action">
      <div className={containerClass}>
        <h2 className={headingClass}>Ready to try it?</h2>
        <p className={`text-muted ${subClass}`}>
          Free for students and teachers. No card required.
        </p>
        <Link href="/signup" className={btnClass}>Create Your Account</Link>
      </div>
    </section>
  );
}

export function FooterAuthLinks({ footerLinkClass }) {
  const { user, loading } = useAuth();
  const loggedIn = !!user;

  if (loading) return null;

  if (loggedIn) {
    return (
      <Link href="/experiments" className={footerLinkClass}>My Experiments</Link>
    );
  }

  return (
    <>
      <Link href="/login" className={footerLinkClass}>Log in</Link>
      <Link href="/signup" className={footerLinkClass}>Sign up</Link>
    </>
  );
}

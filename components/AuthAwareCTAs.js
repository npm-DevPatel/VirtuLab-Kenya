'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function HeroCtas({ className, btnPrimaryClass, btnSecondaryClass }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className={className}>
      {loggedIn ? (
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
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (loggedIn) return null;

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

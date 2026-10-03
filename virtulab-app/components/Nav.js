'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Nav.module.css';

/**
 * SiteNav — top navigation bar.
 * loggedIn prop controls whether to show user menu or log in / sign up.
 */
export default function SiteNav({ loggedIn = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="VirtuLab Kenya home">
          <LogoMark />
          <span className={styles.logoText}>VirtuLab Kenya</span>
        </Link>

        {/* Desktop links */}
        <nav className={styles.links} aria-label="Main navigation">
          <Link href="/experiments" className={styles.navLink}>Experiments</Link>
          <Link href="/#how-it-works" className={styles.navLink}>How it works</Link>
        </nav>

        {/* Auth area — desktop */}
        <div className={styles.auth}>
          {loggedIn ? (
            <Link href="/experiments" className="btn btn-primary">My Experiments</Link>
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>Log in</Link>
              <Link href="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu} role="navigation" aria-label="Mobile navigation">
          <Link href="/experiments" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Experiments</Link>
          <Link href="/#how-it-works" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>How it works</Link>
          <hr className="divider" />
          {loggedIn ? (
            <Link href="/experiments" className={`btn btn-primary ${styles.mobileAuthBtn}`}>My Experiments</Link>
          ) : (
            <>
              <Link href="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link href="/signup" className={`btn btn-primary ${styles.mobileAuthBtn}`} onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      {/* Stylised flask — two lines for the neck, triangular body, a drop inside */}
      <rect x="11" y="2" width="6" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M11 10 L4 24 Q3.5 26 6 26 H22 Q24.5 26 24 24 L17 10 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <circle cx="14" cy="19" r="2.5" fill="currentColor" opacity="0.25"/>
      <circle cx="18" cy="22" r="1.2" fill="currentColor" opacity="0.18"/>
    </svg>
  );
}

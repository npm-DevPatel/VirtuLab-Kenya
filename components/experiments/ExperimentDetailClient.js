'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SiteNav from '@/components/Nav';
import { useAuth } from '@/components/AuthProvider';
import styles from '@/app/experiments/[id]/detail.module.css';

/**
 * Universal Lab Shell — dynamically loaded (no SSR) for all 12 experiments.
 * The shell itself handles the per-experiment module imports internally.
 */
const LabShell = dynamic(
  () => import('@/components/experiments/LabShell'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          gap: '16px',
        }}
      >
        <p style={{ fontSize: '18px', fontWeight: 500 }}>
          Loading 3D Virtual Laboratory…
        </p>
      </div>
    ),
  }
);

const subjectLabel = {
  Chemistry: 'Chemistry Laboratory',
  Physics:   'Physics Laboratory',
  Biology:   'Biology Laboratory',
};

export default function ExperimentDetailClient({ exp, subjectTagClass, subjectSlug }) {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isLabRequested =
    searchParams.get('lab') === 'true' || searchParams.get('lab') === '1';

  const [manuallyOpened, setManuallyOpened] = useState(false);
  const [closedByStudent, setClosedByStudent] = useState(false);

  const shouldOpenLab = (isLabRequested && !closedByStudent) || manuallyOpened;

  // All 12 experiments now launch the universal LabShell when user is logged in.
  const isLabActive = Boolean(shouldOpenLab && user);
  const showLockedPrompt = Boolean(shouldOpenLab && !user && !authLoading);

  function handleLaunchClick() {
    if (user) {
      setClosedByStudent(false);
      setManuallyOpened(true);
    } else {
      router.push(`/login?redirect=/experiments/${exp.id}?lab=true`);
    }
  }

  function handleExitLab() {
    setClosedByStudent(true);
    setManuallyOpened(false);
    if (searchParams.get('lab')) {
      router.replace(`/experiments/${exp.id}`);
    }
  }

  // Active full-screen 3D lab view
  if (isLabActive) {
    return <LabShell experiment={exp} onExit={handleExitLab} />;
  }

  return (
    <>
      <SiteNav />
      <main className={styles.page}>
        <div className="container">
          {/* Breadcrumb */}
          <nav className={`breadcrumb ${styles.breadcrumb}`} aria-label="Breadcrumb">
            <Link href="/experiments">Experiments</Link>
            <span className="breadcrumb__sep" aria-hidden="true">›</span>
            <Link href={`/experiments#section-${subjectSlug[exp.subject]}`}>
              {exp.subject}
            </Link>
            <span className="breadcrumb__sep" aria-hidden="true">›</span>
            <span className="breadcrumb__current">{exp.title}</span>
          </nav>

          {/* Header */}
          <header className={styles.header}>
            <span className={`subject-tag ${subjectTagClass[exp.subject]}`}>
              {exp.subject}
            </span>
            <h1 className={styles.title}>{exp.title}</h1>
            <p className={styles.description}>{exp.description}</p>
          </header>

          {/* Locked Alert if unauthorized launch attempt was made */}
          {showLockedPrompt && (
            <div className={styles.lockedCard} role="alert">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🔒</span>
                <h3 className={styles.lockedCardHeading}>Authentication Required</h3>
              </div>
              <p className={styles.lockedCardText}>
                You must be logged in to open the interactive 3D virtual laboratory.
                Please sign in with your student or teacher account to continue.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <Link
                  href={`/login?redirect=/experiments/${exp.id}?lab=true`}
                  className="btn btn-primary"
                >
                  Log in to Launch 3D Lab
                </Link>
                <Link href="/signup" className="btn btn-secondary">
                  Create Free Account
                </Link>
              </div>
            </div>
          )}

          {/* Interactive 3D Lab Launch Block — available for ALL experiments */}
          <div className={styles.readyBlock} role="region" aria-label="Interactive 3D Simulation">
            <div className={styles.readyBadgeRow}>
              <span className={styles.readyBadge}>
                <span className={styles.readyBadgeDot} /> 3D Virtual Lab Ready
              </span>
              <span className="mono-small" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                {exp.subject} Practical
              </span>
            </div>

            <div>
              <h2 className={styles.readyHeading}>
                {exp.title} — 3D Simulation
              </h2>
              <p className={styles.readyText} style={{ marginTop: '8px' }}>
                A guided, step-by-step 3D virtual {subjectLabel[exp.subject] ?? 'laboratory'}.
                Walk through the KCSE procedure with interactive apparatus on a shared Kenyan
                school laboratory bench.
              </p>
            </div>

            <div className={styles.readyActions}>
              {user ? (
                <button
                  type="button"
                  onClick={handleLaunchClick}
                  className="btn btn-primary"
                  style={{ fontSize: '16px', padding: '12px 24px' }}
                >
                  Launch 3D Virtual Lab →
                </button>
              ) : (
                <>
                  <Link
                    href={`/login?redirect=/experiments/${exp.id}?lab=true`}
                    className="btn btn-primary"
                    style={{ fontSize: '15px', padding: '10px 20px' }}
                  >
                    🔒 Log in to Launch 3D Lab
                  </Link>
                  <span className={styles.lockedNotice}>
                    Account required to record results and perform practical
                  </span>
                </>
              )}
            </div>
          </div>

          {/* What you'll do */}
          <section className={styles.procedureSection} aria-labelledby="procedure-heading">
            <h2 id="procedure-heading" className={styles.procedureHeading}>
              What you&rsquo;ll do
            </h2>
            <p className={`text-muted ${styles.procedureSub}`}>
              The guided simulation will walk you through these steps in order.
            </p>
            <ol className={styles.procedureList}>
              {exp.procedure.map((step, i) => (
                <li key={i} className={styles.procedureStep}>
                  <span className={`mono ${styles.stepNum}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.stepText}>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Back link */}
          <div className={styles.backRow}>
            <Link href="/experiments" className="btn btn-secondary">
              ← Back to Experiments
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

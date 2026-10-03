'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/Nav';
import { experiments, subjects } from '@/lib/experiments';
import styles from './experiments.module.css';

const FILTERS = ['All', ...subjects];

const subjectTagClass = {
  Chemistry: 'subject-tag--chemistry',
  Physics:   'subject-tag--physics',
  Biology:   'subject-tag--biology',
};

export default function ExperimentsPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const visibleSubjects =
    activeFilter === 'All' ? subjects : [activeFilter];

  return (
    <>
      <SiteNav />
      <main className={styles.page}>
        {/* Page header */}
        <div className={`container ${styles.pageHeader}`}>
          <h1 className={styles.pageTitle}>Experiments</h1>
          <p className={`text-muted ${styles.pageSubtitle}`}>
            12 guided practicals across Chemistry, Physics and Biology.
          </p>

          {/* Subject filter tabs */}
          <nav className={styles.filterTabs} aria-label="Filter experiments by subject">
            {FILTERS.map((f) => (
              <button
                key={f}
                id={`filter-${f.toLowerCase()}`}
                className={`${styles.filterTab} ${activeFilter === f ? styles.filterTabActive : ''}`}
                onClick={() => setActiveFilter(f)}
                aria-pressed={activeFilter === f}
              >
                {f}
              </button>
            ))}
          </nav>
        </div>

        <hr className="divider" />

        {/* Subject sections */}
        <div className="container">
          {visibleSubjects.map((subject) => {
            const exps = experiments.filter((e) => e.subject === subject);
            return (
              <section
                key={subject}
                className={styles.subjectSection}
                aria-labelledby={`section-${subject.toLowerCase()}`}
              >
                <div className={styles.subjectHeadRow}>
                  <h2
                    id={`section-${subject.toLowerCase()}`}
                    className={`${styles.subjectHeading} ${styles[`subjectHeading${subject}`]}`}
                  >
                    {subject}
                  </h2>
                  <span className={`subject-tag ${subjectTagClass[subject]}`}>{subject}</span>
                </div>

                <div className={styles.cardGrid}>
                  {exps.map((exp) => (
                    <Link
                      key={exp.id}
                      href={`/experiments/${exp.id}`}
                      className="experiment-card"
                      aria-label={`${exp.title} — ${exp.subject}`}
                    >
                      <span className={`subject-tag ${subjectTagClass[exp.subject]} ${styles.cardTag}`}>
                        {exp.subject}
                      </span>
                      <h3 className="experiment-card__title">{exp.title}</h3>
                      <p className="experiment-card__desc">{exp.description}</p>
                      <span className="experiment-card__status">
                        <ArrowIcon /> Preview available
                      </span>
                    </Link>
                  ))}
                </div>

                <hr className="divider" style={{ marginTop: 'var(--sp-12)' }} />
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

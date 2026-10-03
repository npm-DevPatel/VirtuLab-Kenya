import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/Nav';
import { experiments, getExperiment } from '@/lib/experiments';
import styles from './detail.module.css';

const subjectTagClass = {
  Chemistry: 'subject-tag--chemistry',
  Physics:   'subject-tag--physics',
  Biology:   'subject-tag--biology',
};

const subjectSlug = {
  Chemistry: 'chemistry',
  Physics:   'physics',
  Biology:   'biology',
};

// Generate static params for all 12 experiments
export async function generateStaticParams() {
  return experiments.map((exp) => ({ id: exp.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const exp = getExperiment(id);
  if (!exp) return {};
  return {
    title: `${exp.title} - ${exp.subject}`,
    description: exp.description,
  };
}

export default async function ExperimentDetailPage({ params }) {
  const { id } = await params;
  const exp = getExperiment(id);
  if (!exp) notFound();

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

          {/* Status block */}
          <div className={styles.statusBlock} role="note" aria-label="Development status">
            <p className={`mono-small ${styles.statusLabel}`}>STATUS</p>
            <h2 className={styles.statusHeading}>This lab is in development.</h2>
            <p className={styles.statusText}>
              When complete, this will be a guided, step-by-step 3D simulation of the
              real {exp.subject.toLowerCase()} practical. For now, you can read exactly
              what the simulation will cover below.
            </p>
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

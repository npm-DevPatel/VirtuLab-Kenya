import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { experiments, getExperiment } from '@/lib/experiments';
import ExperimentDetailClient from '@/components/experiments/ExperimentDetailClient';
import SiteNav from '@/components/Nav';
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

// Generate static params for all 12 experiments (both canonical ID and KCSE code)
export async function generateStaticParams() {
  const params = [];
  experiments.forEach((exp) => {
    params.push({ id: exp.id });
    if (exp.code && exp.code !== exp.id) {
      params.push({ id: exp.code });
    }
  });
  return params;
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
    <Suspense
      fallback={
        <>
          <SiteNav />
          <main className={styles.page}>
            <div className="container" style={{ padding: '48px 0', textAlign: 'center' }}>
              <p className="text-muted">Loading experiment details...</p>
            </div>
          </main>
        </>
      }
    >
      <ExperimentDetailClient
        exp={exp}
        subjectTagClass={subjectTagClass}
        subjectSlug={subjectSlug}
      />
    </Suspense>
  );
}

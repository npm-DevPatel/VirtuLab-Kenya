import Link from 'next/link';
import SiteNav from '@/components/Nav';
import { HeroIllustration, ChemistryIcon, PhysicsIcon, BiologyIcon } from '@/components/Illustrations';
import { getBySubject } from '@/lib/experiments';
import styles from './home.module.css';

export const metadata = {
  title: 'VirtuLab Kenya — Virtual Science Practicals for Secondary Schools',
  description:
    'Free, guided, KCSE-aligned virtual lab practicals for Kenyan secondary schools. Run Chemistry, Physics and Biology experiments — no equipment needed.',
};

const subjectData = [
  {
    id: 'chemistry',
    label: 'Chemistry',
    tagClass: 'subject-tag--chemistry',
    colorVar: '--chemistry',
    Icon: ChemistryIcon,
    iconColor: '#B4452A',
    description:
      'Acid-base titrations, inorganic and organic qualitative analysis, thermochemistry and reaction kinetics.',
  },
  {
    id: 'physics',
    label: 'Physics',
    tagClass: 'subject-tag--physics',
    colorVar: '--physics',
    Icon: PhysicsIcon,
    iconColor: '#2A5B8C',
    description:
      'Circuit experiments, optics with convex lenses, and classical mechanics — pendula, springs and Hooke\'s Law.',
  },
  {
    id: 'biology',
    label: 'Biology',
    tagClass: 'subject-tag--biology',
    colorVar: '--biology',
    Icon: BiologyIcon,
    iconColor: '#5B7A3A',
    description:
      'Food tests, enzyme activity, osmosis and diffusion, and specimen identification with dichotomous keys.',
  },
];

const howItWorks = [
  { n: '01', step: 'Create a free account — no card, no spam.' },
  { n: '02', step: 'Browse the catalogue and pick the practical your class is covering.' },
  { n: '03', step: 'Follow the guided, step-by-step 3D simulation of the real lab procedure.' },
  { n: '04', step: 'Review your results and compare against expected values.' },
];

export default function HomePage() {
  return (
    <>
      <SiteNav />

      <main>
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className={styles.hero} aria-labelledby="hero-headline">
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroContent}>
              <p className={`mono-small text-muted ${styles.heroEyebrow}`}>
                KCSE-ALIGNED · CHEMISTRY · PHYSICS · BIOLOGY
              </p>
              <h1 id="hero-headline" className={`display ${styles.heroHeadline}`}>
                Run the science practicals your school&rsquo;s lab can&rsquo;t.
              </h1>
              <p className={styles.heroSub}>
                A free, guided virtual lab for Kenyan secondary school students. Twelve
                KCSE-aligned experiments across Chemistry, Physics and Biology — no
                equipment, no reagents, no working lab needed.
              </p>
              <div className={styles.heroCtas}>
                <Link href="/signup" className="btn btn-primary">Create Your Account</Link>
                <Link href="/experiments" className="btn btn-secondary">Browse Experiments</Link>
              </div>
            </div>
            <div className={styles.heroArt} aria-hidden="true">
              <HeroIllustration className={styles.heroSvg} />
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* ── Problem statement ───────────────────────────────────── */}
        <section className={styles.problem} aria-labelledby="problem-heading">
          <div className="container">
            <h2 id="problem-heading" className={styles.problemHeading}>The gap this addresses</h2>
            <p className={styles.problemText}>
              Most Kenyan public secondary schools do not have functional science labs. Chemicals
              are unavailable, equipment is broken or absent, and practical examinations still
              appear on the KCSE. Students prepare for experiments they have never done. VirtuLab
              Kenya is a direct response to that gap — not a supplement for schools that already
              have labs, but a substitute for those that don&rsquo;t.
            </p>
          </div>
        </section>

        <hr className="divider" />

        {/* ── Subject overview ────────────────────────────────────── */}
        <section aria-label="Subject areas">
          {subjectData.map((subject, i) => {
            const experiments = getBySubject(subject.label);
            const dimBg = i % 2 === 1;
            return (
              <div
                key={subject.id}
                className={`${styles.subjectBlock} ${dimBg ? styles.subjectBlockDim : ''}`}
              >
                <div className={`container ${styles.subjectInner}`}>
                  <div className={styles.subjectMeta}>
                    <subject.Icon size={44} color={subject.iconColor} />
                    <span
                      className={`subject-tag ${subject.tagClass}`}
                      style={{ fontSize: '13px' }}
                    >
                      {subject.label}
                    </span>
                    <p className={`text-muted ${styles.subjectDesc}`}>{subject.description}</p>
                  </div>
                  <ol className={styles.subjectList}>
                    {experiments.map((exp) => (
                      <li key={exp.id} className={styles.subjectListItem}>
                        <Link href={`/experiments/${exp.id}`} className={styles.subjectExpLink}>
                          {exp.title}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            );
          })}
        </section>

        <hr className="divider" />

        {/* ── How it works ────────────────────────────────────────── */}
        <section id="how-it-works" className={styles.howSection} aria-labelledby="how-heading">
          <div className="container">
            <h2 id="how-heading" className={styles.sectionHeading}>How it works</h2>
            <ol className={styles.stepsList}>
              {howItWorks.map((item) => (
                <li key={item.n} className={styles.step}>
                  <span className={`mono ${styles.stepNum}`}>{item.n}</span>
                  <span className={styles.stepText}>{item.step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <hr className="divider" />

        {/* ── CTA strip ───────────────────────────────────────────── */}
        <section className={styles.ctaStrip} aria-label="Sign up call to action">
          <div className="container">
            <h2 className={styles.ctaHeading}>Ready to try it?</h2>
            <p className={`text-muted ${styles.ctaSub}`}>
              Free for students and teachers. No card required.
            </p>
            <Link href="/signup" className="btn btn-primary">Create Your Account</Link>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerLogo}>
            <span className={styles.footerWordmark}>VirtuLab Kenya</span>
            <p className={`text-muted text-small ${styles.footerTagline}`}>
              Virtual science practicals for Kenyan secondary schools.
            </p>
          </div>
          <nav className={styles.footerLinks} aria-label="Footer navigation">
            <Link href="/experiments" className={styles.footerLink}>Experiments</Link>
            <Link href="/login" className={styles.footerLink}>Log in</Link>
            <Link href="/signup" className={styles.footerLink}>Sign up</Link>
          </nav>
        </div>
        <div className={`container ${styles.footerBottom}`}>
          <p className="text-muted text-small">
            Built for the APT4900 capstone project, USIU-Africa.
          </p>
        </div>
      </footer>
    </>
  );
}

# VirtuLab Kenya — Pages, Copy & Build Notes

## Copy rules (apply everywhere)

**Banned words/phrases:** seamless, powerful, innovative, revolutionary, elevate,
unlock, supercharge, transform, empower, streamline, cutting-edge, next-generation,
frictionless, intelligent (as a vague adjective), effortless, "in today's fast-paced
world," "Get Started" as a CTA, "Learn More" as a CTA, any fabricated statistic
("10,000+ students," "99% satisfaction") or fake testimonial/"trusted by" logos.
This product has no users yet — do not imply otherwise.

**Instead:** every CTA names the actual action ("Browse Experiments," "Create Your
Account," "View Titration Lab"). Every claim is either true today or phrased as
what the product does, not invented social proof.

---

## Page 1 — Home / Landing

**Purpose:** A skeptical teacher or a student with patchy internet understands what
this is within 10 seconds and either signs up or browses the catalogue.

**Structure (asymmetric hero, not centered — see design system):**

1. **Nav** — Logo, "Experiments," "Log in," "Sign up" (primary button)
2. **Hero** — Left: headline + subhead + two CTAs. Right: line-art illustration of
   lab apparatus (see design system Imagery).
   - Headline (specific, not generic): *"Run the science practicals your school's
     lab can't."* or similar — must name the actual problem, not say "revolutionize
     education."
   - Subhead: one or two sentences explaining it's a free, guided, KCSE-aligned
     virtual lab for Chemistry, Physics and Biology, built for schools without
     working lab equipment.
   - Primary CTA: "Create Your Account" → sign up
   - Secondary CTA: "Browse Experiments" → catalogue (public preview, doesn't
     require login to view the list, only to open one)
3. **The problem, stated plainly** — Short section, 2-3 sentences, no card, just
   text with good hierarchy: most Kenyan public secondary schools don't have
   working labs; this is a real, specific, documented gap (do not invent numbers —
   keep this qualitative unless real cited figures are supplied separately).
4. **Subject overview** — Three sections (Chemistry / Physics / Biology), NOT three
   identical generic cards. Each is its own horizontal block: subject name in its
   accent color, one-line description of what it covers, small line-art icon, and
   a short list of the 4 experiment names in that subject (plain text list, not
   mini-cards). Alternate background between `--paper` and `--paper-dim` per
   subject block to create rhythm without using card containers.
5. **How it works** — 3-4 numbered steps as a simple text sequence (numbers in
   mono type), not icon-cards: e.g. 1. Create an account → 2. Pick an experiment
   → 3. Follow the guided lab → 4. Review your results. Plain, factual, short.
6. **Footer** — Logo, minimal links (Experiments, Log in, Sign up), no fake social
   links unless real ones exist. No newsletter signup (don't invent a feature).

---

## Page 2 — Sign Up

**Purpose:** Fast, low-friction account creation. No dark patterns, no unnecessary
fields.

**Fields:** Full name, email, password, school name (text input, optional —
label it "School (optional)"), role (simple toggle/select: Student / Teacher).

**States to design explicitly:**
- Default/empty state
- Field-level validation error (inline, below field, error color, specific
  message — e.g. "Enter a valid email address," not "Invalid input")
- Submitting state (button shows a simple inline loading indicator, not a full
  page spinner)
- Success → redirect to dashboard (describe this; actual redirect logic is
  backend work, not this build's concern)

**Copy:** Heading "Create your account." Subtext: one line on why (e.g. "Free for
students and teachers. No card required."). Button: "Create Account," not "Sign
Up Now" or "Get Started."

Link below form to log in page: "Already have an account? Log in."

---

## Page 3 — Log In

**Purpose:** Minimal — email, password, "Log In" button, "Forgot password?" link
(link can go nowhere functional yet, but should exist visually), link to sign up
for new users.

Same input/error/loading state treatment as sign up, reused consistently.

---

## Page 4 — Dashboard (Experiment Catalogue)

**Purpose:** The core screen. This is the "workspace is the hero" page — the one
place the product itself, not marketing copy, is on display.

**Structure:**
- Simple header: "Experiments" as H1, one-line subtext ("12 guided practicals
  across Chemistry, Physics and Biology.")
- Optional lightweight filter/tab control by subject (All / Chemistry / Physics /
  Biology) — simple text tabs with underline for active state, not pill buttons.
- Three subject sections in order (Chemistry, Physics, Biology), each with a
  section heading in the subject accent color, followed by its 4 experiment cards
  in a grid (2 columns on tablet, up to 4 on wide desktop, 1 on mobile).
- Use the exact 12 experiment names and descriptions from the overview file,
  verbatim, as each card's title and description. Do not paraphrase them into
  shorter marketing blurbs — the real descriptive content is the point.

**Experiment card contents (see design system for visual spec):**
- Subject tag (small mono label + left border accent color)
- Experiment title (Fraunces)
- One-sentence description (the real content, from file 01)
- Status indicator: since nothing is built yet, every card shows a small, honest
  label — "Preview available" (links to the placeholder detail page) rather than
  a broken "Launch" button that goes nowhere. Do not use "Coming Soon" as a vague
  ribbon-stamp; the detail page itself explains status clearly (see Page 5).

---

## Page 5 — Experiment Detail (Placeholder Template)

**Purpose:** One shared template used by all 12 experiments. This page must not
feel like a dead end or an apology — it should read as a real, specific preview of
what the lab will contain, because the written content for each experiment
(from file 01) is already real and specific.

**Structure:**
- Breadcrumb: Experiments / [Subject] / [Experiment name]
- Subject tag + experiment title (H1, Fraunces)
- Full description (the real sentence from file 01, can be expanded slightly
  into 2-3 sentences of plain factual framing — what the student will do, what
  concept it teaches — without inventing specific UI features that don't exist)
- A clearly labeled status block (bordered, not a banner/toast): heading "This
  lab is in development." One or two sentences: it will be a guided, step-by-step
  3D simulation of this practical; for now you can read what it will cover below.
- "What you'll do" — a short plain-text numbered outline specific to that
  experiment's real procedure (e.g. for titration: set up the burette, record
  initial volume, add indicator, titrate to endpoint, calculate concentration).
  Keep this factually accurate to the real experiment, not generic filler.
- Button back to full catalogue: "Back to Experiments"

This page should be built as a single reusable component/template that accepts
the experiment's data (subject, title, description, procedure outline) as props/
content — not 12 separately hand-built pages.

---

## Responsive behavior

Design and build desktop-first, then ensure graceful collapse:
- Hero becomes single column, illustration moves below or is simplified/hidden
  on narrow mobile if needed
- Subject sections stack to single-column card grids
- Nav collapses to a simple menu (no slide-out animation theatrics — a plain
  toggle is fine)

## Technical constraints

- Frontend only. No real authentication logic — build the UI and states, wire up
  to placeholder/mock submit handlers.
- Framework: React (Next.js preferred for routing simplicity across 5 pages).
  Tailwind is acceptable as a styling tool **only if** the design system in file
  02 (colors, type scale, spacing, radius) is implemented as actual Tailwind
  theme config — not left at Tailwind defaults.
- Fonts: Fraunces, IBM Plex Sans, IBM Plex Mono — load via Google Fonts or
  self-hosted, specified in file 02.
- Intended hosting: Vercel or Render (static/frontend deployment, no backend
  service needed for this build).
- Database: not implemented in this build, but field names in the sign-up form
  (full name, email, password, school, role) should anticipate a future Supabase
  auth integration — keep field names clean and obvious for that reason.
- Build the experiment detail page as one reusable template, not 12 hardcoded
  pages — pass each experiment's content as data.

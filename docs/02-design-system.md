# VirtuLab Kenya — Design System

This file makes binding visual decisions. Follow them exactly. Where this file is
silent, default to restraint, not decoration.

## Visual personality

Think **field notebook / technical manual**, not SaaS dashboard, not kids' app.
The site should feel like it was made by people who actually understand lab work —
calm, precise, a little analog in its warmth, trustworthy to a skeptical teacher.
Low noise. Confident use of whitespace that comes from content hierarchy, not from
padding everything equally.

If you can picture the design transplanted directly onto a generic AI SaaS tool with
only the logo changed, it is wrong. Specificity to this product is the test.

## Color system

Do not use purple, violet, indigo, or purple-to-blue gradients anywhere. No neon
glow, no glassmorphism.

**Base palette — warm paper neutrals, not cold tech-grey:**
- `--paper`: `#FAF7F0` — primary background. A warm off-white, not pure white.
- `--paper-dim`: `#F0EBE0` — secondary surface (alternating sections, subtle cards)
- `--ink`: `#1E1B16` — primary text. Warm near-black, not pure black.
- `--ink-muted`: `#5C564B` — secondary text, captions, metadata

**Accent — single confident color, used deliberately, not everywhere:**
- `--accent`: `#1F6E4F` — a deep, slightly muted lab-glass green. Used for primary
  actions, active states, key highlights. This is not a bright "go" green; it reads
  closer to copper-sulphate-and-verdigris than to a startup logo.
- `--accent-dim`: `#163F30` — hover/pressed state of accent, headings where
  emphasis is needed
- `--accent-tint`: `#E4EEE7` — very light wash of accent, used sparingly for
  selected/active backgrounds only

**Subject colors — used only as small tags/markers, never as full backgrounds:**
- Chemistry: `#B4452A` (burnt terracotta — reagent/flame association, not cliché beaker-green)
- Physics: `#2A5B8C` (muted slate blue — circuits/optics, deliberately desaturated so it doesn't read as "tech blue")
- Biology: `#5B7A3A` (olive green, distinct from the main accent green)

**Status/system colors**, used only functionally (form errors, success states):
- Error: `#A3362A`
- Success: reuse `--accent`

No gradients anywhere except one allowed exception: a very subtle (8-12%) single-hue
gradient on the hero background only, accent-to-paper, if it helps a hero photo/
illustration sit well. If in doubt, leave it flat.

## Typography

Two typefaces, both intentional choices, not framework defaults. Do not use Inter
or Roboto as the primary typeface.

- **Headings:** `Fraunces` (serif, variable, has a slightly technical/editorial
  character — available free via Google Fonts). Use at weight 500-600. This is not
  decorative — it is the full heading typeface throughout, not "one italic word for
  flair." No random italic single words anywhere.
- **Body & UI:** `IBM Plex Sans` — chosen deliberately for its slightly technical,
  engineering-adjacent character which fits a lab/instrument context, and because
  it is not Inter.
- **Monospace (for data, measurements, units):** `IBM Plex Mono` — use this for any
  displayed numeric values, units, or experiment data placeholders (e.g. "0.1M",
  "25°C"). This is a meaningful typographic signal: numbers that come from an
  instrument reading look different from prose.

**Type scale (desktop):**
- Display (hero headline only): 56px / 1.08 line-height
- H1: 40px / 1.15
- H2: 28px / 1.2
- H3: 20px / 1.3
- Body: 17px / 1.6
- Small/meta: 14px / 1.5
- Mono data: 15px / 1.4

Scale down Display to 36px and H1 to 30px at mobile widths. Do not introduce extra
arbitrary sizes outside this scale.

## Spacing & shape system

**Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 64, 96. Use only these values.
No arbitrary one-off margins.

**Border radius:** Two values only.
- `4px` — form inputs, buttons, tags, small UI elements
- `0px` (sharp) — cards, images, major containers

Do not round every container. Large soft rounded corners on big surfaces are banned.
Buttons and tags get a small 4px radius, not pill shape. No pill-shaped anything.

**Borders over shadows.** Primary way to separate content is a 1px solid border in
`--ink` at 10% opacity, not a drop shadow. Reserve shadow (a single soft, small
shadow token) for exactly one case: the top navigation bar when the page is
scrolled, to lift it off content behind it. Nowhere else.

## Layout principles

- **Do not center everything.** Home page hero is left-aligned, asymmetric: headline
  and copy on the left ~55%, a real visual (see Imagery section) on the right ~45%.
- **Do not force 3 equal columns everywhere.** The experiment catalogue is grouped
  by subject (3 sections: Chemistry, Physics, Biology), each section showing its 4
  experiments in a 2-column or 4-column grid depending on viewport — but the section
  grouping itself, with a subject label and distinct accent tag color, is the
  structural device, not three generic feature cards.
- **Not everything is a card.** Use a card-like bordered container only for the
  experiment entries themselves (since they are genuinely discrete, comparable
  items). Everything else — hero, how-it-works content, footer — uses typography,
  spacing and dividers, not nested card containers.
- Use dividers (1px `--ink` at 10%) to separate sections instead of large empty
  whitespace gaps as the only separator.

## Components

**Buttons:**
- Primary: solid `--accent` fill, `--paper` text, 4px radius, no shadow, no scale/
  lift hover — hover state is a simple fill-darken to `--accent-dim`.
- Secondary: 1px `--ink` border, transparent fill, `--ink` text.
- No pill shape. No glow. Transition speed on hover: 120ms, not slow/floaty.

**Navigation:**
- Logo/wordmark left. Right-aligned: Experiments, How it works (if content
  exists), then Log in / Sign up (logged out) or user menu (logged in).
- Do not include Pricing, Resources, Solutions, Blog — they don't exist. Keep nav
  to only real pages from file 01.
- Flat, no background until scrolled (see shadow rule above).

**Experiment card (catalogue entry):**
- 1px border, 0px radius, `--paper` or `--paper-dim` background.
- Top: small subject-color tag (text label, not a pill — e.g. a 3px left border
  in the subject color plus a small uppercase mono label "CHEMISTRY").
  Experiment title in Fraunces H3. One-sentence description in body text, pulled
  directly from file 01's content — do not shorten it into vague marketing copy.
  Bottom: a small "Preview" or "Not yet available" status indicator (see file 03
  for exact state copy), not a generic "Learn More" link.

**Forms (sign up / log in):**
- Label above field, not placeholder-as-label.
- 4px radius inputs, 1px `--ink` border at 20% opacity, `--accent` border on focus
  (no glow/shadow on focus, just the border color change).
- Inline error text in error color below the field, not a toast/banner for field-
  level errors.

**Icons:**
- Use icons only where they add real information (e.g. a small flask/circuit/leaf
  glyph per subject as a quiet section marker). Do not add a generic outline icon
  to every card or feature purely for visual rhythm. No emoji anywhere in the UI.

## Imagery

No generic 3D abstract objects, no blurry gradient blobs, no stock photography with
dark overlay, no fake dashboard mockup. Since the real 3D lab doesn't exist yet,
the hero and subject sections should use **simple, custom line-drawn/geometric
illustrations of real lab apparatus** — a burette, an ammeter and circuit, a
pendulum, a microscope — rendered as clean single-color line art in `--ink` or the
relevant subject color. These communicate exactly what the product is about
without needing a screenshot that doesn't exist yet. Flat, not 3D, not glossy.

## Motion

Minimal. Interaction feedback only: 120-150ms ease on hover/focus states. No
scroll-triggered fade-ins, no staggered card entrances, no parallax, no cursor
trail. A page should feel instantly present, not performed.

## Dark mode

Not required for this build. Do not add a dark theme speculatively.

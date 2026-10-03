# VirtuLab Kenya — Project Overview

## What this is

VirtuLab Kenya is a free, browser-based platform that lets Kenyan secondary school
students run guided virtual science practicals when their school has no working lab.
Students sign up, browse a catalogue of KCSE-mapped experiments across Chemistry,
Physics and Biology, and open one to begin a guided 3D simulation.

This build is **frontend only**. The 3D lab experience itself is not being built yet.
Every experiment in the catalogue links to a placeholder page. The only functional
piece is sign up / log in UI (no real auth logic required yet, just the screens and
states — see file 03).

## Who uses this

- **Primary user: a Form 3/4 student** at an under-resourced public school, using a
  shared school computer or a low-end personal device. Assume patchy internet,
  assume they are not especially tech-literate, assume they are a little skeptical
  of "another e-learning site" because most are low-quality. The design has to earn
  trust fast — it should look like a real, carefully made tool, not a hackathon demo.
- **Secondary user: a Chemistry/Physics/Biology teacher** evaluating whether to use
  this with their class. They will judge it in under a minute. It needs to read as
  credible and curriculum-serious, not playful or consumer-app-like.

## Reference point: Tinkercad

Borrow Tinkercad's core lesson: **the workspace/content is the hero, the chrome
stays quiet.** Tinkercad does not sell itself with marketing bravado — it gets out
of the way and lets the tool be the tool. Low visual noise, content-first layout,
restrained UI chrome, approachable without being childish.

Do **not** borrow Tinkercad's specific aesthetic (rounded-plastic, toy-like
illustration style, playful color blocking). That look fits a CAD sandbox for
hobbyists. It does not fit a curriculum-aligned tool a teacher needs to trust. The
actual visual direction is defined in file 02.

## Scope of this build

**In scope:**
- Public landing/home page
- Sign up page
- Log in page
- Main dashboard — the experiment catalogue, grouped by subject
- One placeholder experiment detail page template (used by all 12 experiments)
- Responsive behavior (desktop first, must work down to tablet and phone width)

**Explicitly out of scope — do not build or stub beyond a placeholder link:**
- Any real 3D rendering or lab interaction
- Any real backend/auth logic, payment, admin panel
- Blog, pricing page, testimonials, "trusted by" logos, or any other page not
  listed above. Do not invent pages.

## The experiment catalogue (content, not yet functional)

Twelve experiments across three subjects. Every one of these needs a real card/entry
in the catalogue linking to the shared placeholder template. Use this exact content —
do not invent different experiment names or descriptions.

### Chemistry
1. **Volumetric Analysis (Titration)** — Acid-base and redox titrations to determine
   unknown concentration or molar mass.
2. **Qualitative Analysis: Inorganic** — Identifying cations and anions using
   reagents such as sodium hydroxide and aqueous ammonia.
3. **Qualitative Analysis: Organic** — Using bromine water and acidified
   potassium manganate(VII) to distinguish saturated from unsaturated hydrocarbons.
4. **Thermochemistry & Reaction Rates** — Measuring enthalpy changes (heat of
   solution) and tracking reaction rate via the "disappearing cross" method
   (sodium thiosulphate and acid).

### Physics
1. **Electricity: Ohm's Law & Internal Resistance** — Wiring circuits with cells,
   voltmeters and ammeters to determine EMF and internal resistance.
2. **Optics: Convex Lenses** — Using an illuminated object, convex lens and screen
   to determine focal length.
3. **Mechanics: Simple Pendulum** — Timing oscillations to calculate acceleration
   due to gravity.
4. **Mechanics: Hooke's Law** — Investigating spring extension under varying
   slotted masses.

### Biology
1. **Food Tests** — Using Benedict's, Iodine and Biuret reagents to test for
   reducing sugars, starch and proteins.
2. **Enzyme Activity** — Investigating how temperature and pH affect enzyme
   reaction rate, e.g. amylase breaking down starch.
3. **Osmosis & Diffusion** — Observing weight/volume changes in potato cylinders
   or Visking tubing across sucrose concentration gradients.
4. **Dichotomous Keys & Specimen Observation** — Examining structural adaptations
   of leaves and flowers to identify them using a key.

## Core user flow for this build

1. Visitor lands on home page → understands what this is within seconds → signs up
2. After sign up, lands on the dashboard (experiment catalogue)
3. Browses by subject, sees all 12 experiments with real titles/descriptions
4. Clicks any experiment → placeholder detail page → clear "not yet available,
   here's what it will cover" state (not a dead link, not a broken feeling)
5. Can navigate back to catalogue easily from anywhere

## Tone of all written content

Direct, specific, written for a Kenyan secondary school context. No generic
SaaS language. See file 03 for exact copy direction and banned phrases.

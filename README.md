# VirtuLab Kenya

Free, browser-based virtual science practicals for Kenyan secondary school students. Twelve KCSE-aligned experiments across Chemistry, Physics and Biology - no lab equipment needed.

## Stack

- **Framework:** Next.js 16 (App Router, JavaScript)
- **Styling:** Vanilla CSS with custom properties (no Tailwind)
- **Auth:** Firebase Authentication (email/password)
- **Hosting target:** Vercel

## Pages

| Route | Description |
|---|---|
| `/` | Landing page - hero, problem statement, subject overview, how it works |
| `/signup` | Account creation - wired to Firebase Auth |
| `/login` | Log in (UI complete, Firebase wiring in progress) |
| `/experiments` | Catalogue - all 12 experiments with subject filter tabs |
| `/experiments/[id]` | Shared detail template - used by all 12 experiments |

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local
# Fill in your Firebase config values

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` and fill in your Firebase project values. Never commit `.env.local`.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

## Project structure

```
virtulab-app/
├── app/
│   ├── globals.css          # Design system - all tokens, type scale, shared components
│   ├── layout.js            # Root layout
│   ├── page.js              # Home page
│   ├── signup/page.js       # Sign up - Firebase Auth connected
│   ├── login/page.js        # Log in
│   └── experiments/
│       ├── page.js          # Experiment catalogue (all 12)
│       └── [id]/page.js     # Shared detail template
├── components/
│   ├── Nav.js               # Sticky navigation
│   └── Illustrations.js     # SVG line-art illustrations
├── lib/
│   ├── experiments.js       # Experiment data (12 entries, verbatim from spec)
│   └── firebase.js          # Firebase init
└── docs/                    # Project specification documents
```

## Design system

Visual direction: field notebook / technical manual. Warm paper neutrals, a single deep-green accent, and serif headings (Fraunces) over IBM Plex Sans body text.

See [`docs/02-design-system.md`](../docs/02-design-system.md) for the full specification.

## Status

Frontend build complete. Auth (sign up) wired to Firebase. Experiment 3D simulations are not yet built - the detail pages show a preview of what each lab will cover.

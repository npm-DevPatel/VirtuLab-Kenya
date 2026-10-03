/**
 * Firebase initialisation — VirtuLab Kenya
 *
 * Config values are read from environment variables (NEXT_PUBLIC_*) so the
 * actual keys are never hard-coded in source and never committed to git.
 * The .env.local file (gitignored) holds the real values.
 *
 * Future Supabase migration note: the field names used in sign-up
 * (full_name, email, school, role) are kept consistent with the
 * Supabase auth schema for a smooth future switch.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initialising during Next.js hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export default app;

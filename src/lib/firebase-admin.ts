import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

let _app: App | null = null;
let _firestore: Firestore | null = null;
let _auth: Auth | null = null;

function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }

  const credentials = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (!credentials) {
    throw new Error("FIREBASE_ADMIN_CREDENTIALS environment variable is not set");
  }

  _app = initializeApp({
    credential: cert(JSON.parse(credentials)),
  });
  return _app;
}

export const adminFirestore = new Proxy({} as Firestore, {
  get(_, prop) {
    if (!_firestore) _firestore = getFirestore(getAdminApp());
    return (_firestore as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    if (!_auth) _auth = getAuth(getAdminApp());
    return (_auth as unknown as Record<string | symbol, unknown>)[prop];
  },
});

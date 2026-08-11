import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  const isNewApp = !getApps().length;
  const firebaseApp = isNewApp ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(firebaseApp);
  // Optional profile fields (e.g. babyBirthDate, careTeam) are written as `undefined`
  // when left blank; ignoreUndefinedProperties drops them instead of throwing.
  const firestore = isNewApp
    ? initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true })
    : getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}

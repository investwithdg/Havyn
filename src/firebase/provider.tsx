'use client';

import React, { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  firebaseApp: null,
  auth: null,
  firestore: null,
});

export const FirebaseProvider: React.FC<React.PropsWithChildren<FirebaseContextValue>> = ({
  children,
  firebaseApp,
  auth,
  firestore,
}) => {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebaseApp = () => useContext(FirebaseContext)?.firebaseApp;
export const useAuth = () => useContext(FirebaseContext)?.auth;

export const useFirestore = () => {
  const firestore = useContext(FirebaseContext)?.firestore;
  // This project's Firebase API key is invalid, so real Firestore calls hang
  // indefinitely rather than failing fast. The rest of the app already treats
  // a null firestore as "no backend, render local/empty state" everywhere, so
  // the dev-preview mock session short-circuits here instead of hanging.
  if (typeof window !== "undefined" && localStorage.getItem("havyn_dev_mock_user") === "1") {
    return null;
  }
  return firestore ?? null;
};

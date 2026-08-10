"use client";

import React, { useEffect, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { FirebaseProvider } from '@/firebase/provider';

type FirebaseClientState = {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
};

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebaseClient, setFirebaseClient] = useState<FirebaseClientState>({
    firebaseApp: null,
    firestore: null,
    auth: null,
  });

  useEffect(() => {
    let mounted = true;

    import('@/firebase/client-init').then(({ initializeFirebase }) => {
      if (mounted) {
        setFirebaseClient(initializeFirebase());
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseClient.firebaseApp}
      firestore={firebaseClient.firestore}
      auth={firebaseClient.auth}
    >
      {children}
    </FirebaseProvider>
  );
}

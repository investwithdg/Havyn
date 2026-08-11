"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "@/firebase/provider";

const DEV_MOCK_USER_KEY = "havyn_dev_mock_user";

const DEV_MOCK_USER = {
  uid: "dev-preview-user",
  email: "dev-preview@havyn.test",
  displayName: "Dev Preview",
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  getIdToken: async () => "dev-preview-token",
} as unknown as User;

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(DEV_MOCK_USER_KEY) === "1") {
      setUser(DEV_MOCK_USER);
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(true);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    import("firebase/auth").then(({ onAuthStateChanged }) => {
      if (!mounted) return;
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [auth]);

  return { user, loading };
};

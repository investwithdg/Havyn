"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "@/firebase/provider";

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

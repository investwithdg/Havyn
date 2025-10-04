"use client";

import { useEffect, useState, useMemo } from "react";
import {
  onSnapshot,
  collection,
  query,
  where,
  type CollectionReference,
  type Query,
} from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";

interface DocumentData {
  id: string;
  [key: string]: any;
}

export const useCollection = <T extends DocumentData>(
  ref: CollectionReference | Query | null
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
};

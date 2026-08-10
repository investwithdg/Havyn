"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Failed to register Havyn service worker:", error);
    });
  }, []);

  return null;
}

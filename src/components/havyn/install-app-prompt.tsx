"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, Download, Share, Smartphone, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISSED_KEY = "havyn-install-prompt-dismissed";

export function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const dismissedValue = window.localStorage.getItem(DISMISSED_KEY);
    setDismissed(dismissedValue === "true");
    setIsStandalone(isRunningStandalone());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installMode = useMemo(() => {
    if (typeof navigator === "undefined") return "unknown";
    const ua = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isSafari = isIos && /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);

    if (installEvent) return "native";
    if (isSafari) return "ios";
    return "unknown";
  }, [installEvent]);

  if (dismissed || installed || isStandalone || installMode === "unknown") {
    return null;
  }

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallEvent(null);
  };

  return (
    <div className="fixed inset-x-3 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] z-[70] mx-auto max-w-sm rounded-[1.5rem] border border-primary/15 bg-card p-4 shadow-2xl">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Smartphone size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Add Havyn to your phone</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Open Havyn from your Home Screen like an app for faster check-ins.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
              aria-label="Dismiss install prompt"
            >
              <X size={15} />
            </button>
          </div>

          {installMode === "native" ? (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              <Download size={16} />
              <span>Install Havyn</span>
            </button>
          ) : (
            <div className="mt-3 rounded-2xl bg-primary/8 p-3 text-xs leading-relaxed text-foreground/80">
              <div className="flex items-start gap-2">
                <Share className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Tap Share in Safari, then choose Add to Home Screen.</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="mt-2 flex w-full items-center justify-center gap-2 py-2 text-xs font-medium text-muted-foreground"
          >
            <Check size={14} />
            <span>Not now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function isRunningStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export function InstallAppButton() {
  const t = useTranslations("pwa");
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    setIsStandalone(
      media.matches ||
        Boolean(
          "standalone" in navigator &&
            (navigator as NavigatorWithStandalone).standalone,
        ),
    );

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      toast.info(t("installReady"));
    }

    function handleInstalled() {
      setIsStandalone(true);
      setPromptEvent(null);
      toast.success(t("installed"));
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [t]);

  async function handleInstall() {
    if (promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice.catch(() => undefined);
      setPromptEvent(null);
      return;
    }

    const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    toast.info(isiOS ? t("iosHint") : t("unsupported"));
  }

  if (isStandalone) return null;

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="hidden min-h-10 items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-800 transition hover:bg-sky-100 md:inline-flex dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-100"
    >
      <Download className="h-4 w-4" />
      {t("install")}
    </button>
  );
}

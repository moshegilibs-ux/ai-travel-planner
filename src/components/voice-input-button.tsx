"use client";

import { useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

type SpeechRecognitionEventLike = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionErrorEventLike = Event & {
  error?: string;
};

type SpeechRecognitionLike = EventTarget & {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const speechLocales: Record<string, string> = {
  he: "he-IL",
  en: "en-US",
  ar: "ar-SA",
  ru: "ru-RU",
  fr: "fr-FR",
  es: "es-ES",
};

function getSpeechRecognition() {
  const speechWindow = window as Window &
    typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
}

export function VoiceInputButton({
  onTranscript,
}: {
  onTranscript: (value: string) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("voice");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function startListening() {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      toast.error(t("unsupported"));
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = speechLocales[locale] ?? "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (transcript) {
        onTranscript(transcript);
      }
    };

    recognition.onerror = () => {
      toast.error(t("error"));
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
      toast.info(t("listening"));
    } catch {
      toast.error(t("error"));
      setIsListening(false);
    }
  }

  return (
    <button
      type="button"
      onClick={startListening}
      className={`absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full transition ${
        isListening
          ? "bg-rose-100 text-rose-700"
          : "bg-slate-100 text-slate-500 hover:bg-sky-100 hover:text-sky-700 dark:bg-white/10 dark:text-slate-200"
      }`}
      aria-label={isListening ? t("listening") : t("start")}
      title={isListening ? t("listening") : t("start")}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}

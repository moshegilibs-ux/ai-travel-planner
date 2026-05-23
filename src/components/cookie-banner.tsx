"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem("trippilot:cookies") !== "accepted");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl md:bottom-4 md:right-4 md:left-auto md:max-w-md dark:border-white/10 dark:bg-slate-900">
      <h2 className="font-black text-slate-950 dark:text-white">עוגיות ואנליטיקה</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        אנחנו משתמשים בעוגיות חיוניות ובאנליטיקה כדי לשפר חיפוש, המלצות AI
        ואיכות המוצר.
      </p>
      <div className="mt-4 flex flex-row-reverse gap-2">
        <button
          onClick={() => {
            window.localStorage.setItem("trippilot:cookies", "accepted");
            setVisible(false);
          }}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white dark:bg-sky-500 dark:text-slate-950"
        >
          אישור
        </button>
        <button
          onClick={() => setVisible(false)}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 dark:border-white/10 dark:text-slate-200"
        >
          אחר כך
        </button>
      </div>
    </div>
  );
}

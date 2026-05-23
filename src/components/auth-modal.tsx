"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, X } from "lucide-react";
import { loginUser, registerUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { firebaseSetupMessage, isFirebaseConfigured } from "@/lib/firebase";

type AuthMode = "login" | "register";

const fieldClass =
  "mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export function AuthModal({
  initialMode = "login",
  onClose,
  onAuthenticated,
}: {
  initialMode?: AuthMode;
  onClose: () => void;
  onAuthenticated?: (user: AuthUser) => void;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim() || (mode === "register" && !name.trim())) {
      setError("יש למלא את כל השדות הנדרשים.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const user =
        mode === "login"
          ? await loginUser({ email, password })
          : await registerUser({ name, email, password });

      onAuthenticated?.(user);
      onClose();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "לא הצלחנו להשלים את הפעולה.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
          aria-label="סגור"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pl-10">
          <p className="text-sm font-bold text-emerald-700">
            {mode === "login" ? "ברוכים השבים" : "יוצרים חשבון חדש"}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            {mode === "login" ? "התחברות" : "הרשמה"}
          </h2>
          <p className="mt-2 leading-7 text-slate-600">
            {isFirebaseConfigured()
              ? "חשבון מאפשר לשייך מסלולים למשתמש ולשמור אותם בענן."
              : firebaseSetupMessage}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          {mode === "register" ? (
            <label className="font-semibold text-slate-800">
              שם משתמש
              <input
                className={fieldClass}
                onChange={(event) => setName(event.target.value)}
                placeholder="השם שלך"
                type="text"
                value={name}
              />
            </label>
          ) : null}

          <label className="font-semibold text-slate-800">
            אימייל
            <input
              className={fieldClass}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              type="email"
              value={email}
            />
          </label>

          <label className="font-semibold text-slate-800">
            סיסמה
            <input
              className={fieldClass}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="לפחות כמה תווים"
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {mode === "login" ? (
              <LogIn className="h-5 w-5" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            {isSubmitting
              ? "רק רגע..."
              : mode === "login"
                ? "התחבר"
                : "הירשם"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="mt-4 w-full rounded-md px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
        >
          {mode === "login" ? "אין לך חשבון? הרשמה" : "כבר יש לך חשבון? התחברות"}
        </button>
      </motion.div>
    </div>
  );
}

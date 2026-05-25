"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, UserCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  subscribeAuthState,
} from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { addLocaleToPath, AppLocale, isLocale } from "@/lib/i18n";

type AuthMode = "login" | "register";

export function UserMenu() {
  const t = useTranslations("auth");
  const localeValue = useLocale();
  const locale: AppLocale = isLocale(localeValue) ? localeValue : "he";
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  useEffect(() => subscribeAuthState(setUser), []);

  async function handleLogout() {
    await logoutUser();
    toast.success(t("loggedOut"));
  }

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setOpen(true);
          }}
          className="rounded-full border border-slate-200 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
        >
          {t("login")}
        </button>
        {open ? <AuthDialog mode={mode} setMode={setMode} onClose={() => setOpen(false)} /> : null}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={addLocaleToPath("/my-trips", locale)}
        className="hidden rounded-full border border-slate-200 px-3 py-2 font-bold text-slate-700 transition hover:bg-slate-100 sm:inline-flex dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
      >
        {t("myTrips")}
      </Link>
      <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 font-bold text-sky-900 dark:bg-sky-500/10 dark:text-sky-100">
        <UserCircle className="h-4 w-4" />
        <span className="hidden max-w-28 truncate sm:inline">{user.name || user.email}</span>
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">{t("logout")}</span>
      </button>
    </div>
  );
}

function AuthDialog({
  mode,
  onClose,
  setMode,
}: {
  mode: AuthMode;
  onClose: () => void;
  setMode: (mode: AuthMode) => void;
}) {
  const t = useTranslations("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        await registerUser({ name, email, password });
        toast.success(t("registered"));
      } else {
        await loginUser({ email, password });
        toast.success(t("loggedIn"));
      }

      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <button
        type="button"
        aria-label={t("close")}
        className="absolute inset-0"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl dark:bg-slate-950"
      >
        <h2 className="text-2xl font-black text-slate-950 dark:text-white">
          {mode === "register" ? t("registerTitle") : t("loginTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {mode === "register" ? t("registerCopy") : t("loginCopy")}
        </p>

        <div className="mt-5 grid gap-3">
          {mode === "register" ? (
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {t("name")}
              <input
                required
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 dark:border-white/10 dark:bg-slate-900"
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </label>
          ) : null}
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {t("email")}
            <input
              required
              type="email"
              className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 dark:border-white/10 dark:bg-slate-900"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
            />
          </label>
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {t("password")}
            <input
              required
              minLength={6}
              type="password"
              className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 dark:border-white/10 dark:bg-slate-900"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 min-h-12 w-full rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-sky-600 disabled:opacity-60 dark:bg-sky-500 dark:text-slate-950"
        >
          {loading ? t("loading") : mode === "register" ? t("register") : t("login")}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "register" ? "login" : "register")}
          className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-50 dark:text-sky-200 dark:hover:bg-sky-400/10"
        >
          {mode === "register" ? t("switchToLogin") : t("switchToRegister")}
        </button>
      </form>
    </div>
  );
}

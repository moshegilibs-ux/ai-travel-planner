import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  provider: "firebase" | "local";
};

type StoredUser = AuthUser & {
  password: string;
};

type AuthListener = (user: AuthUser | null) => void;

const usersKey = "ai-travel-planner:auth-users";
const sessionKey = "ai-travel-planner:auth-session";
const authEventName = "ai-travel-planner:auth-change";

function mapFirebaseUser(user: User): AuthUser {
  return {
    id: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "מטייל",
    email: user.email ?? "",
    provider: "firebase",
  };
}

function getStoredUsers() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(usersKey);
    return value ? (JSON.parse(value) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  window.localStorage.setItem(usersKey, JSON.stringify(users));
}

function emitAuthChange() {
  window.dispatchEvent(new Event(authEventName));
}

export function getCurrentUser(): AuthUser | null {
  const auth = getFirebaseAuth();

  if (auth?.currentUser) {
    return mapFirebaseUser(auth.currentUser);
  }

  if (typeof window === "undefined" || isFirebaseConfigured()) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(sessionKey);
    return value ? (JSON.parse(value) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function subscribeAuthState(listener: AuthListener) {
  const auth = getFirebaseAuth();

  if (auth) {
    return onAuthStateChanged(auth, (user) => {
      listener(user ? mapFirebaseUser(user) : null);
    });
  }

  const handler = () => listener(getCurrentUser());

  window.addEventListener(authEventName, handler);

  const timeoutId = window.setTimeout(handler, 0);

  return () => {
    window.clearTimeout(timeoutId);
    window.removeEventListener(authEventName, handler);
  };
}

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  const normalizedEmail = email.trim().toLowerCase();

  if (auth) {
    const credential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password,
    );

    await updateProfile(credential.user, { displayName: name.trim() });

    return {
      id: credential.user.uid,
      name: name.trim(),
      email: credential.user.email ?? normalizedEmail,
      provider: "firebase",
    };
  }

  const users = getStoredUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("משתמש עם האימייל הזה כבר קיים.");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    provider: "local",
  };

  saveStoredUsers([...users, user]);

  const sessionUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: "local",
  };

  window.localStorage.setItem(sessionKey, JSON.stringify(sessionUser));
  emitAuthChange();
  return sessionUser;
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  const normalizedEmail = email.trim().toLowerCase();

  if (auth) {
    const credential = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password,
    );

    return mapFirebaseUser(credential.user);
  }

  const user = getStoredUsers().find(
    (storedUser) =>
      storedUser.email === normalizedEmail && storedUser.password === password,
  );

  if (!user) {
    throw new Error("האימייל או הסיסמה אינם נכונים.");
  }

  const sessionUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: "local",
  };

  window.localStorage.setItem(sessionKey, JSON.stringify(sessionUser));
  emitAuthChange();
  return sessionUser;
}

export async function logoutUser() {
  const auth = getFirebaseAuth();

  if (auth) {
    await signOut(auth);
    return;
  }

  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(sessionKey);
  emitAuthChange();
}

export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("travel-current-user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function subscribeAuthState(callback: (user: AuthUser | null) => void) {
  callback(getCurrentUser());
  return () => undefined;
}

export async function loginUser({ email }: { email: string; password: string }) {
  const user = { id: email || "guest", email, name: email?.split("@")[0] || "Guest" };
  signInLocalUser(user);
  return user;
}

export async function registerUser({
  email,
  name,
}: {
  email: string;
  name?: string;
  password: string;
}) {
  const user = { id: email || "guest", email, name: name || email?.split("@")[0] || "Guest" };
  signInLocalUser(user);
  return user;
}

export async function logoutUser() {
  signOutLocalUser();
}

export function signInLocalUser(user: AuthUser) {
  window.localStorage.setItem("travel-current-user", JSON.stringify(user));
}

export function signOutLocalUser() {
  window.localStorage.removeItem("travel-current-user");
}

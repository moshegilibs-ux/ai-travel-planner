export function isPublicProduction() {
  return process.env.NODE_ENV === "production";
}

export function isPublicMockMode() {
  const value = process.env.NEXT_PUBLIC_USE_MOCK_DATA;

  if (value === undefined || value === "") {
    return !isPublicProduction();
  }

  return value !== "false";
}

export function logPublicMockMode(reason: string) {
  console.warn(`[env] Mock data active: ${reason}`);
}

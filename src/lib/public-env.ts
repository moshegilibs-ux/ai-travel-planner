export function isPublicMockMode() {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";
}

export function logPublicMockMode(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(message);
  }
}

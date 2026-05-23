type RetryOptions = {
  retries?: number;
  timeoutMs?: number;
  retryStatuses?: number[];
};

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 10_000,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: init.signal ?? controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: RetryOptions = {},
) {
  const {
    retries = 2,
    timeoutMs = 10_000,
    retryStatuses = [408, 429, 500, 502, 503, 504],
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(input, init, timeoutMs);

      if (!retryStatuses.includes(response.status) || attempt === retries) {
        return response;
      }
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        throw error;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }

  throw lastError instanceof Error ? lastError : new Error("External API failed.");
}

function isRetryableError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const maybeStatus =
    "status" in error ? error.status : "statusCode" in error ? error.statusCode : null;

  if (typeof maybeStatus !== "number") {
    return false;
  }

  return maybeStatus === 429 || maybeStatus >= 500;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withLlmRetry<T>(operation: () => Promise<T>) {
  const delays = [1000, 2000, 4000];

  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const delay = delays[attempt];

      if (!delay || !isRetryableError(error)) {
        throw error;
      }

      await wait(delay);
    }
  }

  return operation();
}

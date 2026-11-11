/** A failed API call. `errors` holds the server's per-field messages, if any. */
export class ApiError extends Error {
  errors?: Record<string, string>;
  status: number;
  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Calls one of our API routes from the browser. Returns the parsed JSON body,
 * or throws an ApiError carrying the server's message so it can be shown as is.
 */
export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      data?.message ?? "Something went wrong. Please try again.",
      res.status,
      data?.errors
    );
  }
  return data as T;
}

/** The thrown error's message, for showing in the UI. */
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

/** Like errorMessage, plus the first few field-level problems the server listed. */
export function detailedErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.errors) {
    const details = [...new Set(Object.values(error.errors))].slice(0, 3).join(" ");
    if (details) return `${error.message} ${details}`;
  }
  return errorMessage(error);
}

// All requests use relative "/api/..." URLs, which src/proxy.ts forwards to
// the backend. The browser stores and sends the JSESSIONID session cookie by
// itself; we never read it (it is HttpOnly).

import type { ProblemDetail, User } from "@/lib/types";

// Thrown when the backend answers with an error status. `fieldErrors` holds
// per-field validation messages from a 400 response, e.g. { email: "..." }.
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type CsrfResponse = {
  headerName: string;
  token: string;
};

async function getCsrf(): Promise<CsrfResponse> {
  const res = await fetch("/api/auth/csrf");
  if (!res.ok) {
    throw new ApiError(res.status, "Could not get a security token");
  }
  return res.json();
}

// Every state-changing request needs a fresh CSRF token, because the token
// changes after login and logout.
async function postJson(path: string, body?: object): Promise<Response> {
  const csrf = await getCsrf();
  return fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Turns a failed response into an ApiError. The 403 for a missing CSRF token
// is not in the ProblemDetail shape, so parsing is wrapped in try/catch.
async function readError(res: Response): Promise<ApiError> {
  try {
    const problem: ProblemDetail = await res.json();
    return new ApiError(res.status, problem.detail, problem.errors ?? {});
  } catch {
    return new ApiError(res.status, `Request failed (${res.status})`);
  }
}

export async function login(email: string, password: string): Promise<User> {
  const res = await postJson("/api/auth/login", { email, password });
  if (!res.ok) {
    throw await readError(res);
  }
  return res.json();
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const res = await postJson("/api/auth/register", { name, email, password });
  if (!res.ok) {
    throw await readError(res);
  }
  return res.json();
}

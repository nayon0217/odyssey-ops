// Custom fetch mutator used by every Orval-generated hook.
// Centralizes base URL, JSON handling, and typed errors so generated code never
// hard-codes transport concerns.
//
// Orval's fetch client expects the mutator to resolve to `{ status, data, headers }`
// (the generated response types are shaped that way), so callers read `result.data`.

// Expo inlines EXPO_PUBLIC_* at build time; declared here to stay dependency-free
// across web/native without pulling in @types/node.
declare const process: { env?: Record<string, string | undefined> } | undefined;

const BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || 'http://localhost:8787';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error implements ApiError {
  status: number;
  code: string;
  details?: unknown;
  constructor(err: ApiError) {
    super(err.message);
    this.name = 'ApiClientError';
    this.status = err.status;
    this.code = err.code;
    this.details = err.details;
  }
}

function resolveUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(resolveUrl(url), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => undefined) : await response.text();

  if (!response.ok) {
    const errEnvelope = (body as { error?: Partial<ApiError> })?.error;
    throw new ApiClientError({
      status: response.status,
      code: errEnvelope?.code ?? 'HTTP_ERROR',
      message: errEnvelope?.message ?? `Request failed with status ${response.status}`,
      details: errEnvelope?.details,
    });
  }

  return { status: response.status, data: body, headers: response.headers } as T;
};

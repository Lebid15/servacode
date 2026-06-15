/**
 * =====================================================
 * API Client مركزي
 * كل طلبات الباكند تمر من هنا لتوحيد الأخطاء والهيدرات
 * =====================================================
 */

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    details?: unknown;
  };
};

export class ApiClientError extends Error {
  code?: string;
  status: number;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const DEFAULT_REQUEST_TIMEOUT_MS = 4_000;
const IS_NEXT_PRODUCTION_BUILD =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.npm_lifecycle_event === "build";

type NextFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

type RequestOptions = RequestInit & {
  token?: string | null;
  next?: NextFetchOptions;
  timeoutMs?: number;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (IS_NEXT_PRODUCTION_BUILD) {
    throw new ApiClientError(
      "تم تخطي طلبات API أثناء بناء الموقع.",
      503,
      "api.skipped_during_build",
    );
  }

  const { token, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  const controller = fetchOptions.signal ? null : new AbortController();
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      signal: fetchOptions.signal ?? controller?.signal,
    });

    const payload = (await response
      .json()
      .catch(() => null)) as ApiResponse<T> | null;

    if (!response.ok || !payload?.success) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Public API] Request failed", {
          path,
          status: response.status,
          message: payload?.message,
          code: payload?.error?.code,
          details: payload?.error?.details,
        });
      }

      throw new ApiClientError(
        payload?.message ?? "حدث خطأ في الاتصال بالخادم.",
        response.status,
        payload?.error?.code,
        payload?.error?.details,
      );
    }

    return payload.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn("[Public API] Connection failed", { path, error });
    }

    throw new ApiClientError(
      "تعذر الاتصال بالخادم خلال المهلة المحددة.",
      503,
      "api.connection_failed",
      error,
    );
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function buildBackendAssetUrl(url?: string | null) {
  const normalizedUrl = url?.trim();

  if (!normalizedUrl) {
    return "";
  }

  if (/^(https?:|data:|blob:)/i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  const backendBaseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  return `${backendBaseUrl}${normalizedUrl.startsWith("/") ? normalizedUrl : `/${normalizedUrl}`}`;
}

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

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

type NextFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

type RequestOptions = RequestInit & {
  token?: string | null;
  next?: NextFetchOptions;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body: options.body,
    headers
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiClientError(
      payload?.message ?? "حدث خطأ في الاتصال بالخادم.",
      response.status,
      payload?.error?.code,
      payload?.error?.details
    );
  }

  return payload.data;
}


export function buildBackendAssetUrl(url?: string | null) {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const apiUrl = new URL(API_BASE_URL);
  return `${apiUrl.origin}${url.startsWith("/") ? url : `/${url}`}`;
}


export const PUBLIC_SITE_BASE_URL = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";

export function buildPublicSiteUrl(locale: string, ...segments: Array<string | number | null | undefined>) {
  const cleanBase = PUBLIC_SITE_BASE_URL.replace(/\/+$/, "");
  const cleanSegments = [locale, ...segments]
    .filter((segment) => segment !== undefined && segment !== null && String(segment).trim() !== "")
    .map((segment) => encodeURIComponent(String(segment).replace(/^\/+|\/+$/g, "")));

  return `${cleanBase}/${cleanSegments.join("/")}`;
}

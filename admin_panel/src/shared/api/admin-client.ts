/**
 * =====================================================
 * Admin Client
 * كل طلبات لوحة الأدمن المحمية تمر من هنا
 * =====================================================
 */

import { collectAutoTranslationItems, applyAutoTranslations } from "@/shared/admin/translation/auto-translation";

import { apiRequest } from "./api-client";

export type DashboardTone = "neutral" | "success" | "warning" | "danger" | "primary";

export type AdminDashboardItem = Record<string, unknown> & {
  id?: string;
  full_name?: string;
  subject?: string | null;
  status?: string;
  priority?: string;
  created_at?: string;
  description?: string;
  message?: string;
};


export type AdminContentModuleStatus = {
  key: string;
  label_ar: string;
  label_en: string;
  description_ar: string;
  description_en: string;
  icon: string;
  target_path: string;
  public_path?: string | null;
  total: number;
  visible: number;
  hidden?: number;
  draft?: number;
  required_minimum?: number;
  needs_attention: boolean;
  completion_score: number;
  tone: DashboardTone;
  seed_managed?: boolean;
  manual_entry_required?: boolean;
};

export type AdminContentOverview = {
  generated_at?: string;
  totals: {
    modules_count: number;
    items_count: number;
    visible_count: number;
    hidden_count: number;
    draft_count: number;
    attention_count: number;
    seed_managed_count: number;
    manual_entry_count: number;
  };
  modules: AdminContentModuleStatus[];
  readiness_alerts?: Array<{
    code: string;
    tone: DashboardTone;
    label_ar: string;
    label_en: string;
    target_path: string;
  }>;
  latest_activity?: AdminDashboardItem[];
  rules?: {
    seed_managed_ar?: string;
    manual_entry_ar?: string;
    seed_managed_en?: string;
    manual_entry_en?: string;
  };
};


export type AdminCustomerModuleStatus = {
  key: string;
  label_ar: string;
  label_en: string;
  description_ar: string;
  description_en: string;
  target_path: string;
  icon: string;
  total: number;
  new: number;
  active: number;
  waiting: number;
  resolved: number;
  closed: number;
  needs_attention: boolean;
  tone: DashboardTone;
};

export type AdminCustomerOverviewItem = {
  kind: string;
  id: string;
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  status?: string;
  priority?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  target_path: string;
};

export type AdminCustomersOverview = {
  generated_at?: string;
  totals: {
    unique_customers: number;
    quote_requests: number;
    contact_messages: number;
    support_requests: number;
    testimonials: number;
    open_items: number;
    urgent_items: number;
    waiting_customer: number;
  };
  modules: AdminCustomerModuleStatus[];
  alerts?: Array<{
    code: string;
    tone: DashboardTone;
    label_ar: string;
    label_en: string;
    target_path: string;
  }>;
  latest_items?: AdminCustomerOverviewItem[];
  due_followups?: AdminCustomerOverviewItem[];
  rules?: { ar?: string; en?: string };
};


export type AdminCommunicationModuleStatus = {
  key: string;
  label_ar: string;
  label_en: string;
  description_ar: string;
  description_en: string;
  target_path: string;
  icon: string;
  total: number;
  active: number;
  secondary: number;
  needs_attention: boolean;
  tone: DashboardTone;
};

export type AdminCommunicationOverview = {
  generated_at?: string;
  totals: {
    notifications: number;
    unread_notifications: number;
    today_notifications: number;
    week_notifications: number;
    email_templates: number;
    active_email_templates: number;
    inactive_email_templates: number;
    open_quote_requests: number;
    open_contact_messages: number;
    open_support_requests: number;
  };
  modules: AdminCommunicationModuleStatus[];
  latest_notifications?: Array<{
    id: string;
    title_ar?: string | null;
    title_en?: string | null;
    notification_type?: string | null;
    is_read?: boolean;
    target_type?: string | null;
    target_id?: string | null;
    action_url?: string | null;
    created_at?: string | null;
  }>;
  alerts?: Array<{
    code: string;
    tone: DashboardTone;
    label_ar: string;
    label_en: string;
    target_path: string;
  }>;
  rules?: { ar?: string; en?: string };
};



export type AdminAdministrationModuleStatus = {
  key: string;
  label_ar: string;
  label_en: string;
  description_ar: string;
  description_en: string;
  target_path: string;
  icon: string;
  total: number;
  active: number;
  attention: number;
  tone: DashboardTone;
};

export type AdminAdministrationRoleStatus = {
  id: string;
  name: string;
  display_name_ar: string;
  display_name_en: string;
  is_system: boolean;
  permissions_count: number;
  users_count: number;
  target_path: string;
};

export type AdminAdministrationOverview = {
  generated_at?: string;
  totals: {
    users: number;
    active_users: number;
    inactive_users: number;
    suspended_users: number;
    deleted_users: number;
    locked_users: number;
    superusers: number;
    roles: number;
    system_roles: number;
    custom_roles: number;
    permissions: number;
    audit_logs: number;
    today_audit_logs: number;
    week_audit_logs: number;
    failed_logins_week: number;
  };
  modules: AdminAdministrationModuleStatus[];
  roles?: AdminAdministrationRoleStatus[];
  latest_users?: AdminDashboardItem[];
  latest_activity?: AdminDashboardItem[];
  alerts?: Array<{
    code: string;
    tone: DashboardTone;
    label_ar: string;
    label_en: string;
    target_path: string;
  }>;
  rules?: { ar?: string; en?: string };
};

export type AdminSettingsModuleStatus = {
  key: string;
  label_ar: string;
  label_en: string;
  description_ar: string;
  description_en: string;
  target_path: string;
  done: boolean;
  tone: DashboardTone;
};

export type AdminSettingsOverview = {
  generated_at?: string;
  completion_score: number;
  totals: {
    modules_count: number;
    completed_modules: number;
    attention_count: number;
    social_channels: number;
    visible_sections: number;
    maintenance_mode: boolean;
  };
  modules: AdminSettingsModuleStatus[];
  readiness_alerts?: Array<{
    code: string;
    tone: DashboardTone;
    label_ar: string;
    label_en: string;
    target_path: string;
  }>;
  settings?: {
    site_name_ar?: string | null;
    site_name_en?: string | null;
    active_theme?: string | null;
    default_language?: string | null;
    is_english_enabled?: boolean;
    has_logo?: boolean;
    has_favicon?: boolean;
    has_contact_channels?: boolean;
    has_seo?: boolean;
  };
  system?: {
    ai_enabled?: boolean;
    ai_provider?: string;
    ai_key_configured?: boolean;
    debug?: boolean;
  };
  rules?: { ar?: string; en?: string };
};

export type AdminDashboardSummary = {
  services_count?: number;
  products_count?: number;
  apps_count?: number;
  portfolio_count?: number;
  quote_requests_count?: number;
  contact_messages_count?: number;
  support_requests_count?: number;
  blog_posts_count?: number;
  users_count?: number;
  generated_at?: string;
  stats?: {
    new_quote_requests?: number;
    unread_contact_messages?: number;
    open_support_requests?: number;
    unread_notifications?: number;
    published_services?: number;
    published_products?: number;
    published_apps?: number;
    published_portfolio?: number;
    published_blog_posts?: number;
    active_faqs?: number;
    active_static_pages?: number;
    active_testimonials?: number;
    media_files?: number;
    email_templates?: number;
    active_users?: number;
  };
  site_status?: {
    site_name_ar?: string;
    site_name_en?: string;
    maintenance_mode?: boolean;
    default_language?: string;
    english_enabled?: boolean;
    active_theme?: string;
    has_logo?: boolean;
    has_favicon?: boolean;
    has_contact_channels?: boolean;
  };
  content_status?: Array<{
    key: string;
    total: number;
    visible: number;
    hidden?: number;
    draft?: number;
  }>;
  readiness_alerts?: Array<{
    code: string;
    tone: DashboardTone;
    target_path?: string;
  }>;
  latest_quote_requests?: AdminDashboardItem[];
  latest_contact_messages?: AdminDashboardItem[];
  latest_support_requests?: AdminDashboardItem[];
  latest_activity?: AdminDashboardItem[];
  system_status?: {
    api?: string;
    database?: string;
    storage?: string;
    environment?: string;
    debug?: boolean;
    email_notifications_enabled?: boolean;
    media_files?: number;
    email_templates?: number;
  };
};

type AdminListParams = {
  token: string;
  search?: string;
  skip?: number;
  limit?: number;
  includeDeleted?: boolean;
};


const AUTO_TRANSLATE_ON_SAVE = process.env.NEXT_PUBLIC_ADMIN_AUTO_TRANSLATE !== "false";

function isBlankTranslationValue(value: unknown) {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

function applyBilingualFallbacks(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => applyBilingualFallbacks(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const source = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};

  Object.entries(source).forEach(([key, itemValue]) => {
    next[key] = applyBilingualFallbacks(itemValue);
  });

  Object.keys(next).forEach((key) => {
    if (!key.endsWith("_en")) {
      return;
    }

    const arabicKey = `${key.slice(0, -3)}_ar`;
    if (arabicKey in next && isBlankTranslationValue(next[key]) && !isBlankTranslationValue(next[arabicKey])) {
      next[key] = next[arabicKey];
    }
  });

  return next;
}

async function preparePayloadBeforeSave(token: string, payload: Record<string, unknown>) {
  const payloadWithFallbacks = applyBilingualFallbacks(payload) as Record<string, unknown>;

  if (!AUTO_TRANSLATE_ON_SAVE) {
    return payloadWithFallbacks;
  }

  const items = collectAutoTranslationItems(payloadWithFallbacks);
  if (items.length === 0) {
    return payloadWithFallbacks;
  }

  try {
    const response = await translateAdminContent(token, items);
    return applyBilingualFallbacks(applyAutoTranslations(payloadWithFallbacks, response.items)) as Record<string, unknown>;
  } catch {
    // لا نمنع الحفظ إذا فشل مزود الترجمة؛ الحقول الإنجليزية تأخذ قيمة عربية احتياطية.
    return payloadWithFallbacks;
  }
}

function queryString(params: Record<string, string | number | boolean | undefined | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const value = searchParams.toString();
  return value ? `?${value}` : "";
}

export function getAdminDashboard(token: string) {
  return apiRequest<AdminDashboardSummary>("/admin/dashboard", { token });
}

export function getAdminContentOverview(token: string) {
  return apiRequest<AdminContentOverview>("/admin/content-overview", { token });
}

export function getAdminCustomersOverview(token: string) {
  return apiRequest<AdminCustomersOverview>("/admin/customers-overview", { token });
}

export function getAdminCommunicationOverview(token: string) {
  return apiRequest<AdminCommunicationOverview>("/admin/communication-overview", { token });
}

export function getAdminAdministrationOverview(token: string) {
  return apiRequest<AdminAdministrationOverview>("/admin/administration-overview", { token });
}

export function getAdminSettingsOverview(token: string) {
  return apiRequest<AdminSettingsOverview>("/admin/settings-overview", { token });
}

export function listAdminItems(path: string, params: AdminListParams) {
  return apiRequest<unknown[]>(
    `${path}${queryString({ search: params.search, skip: params.skip ?? 0, limit: params.limit ?? 50, include_deleted: params.includeDeleted })}`,
    { token: params.token }
  );
}

export function getAdminItem(path: string, token: string) {
  return apiRequest<Record<string, unknown>>(path, { token });
}

export async function createAdminItem(path: string, token: string, payload: Record<string, unknown>) {
  const preparedPayload = await preparePayloadBeforeSave(token, payload);
  return apiRequest<Record<string, unknown>>(path, {
    method: "POST",
    token,
    body: JSON.stringify(preparedPayload)
  });
}

export async function updateAdminItem(path: string, token: string, payload: Record<string, unknown>) {
  const preparedPayload = await preparePayloadBeforeSave(token, payload);
  return apiRequest<Record<string, unknown>>(path, {
    method: "PATCH",
    token,
    body: JSON.stringify(preparedPayload)
  });
}

export function deleteAdminItem(path: string, token: string) {
  return apiRequest<Record<string, unknown>>(path, {
    method: "DELETE",
    token
  });
}


export function restoreAdminService(token: string, serviceId: string) {
  return apiRequest<Record<string, unknown>>(`/admin/services/${serviceId}/restore`, {
    method: "PATCH",
    token
  });
}

export function restoreAdminApp(token: string, appId: string) {
  return apiRequest<Record<string, unknown>>(`/admin/apps/${appId}/restore`, {
    method: "PATCH",
    token
  });
}

export function restoreAdminProduct(token: string, productId: string) {
  return apiRequest<Record<string, unknown>>(`/admin/products/${productId}/restore`, {
    method: "PATCH",
    token
  });
}

export function restoreAdminPortfolio(token: string, portfolioId: string) {
  return apiRequest<Record<string, unknown>>(`/admin/portfolio/${portfolioId}/restore`, {
    method: "PATCH",
    token
  });
}

export function restoreAdminFaq(token: string, faqId: string) {
  return apiRequest<Record<string, unknown>>(`/admin/faqs/${faqId}/restore`, {
    method: "PATCH",
    token
  });
}

export function restoreAdminStaticPage(token: string, pageId: string) {
  return apiRequest<Record<string, unknown>>(`/admin/static-pages/${pageId}/restore`, {
    method: "PATCH",
    token
  });
}

export function ensureDefaultStaticPages(token: string) {
  return apiRequest<Record<string, unknown>>("/admin/static-pages/ensure-defaults", {
    method: "POST",
    token
  });
}

export function getAdminSettings(token: string) {
  return apiRequest<Record<string, unknown>>("/admin/settings", { token });
}

export function updateAdminSettings(token: string, payload: Record<string, unknown>) {
  return apiRequest<Record<string, unknown>>("/admin/settings", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
}

export function getUnreadNotificationsCount(token: string) {
  return apiRequest<{ unread_count: number }>("/admin/notifications/unread-count", { token });
}

export function markNotificationRead(token: string, notificationId: string) {
  return apiRequest<Record<string, unknown>>(`/admin/notifications/${notificationId}/read`, {
    method: "PATCH",
    token
  });
}

export function addQuoteNote(token: string, quoteId: string, note: string) {
  return apiRequest<Record<string, unknown>>(`/admin/quote-requests/${quoteId}/notes`, {
    method: "POST",
    token,
    body: JSON.stringify({ note })
  });
}

export function listRoles(token: string) {
  return apiRequest<unknown[]>("/roles", { token });
}

export function ensureDefaultRoles(token: string) {
  return apiRequest<unknown[]>("/roles/ensure-defaults", {
    method: "POST",
    token
  });
}

export function updateUserPassword(token: string, userId: string, password: string) {
  return apiRequest<Record<string, unknown>>(`/users/${userId}/password`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ password })
  });
}

export function getAnalyticsSummary(token: string) {
  return apiRequest<Record<string, unknown>>("/admin/analytics/summary", { token });
}

export function ensureDefaultEmailTemplates(token: string) {
  return apiRequest<unknown[]>("/admin/email-templates/ensure-defaults", {
    method: "POST",
    token
  });
}

export function listEmailTemplates(token: string) {
  return apiRequest<unknown[]>("/admin/email-templates", { token });
}

export function updateEmailTemplate(token: string, templateId: string, payload: Record<string, unknown>) {
  return apiRequest<Record<string, unknown>>(`/admin/email-templates/${templateId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
}

export function uploadAdminMedia(token: string, formData: FormData) {
  return apiRequest<Record<string, unknown>>("/admin/media/upload", {
    method: "POST",
    token,
    body: formData
  });
}

export type AdminTranslationItem = {
  id: string;
  text: string;
  field?: string;
};

export function translateAdminContent(token: string, items: AdminTranslationItem[]) {
  return apiRequest<{ items: Array<{ id: string; text: string; provider?: string }>; provider?: string }>(
    "/admin/translation/bulk",
    {
      method: "POST",
      token,
      body: JSON.stringify({
        items,
        source_language: "ar",
        target_language: "en",
      }),
    },
  );
}

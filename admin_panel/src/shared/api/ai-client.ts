/**
 * =====================================================
 * AI Client
 * طلبات مساعد الذكاء الاصطناعي داخل لوحة الأدمن
 * =====================================================
 */

import { apiRequest } from "./api-client";

export type AiEntityType =
  | "service"
  | "app"
  | "product"
  | "portfolio"
  | "static_page"
  | "faq"
  | "testimonial"
  | "email_template"
  | "general";

export type AiTargetField =
  | "all"
  | "improved_title_ar"
  | "short_description_ar"
  | "full_description_ar"
  | "seo_title_ar"
  | "seo_description_ar"
  | "features_ar"
  | "keywords_ar"
  | "slug"
  | "image_prompt"
  | "icon_prompt"
  | "translate_to_en";


export type AiImageKind = "image" | "icon";
export type AiImageSize = "1024x1024" | "1024x1536" | "1536x1024";

export type AiSettings = {
  enabled: boolean;
  provider: string;
  base_url?: string;
  base_url_configured: boolean;
  api_key_configured: boolean;
  api_key_masked?: string;
  text_model: string;
  image_model: string;
  timeout_seconds: number;
  auto_translate: boolean;
  auto_fill_seo: boolean;
  hide_english_fields: boolean;
  enable_ai_everywhere?: boolean;
  source?: string;
};

export type AiSettingsUpdatePayload = Partial<Pick<
  AiSettings,
  "enabled" | "provider" | "base_url" | "text_model" | "image_model" | "timeout_seconds" | "auto_translate" | "auto_fill_seo" | "hide_english_fields" | "enable_ai_everywhere"
>> & {
  api_key?: string;
  clear_api_key?: boolean;
};

export type AiSettingsTestResponse = {
  ready: boolean;
  provider?: string;
  text_model?: string;
  message_ar?: string;
  message_en?: string;
};

export type AiGeneratePayload = {
  entity_type?: AiEntityType;
  target_field?: AiTargetField;
  title_ar?: string;
  short_description_ar?: string;
  full_description_ar?: string;
  context_ar?: string;
  target_audience?: string;
  tone?: string;
  extra_instructions?: string;
};


export type AiImageGeneratePayload = {
  entity_type?: AiEntityType;
  image_kind?: AiImageKind;
  title_ar?: string;
  short_description_ar?: string;
  full_description_ar?: string;
  context_ar?: string;
  prompt?: string;
  size?: AiImageSize;
};

export type AiImageGenerateResponse = {
  image_url: string;
  media_id: string;
  prompt: string;
  used_ai: boolean;
  provider: string;
  model: string;
  mime_type: string;
  file_size: number;
};

export type AiGeneratedContent = {
  improved_title_ar: string;
  short_description_ar: string;
  full_description_ar: string;
  seo_title_ar: string;
  seo_description_ar: string;
  keywords_ar: string[];
  features_ar: string[];
  slug: string;
  image_prompt: string;
  icon_prompt: string;
  title_en: string;
  short_description_en: string;
  full_description_en: string;
  seo_title_en: string;
  seo_description_en: string;
  provider: string;
  model: string;
};

export type AiGenerateResponse = {
  content: AiGeneratedContent;
  used_ai: boolean;
  provider: string;
  model: string;
};

export function getAdminAiSettings(token: string) {
  return apiRequest<AiSettings>("/admin/ai/settings", { token });
}

export function updateAdminAiSettings(token: string, payload: AiSettingsUpdatePayload) {
  return apiRequest<AiSettings>("/admin/ai/settings", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
}

export function testAdminAiSettings(token: string) {
  return apiRequest<AiSettingsTestResponse>("/admin/ai/test", {
    method: "POST",
    token
  });
}

export function generateAdminAiContent(token: string, payload: AiGeneratePayload) {
  return apiRequest<AiGenerateResponse>("/admin/ai/generate", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function translateAdminAiFields(token: string, fields: Record<string, unknown>, overwrite = true) {
  return apiRequest<{ fields: Record<string, unknown> }>("/admin/ai/translate", {
    method: "POST",
    token,
    body: JSON.stringify({ fields, overwrite })
  });
}


export function generateAdminAiImage(token: string, payload: AiImageGeneratePayload) {
  return apiRequest<AiImageGenerateResponse>("/admin/ai/generate-image", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

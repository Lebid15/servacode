/**
 * =====================================================
 * Public Client
 * طلبات الموقع العام المفتوحة للزوار
 * =====================================================
 */

import { apiRequest } from "./api-client";

export type PublicSettings = {
  site_name_ar: string;
  site_name_en: string;
  company_legal_name_ar?: string | null;
  company_legal_name_en?: string | null;
  company_description_ar?: string | null;
  company_description_en?: string | null;
  active_theme: string;
  default_language: string;
  is_english_enabled: boolean;
  logo_url?: string | null;
  favicon_url?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address_ar?: string | null;
  address_en?: string | null;
  map_url?: string | null;
  working_hours_ar?: string | null;
  working_hours_en?: string | null;
  support_email?: string | null;
  support_phone?: string | null;
  social_links?: Record<string, string>;
  seo_title_ar?: string | null;
  seo_title_en?: string | null;
  seo_description_ar?: string | null;
  seo_description_en?: string | null;
  maintenance_mode?: boolean;
  maintenance_message_ar?: string | null;
  maintenance_message_en?: string | null;
  visible_sections?: Record<string, boolean>;
  footer_text_ar?: string | null;
  footer_text_en?: string | null;
  extra_settings?: Record<string, unknown>;
};

export type PublicService = {
  id: string;
  title_ar: string;
  title_en: string;
  slug_ar: string;
  slug_en: string;
  description_ar: string;
  description_en: string;
  full_description_ar?: string | null;
  full_description_en?: string | null;
  image_url?: string | null;
  icon?: string | null;
  features?: Array<{
    id: string;
    title_ar: string;
    title_en: string;
    description_ar?: string | null;
    description_en?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }>;
};

export type PublicProduct = {
  id: string;
  name_ar: string;
  name_en: string;
  slug_ar: string;
  slug_en: string;
  short_description_ar: string;
  short_description_en: string;
  full_description_ar?: string | null;
  full_description_en?: string | null;
  product_type: string;
  status: string;
  main_image_url?: string | null;
  target_audience_ar?: string | null;
  target_audience_en?: string | null;
  requirements_ar?: string | null;
  requirements_en?: string | null;
  show_demo_request?: boolean;
  features?: Array<{
    id: string;
    title_ar: string;
    title_en: string;
    description_ar?: string | null;
    description_en?: string | null;
  }>;
  images?: Array<{
    id: string;
    image_url: string;
    alt_text_ar?: string | null;
    alt_text_en?: string | null;
  }>;
  faqs?: Array<{
    id: string;
    question_ar: string;
    question_en: string;
    answer_ar: string;
    answer_en: string;
  }>;
};

export type PublicApp = {
  id: string;
  name_ar: string;
  name_en: string;
  slug_ar: string;
  slug_en: string;
  short_description_ar: string;
  short_description_en: string;
  full_description_ar?: string | null;
  full_description_en?: string | null;
  app_type: string;
  platform: string;
  status: string;
  pricing_type: string;
  icon_url?: string | null;
  main_image_url?: string | null;
  download_url?: string | null;
  download_files?: Array<Record<string, unknown>>;
  live_url?: string | null;
  support_url?: string | null;
  privacy_url?: string | null;
  version?: string | null;
  latest_release_at?: string | null;
  features?: Array<Record<string, unknown>>;
  screenshots?: Array<Record<string, unknown>>;
  requirements?: Record<string, unknown>;
  changelog?: Array<Record<string, unknown>>;
  seo_title_ar?: string | null;
  seo_title_en?: string | null;
  seo_description_ar?: string | null;
  seo_description_en?: string | null;
  is_featured?: boolean;
};

export type PublicPortfolioProject = {
  id: string;
  title_ar: string;
  title_en: string;
  slug_ar: string;
  slug_en: string;
  description_ar: string;
  description_en: string;
  full_description_ar?: string | null;
  full_description_en?: string | null;
  category_ar?: string | null;
  category_en?: string | null;
  technologies: string[];
  main_image_url?: string | null;
  preview_url?: string | null;
  gallery_images?: string[];
  completed_at?: string | null;
  problem_ar?: string | null;
  problem_en?: string | null;
  result_ar?: string | null;
  result_en?: string | null;
};

export type PublicBlogPost = {
  id: string;
  title_ar: string;
  title_en: string;
  slug_ar: string;
  slug_en: string;
  excerpt_ar?: string | null;
  excerpt_en?: string | null;
  content_ar?: string | null;
  content_en?: string | null;
  featured_image_url?: string | null;
  published_at?: string | null;
  tags: string[];
};

export type PublicFaq = {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
};

export type PublicTestimonial = {
  id: string;
  client_name: string;
  company_name?: string | null;
  position?: string | null;
  text_ar: string;
  text_en: string;
  rating: number;
  image_url?: string | null;
};


export type TestimonialPayload = {
  client_name: string;
  company_name?: string;
  position?: string;
  rating: number;
  text: string;
  website?: string;
};

export type PublicStaticPage = {
  id: string;
  page_key: string;
  title_ar: string;
  title_en: string;
  slug_ar?: string | null;
  slug_en?: string | null;
  content_ar?: string | null;
  content_en?: string | null;
  sections?: Record<string, unknown>;
  seo_title_ar?: string | null;
  seo_title_en?: string | null;
  seo_description_ar?: string | null;
  seo_description_en?: string | null;
  is_active?: boolean;
  updated_at?: string | null;
};

export type ContactPayload = {
  full_name: string;
  phone?: string;
  email?: string;
  subject?: string;
  message: string;
  website?: string;
};

export type SupportPayload = {
  full_name: string;
  phone?: string;
  email?: string;
  app_id?: string;
  app_name?: string;
  subject: string;
  message: string;
  priority?: string;
  website?: string;
};


export type PublicAnalyticsPayload = {
  event_type?: "page_view";
  path?: string;
  locale?: string;
  entity_type?: string;
  entity_id?: string;
  referrer?: string;
  extra_data?: Record<string, unknown>;
};

export type QuotePayload = {
  full_name: string;
  phone: string;
  email?: string;
  project_type: string;
  expected_budget?: number;
  expected_duration?: string;
  description: string;
  preferred_contact_method: string;
  website?: string;
};

export function getPublicSettings() {
  return apiRequest<PublicSettings>("/public/settings", { cache: "no-store" });
}

export function getPublicServices() {
  return apiRequest<PublicService[]>("/public/services", { next: { revalidate: 60 } });
}

export function getPublicService(slug: string) {
  return apiRequest<PublicService>(`/public/services/${slug}`, { next: { revalidate: 60 } });
}

export function getPublicProducts() {
  return apiRequest<PublicProduct[]>("/public/products", { next: { revalidate: 60 } });
}

export function getPublicProduct(slug: string) {
  return apiRequest<PublicProduct>(`/public/products/${slug}`, { next: { revalidate: 60 } });
}

export function getPublicApps() {
  return apiRequest<PublicApp[]>("/public/apps", { next: { revalidate: 60 } });
}

export function getPublicApp(slug: string) {
  return apiRequest<PublicApp>(`/public/apps/${slug}`, { next: { revalidate: 60 } });
}

export function getPublicPortfolio() {
  return apiRequest<PublicPortfolioProject[]>("/public/portfolio", { next: { revalidate: 60 } });
}

export function getPublicPortfolioProject(slug: string) {
  return apiRequest<PublicPortfolioProject>(`/public/portfolio/${slug}`, { next: { revalidate: 60 } });
}

export function getPublicBlogPosts() {
  return apiRequest<PublicBlogPost[]>("/public/blog", { next: { revalidate: 60 } });
}

export function getPublicBlogPost(slug: string) {
  return apiRequest<PublicBlogPost>(`/public/blog/${slug}`, { next: { revalidate: 60 } });
}

export function getPublicFaqs() {
  return apiRequest<PublicFaq[]>("/public/faqs", { next: { revalidate: 60 } });
}

export function getPublicTestimonials() {
  return apiRequest<PublicTestimonial[]>("/public/testimonials", { next: { revalidate: 60 } });
}

export function getPublicStaticPage(identifier: string) {
  const normalizedIdentifier = encodeURIComponent(identifier.trim());

  return apiRequest<PublicStaticPage>(`/public/static-pages/${normalizedIdentifier}`, {
    next: { revalidate: 300 }
  });
}

export function trackPublicAnalyticsEvent(payload: PublicAnalyticsPayload) {
  return apiRequest<Record<string, unknown>>("/public/analytics/events", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store"
  });
}


export function submitCustomerTestimonial(payload: TestimonialPayload) {
  return apiRequest<Record<string, unknown>>("/public/testimonials/submit", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store"
  });
}

export function submitContactMessage(payload: ContactPayload) {
  return apiRequest<Record<string, unknown>>("/public/contact", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function submitQuoteRequest(payload: QuotePayload) {
  return apiRequest<Record<string, unknown>>("/public/quote-requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function submitSupportRequest(payload: SupportPayload) {
  return apiRequest<Record<string, unknown>>("/public/support-requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

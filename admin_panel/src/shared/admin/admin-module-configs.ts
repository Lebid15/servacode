/**
 * =====================================================
 * إعدادات وحدات الأدمن
 * كل صفحة تستدعي إعدادها بدل تكرار تعريف الحقول والجداول
 * =====================================================
 */

import type { AdminModuleConfig } from "./admin-module-types";

type FieldLabels = Record<string, string>;

export function buildServiceConfig(
  title: string,
  description: string,
  fields: FieldLabels,
): AdminModuleConfig {
  return {
    title,
    description,
    endpoint: "/admin/services",
    columns: [
      { key: "title_ar", label: fields.titleAr },
      { key: "title_en", label: fields.titleEn },
      { key: "slug_en", label: fields.slugEn },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    fields: [
      { key: "title_ar", label: fields.titleAr, type: "text", required: true },
      { key: "title_en", label: fields.titleEn, type: "text", required: true },
      { key: "slug_ar", label: fields.slugAr, type: "text", required: true },
      { key: "slug_en", label: fields.slugEn, type: "text", required: true },
      {
        key: "description_ar",
        label: fields.descriptionAr,
        type: "textarea",
        required: true,
      },
      {
        key: "description_en",
        label: fields.descriptionEn,
        type: "textarea",
        required: true,
      },
      {
        key: "full_description_ar",
        label: fields.fullDescriptionAr ?? fields.descriptionAr,
        type: "textarea",
      },
      {
        key: "full_description_en",
        label: fields.fullDescriptionEn ?? fields.descriptionEn,
        type: "textarea",
      },
      { key: "icon", label: fields.icon ?? "Icon", type: "text" },
      { key: "image_url", label: fields.imageUrl, type: "media-url" },
      {
        key: "features",
        label: fields.features ?? "Features",
        type: "json-list",
        itemLabel: fields.feature ?? "Feature",
        itemFields: [
          { key: "title_ar", label: fields.titleAr, type: "text" },
          { key: "title_en", label: fields.titleEn, type: "text" },
          { key: "description_ar", label: fields.descriptionAr, type: "textarea" },
          { key: "description_en", label: fields.descriptionEn, type: "textarea" },
          { key: "sort_order", label: fields.sortOrder, type: "number" },
          { key: "is_active", label: fields.status, type: "boolean" },
        ],
      },
      {
        key: "seo_title_ar",
        label: fields.seoTitleAr ?? "SEO title AR",
        type: "text",
      },
      {
        key: "seo_title_en",
        label: fields.seoTitleEn ?? "SEO title EN",
        type: "text",
      },
      {
        key: "seo_description_ar",
        label: fields.seoDescriptionAr ?? "SEO description AR",
        type: "textarea",
      },
      {
        key: "seo_description_en",
        label: fields.seoDescriptionEn ?? "SEO description EN",
        type: "textarea",
      },
      { key: "sort_order", label: fields.sortOrder, type: "number" },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    createInitialValues: {
      title_ar: "",
      title_en: "",
      slug_ar: "",
      slug_en: "",
      description_ar: "",
      description_en: "",
      full_description_ar: "",
      full_description_en: "",
      icon: "server",
      image_url: "",
      features: [],
      seo_title_ar: "",
      seo_title_en: "",
      seo_description_ar: "",
      seo_description_en: "",
      sort_order: 0,
      is_active: true,
    },
  };
}

export function buildProductConfig(
  title: string,
  description: string,
  fields: FieldLabels,
): AdminModuleConfig {
  return {
    title,
    description,
    endpoint: "/admin/products",
    columns: [
      { key: "name_ar", label: fields.nameAr },
      { key: "name_en", label: fields.nameEn },
      { key: "product_type", label: "Type" },
      { key: "status", label: fields.status, type: "badge" },
    ],
    fields: [
      { key: "name_ar", label: fields.nameAr, type: "text", required: true },
      { key: "name_en", label: fields.nameEn, type: "text", required: true },
      { key: "slug_ar", label: fields.slugAr, type: "text", required: true },
      { key: "slug_en", label: fields.slugEn, type: "text", required: true },
      {
        key: "short_description_ar",
        label: fields.descriptionAr,
        type: "textarea",
        required: true,
      },
      {
        key: "short_description_en",
        label: fields.descriptionEn,
        type: "textarea",
        required: true,
      },
      {
        key: "product_type",
        label: "Type",
        type: "select",
        options: [
          { label: "Web", value: "web" },
          { label: "Desktop", value: "desktop" },
          { label: "Mobile", value: "mobile" },
          { label: "SaaS", value: "saas" },
        ],
      },
      {
        key: "status",
        label: fields.status,
        type: "select",
        options: [
          { label: "Available", value: "available" },
          { label: "Launching soon", value: "coming_soon" },
          { label: "In development", value: "in_development" },
        ],
      },
      { key: "main_image_url", label: fields.imageUrl, type: "media-url" },
      { key: "sort_order", label: fields.sortOrder, type: "number" },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    createInitialValues: {
      name_ar: "",
      name_en: "",
      slug_ar: "",
      slug_en: "",
      short_description_ar: "",
      short_description_en: "",
      product_type: "web",
      status: "available",
      main_image_url: "",
      sort_order: 0,
      is_active: true,
    },
  };
}

export function buildAppsConfig(
  title: string,
  description: string,
  fields: FieldLabels,
): AdminModuleConfig {
  const platformOptions = [
    { label: "Web", value: "web" },
    { label: "Windows", value: "windows" },
    { label: "macOS", value: "macos" },
    { label: "Linux", value: "linux" },
    { label: "Android", value: "android" },
    { label: "iOS", value: "ios" },
    { label: "Cross platform", value: "cross_platform" },
  ];

  return {
    title,
    description,
    endpoint: "/admin/apps",
    columns: [
      { key: "name_ar", label: fields.nameAr },
      { key: "name_en", label: fields.nameEn },
      { key: "platform", label: fields.platform ?? "Platform", type: "badge" },
      { key: "status", label: fields.status, type: "badge" },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    fields: [
      { key: "name_ar", label: fields.nameAr, type: "text", required: true },
      { key: "name_en", label: fields.nameEn, type: "text", required: true },
      { key: "slug_ar", label: fields.slugAr, type: "text", required: true },
      { key: "slug_en", label: fields.slugEn, type: "text", required: true },
      {
        key: "short_description_ar",
        label: fields.descriptionAr,
        type: "textarea",
        required: true,
      },
      {
        key: "short_description_en",
        label: fields.descriptionEn,
        type: "textarea",
        required: true,
      },
      {
        key: "full_description_ar",
        label: fields.fullDescriptionAr ?? fields.descriptionAr,
        type: "textarea",
      },
      {
        key: "full_description_en",
        label: fields.fullDescriptionEn ?? fields.descriptionEn,
        type: "textarea",
      },
      {
        key: "app_type",
        label: fields.type ?? "Type",
        type: "select",
        options: [
          { label: "Web", value: "web" },
          { label: "Desktop", value: "desktop" },
          { label: "Mobile", value: "mobile" },
          { label: "Tool", value: "tool" },
          { label: "API", value: "api" },
        ],
      },
      {
        key: "platform",
        label: fields.platform ?? "Platform",
        type: "select",
        options: platformOptions,
      },
      {
        key: "status",
        label: fields.status,
        type: "select",
        options: [
          { label: "Available", value: "available" },
          { label: "Beta", value: "beta" },
          { label: "Launching soon", value: "coming_soon" },
          { label: "In development", value: "in_development" },
          { label: "Hidden", value: "hidden" },
        ],
      },
      {
        key: "pricing_type",
        label: fields.pricing ?? "Pricing",
        type: "select",
        options: [
          { label: "Free", value: "free" },
          { label: "Paid", value: "paid" },
          { label: "Freemium", value: "freemium" },
          { label: "Contact", value: "contact" },
        ],
      },
      { key: "version", label: fields.version ?? "Version", type: "text" },
      {
        key: "icon_url",
        label: fields.iconUrl ?? fields.imageUrl,
        type: "media-url",
      },
      { key: "main_image_url", label: fields.imageUrl, type: "media-url" },
      {
        key: "download_url",
        label: fields.downloadUrl ?? "Download URL",
        type: "media-url",
      },
      { key: "live_url", label: fields.liveUrl ?? "Live URL", type: "text" },
      {
        key: "support_url",
        label: fields.supportUrl ?? "Support URL",
        type: "text",
      },
      {
        key: "privacy_url",
        label: fields.privacyUrl ?? "Privacy URL",
        type: "text",
      },
      {
        key: "download_files",
        label: fields.downloadFiles ?? "Download files",
        type: "json-list",
        itemLabel: fields.downloadFile ?? "Download",
        itemFields: [
          {
            key: "platform",
            label: fields.platform ?? "Platform",
            type: "select",
            options: platformOptions,
          },
          { key: "label_ar", label: fields.titleAr, type: "text" },
          { key: "label_en", label: fields.titleEn, type: "text" },
          {
            key: "url",
            label: fields.downloadUrl ?? "Download URL",
            type: "media-url",
          },
          { key: "version", label: fields.version ?? "Version", type: "text" },
          {
            key: "file_size",
            label: fields.fileSize ?? "File size",
            type: "text",
          },
          {
            key: "release_date",
            label: fields.releaseDate ?? "Release date",
            type: "text",
          },
        ],
      },
      {
        key: "features",
        label: fields.features ?? "Features",
        type: "json-list",
        itemLabel: fields.feature ?? "Feature",
        itemFields: [
          { key: "title_ar", label: fields.titleAr, type: "text" },
          { key: "title_en", label: fields.titleEn, type: "text" },
          {
            key: "description_ar",
            label: fields.descriptionAr,
            type: "textarea",
          },
          {
            key: "description_en",
            label: fields.descriptionEn,
            type: "textarea",
          },
        ],
      },
      {
        key: "screenshots",
        label: fields.screenshots ?? "Screenshots",
        type: "json-list",
        itemLabel: fields.screenshot ?? "Screenshot",
        itemFields: [
          { key: "image_url", label: fields.imageUrl, type: "media-url" },
          { key: "alt_ar", label: fields.titleAr, type: "text" },
          { key: "alt_en", label: fields.titleEn, type: "text" },
        ],
      },
      {
        key: "requirements",
        label: fields.requirements ?? "Requirements",
        type: "key-value-list",
      },
      {
        key: "changelog",
        label: fields.changelog ?? "Changelog",
        type: "json-list",
        itemLabel: fields.release ?? "Release",
        itemFields: [
          { key: "version", label: fields.version ?? "Version", type: "text" },
          {
            key: "release_date",
            label: fields.releaseDate ?? "Release date",
            type: "text",
          },
          { key: "title_ar", label: fields.titleAr, type: "text" },
          { key: "title_en", label: fields.titleEn, type: "text" },
          {
            key: "description_ar",
            label: fields.descriptionAr,
            type: "textarea",
          },
          {
            key: "description_en",
            label: fields.descriptionEn,
            type: "textarea",
          },
        ],
      },
      {
        key: "seo_title_ar",
        label: fields.seoTitleAr ?? "SEO title AR",
        type: "text",
      },
      {
        key: "seo_title_en",
        label: fields.seoTitleEn ?? "SEO title EN",
        type: "text",
      },
      {
        key: "seo_description_ar",
        label: fields.seoDescriptionAr ?? "SEO description AR",
        type: "textarea",
      },
      {
        key: "seo_description_en",
        label: fields.seoDescriptionEn ?? "SEO description EN",
        type: "textarea",
      },
      { key: "sort_order", label: fields.sortOrder, type: "number" },
      {
        key: "is_featured",
        label: fields.featured ?? "Featured",
        type: "boolean",
      },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    createInitialValues: {
      name_ar: "",
      name_en: "",
      slug_ar: "",
      slug_en: "",
      short_description_ar: "",
      short_description_en: "",
      full_description_ar: "",
      full_description_en: "",
      app_type: "web",
      platform: "web",
      status: "available",
      pricing_type: "free",
      version: "",
      icon_url: "",
      main_image_url: "",
      download_url: "",
      live_url: "",
      support_url: "",
      privacy_url: "",
      download_files: [],
      features: [],
      screenshots: [],
      requirements: {},
      changelog: [],
      seo_title_ar: "",
      seo_title_en: "",
      seo_description_ar: "",
      seo_description_en: "",
      sort_order: 0,
      is_featured: false,
      is_active: true,
    },
  };
}

export function buildPortfolioConfig(
  title: string,
  description: string,
  fields: FieldLabels,
): AdminModuleConfig {
  return {
    title,
    description,
    endpoint: "/admin/portfolio",
    columns: [
      { key: "title_ar", label: fields.titleAr },
      { key: "title_en", label: fields.titleEn },
      { key: "category_ar", label: "Category" },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    fields: [
      { key: "title_ar", label: fields.titleAr, type: "text", required: true },
      { key: "title_en", label: fields.titleEn, type: "text", required: true },
      { key: "slug_ar", label: fields.slugAr, type: "text", required: true },
      { key: "slug_en", label: fields.slugEn, type: "text", required: true },
      {
        key: "description_ar",
        label: fields.descriptionAr,
        type: "textarea",
        required: true,
      },
      {
        key: "description_en",
        label: fields.descriptionEn,
        type: "textarea",
        required: true,
      },
      { key: "main_image_url", label: fields.imageUrl, type: "media-url" },
      { key: "sort_order", label: fields.sortOrder, type: "number" },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    createInitialValues: {
      title_ar: "",
      title_en: "",
      slug_ar: "",
      slug_en: "",
      description_ar: "",
      description_en: "",
      main_image_url: "",
      sort_order: 0,
      is_active: true,
    },
  };
}

export function buildBlogCategoryConfig(
  title: string,
  description: string,
  fields: FieldLabels,
): AdminModuleConfig {
  return {
    title,
    description,
    endpoint: "/admin/blog/categories",
    columns: [
      { key: "name_ar", label: fields.nameAr },
      { key: "name_en", label: fields.nameEn },
      { key: "slug_en", label: fields.slugEn },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    fields: [
      { key: "name_ar", label: fields.nameAr, type: "text", required: true },
      { key: "name_en", label: fields.nameEn, type: "text", required: true },
      { key: "slug_ar", label: fields.slugAr, type: "text", required: true },
      { key: "slug_en", label: fields.slugEn, type: "text", required: true },
      { key: "description_ar", label: fields.descriptionAr, type: "textarea" },
      { key: "description_en", label: fields.descriptionEn, type: "textarea" },
      { key: "sort_order", label: fields.sortOrder, type: "number" },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    createInitialValues: {
      name_ar: "",
      name_en: "",
      slug_ar: "",
      slug_en: "",
      description_ar: "",
      description_en: "",
      sort_order: 0,
      is_active: true,
    },
  };
}

export function buildTestimonialConfig(
  title: string,
  description: string,
  fields: FieldLabels,
): AdminModuleConfig {
  return {
    title,
    description,
    endpoint: "/admin/testimonials",
    columns: [
      { key: "client_name", label: fields.nameAr },
      { key: "company_name", label: "Company" },
      { key: "rating", label: "Rating" },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    fields: [
      {
        key: "client_name",
        label: fields.fullName,
        type: "text",
        required: true,
      },
      { key: "company_name", label: "Company", type: "text" },
      { key: "position", label: "Position", type: "text" },
      {
        key: "text_ar",
        label: fields.contentAr,
        type: "textarea",
        required: true,
      },
      {
        key: "text_en",
        label: fields.contentEn,
        type: "textarea",
        required: true,
      },
      { key: "rating", label: "Rating", type: "number" },
      { key: "image_url", label: fields.imageUrl, type: "media-url" },
      { key: "sort_order", label: fields.sortOrder, type: "number" },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    createInitialValues: {
      client_name: "",
      company_name: "",
      position: "",
      text_ar: "",
      text_en: "",
      rating: 5,
      image_url: "",
      sort_order: 0,
      is_active: true,
    },
  };
}

export function buildFaqConfig(
  title: string,
  description: string,
  fields: FieldLabels,
): AdminModuleConfig {
  return {
    title,
    description,
    endpoint: "/admin/faqs",
    columns: [
      { key: "question_ar", label: fields.titleAr },
      { key: "scope", label: "Scope" },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    fields: [
      {
        key: "scope",
        label: "Scope",
        type: "select",
        options: [
          { label: "General", value: "general" },
          { label: "Service", value: "service" },
          { label: "Product", value: "product" },
        ],
      },
      {
        key: "question_ar",
        label: fields.titleAr,
        type: "textarea",
        required: true,
      },
      {
        key: "question_en",
        label: fields.titleEn,
        type: "textarea",
        required: true,
      },
      {
        key: "answer_ar",
        label: fields.descriptionAr,
        type: "textarea",
        required: true,
      },
      {
        key: "answer_en",
        label: fields.descriptionEn,
        type: "textarea",
        required: true,
      },
      { key: "sort_order", label: fields.sortOrder, type: "number" },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    createInitialValues: {
      scope: "general",
      question_ar: "",
      question_en: "",
      answer_ar: "",
      answer_en: "",
      sort_order: 0,
      is_active: true,
    },
  };
}

export function buildBlogPostConfig(
  title: string,
  description: string,
  fields: FieldLabels,
): AdminModuleConfig {
  return {
    title,
    description,
    endpoint: "/admin/blog/posts",
    columns: [
      { key: "title_ar", label: fields.titleAr },
      { key: "title_en", label: fields.titleEn },
      { key: "status", label: fields.status, type: "badge" },
      { key: "is_featured", label: "Featured", type: "boolean" },
    ],
    fields: [
      { key: "title_ar", label: fields.titleAr, type: "text", required: true },
      { key: "title_en", label: fields.titleEn, type: "text", required: true },
      { key: "slug_ar", label: fields.slugAr, type: "text", required: true },
      { key: "slug_en", label: fields.slugEn, type: "text", required: true },
      { key: "excerpt_ar", label: "Excerpt AR", type: "textarea" },
      { key: "excerpt_en", label: "Excerpt EN", type: "textarea" },
      {
        key: "content_ar",
        label: fields.contentAr,
        type: "textarea",
        required: true,
      },
      {
        key: "content_en",
        label: fields.contentEn,
        type: "textarea",
        required: true,
      },
      { key: "featured_image_url", label: fields.imageUrl, type: "text" },
      {
        key: "status",
        label: fields.status,
        type: "select",
        options: [
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
          { label: "Archived", value: "archived" },
        ],
      },
      { key: "is_featured", label: "Featured", type: "boolean" },
      { key: "sort_order", label: fields.sortOrder, type: "number" },
      { key: "seo_title_ar", label: "SEO title AR", type: "text" },
      { key: "seo_title_en", label: "SEO title EN", type: "text" },
      {
        key: "seo_description_ar",
        label: "SEO description AR",
        type: "textarea",
      },
      {
        key: "seo_description_en",
        label: "SEO description EN",
        type: "textarea",
      },
    ],
    createInitialValues: {
      title_ar: "",
      title_en: "",
      slug_ar: "",
      slug_en: "",
      excerpt_ar: "",
      excerpt_en: "",
      content_ar: "",
      content_en: "",
      featured_image_url: "",
      status: "draft",
      is_featured: false,
      sort_order: 0,
      seo_title_ar: "",
      seo_title_en: "",
      seo_description_ar: "",
      seo_description_en: "",
    },
  };
}

export function buildStaticPageConfig(
  title: string,
  description: string,
  fields: FieldLabels,
): AdminModuleConfig {
  return {
    title,
    description,
    endpoint: "/admin/static-pages",
    columns: [
      { key: "page_key", label: "Key" },
      { key: "title_ar", label: fields.titleAr },
      { key: "title_en", label: fields.titleEn },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    fields: [
      { key: "page_key", label: "Key", type: "text", required: true },
      { key: "title_ar", label: fields.titleAr, type: "text", required: true },
      { key: "title_en", label: fields.titleEn, type: "text", required: true },
      { key: "slug_ar", label: fields.slugAr, type: "text", required: true },
      { key: "slug_en", label: fields.slugEn, type: "text", required: true },
      { key: "content_ar", label: fields.contentAr, type: "textarea" },
      { key: "content_en", label: fields.contentEn, type: "textarea" },
      { key: "seo_title_ar", label: "SEO title AR", type: "text" },
      { key: "seo_title_en", label: "SEO title EN", type: "text" },
      {
        key: "seo_description_ar",
        label: "SEO description AR",
        type: "textarea",
      },
      {
        key: "seo_description_en",
        label: "SEO description EN",
        type: "textarea",
      },
      { key: "is_active", label: fields.status, type: "boolean" },
    ],
    createInitialValues: {
      page_key: "",
      title_ar: "",
      title_en: "",
      slug_ar: "",
      slug_en: "",
      content_ar: "",
      content_en: "",
      seo_title_ar: "",
      seo_title_en: "",
      seo_description_ar: "",
      seo_description_en: "",
      is_active: true,
    },
  };
}

export function buildMediaConfig(
  title: string,
  description: string,
  fields: FieldLabels,
): AdminModuleConfig {
  return {
    title,
    description,
    endpoint: "/admin/media",
    columns: [
      { key: "file_name", label: fields.nameAr },
      { key: "mime_type", label: "MIME" },
      { key: "media_type", label: "Type" },
      { key: "is_used", label: fields.status, type: "boolean" },
    ],
    fields: [
      { key: "file_name", label: fields.nameAr, type: "text", required: true },
      {
        key: "original_name",
        label: fields.nameEn,
        type: "text",
        required: true,
      },
      { key: "mime_type", label: "MIME", type: "text", required: true },
      {
        key: "media_type",
        label: "Type",
        type: "select",
        options: [
          { label: "Image", value: "image" },
          { label: "Document", value: "document" },
          { label: "Other", value: "other" },
        ],
      },
      { key: "file_size", label: "Size", type: "number" },
      { key: "url", label: "URL", type: "text", required: true },
      { key: "storage_path", label: "Path", type: "text", required: true },
      { key: "alt_text_ar", label: fields.titleAr, type: "text" },
      { key: "alt_text_en", label: fields.titleEn, type: "text" },
    ],
    createInitialValues: {
      file_name: "",
      original_name: "",
      mime_type: "image/png",
      media_type: "image",
      file_size: 0,
      url: "",
      storage_path: "",
      alt_text_ar: "",
      alt_text_en: "",
    },
  };
}

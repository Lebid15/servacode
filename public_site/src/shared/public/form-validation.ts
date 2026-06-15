import { z } from "zod";

import type { Locale } from "@/shared/design-system/utils/direction";

const messages = {
  ar: {
    required: "هذا الحقل مطلوب.",
    name: "اكتب الاسم الكامل بشكل صحيح.",
    phone: "اكتب رقم هاتف صالح للتواصل.",
    email: "اكتب بريدًا إلكترونيًا صالحًا.",
    contact: "أدخل رقم هاتف أو بريدًا إلكترونيًا حتى نستطيع التواصل معك.",
    subject: "اكتب موضوعًا أوضح للرسالة.",
    message: "اكتب تفاصيل أكثر حتى نستطيع فهم الطلب.",
    budget: "أدخل ميزانية صحيحة أو اترك الحقل فارغًا.",
    max: "النص أطول من الحد المناسب."
  },
  en: {
    required: "This field is required.",
    name: "Enter a valid full name.",
    phone: "Enter a valid phone number.",
    email: "Enter a valid email address.",
    contact: "Enter a phone number or email so we can reach you.",
    subject: "Enter a clearer subject.",
    message: "Add more details so we can understand the request.",
    budget: "Enter a valid budget or leave it empty.",
    max: "This text is longer than expected."
  }
};

const phonePattern = /^[+\d][+\d\s().-]{5,24}$/;

function emptyToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function baseText(locale: Locale) {
  const t = messages[locale];

  return {
    full_name: z.string().trim().min(2, t.name).max(120, t.max),
    phone: z.preprocess(
      emptyToUndefined,
      z.string().trim().regex(phonePattern, t.phone).max(32, t.max).optional()
    ),
    email: z.preprocess(
      emptyToUndefined,
      z.string().trim().email(t.email).max(160, t.max).optional()
    ),
    subject: z.preprocess(emptyToUndefined, z.string().trim().min(3, t.subject).max(180, t.max).optional()),
    message: z.string().trim().min(10, t.message).max(3000, t.max),
    website: z.string().trim().max(200, t.max).optional()
  };
}

export function contactSchema(locale: Locale) {
  const t = messages[locale];

  return z.object(baseText(locale)).refine((value) => value.phone || value.email, {
    path: ["phone"],
    message: t.contact
  });
}

export function quoteSchema(locale: Locale) {
  const t = messages[locale];

  return z.object({
    full_name: z.string().trim().min(2, t.name).max(120, t.max),
    phone: z.string().trim().regex(phonePattern, t.phone).max(32, t.max),
    email: z.preprocess(emptyToUndefined, z.string().trim().email(t.email).max(160, t.max).optional()),
    project_type: z.string().trim().min(1, t.required).max(80, t.max),
    expected_budget: z.preprocess(
      emptyToUndefined,
      z.coerce.number({ invalid_type_error: t.budget }).min(0, t.budget).max(100000000, t.budget).optional()
    ),
    expected_duration: z.preprocess(emptyToUndefined, z.string().trim().max(120, t.max).optional()),
    description: z.string().trim().min(15, t.message).max(4000, t.max),
    preferred_contact_method: z.string().trim().min(1, t.required).max(80, t.max),
    website: z.string().trim().max(200, t.max).optional()
  });
}

export function supportSchema(locale: Locale) {
  const t = messages[locale];

  return z.object({
    full_name: z.string().trim().min(2, t.name).max(120, t.max),
    phone: z.preprocess(
      emptyToUndefined,
      z.string().trim().regex(phonePattern, t.phone).max(32, t.max).optional()
    ),
    email: z.preprocess(emptyToUndefined, z.string().trim().email(t.email).max(160, t.max).optional()),
    app_id: z.preprocess(emptyToUndefined, z.string().trim().max(80, t.max).optional()),
    app_name: z.preprocess(emptyToUndefined, z.string().trim().max(160, t.max).optional()),
    subject: z.string().trim().min(3, t.subject).max(180, t.max),
    message: z.string().trim().min(10, t.message).max(3000, t.max),
    priority: z.string().trim().min(1, t.required).max(40, t.max),
    website: z.string().trim().max(200, t.max).optional()
  }).refine((value) => value.phone || value.email, {
    path: ["phone"],
    message: t.contact
  });
}

export function zodFieldErrors<T extends string>(error: z.ZodError) {
  const fieldErrors: Partial<Record<T, string>> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key as T]) {
      fieldErrors[key as T] = issue.message;
    }
  }

  return fieldErrors;
}

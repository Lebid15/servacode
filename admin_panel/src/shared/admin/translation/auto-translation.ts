/**
 * =====================================================
 * Auto Translation Helpers
 * يكتشف حقول *_ar ويملأ حقول *_en قبل الحفظ تلقائيًا
 * =====================================================
 */

export type AutoTranslationItem = {
  id: string;
  text: string;
  field?: string;
};

export type AutoTranslationResultItem = {
  id: string;
  text: string;
  provider?: string;
};

type PlainObject = Record<string, unknown>;

const MAX_ITEMS_PER_REQUEST = 60;

// بما أن حقول الإنجليزية مخفية افتراضيًا، نعيد توليدها تلقائيًا عند الحفظ
// حتى لا تبقى ترجمة قديمة بعد تعديل النص العربي.
const OVERWRITE_ENGLISH_TRANSLATIONS = process.env.NEXT_PUBLIC_ADMIN_TRANSLATION_OVERWRITE !== "false";

function isPlainObject(value: unknown): value is PlainObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isTranslatableArabicKey(key: string) {
  if (!key.endsWith("_ar")) {
    return false;
  }

  // لا نترجم روابط الملفات والصور أو المفاتيح التقنية.
  // slug_en يُشتق من title_en حتى يبقى رابطًا نظيفًا.
  return !/(url|image|logo|icon|favicon|file|attachment|email|phone|password|slug)/i.test(key);
}

function isEmptyText(value: unknown) {
  return typeof value !== "string" || value.trim().length === 0;
}

function toEnglishKey(key: string) {
  return key.replace(/_ar$/, "_en");
}

function getPath(path: Array<string | number>) {
  return path.map(String).join(".");
}

export function slugifyEnglish(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function collectFromValue(value: unknown, path: Array<string | number>, items: AutoTranslationItem[]) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectFromValue(item, [...path, index], items));
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  Object.entries(value).forEach(([key, itemValue]) => {
    if (isTranslatableArabicKey(key)) {
      const targetKey = toEnglishKey(key);
      const targetValue = value[targetKey];

      if (typeof itemValue === "string" && itemValue.trim() && (OVERWRITE_ENGLISH_TRANSLATIONS || isEmptyText(targetValue))) {
        const targetPath = [...path, targetKey];
        items.push({
          id: getPath(targetPath),
          text: itemValue.trim(),
          field: targetKey,
        });
      }
    }

    if (Array.isArray(itemValue) || isPlainObject(itemValue)) {
      collectFromValue(itemValue, [...path, key], items);
    }
  });
}

export function collectAutoTranslationItems(payload: unknown) {
  const items: AutoTranslationItem[] = [];
  collectFromValue(payload, [], items);
  return items.slice(0, MAX_ITEMS_PER_REQUEST);
}

function clonePayload<T>(payload: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(payload);
  }
  return JSON.parse(JSON.stringify(payload)) as T;
}

function setValueAtPath(target: unknown, pathText: string, value: string) {
  const parts = pathText.split(".");
  let cursor: unknown = target;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (Array.isArray(cursor)) {
      cursor = cursor[Number(part)];
    } else if (isPlainObject(cursor)) {
      cursor = cursor[part];
    } else {
      return;
    }
  }

  const last = parts[parts.length - 1];
  if (Array.isArray(cursor)) {
    cursor[Number(last)] = value;
    return;
  }

  if (isPlainObject(cursor)) {
    cursor[last] = value;
  }
}

function deriveMissingSlugs(value: unknown) {
  if (Array.isArray(value)) {
    value.forEach(deriveMissingSlugs);
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  const titleEn = typeof value.title_en === "string" ? value.title_en : "";
  const nameEn = typeof value.name_en === "string" ? value.name_en : "";

  if (isEmptyText(value.slug_en)) {
    const source = titleEn.trim() || nameEn.trim();
    if (source) {
      value.slug_en = slugifyEnglish(source);
    }
  }

  Object.values(value).forEach(deriveMissingSlugs);
}

function normalizeTranslatedValue(path: string, value: string) {
  if (/(^|\.)slug_en$/i.test(path)) {
    return slugifyEnglish(value);
  }
  return value.trim();
}

export function applyAutoTranslations<T>(payload: T, results: AutoTranslationResultItem[]) {
  const next = clonePayload(payload);

  results.forEach((item) => {
    if (!item.id || !item.text) {
      return;
    }
    setValueAtPath(next, item.id, normalizeTranslatedValue(item.id, item.text));
  });

  deriveMissingSlugs(next);
  return next;
}

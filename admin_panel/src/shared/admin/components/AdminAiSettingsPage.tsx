"use client";

/**
 * =====================================================
 * AdminAiSettingsPage
 * إعدادات الذكاء الاصطناعي المركزية + تجربة التوليد.
 * =====================================================
 */

import { useEffect, useMemo, useState } from "react";

import {
  generateAdminAiContent,
  getAdminAiSettings,
  testAdminAiSettings,
  updateAdminAiSettings,
  type AiEntityType,
  type AiGeneratedContent,
  type AiSettings
} from "@/shared/api/ai-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { AppTextarea } from "@/shared/design-system/components/AppTextarea";
import { cn } from "@/shared/design-system/utils/cn";
import type { Locale } from "@/shared/design-system/utils/direction";

const ENTITY_OPTIONS: Array<{ value: AiEntityType; ar: string; en: string }> = [
  { value: "service", ar: "خدمة", en: "Service" },
  { value: "product", ar: "نظام", en: "System" },
  { value: "app", ar: "تطبيق", en: "App" },
  { value: "portfolio", ar: "عمل سابق", en: "Portfolio" },
  { value: "static_page", ar: "صفحة ثابتة", en: "Static page" },
  { value: "faq", ar: "سؤال شائع", en: "FAQ" },
  { value: "general", ar: "عام", en: "General" }
];

const PROVIDERS = [
  { value: "openai_compatible", ar: "OpenAI أو مزود متوافق", en: "OpenAI compatible" },
  { value: "openai", ar: "OpenAI", en: "OpenAI" },
  { value: "openrouter", ar: "OpenRouter", en: "OpenRouter" },
  { value: "azure_openai", ar: "Azure OpenAI", en: "Azure OpenAI" }
];

type AiSettingsSafe = AiSettings;

const EMPTY_CONTENT: AiGeneratedContent = {
  improved_title_ar: "",
  short_description_ar: "",
  full_description_ar: "",
  seo_title_ar: "",
  seo_description_ar: "",
  keywords_ar: [],
  features_ar: [],
  slug: "",
  image_prompt: "",
  icon_prompt: "",
  title_en: "",
  short_description_en: "",
  full_description_en: "",
  seo_title_en: "",
  seo_description_en: "",
  provider: "",
  model: ""
};

function labels(locale: Locale) {
  const ar = locale === "ar";
  return {
    title: ar ? "الذكاء الاصطناعي" : "AI Assistant",
    subtitle: ar
      ? "إدارة مفتاح AI، الترجمة التلقائية، تحسين النصوص، SEO، وتوليد المحتوى من مكان واحد."
      : "Manage the AI key, auto translation, content improvement, SEO, and generation from one place.",
    configured: ar ? "جاهز ومفعل" : "Ready & enabled",
    missingKey: ar ? "يحتاج مفتاح API" : "API key required",
    disabled: ar ? "معطل" : "Disabled",
    save: ar ? "حفظ إعدادات الذكاء الاصطناعي" : "Save AI settings",
    saving: ar ? "جاري الحفظ..." : "Saving...",
    test: ar ? "اختبار الجاهزية" : "Test readiness",
    provider: ar ? "مزود الذكاء الاصطناعي" : "AI provider",
    apiKey: ar ? "AI API Key" : "AI API Key",
    apiKeyHint: ar ? "لن يظهر المفتاح كاملًا بعد الحفظ. اتركه فارغًا إذا لا تريد تغييره." : "The key is never shown fully after saving. Leave it blank to keep the current key.",
    clearKey: ar ? "حذف المفتاح الحالي" : "Clear current key",
    baseUrl: ar ? "رابط المزود" : "Provider URL",
    textModel: ar ? "نموذج النصوص" : "Text model",
    imageModel: ar ? "نموذج الصور" : "Image model",
    timeout: ar ? "مهلة الاتصال بالثواني" : "Timeout seconds",
    enabled: ar ? "تفعيل الذكاء الاصطناعي" : "Enable AI",
    enableEverywhere: ar ? "تفعيل الذكاء الاصطناعي في كل النماذج" : "Enable AI in all forms",
    autoTranslate: ar ? "ترجمة تلقائية للعناصر الإنجليزية" : "Auto translate English fields",
    autoSeo: ar ? "توليد SEO تلقائي" : "Auto SEO generation",
    hiddenEnglish: ar ? "إخفاء الحقول الإنجليزية عند الإدخال" : "Hide English fields while editing",
    source: ar ? "مصدر الإعدادات" : "Settings source",
    keyConfigured: ar ? "المفتاح محفوظ" : "Key configured",
    keyMissing: ar ? "لا يوجد مفتاح" : "No key",
    playground: ar ? "تجربة المساعد" : "Assistant playground",
    entityType: ar ? "نوع المحتوى" : "Content type",
    itemTitle: ar ? "العنوان العربي" : "Arabic title",
    context: ar ? "سياق إضافي اختياري" : "Optional context",
    generateAll: ar ? "توليد وتحسين وترجمة" : "Generate, improve, and translate",
    generated: ar ? "الناتج المقترح" : "Generated output",
    improvedTitle: ar ? "عنوان محسن" : "Improved title",
    shortDescription: ar ? "وصف مختصر" : "Short description",
    fullDescription: ar ? "وصف تفصيلي" : "Full description",
    seoTitle: ar ? "عنوان SEO" : "SEO title",
    seoDescription: ar ? "وصف SEO" : "SEO description",
    englishTitle: ar ? "العنوان الإنجليزي" : "English title",
    englishDescription: ar ? "الوصف الإنجليزي" : "English description",
    slug: ar ? "الرابط التلقائي" : "Auto slug",
    features: ar ? "المميزات" : "Features",
    keywords: ar ? "الكلمات المفتاحية" : "Keywords",
    imagePrompt: ar ? "برومبت الصورة" : "Image prompt",
    iconPrompt: ar ? "برومبت الأيقونة" : "Icon prompt",
    saved: ar ? "تم حفظ إعدادات الذكاء الاصطناعي." : "AI settings saved.",
    error: ar ? "تعذر تنفيذ الطلب." : "Request failed.",
    noResult: ar ? "اكتب عنوانًا واضغط توليد." : "Enter a title and generate content.",
    clearLabelsRule: ar
      ? "الواجهة تعرض أسماء عربية وإنجليزية واضحة، بينما تبقى القيم التقنية داخلية فقط."
      : "The interface shows clear Arabic and English labels while technical values remain internal only."
  };
}

function FieldBlock({ title, value, multiline = false }: { title: string; value?: string; multiline?: boolean }) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-appLg border border-app-border bg-app-surfaceElevated/60 p-4">
      <p className="mb-2 text-xs font-black uppercase tracking-wide text-app-muted">{title}</p>
      <p className={cn("text-sm font-semibold leading-7 text-app-foreground", multiline && "whitespace-pre-wrap")}>{value}</p>
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-appLg border border-app-border bg-app-surfaceElevated/50 px-4 py-3 text-sm font-bold text-app-foreground">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-app-primary" />
    </label>
  );
}

export function AdminAiSettingsPage({ locale }: { locale: Locale }) {
  const copy = labels(locale);
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";
  const [settings, setSettings] = useState<AiSettingsSafe | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [clearApiKey, setClearApiKey] = useState(false);
  const [entityType, setEntityType] = useState<AiEntityType>("service");
  const [titleAr, setTitleAr] = useState("تطوير مواقع الويب");
  const [contextAr, setContextAr] = useState("");
  const [result, setResult] = useState<AiGeneratedContent>(EMPTY_CONTENT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const status = useMemo(() => {
    if (!settings?.enabled) {
      return { label: copy.disabled, tone: "neutral" as const };
    }
    if (settings.api_key_configured) {
      return { label: copy.configured, tone: "success" as const };
    }
    return { label: copy.missingKey, tone: "warning" as const };
  }, [copy.configured, copy.disabled, copy.missingKey, settings?.api_key_configured, settings?.enabled]);

  useEffect(() => {
    if (!token) {
      return;
    }

    getAdminAiSettings(token)
      .then(setSettings)
      .catch(() => setError(copy.error));
  }, [copy.error, token]);

  const patchSettings = (patch: Partial<AiSettingsSafe>) => {
    setSettings((current) => ({ ...(current ?? { enabled: true, provider: "openai_compatible", base_url: "https://api.openai.com/v1", base_url_configured: true, api_key_configured: false, text_model: "gpt-4o-mini", image_model: "gpt-image-1", timeout_seconds: 45, auto_translate: true, auto_fill_seo: true, hide_english_fields: true, enable_ai_everywhere: true }), ...patch }));
  };

  const handleSave = async () => {
    if (!token || !settings) {
      return;
    }
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateAdminAiSettings(token, {
        enabled: settings.enabled,
        provider: settings.provider,
        base_url: settings.base_url,
        text_model: settings.text_model,
        image_model: settings.image_model,
        timeout_seconds: Number(settings.timeout_seconds) || 45,
        auto_translate: settings.auto_translate,
        auto_fill_seo: settings.auto_fill_seo,
        hide_english_fields: settings.hide_english_fields,
        enable_ai_everywhere: settings.enable_ai_everywhere,
        api_key: apiKey,
        clear_api_key: clearApiKey
      });
      setSettings(updated);
      setApiKey("");
      setClearApiKey(false);
      setNotice(copy.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!token) {
      return;
    }
    setError("");
    setNotice("");
    try {
      const response = await testAdminAiSettings(token);
      setNotice(locale === "ar" ? response.message_ar || copy.saved : response.message_en || copy.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.error);
    }
  };

  const handleGenerate = async () => {
    if (!token || !titleAr.trim()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await generateAdminAiContent(token, {
        entity_type: entityType,
        target_field: "all",
        title_ar: titleAr,
        context_ar: contextAr
      });
      setResult(response.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-appLg border border-app-primary/30 bg-app-primary/12 text-app-primary shadow-appGlow">
              <AppIcon name="sparkles" size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-app-foreground">{copy.title}</h1>
              <p className="mt-1 text-sm leading-6 text-app-muted">{copy.subtitle}</p>
            </div>
          </div>
        </div>
        <AppBadge tone={status.tone}>{status.label}</AppBadge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AppCard className="p-4"><p className="text-xs font-bold text-app-muted">{copy.provider}</p><p className="mt-2 truncate text-lg font-black text-app-foreground">{settings?.provider ?? "-"}</p></AppCard>
        <AppCard className="p-4"><p className="text-xs font-bold text-app-muted">{copy.apiKey}</p><p className="mt-2 truncate text-lg font-black text-app-foreground">{settings?.api_key_configured ? settings?.api_key_masked || copy.keyConfigured : copy.keyMissing}</p></AppCard>
        <AppCard className="p-4"><p className="text-xs font-bold text-app-muted">{copy.textModel}</p><p className="mt-2 truncate text-lg font-black text-app-foreground">{settings?.text_model ?? "-"}</p></AppCard>
        <AppCard className="p-4"><p className="text-xs font-bold text-app-muted">{copy.autoTranslate}</p><p className="mt-2 text-lg font-black text-app-foreground">{settings?.auto_translate ? "ON" : "OFF"}</p></AppCard>
        <AppCard className="p-4"><p className="text-xs font-bold text-app-muted">{copy.source}</p><p className="mt-2 truncate text-lg font-black text-app-foreground">{settings?.source ?? "-"}</p></AppCard>
      </div>

      <AppCard className="p-5">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-app-foreground">{copy.title}</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-app-muted">{copy.clearLabelsRule}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AppButton onClick={handleTest} variant="secondary" icon={<AppIcon name="check" size={18} />}>{copy.test}</AppButton>
            <AppButton onClick={handleSave} disabled={isSaving || !settings} icon={<AppIcon name={isSaving ? "loader" : "save"} size={18} className={isSaving ? "animate-spin" : undefined} />}>{isSaving ? copy.saving : copy.save}</AppButton>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="grid gap-4">
            <ToggleField label={copy.enabled} checked={Boolean(settings?.enabled)} onChange={(enabled) => patchSettings({ enabled })} />
            <ToggleField label={copy.enableEverywhere} checked={Boolean(settings?.enable_ai_everywhere ?? true)} onChange={(enable_ai_everywhere) => patchSettings({ enable_ai_everywhere })} />
            <ToggleField label={copy.autoTranslate} checked={Boolean(settings?.auto_translate)} onChange={(auto_translate) => patchSettings({ auto_translate })} />
            <ToggleField label={copy.autoSeo} checked={Boolean(settings?.auto_fill_seo)} onChange={(auto_fill_seo) => patchSettings({ auto_fill_seo })} />
            <ToggleField label={copy.hiddenEnglish} checked={Boolean(settings?.hide_english_fields)} onChange={(hide_english_fields) => patchSettings({ hide_english_fields })} />
          </div>
          <div className="grid gap-4">
            <AppSelect label={copy.provider} value={settings?.provider ?? "openai_compatible"} onChange={(event) => patchSettings({ provider: event.target.value })}>
              {PROVIDERS.map((option) => <option key={option.value} value={option.value}>{locale === "ar" ? option.ar : option.en}</option>)}
            </AppSelect>
            <AppInput label={copy.apiKey} value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={settings?.api_key_masked || "sk-..."} type="password" />
            <p className="-mt-2 text-xs font-semibold text-app-muted">{copy.apiKeyHint}</p>
            <ToggleField label={copy.clearKey} checked={clearApiKey} onChange={setClearApiKey} />
            <AppInput label={copy.baseUrl} value={settings?.base_url ?? ""} onChange={(event) => patchSettings({ base_url: event.target.value })} />
            <div className="grid gap-4 md:grid-cols-3">
              <AppInput label={copy.textModel} value={settings?.text_model ?? ""} onChange={(event) => patchSettings({ text_model: event.target.value })} />
              <AppInput label={copy.imageModel} value={settings?.image_model ?? ""} onChange={(event) => patchSettings({ image_model: event.target.value })} />
              <AppInput label={copy.timeout} value={String(settings?.timeout_seconds ?? 45)} onChange={(event) => patchSettings({ timeout_seconds: Number(event.target.value) || 45 })} type="number" />
            </div>
          </div>
        </div>

        {notice ? <p className="mt-4 rounded-appMd border border-app-success/30 bg-app-success/10 p-3 text-sm font-bold text-app-success">{notice}</p> : null}
        {error ? <p className="mt-4 rounded-appMd border border-app-danger/30 bg-app-danger/10 p-3 text-sm font-bold text-app-danger">{error}</p> : null}
      </AppCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <AppCard className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-app-foreground">{copy.playground}</h2>
              <p className="mt-1 text-sm text-app-muted">{copy.noResult}</p>
            </div>
            <AppIcon name="sparkles" size={22} className="text-app-primary" />
          </div>

          <div className="grid gap-4">
            <AppSelect label={copy.entityType} value={entityType} onChange={(event) => setEntityType(event.target.value as AiEntityType)}>
              {ENTITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{locale === "ar" ? option.ar : option.en}</option>)}
            </AppSelect>
            <AppInput label={copy.itemTitle} value={titleAr} onChange={(event) => setTitleAr(event.target.value)} />
            <AppTextarea label={copy.context} value={contextAr} onChange={(event) => setContextAr(event.target.value)} />
            <AppButton onClick={handleGenerate} disabled={isLoading || !titleAr.trim()} icon={<AppIcon name={isLoading ? "loader" : "sparkles"} size={18} className={isLoading ? "animate-spin" : ""} />}>
              {copy.generateAll}
            </AppButton>
          </div>
        </AppCard>

        <AppCard className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-app-foreground">{copy.generated}</h2>
            {result.provider ? <AppBadge tone={result.provider === "fallback" ? "warning" : "success"}>{result.provider}</AppBadge> : null}
          </div>

          {result.improved_title_ar || result.short_description_ar ? (
            <div className="grid gap-4">
              <FieldBlock title={copy.improvedTitle} value={result.improved_title_ar} />
              <FieldBlock title={copy.shortDescription} value={result.short_description_ar} multiline />
              <FieldBlock title={copy.fullDescription} value={result.full_description_ar} multiline />
              <FieldBlock title={copy.englishTitle} value={result.title_en} />
              <FieldBlock title={copy.englishDescription} value={result.short_description_en} multiline />
              <FieldBlock title={copy.seoTitle} value={result.seo_title_ar} />
              <FieldBlock title={copy.seoDescription} value={result.seo_description_ar} multiline />
              <FieldBlock title={copy.slug} value={result.slug} />
              {result.features_ar.length ? <FieldBlock title={copy.features} value={result.features_ar.map((item) => `• ${item}`).join("\n")} multiline /> : null}
              {result.keywords_ar.length ? <FieldBlock title={copy.keywords} value={result.keywords_ar.join("، ")} /> : null}
              <FieldBlock title={copy.imagePrompt} value={result.image_prompt} multiline />
              <FieldBlock title={copy.iconPrompt} value={result.icon_prompt} multiline />
            </div>
          ) : (
            <div className="grid min-h-80 place-items-center rounded-appLg border border-dashed border-app-border bg-app-surfaceElevated/40 p-8 text-center">
              <div>
                <AppIcon name="sparkles" size={36} className="mx-auto mb-3 text-app-primary" />
                <p className="text-sm font-bold text-app-muted">{copy.noResult}</p>
              </div>
            </div>
          )}
        </AppCard>
      </div>
    </div>
  );
}

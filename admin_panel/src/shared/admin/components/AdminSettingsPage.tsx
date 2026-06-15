"use client";

/**
 * =====================================================
 * AdminSettingsPage
 * صفحة هوية الشركة وإعدادات الموقع المتصلة بالـ API
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Globe2,
  ImageIcon,
  Info,
  RefreshCw,
  Save,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  AdminMediaPicker,
  type MediaPickerLabels,
} from "@/shared/admin/components/AdminMediaPicker";
import { buildBackendAssetUrl } from "@/shared/api/api-client";
import {
  getAdminSettings,
  updateAdminSettings,
} from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import {
  AppBadge,
  type BadgeTone,
} from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { AppTextarea } from "@/shared/design-system/components/AppTextarea";

const textFields = [
  "site_name_ar",
  "site_name_en",
  "company_legal_name_ar",
  "company_legal_name_en",
  "company_description_ar",
  "company_description_en",
  "email",
  "phone",
  "whatsapp",
  "logo_url",
  "favicon_url",
  "active_theme",
  "default_language",
  "address_ar",
  "address_en",
  "map_url",
  "working_hours_ar",
  "working_hours_en",
  "support_email",
  "support_phone",
  "footer_text_ar",
  "footer_text_en",
  "seo_title_ar",
  "seo_title_en",
  "seo_description_ar",
  "seo_description_en",
  "maintenance_message_ar",
  "maintenance_message_en",
] as const;

type TextFieldKey = (typeof textFields)[number];

type SectionKey =
  | "build"
  | "composition"
  | "architecture"
  | "why"
  | "process"
  | "technologies"
  | "services"
  | "products"
  | "apps"
  | "portfolio"
  | "testimonials"
  | "faqs"
  | "cta";

const sectionKeys: SectionKey[] = [
  "build",
  "composition",
  "architecture",
  "why",
  "process",
  "technologies",
  "services",
  "products",
  "apps",
  "portfolio",
  "testimonials",
  "faqs",
  "cta",
];

const defaultVisibleSections: Record<SectionKey, boolean> = {
  build: true,
  composition: false,
  architecture: false,
  why: true,
  process: false,
  technologies: false,
  services: true,
  products: true,
  apps: true,
  portfolio: true,
  testimonials: false,
  faqs: false,
  cta: true,
};

const socialKeys = [
  "facebook",
  "instagram",
  "linkedin",
  "telegram",
  "github",
  "x",
] as const;

type SocialKey = (typeof socialKeys)[number];

type AdminSettingsLabels = Record<string, string> & Partial<MediaPickerLabels>;

type AdminSettingsPageProps = {
  title: string;
  description: string;
  labels: AdminSettingsLabels;
  activeTab?: SettingsTab;
  basePath?: string;
};

type SettingsTab =
  | "identity"
  | "contact"
  | "social"
  | "seo"
  | "appearance"
  | "maintenance";

type CompletionItem = {
  key: string;
  label: string;
  done: boolean;
};

function readString(
  data: Record<string, unknown>,
  key: TextFieldKey,
  fallback = "",
) {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

function readRecord(data: Record<string, unknown>, key: string) {
  const value = data[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function safeLabel(labels: AdminSettingsLabels, key: string, fallback: string) {
  return labels[key] ?? fallback;
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function buildFormSnapshot(
  values: Record<TextFieldKey, string>,
  socialLinks: Record<SocialKey, string>,
  visibleSections: Record<SectionKey, boolean>,
  isEnglishEnabled: boolean,
  maintenanceMode: boolean,
) {
  return JSON.stringify({
    values,
    socialLinks,
    visibleSections,
    isEnglishEnabled,
    maintenanceMode,
  });
}

function completionTone(score: number): BadgeTone {
  if (score >= 80) {
    return "success";
  }
  if (score >= 55) {
    return "warning";
  }
  return "danger";
}

function FieldsetTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="grid gap-1 border-b border-app-border pb-3">
      <h2 className="text-base font-black text-app-foreground">{title}</h2>
      {description ? (
        <p className="text-sm leading-6 text-app-muted">{description}</p>
      ) : null}
    </div>
  );
}

function SettingsCard({ children }: { children: ReactNode }) {
  return <AppCard className="grid gap-5 p-5">{children}</AppCard>;
}

function AppCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-appLg border border-app-border bg-app-surface px-4 py-3 text-sm font-black text-app-foreground transition hover:border-app-primary/40">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[hsl(var(--color-primary))]"
      />
    </label>
  );
}

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 rounded-appLg border border-app-border bg-app-surfaceElevated p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-app-muted">{label}</span>
        <span className="grid size-9 place-items-center rounded-appMd border border-app-border bg-app-surface text-app-primary">
          {icon}
        </span>
      </div>
      <strong className="text-2xl font-black text-app-foreground">
        {value}
      </strong>
    </div>
  );
}

function MediaUrlInput({
  label,
  value,
  token,
  labels,
  onChange,
}: {
  label: string;
  value: string;
  token: string;
  labels: AdminSettingsLabels;
  onChange: (value: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const previewUrl = buildBackendAssetUrl(value);
  const isImageLike = /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value);

  const pickerLabels: MediaPickerLabels = {
    mediaPickerTitle: safeLabel(labels, "mediaPickerTitle", "Media Library"),
    mediaPickerDescription: safeLabel(
      labels,
      "mediaPickerDescription",
      "Choose an uploaded asset or upload a new file.",
    ),
    mediaPickerSearch: safeLabel(labels, "mediaPickerSearch", "Search media"),
    mediaPickerEmptyTitle: safeLabel(
      labels,
      "mediaPickerEmptyTitle",
      "No media found",
    ),
    mediaPickerEmptyDescription: safeLabel(
      labels,
      "mediaPickerEmptyDescription",
      "Upload a file first, then select it here.",
    ),
    uploadFromDevice: safeLabel(
      labels,
      "uploadFromDevice",
      "Upload from device",
    ),
    chooseFile: safeLabel(labels, "chooseFile", "Choose file"),
    upload: safeLabel(labels, "upload", "Upload"),
    select: safeLabel(labels, "select", "Select"),
    open: safeLabel(labels, "open", "Open"),
    refresh: safeLabel(labels, "refresh", "Refresh"),
    error: safeLabel(labels, "error", "Error"),
    loading: safeLabel(labels, "loading", "Loading..."),
  };

  return (
    <div className="grid gap-2">
      <AppInput
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <AppButton
          type="button"
          variant="secondary"
          className="min-h-9 px-3"
          onClick={() => setPickerOpen(true)}
        >
          {safeLabel(labels, "chooseFromLibrary", "Choose from library")}
        </AppButton>
        {value ? (
          <AppButton
            type="button"
            variant="ghost"
            className="min-h-9 px-3"
            onClick={() => onChange("")}
          >
            {safeLabel(labels, "clearMedia", "Clear")}
          </AppButton>
        ) : null}
      </div>

      {value ? (
        <div className="flex items-center gap-3 rounded-appMd border border-app-border bg-app-surface px-3 py-2 text-xs text-app-muted">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-appSm border border-app-border bg-app-surfaceElevated">
            {isImageLike ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span>URL</span>
            )}
          </div>
          <span className="min-w-0 flex-1 truncate">{value}</span>
          <AppButton
            type="button"
            variant="ghost"
            className="min-h-8 px-2"
            onClick={() =>
              window.open(previewUrl, "_blank", "noopener,noreferrer")
            }
          >
            {safeLabel(labels, "open", "Open")}
          </AppButton>
        </div>
      ) : null}

      <AdminMediaPicker
        open={pickerOpen}
        token={token}
        labels={pickerLabels}
        imagesOnly
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
      />
    </div>
  );
}

function BrandPreview({
  labels,
  values,
  isEnglishEnabled,
  maintenanceMode,
}: {
  labels: AdminSettingsLabels;
  values: Record<TextFieldKey, string>;
  isEnglishEnabled: boolean;
  maintenanceMode: boolean;
}) {
  const logoPreviewUrl = buildBackendAssetUrl(values.logo_url);
  const hasLogo = hasText(values.logo_url);

  return (
    <AppCard className="grid gap-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="text-base font-black text-app-foreground">
            {safeLabel(labels, "previewTitle", "Public identity preview")}
          </h2>
          <p className="text-sm leading-6 text-app-muted">
            {safeLabel(
              labels,
              "previewDescription",
              "A quick snapshot of what visitors will recognize on the public website.",
            )}
          </p>
        </div>
        <AppBadge tone={maintenanceMode ? "warning" : "success"}>
          {maintenanceMode
            ? safeLabel(labels, "maintenanceOn", "Maintenance on")
            : safeLabel(labels, "siteActive", "Site active")}
        </AppBadge>
      </div>

      <div className="flex items-center gap-4 rounded-appLg border border-app-border bg-app-surfaceElevated p-4">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-appLg border border-app-border bg-app-surface text-app-primary">
          {hasLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoPreviewUrl}
              alt=""
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <ImageIcon className="size-7" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-black text-app-foreground">
            {values.site_name_ar ||
              safeLabel(labels, "emptyArabicName", "Arabic company name")}
          </h3>
          <p className="truncate text-sm font-semibold text-app-muted">
            {values.site_name_en ||
              safeLabel(labels, "emptyEnglishName", "English company name")}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-app-muted">
            {values.company_description_ar ||
              values.company_description_en ||
              safeLabel(
                labels,
                "emptyDescription",
                "Add a short company description to make the public website feel complete.",
              )}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile
          label={safeLabel(labels, "defaultLanguage", "Default language")}
          value={
            values.default_language === "en"
              ? safeLabel(labels, "langEnglish", "English")
              : safeLabel(labels, "langArabic", "Arabic")
          }
          icon={<Globe2 className="size-4" />}
        />
        <StatTile
          label={safeLabel(labels, "englishVersion", "English version")}
          value={
            isEnglishEnabled
              ? safeLabel(labels, "enabled", "Enabled")
              : safeLabel(labels, "disabled", "Disabled")
          }
          icon={<CheckCircle2 className="size-4" />}
        />
        <StatTile
          label={safeLabel(labels, "activeTheme", "Active theme")}
          value={
            values.active_theme === "emerald-luxury"
              ? safeLabel(labels, "themeEmerald", "Emerald Luxury")
              : safeLabel(labels, "themeBlue", "Blue Tech")
          }
          icon={<ShieldAlert className="size-4" />}
        />
      </div>
    </AppCard>
  );
}

function CompletionPanel({
  labels,
  items,
  score,
}: {
  labels: AdminSettingsLabels;
  items: CompletionItem[];
  score: number;
}) {
  return (
    <AppCard className="grid gap-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="text-base font-black text-app-foreground">
            {safeLabel(labels, "readinessTitle", "Identity readiness")}
          </h2>
          <p className="text-sm leading-6 text-app-muted">
            {safeLabel(
              labels,
              "readinessDescription",
              "These items help the public website look complete and trustworthy.",
            )}
          </p>
        </div>
        <AppBadge tone={completionTone(score)}>{score}%</AppBadge>
      </div>
      <div className="grid gap-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-appMd border border-app-border bg-app-surfaceElevated px-4 py-3"
          >
            <span className="text-sm font-semibold text-app-foreground">
              {item.label}
            </span>
            <AppBadge tone={item.done ? "success" : "warning"}>
              {item.done
                ? safeLabel(labels, "complete", "Complete")
                : safeLabel(labels, "missing", "Missing")}
            </AppBadge>
          </div>
        ))}
      </div>
    </AppCard>
  );
}

export function AdminSettingsPage({
  title,
  description,
  labels,
  activeTab = "identity",
}: AdminSettingsPageProps) {
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";
  const queryClient = useQueryClient();

  const [values, setValues] = useState<Record<TextFieldKey, string>>({
    site_name_ar: "",
    site_name_en: "",
    company_legal_name_ar: "",
    company_legal_name_en: "",
    company_description_ar: "",
    company_description_en: "",
    email: "",
    phone: "",
    whatsapp: "",
    logo_url: "",
    favicon_url: "",
    active_theme: "blue-tech",
    default_language: "ar",
    address_ar: "",
    address_en: "",
    map_url: "",
    working_hours_ar: "",
    working_hours_en: "",
    support_email: "",
    support_phone: "",
    footer_text_ar: "",
    footer_text_en: "",
    seo_title_ar: "",
    seo_title_en: "",
    seo_description_ar: "",
    seo_description_en: "",
    maintenance_message_ar: "",
    maintenance_message_en: "",
  });
  const [isEnglishEnabled, setIsEnglishEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [visibleSections, setVisibleSections] = useState<
    Record<SectionKey, boolean>
  >(defaultVisibleSections);
  const [socialLinks, setSocialLinks] = useState<Record<SocialKey, string>>(
    Object.fromEntries(socialKeys.map((key) => [key, ""])) as Record<
      SocialKey,
      string
    >,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(
    null,
  );
  const query = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => getAdminSettings(token),
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }

    const data = query.data;
    const nextValues = Object.fromEntries(
      textFields.map((key) => [
        key,
        readString(
          data,
          key,
          key === "active_theme"
            ? "blue-tech"
            : key === "default_language"
              ? "ar"
              : "",
        ),
      ]),
    ) as Record<TextFieldKey, string>;
    const nextVisibleSections = readRecord(data, "visible_sections");
    const nextSocialLinks = readRecord(data, "social_links");
    const nextIsEnglishEnabled =
      data.is_english_enabled === undefined
        ? true
        : Boolean(data.is_english_enabled);
    const nextMaintenanceMode = Boolean(data.maintenance_mode);
    const normalizedVisibleSections = Object.fromEntries(
      sectionKeys.map((key) => [
        key,
        nextVisibleSections[key] === undefined
          ? defaultVisibleSections[key]
          : Boolean(nextVisibleSections[key]),
      ]),
    ) as Record<SectionKey, boolean>;
    const normalizedSocialLinks = Object.fromEntries(
      socialKeys.map((key) => [
        key,
        typeof nextSocialLinks[key] === "string"
          ? String(nextSocialLinks[key])
          : "",
      ]),
    ) as Record<SocialKey, string>;

    setValues(nextValues);
    setIsEnglishEnabled(nextIsEnglishEnabled);
    setMaintenanceMode(nextMaintenanceMode);
    setVisibleSections(normalizedVisibleSections);
    setSocialLinks(normalizedSocialLinks);
    setLastSavedSnapshot(
      buildFormSnapshot(
        nextValues,
        normalizedSocialLinks,
        normalizedVisibleSections,
        nextIsEnglishEnabled,
        nextMaintenanceMode,
      ),
    );
  }, [query.data]);

  const nullableFields = useMemo(
    () =>
      new Set<TextFieldKey>([
        "email",
        "phone",
        "whatsapp",
        "logo_url",
        "favicon_url",
        "address_ar",
        "address_en",
        "map_url",
        "working_hours_ar",
        "working_hours_en",
        "support_email",
        "support_phone",
        "footer_text_ar",
        "footer_text_en",
        "seo_title_ar",
        "seo_title_en",
        "seo_description_ar",
        "seo_description_en",
        "maintenance_message_ar",
        "maintenance_message_en",
      ]),
    [],
  );

  const setValue = (key: TextFieldKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setSaveSuccess(null);
  };

  const currentSnapshot = useMemo(
    () =>
      buildFormSnapshot(
        values,
        socialLinks,
        visibleSections,
        isEnglishEnabled,
        maintenanceMode,
      ),
    [isEnglishEnabled, maintenanceMode, socialLinks, values, visibleSections],
  );
  const hasUnsavedChanges = Boolean(
    lastSavedSnapshot && currentSnapshot !== lastSavedSnapshot,
  );
  const enabledSectionsCount = sectionKeys.filter(
    (key) => visibleSections[key],
  ).length;

  const completionItems = useMemo<CompletionItem[]>(
    () => [
      {
        key: "names",
        label: safeLabel(labels, "checkNames", "Arabic and English names"),
        done: hasText(values.site_name_ar) && hasText(values.site_name_en),
      },
      {
        key: "logo",
        label: safeLabel(labels, "checkLogo", "Logo and favicon"),
        done: hasText(values.logo_url) && hasText(values.favicon_url),
      },
      {
        key: "description",
        label: safeLabel(labels, "checkDescription", "Company description"),
        done:
          hasText(values.company_description_ar) ||
          hasText(values.company_description_en),
      },
      {
        key: "contact",
        label: safeLabel(labels, "checkContact", "Main contact channels"),
        done:
          hasText(values.email) ||
          hasText(values.phone) ||
          hasText(values.whatsapp),
      },
      {
        key: "support",
        label: safeLabel(labels, "checkSupport", "Support contact"),
        done: hasText(values.support_email) || hasText(values.support_phone),
      },
      {
        key: "seo",
        label: safeLabel(labels, "checkSeo", "SEO title and description"),
        done:
          (hasText(values.seo_title_ar) || hasText(values.seo_title_en)) &&
          (hasText(values.seo_description_ar) ||
            hasText(values.seo_description_en)),
      },
      {
        key: "footer",
        label: safeLabel(labels, "checkFooter", "Footer text"),
        done: hasText(values.footer_text_ar) || hasText(values.footer_text_en),
      },
      {
        key: "sections",
        label: safeLabel(labels, "checkSections", "Visible public sections"),
        done: enabledSectionsCount > 0,
      },
    ],
    [enabledSectionsCount, labels, values],
  );
  const completionScore = Math.round(
    (completionItems.filter((item) => item.done).length /
      completionItems.length) *
      100,
  );

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const textPayload = Object.fromEntries(
      Object.entries(values).map(([key, value]) => {
        const typedKey = key as TextFieldKey;
        return [
          typedKey,
          nullableFields.has(typedKey) && value.trim() === "" ? null : value,
        ];
      }),
    );
    const normalizedSocialLinks = Object.fromEntries(
      Object.entries(socialLinks)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value !== ""),
    );

    try {
      const updated = await updateAdminSettings(token, {
        ...textPayload,
        is_english_enabled: isEnglishEnabled,
        maintenance_mode: maintenanceMode,
        visible_sections: visibleSections,
        social_links: normalizedSocialLinks,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setLastSavedSnapshot(currentSnapshot);
      setSaveSuccess(
        safeLabel(labels, "saveSuccess", "Settings saved successfully."),
      );
      if (updated) {
        await query.refetch();
      }
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : safeLabel(labels, "saveError", "Failed to save settings."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow={safeLabel(labels, "pageEyebrow", "Company Identity")}
        title={title}
        description={description}
        actions={
          <>
            <AppButton
              type="button"
              variant="secondary"
              icon={<RefreshCw className="size-4" />}
              onClick={() => query.refetch()}
              disabled={query.isFetching || isSaving}
            >
              {safeLabel(labels, "refresh", "Refresh")}
            </AppButton>
            <AppButton
              type="button"
              icon={<Save className="size-4" />}
              onClick={handleSave}
              disabled={
                isSaving ||
                query.isLoading ||
                query.isError ||
                !hasUnsavedChanges
              }
            >
              {isSaving
                ? safeLabel(labels, "saving", "Saving...")
                : safeLabel(labels, "save", "Save")}
            </AppButton>
          </>
        }
      />

      {query.isLoading ? (
        <AppLoadingState text={safeLabel(labels, "loading", "Loading...")} />
      ) : null}
      {query.isError ? (
        <AppErrorState
          title={safeLabel(labels, "error", "Failed to load settings.")}
          description={String(query.error)}
        />
      ) : null}

      {!query.isLoading && !query.isError ? (
        <>
          {activeTab === "identity" ? (
            <>
              <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
                <BrandPreview
                  labels={labels}
                  values={values}
                  isEnglishEnabled={isEnglishEnabled}
                  maintenanceMode={maintenanceMode}
                />
                <CompletionPanel
                  labels={labels}
                  items={completionItems}
                  score={completionScore}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <StatTile
                  label={safeLabel(labels, "enabledSections", "Enabled sections")}
                  value={`${enabledSectionsCount}/${sectionKeys.length}`}
                  icon={<Globe2 className="size-4" />}
                />
                <StatTile
                  label={safeLabel(labels, "socialChannels", "Social channels")}
                  value={String(
                    Object.values(socialLinks).filter(
                      (value) => value.trim() !== "",
                    ).length,
                  )}
                  icon={<Info className="size-4" />}
                />
                <StatTile
                  label={safeLabel(labels, "unsavedStatus", "Unsaved changes")}
                  value={
                    hasUnsavedChanges
                      ? safeLabel(labels, "yes", "Yes")
                      : safeLabel(labels, "no", "No")
                  }
                  icon={<Save className="size-4" />}
                />
              </div>
            </>
          ) : null}

          {hasUnsavedChanges ? (
            <div className="rounded-appLg border border-app-warning/30 bg-app-warning/10 px-4 py-3 text-sm font-semibold text-app-warning">
              {safeLabel(
                labels,
                "unsavedNotice",
                "You have unsaved changes. Save the page before leaving.",
              )}
            </div>
          ) : null}
          {saveSuccess ? (
            <div className="rounded-appLg border border-app-success/30 bg-app-success/10 px-4 py-3 text-sm font-semibold text-app-success">
              {saveSuccess}
            </div>
          ) : null}

          {activeTab === "identity" ? (
            <SettingsCard>
              <FieldsetTitle
                title={safeLabel(labels, "identitySection", "Identity")}
                description={safeLabel(
                  labels,
                  "identityDescription",
                  "Main company identity shown on the public website and admin login.",
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <AppInput
                  label={labels.siteNameAr}
                  value={values.site_name_ar}
                  onChange={(event) =>
                    setValue("site_name_ar", event.target.value)
                  }
                />
                <AppInput
                  label={labels.siteNameEn}
                  value={values.site_name_en}
                  onChange={(event) =>
                    setValue("site_name_en", event.target.value)
                  }
                />
                <AppInput
                  label={safeLabel(
                    labels,
                    "companyLegalNameAr",
                    "Legal name AR",
                  )}
                  value={values.company_legal_name_ar}
                  onChange={(event) =>
                    setValue("company_legal_name_ar", event.target.value)
                  }
                />
                <AppInput
                  label={safeLabel(
                    labels,
                    "companyLegalNameEn",
                    "Legal name EN",
                  )}
                  value={values.company_legal_name_en}
                  onChange={(event) =>
                    setValue("company_legal_name_en", event.target.value)
                  }
                />
                <AppTextarea
                  label={safeLabel(
                    labels,
                    "companyDescriptionAr",
                    "Company description AR",
                  )}
                  value={values.company_description_ar}
                  onChange={(event) =>
                    setValue("company_description_ar", event.target.value)
                  }
                />
                <AppTextarea
                  label={safeLabel(
                    labels,
                    "companyDescriptionEn",
                    "Company description EN",
                  )}
                  value={values.company_description_en}
                  onChange={(event) =>
                    setValue("company_description_en", event.target.value)
                  }
                />
                <MediaUrlInput
                  label={labels.logoUrl}
                  value={values.logo_url}
                  token={token}
                  labels={labels}
                  onChange={(value) => setValue("logo_url", value)}
                />
                <MediaUrlInput
                  label={labels.faviconUrl}
                  value={values.favicon_url}
                  token={token}
                  labels={labels}
                  onChange={(value) => setValue("favicon_url", value)}
                />
              </div>
            </SettingsCard>
          ) : null}

          {activeTab === "contact" ? (
            <SettingsCard>
              <FieldsetTitle
                title={safeLabel(
                  labels,
                  "contactSection",
                  "Contact information",
                )}
                description={safeLabel(
                  labels,
                  "contactDescription",
                  "Public and support contact details shown across the website.",
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <AppInput
                  label={labels.email}
                  type="email"
                  value={values.email}
                  onChange={(event) => setValue("email", event.target.value)}
                />
                <AppInput
                  label={labels.phone}
                  value={values.phone}
                  onChange={(event) => setValue("phone", event.target.value)}
                />
                <AppInput
                  label={labels.whatsapp}
                  value={values.whatsapp}
                  onChange={(event) => setValue("whatsapp", event.target.value)}
                />
                <AppInput
                  label={safeLabel(labels, "supportEmail", "Support email")}
                  type="email"
                  value={values.support_email}
                  onChange={(event) =>
                    setValue("support_email", event.target.value)
                  }
                />
                <AppInput
                  label={safeLabel(labels, "supportPhone", "Support phone")}
                  value={values.support_phone}
                  onChange={(event) =>
                    setValue("support_phone", event.target.value)
                  }
                />
                <AppInput
                  label={safeLabel(labels, "mapUrl", "Map URL")}
                  value={values.map_url}
                  onChange={(event) => setValue("map_url", event.target.value)}
                />
                <AppTextarea
                  label={safeLabel(labels, "addressAr", "Arabic address")}
                  value={values.address_ar}
                  onChange={(event) =>
                    setValue("address_ar", event.target.value)
                  }
                />
                <AppTextarea
                  label={safeLabel(labels, "addressEn", "English address")}
                  value={values.address_en}
                  onChange={(event) =>
                    setValue("address_en", event.target.value)
                  }
                />
                <AppInput
                  label={safeLabel(
                    labels,
                    "workingHoursAr",
                    "Working hours AR",
                  )}
                  value={values.working_hours_ar}
                  onChange={(event) =>
                    setValue("working_hours_ar", event.target.value)
                  }
                />
                <AppInput
                  label={safeLabel(
                    labels,
                    "workingHoursEn",
                    "Working hours EN",
                  )}
                  value={values.working_hours_en}
                  onChange={(event) =>
                    setValue("working_hours_en", event.target.value)
                  }
                />
              </div>
            </SettingsCard>
          ) : null}

          {activeTab === "social" ? (
            <SettingsCard>
              <FieldsetTitle
                title={safeLabel(labels, "socialSection", "Social links")}
                description={safeLabel(
                  labels,
                  "socialDescription",
                  "Add only the channels you want to show publicly.",
                )}
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {socialKeys.map((key) => (
                  <AppInput
                    key={key}
                    label={safeLabel(labels, `social_${key}`, key)}
                    value={socialLinks[key]}
                    onChange={(event) => {
                      setSocialLinks((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }));
                      setSaveSuccess(null);
                    }}
                  />
                ))}
              </div>
            </SettingsCard>
          ) : null}

          {activeTab === "seo" ? (
            <SettingsCard>
              <FieldsetTitle
                title={safeLabel(labels, "seoSection", "SEO and footer")}
                description={safeLabel(
                  labels,
                  "seoDescription",
                  "Control browser titles, search snippets, and footer text.",
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <AppInput
                  label={labels.seoTitleAr}
                  value={values.seo_title_ar}
                  onChange={(event) =>
                    setValue("seo_title_ar", event.target.value)
                  }
                />
                <AppInput
                  label={labels.seoTitleEn}
                  value={values.seo_title_en}
                  onChange={(event) =>
                    setValue("seo_title_en", event.target.value)
                  }
                />
                <AppTextarea
                  label={labels.seoDescriptionAr}
                  value={values.seo_description_ar}
                  onChange={(event) =>
                    setValue("seo_description_ar", event.target.value)
                  }
                />
                <AppTextarea
                  label={labels.seoDescriptionEn}
                  value={values.seo_description_en}
                  onChange={(event) =>
                    setValue("seo_description_en", event.target.value)
                  }
                />
                <AppTextarea
                  label={safeLabel(
                    labels,
                    "footerTextAr",
                    "Arabic footer text",
                  )}
                  value={values.footer_text_ar}
                  onChange={(event) =>
                    setValue("footer_text_ar", event.target.value)
                  }
                />
                <AppTextarea
                  label={safeLabel(
                    labels,
                    "footerTextEn",
                    "English footer text",
                  )}
                  value={values.footer_text_en}
                  onChange={(event) =>
                    setValue("footer_text_en", event.target.value)
                  }
                />
              </div>
            </SettingsCard>
          ) : null}

          {activeTab === "appearance" ? (
            <SettingsCard>
              <FieldsetTitle
                title={safeLabel(
                  labels,
                  "appearanceSection",
                  "Appearance and public sections",
                )}
                description={safeLabel(
                  labels,
                  "appearanceDescription",
                  "Control theme, language, and which homepage sections are visible.",
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <AppSelect
                  label={labels.theme}
                  value={values.active_theme}
                  onChange={(event) =>
                    setValue("active_theme", event.target.value)
                  }
                >
                  <option value="blue-tech">
                    {safeLabel(labels, "themeBlue", "Blue Tech")}
                  </option>
                  <option value="emerald-luxury">
                    {safeLabel(labels, "themeEmerald", "Emerald Luxury")}
                  </option>
                </AppSelect>
                <AppSelect
                  label={labels.language}
                  value={values.default_language}
                  onChange={(event) =>
                    setValue("default_language", event.target.value)
                  }
                >
                  <option value="ar">
                    {safeLabel(labels, "langArabic", "Arabic")}
                  </option>
                  <option value="en">
                    {safeLabel(labels, "langEnglish", "English")}
                  </option>
                </AppSelect>
                <AppCheckbox
                  label={safeLabel(
                    labels,
                    "englishEnabled",
                    "Enable English version",
                  )}
                  checked={isEnglishEnabled}
                  onChange={(checked) => {
                    setIsEnglishEnabled(checked);
                    setSaveSuccess(null);
                  }}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {sectionKeys.map((key) => (
                  <AppCheckbox
                    key={key}
                    label={safeLabel(labels, `section_${key}`, key)}
                    checked={visibleSections[key]}
                    onChange={(checked) => {
                      setVisibleSections((current) => ({
                        ...current,
                        [key]: checked,
                      }));
                      setSaveSuccess(null);
                    }}
                  />
                ))}
              </div>
            </SettingsCard>
          ) : null}

          {activeTab === "maintenance" ? (
            <SettingsCard>
              <FieldsetTitle
                title={safeLabel(
                  labels,
                  "maintenanceSection",
                  "Maintenance mode",
                )}
                description={safeLabel(
                  labels,
                  "maintenanceDescription",
                  "Temporarily hide the public website from visitors while keeping the admin panel available.",
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <AppCheckbox
                  label={safeLabel(
                    labels,
                    "maintenanceMode",
                    "Enable maintenance mode",
                  )}
                  checked={maintenanceMode}
                  onChange={(checked) => {
                    setMaintenanceMode(checked);
                    setSaveSuccess(null);
                  }}
                />
                <div className="flex items-center gap-3 rounded-appLg border border-app-border bg-app-surface px-4 py-3 text-sm text-app-muted">
                  <ShieldAlert className="size-5 shrink-0 text-app-warning" />
                  <span>
                    {maintenanceMode
                      ? safeLabel(
                          labels,
                          "maintenanceWarningOn",
                          "Visitors will see the maintenance message.",
                        )
                      : safeLabel(
                          labels,
                          "maintenanceWarningOff",
                          "The public website is available to visitors.",
                        )}
                  </span>
                </div>
                <AppTextarea
                  label={safeLabel(
                    labels,
                    "maintenanceMessageAr",
                    "Arabic maintenance message",
                  )}
                  value={values.maintenance_message_ar}
                  onChange={(event) =>
                    setValue("maintenance_message_ar", event.target.value)
                  }
                />
                <AppTextarea
                  label={safeLabel(
                    labels,
                    "maintenanceMessageEn",
                    "English maintenance message",
                  )}
                  value={values.maintenance_message_en}
                  onChange={(event) =>
                    setValue("maintenance_message_en", event.target.value)
                  }
                />
              </div>
            </SettingsCard>
          ) : null}

          {saveError ? (
            <AppErrorState
              title={safeLabel(labels, "saveError", "Save failed")}
              description={saveError}
            />
          ) : null}

          <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-appXl border border-app-border bg-app-surface/95 p-4 shadow-appCard backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-sm font-semibold text-app-muted">
              <Info className="size-4 text-app-primary" />
              <span>
                {hasUnsavedChanges
                  ? safeLabel(
                      labels,
                      "bottomUnsaved",
                      "There are changes waiting to be saved.",
                    )
                  : safeLabel(labels, "bottomSaved", "All changes are saved.")}
              </span>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <AppButton
                type="button"
                variant="secondary"
                icon={<RefreshCw className="size-4" />}
                onClick={() => query.refetch()}
                disabled={query.isFetching || isSaving}
              >
                {safeLabel(labels, "refresh", "Refresh")}
              </AppButton>
              <AppButton
                type="button"
                icon={<Save className="size-4" />}
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving
                  ? safeLabel(labels, "saving", "Saving...")
                  : safeLabel(labels, "save", "Save")}
              </AppButton>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

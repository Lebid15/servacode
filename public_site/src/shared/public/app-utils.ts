import type { PublicApp } from "@/shared/api/public-client";
import type { Locale } from "@/shared/design-system/utils/direction";

export type AppDownloadItem = {
  platform: string;
  label: string;
  url: string;
  version?: string;
  fileSize?: string;
  releaseDate?: string;
};

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getLocalizedAppField(
  item: Record<string, unknown>,
  locale: Locale,
  baseKey: string,
  fallback = "",
) {
  const localized = readString(item[`${baseKey}_${locale}`]);
  if (localized) {
    return localized;
  }

  return (
    readString(item[`${baseKey}_${locale === "ar" ? "en" : "ar"}`]) || fallback
  );
}

export function getAppDownloads(
  app: PublicApp,
  locale: Locale,
): AppDownloadItem[] {
  const items = Array.isArray(app.download_files) ? app.download_files : [];
  const normalized = items
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    )
    .map((item) => {
      const url = readString(item.url) || readString(item.download_url);
      return {
        platform: readString(item.platform) || app.platform,
        label: getLocalizedAppField(
          item,
          locale,
          "label",
          app.name_ar || app.name_en,
        ),
        url,
        version: readString(item.version) || app.version || undefined,
        fileSize: readString(item.file_size) || undefined,
        releaseDate: readString(item.release_date) || undefined,
      };
    })
    .filter((item) => Boolean(item.url));

  if (normalized.length > 0) {
    return normalized;
  }

  return app.download_url
    ? [
        {
          platform: app.platform,
          label: locale === "ar" ? app.name_ar : app.name_en,
          url: app.download_url,
          version: app.version || undefined,
        },
      ]
    : [];
}

export function groupDownloadsByPlatform(downloads: AppDownloadItem[]) {
  return downloads.reduce<Record<string, AppDownloadItem[]>>((groups, item) => {
    const key = item.platform || "other";
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});
}

export function normalizeAppFeature(
  feature: unknown,
  locale: Locale,
  fallbackTitle: string,
) {
  if (!feature || typeof feature !== "object" || Array.isArray(feature)) {
    return { title: String(feature || fallbackTitle), description: "" };
  }

  const item = feature as Record<string, unknown>;
  return {
    title: getLocalizedAppField(item, locale, "title", fallbackTitle),
    description: getLocalizedAppField(item, locale, "description", ""),
  };
}

export function normalizeAppScreenshot(screenshot: unknown, locale: Locale) {
  if (
    !screenshot ||
    typeof screenshot !== "object" ||
    Array.isArray(screenshot)
  ) {
    return null;
  }

  const item = screenshot as Record<string, unknown>;
  const imageUrl = readString(item.image_url) || readString(item.url);
  if (!imageUrl) {
    return null;
  }

  return {
    imageUrl,
    alt:
      getLocalizedAppField(item, locale, "alt", "") ||
      getLocalizedAppField(item, locale, "title", ""),
  };
}

export function normalizeAppChangelog(
  entry: unknown,
  locale: Locale,
  index: number,
) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return {
      title: String(entry || `#${index + 1}`),
      description: "",
      version: "",
      releaseDate: "",
    };
  }

  const item = entry as Record<string, unknown>;
  return {
    title: getLocalizedAppField(
      item,
      locale,
      "title",
      readString(item.version) || `#${index + 1}`,
    ),
    description: getLocalizedAppField(item, locale, "description", ""),
    version: readString(item.version),
    releaseDate: readString(item.release_date) || readString(item.date),
  };
}

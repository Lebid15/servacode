"use client";

/**
 * =====================================================
 * AdminMediaLibraryPage
 * مكتبة وسائط مبسطة واحترافية: رفع، بحث، فلترة، معاينة، نسخ رابط، تعديل النص البديل، وحذف آمن.
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useMemo, useState } from "react";

import { buildBackendAssetUrl } from "@/shared/api/api-client";
import { deleteAdminItem, listAdminItems, updateAdminItem, uploadAdminMedia } from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppConfirmDialog } from "@/shared/design-system/components/AppConfirmDialog";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppModal } from "@/shared/design-system/components/AppModal";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { cn } from "@/shared/design-system/utils/cn";

type MediaTypeFilter = "all" | "image" | "document" | "download" | "other";

type MediaRow = {
  id: string;
  original_name: string;
  file_name: string;
  mime_type: string;
  media_type: string;
  file_size: number;
  url: string;
  alt_text_ar?: string | null;
  alt_text_en?: string | null;
  usage_count?: number | null;
  is_used?: boolean | null;
  created_at?: string | null;
};

type AdminMediaLibraryLabels = {
  title: string;
  description: string;
  uploadTitle: string;
  uploadDescription: string;
  chooseFile: string;
  upload: string;
  refresh: string;
  search: string;
  searchPlaceholder: string;
  copied: string;
  copyUrl: string;
  open: string;
  saveAlt: string;
  delete: string;
  confirmDelete: string;
  yesDelete: string;
  cancel: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  error: string;
  file: string;
  type: string;
  size: string;
  url: string;
  altAr: string;
  altEn: string;
  actions: string;
  uploadHint: string;
  all: string;
  images: string;
  documents: string;
  downloads: string;
  other: string;
  filterByType: string;
  totalFiles: string;
  totalImages: string;
  totalDocuments: string;
  totalSize: string;
  selectedFile: string;
  noFileSelected: string;
  used: string;
  unused: string;
  createdAt: string;
  libraryTitle: string;
  libraryDescription: string;
  preview: string;
  details: string;
  clearFilters: string;
  downloadsCount: string;
  fileDetails: string;
};

type AdminMediaLibraryPageProps = {
  labels: AdminMediaLibraryLabels;
};

const DOWNLOAD_EXTENSIONS = [".exe", ".msi", ".dmg", ".apk", ".zip", ".rar", ".7z"];

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getFileExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index).toLowerCase() : "";
}

function isDownloadFile(media: MediaRow) {
  return DOWNLOAD_EXTENSIONS.includes(getFileExtension(media.original_name || media.file_name));
}

function isImage(media: MediaRow) {
  return media.media_type === "image" || media.mime_type.startsWith("image/");
}

function normalizedType(media: MediaRow): MediaTypeFilter {
  if (isImage(media)) {
    return "image";
  }
  if (media.media_type === "document") {
    return isDownloadFile(media) ? "download" : "document";
  }
  if (isDownloadFile(media)) {
    return "download";
  }
  return "other";
}

function mediaTone(media: MediaRow) {
  const type = normalizedType(media);
  if (type === "image") {
    return "success" as const;
  }
  if (type === "document") {
    return "primary" as const;
  }
  if (type === "download") {
    return "warning" as const;
  }
  return "neutral" as const;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString();
}

function statusTone(media: MediaRow) {
  return media.is_used || Number(media.usage_count) > 0 ? "success" : "neutral";
}

export function AdminMediaLibraryPage({ labels }: AdminMediaLibraryPageProps) {
  const queryClient = useQueryClient();
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>("all");
  const [file, setFile] = useState<File | null>(null);
  const [altTextAr, setAltTextAr] = useState("");
  const [altTextEn, setAltTextEn] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteRow, setDeleteRow] = useState<MediaRow | null>(null);
  const [previewRow, setPreviewRow] = useState<MediaRow | null>(null);
  const [altDrafts, setAltDrafts] = useState<Record<string, { ar: string; en: string }>>({});

  const queryKey = useMemo(() => ["admin-media", search], [search]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      listAdminItems("/admin/media", {
        token,
        search,
        skip: 0,
        limit: 100
      }) as Promise<MediaRow[]>,
    enabled: Boolean(token)
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);
  const filteredRows = useMemo(() => {
    if (typeFilter === "all") {
      return rows;
    }
    return rows.filter((row) => normalizedType(row) === typeFilter);
  }, [rows, typeFilter]);

  const stats = useMemo(() => {
    const images = rows.filter((row) => normalizedType(row) === "image").length;
    const documents = rows.filter((row) => normalizedType(row) === "document").length;
    const downloads = rows.filter((row) => normalizedType(row) === "download").length;
    const totalSize = rows.reduce((sum, row) => sum + (Number(row.file_size) || 0), 0);

    return {
      total: rows.length,
      images,
      documents,
      downloads,
      totalSize
    };
  }, [rows]);

  const typeOptions: Array<{ value: MediaTypeFilter; label: string }> = [
    { value: "all", label: labels.all },
    { value: "image", label: labels.images },
    { value: "document", label: labels.documents },
    { value: "download", label: labels.downloads },
    { value: "other", label: labels.other }
  ];

  const typeLabel = (media: MediaRow) => {
    const type = normalizedType(media);
    return typeOptions.find((option) => option.value === type)?.label ?? media.media_type;
  };

  const readDraft = (row: MediaRow) =>
    altDrafts[row.id] ?? {
      ar: row.alt_text_ar ?? "",
      en: row.alt_text_en ?? ""
    };

  const setDraft = (row: MediaRow, key: "ar" | "en", value: string) => {
    const draft = readDraft(row);
    setAltDrafts((current) => ({
      ...current,
      [row.id]: {
        ...draft,
        [key]: value
      }
    }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setUploadError(null);
  };

  const resetSelectedFile = () => {
    setFile(null);
    const input = document.getElementById("media-file-input") as HTMLInputElement | null;
    if (input) {
      input.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (altTextAr.trim()) {
      formData.append("alt_text_ar", altTextAr.trim());
    }
    if (altTextEn.trim()) {
      formData.append("alt_text_en", altTextEn.trim());
    }

    try {
      await uploadAdminMedia(token, formData);
      resetSelectedFile();
      setAltTextAr("");
      setAltTextEn("");
      await queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : labels.error);
    } finally {
      setIsUploading(false);
    }
  };

  const copyUrl = async (row: MediaRow) => {
    const value = buildBackendAssetUrl(row.url);
    await navigator.clipboard.writeText(value);
    setCopiedId(row.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const saveAlt = async (row: MediaRow) => {
    const draft = readDraft(row);
    await updateAdminItem(`/admin/media/${row.id}`, token, {
      alt_text_ar: draft.ar.trim() || null,
      alt_text_en: draft.en.trim() || null
    });
    await queryClient.invalidateQueries({ queryKey: ["admin-media"] });
  };

  const confirmDelete = async () => {
    if (!deleteRow) {
      return;
    }
    await deleteAdminItem(`/admin/media/${deleteRow.id}`, token);
    if (previewRow?.id === deleteRow.id) {
      setPreviewRow(null);
    }
    setDeleteRow(null);
    await queryClient.invalidateQueries({ queryKey: ["admin-media"] });
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
  };

  const quickStats = [
    { label: labels.totalFiles, value: stats.total, icon: "media" as const },
    { label: labels.totalImages, value: stats.images, icon: "media" as const },
    { label: labels.downloadsCount, value: stats.downloads, icon: "archive" as const },
    { label: labels.totalSize, value: formatFileSize(stats.totalSize), icon: "file" as const }
  ];

  return (
    <div className="grid gap-6">
      <AppPageHeader
        title={labels.title}
        description={labels.description}
        actions={
          <AppButton variant="secondary" onClick={() => query.refetch()} icon={<AppIcon name="refresh" size={17} />}>
            {labels.refresh}
          </AppButton>
        }
      />

      <AppCard className="overflow-hidden">
        <div className="grid gap-5 p-5 lg:grid-cols-[1.05fr_1.45fr] lg:items-stretch">
          <div className="grid content-between gap-4 rounded-appXl border border-app-border bg-app-surfaceElevated/65 p-5">
            <div className="grid gap-2">
              <div className="grid size-12 place-items-center rounded-appLg border border-app-primary/25 bg-app-primary/10 text-app-primary">
                <AppIcon name="upload" size={23} />
              </div>
              <h2 className="text-lg font-black text-app-foreground">{labels.uploadTitle}</h2>
              <p className="text-sm leading-6 text-app-muted">{labels.uploadDescription}</p>
            </div>

            <div className="grid gap-2 rounded-appLg border border-app-border bg-app-surface px-4 py-3 text-sm">
              <span className="text-app-muted">{labels.selectedFile}</span>
              <strong className="truncate text-app-foreground">
                {file ? `${file.name} — ${formatFileSize(file.size)}` : labels.noFileSelected}
              </strong>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AppInput id="media-file-input" label={labels.chooseFile} type="file" onChange={handleFileChange} />
              <AppInput label={labels.altAr} value={altTextAr} onChange={(event) => setAltTextAr(event.target.value)} />
              <AppInput label={labels.altEn} value={altTextEn} onChange={(event) => setAltTextEn(event.target.value)} />
              <div className="flex items-end gap-2">
                <AppButton className="flex-1" disabled={!file || isUploading} onClick={handleUpload} icon={<AppIcon name={isUploading ? "loader" : "upload"} size={17} />}>
                  {labels.upload}
                </AppButton>
                <AppButton variant="secondary" disabled={!file || isUploading} onClick={resetSelectedFile} className="px-4" icon={<AppIcon name="close" size={17} />}>
                  <span className="sr-only">{labels.cancel}</span>
                </AppButton>
              </div>
            </div>

            <p className="rounded-appLg border border-app-border bg-app-surfaceElevated/70 px-4 py-3 text-sm leading-6 text-app-muted">
              {labels.uploadHint}
            </p>

            {uploadError ? <AppErrorState title={labels.error} description={uploadError} /> : null}
          </div>
        </div>
      </AppCard>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <AppCard key={stat.label} className="flex items-center justify-between gap-3 p-4">
            <div className="grid gap-1">
              <span className="text-xs font-semibold text-app-muted">{stat.label}</span>
              <strong className="text-xl font-black text-app-foreground">{stat.value}</strong>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-appLg border border-app-border bg-app-surfaceElevated text-app-primary">
              <AppIcon name={stat.icon} size={18} />
            </span>
          </AppCard>
        ))}
      </div>

      <AppCard className="grid gap-4 p-4 md:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <AppInput
            label={labels.search}
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            startIcon={<AppIcon name="search" size={16} />}
          />

          <div className="flex flex-wrap gap-2">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTypeFilter(option.value)}
                className={cn(
                  "min-h-11 rounded-appMd border px-4 text-sm font-semibold transition",
                  typeFilter === option.value
                    ? "border-app-primary bg-app-primary text-app-primaryForeground shadow-appGlow"
                    : "border-app-border bg-app-surfaceElevated text-app-foreground hover:bg-app-surface"
                )}
              >
                {option.label}
              </button>
            ))}
            {(search || typeFilter !== "all") ? (
              <AppButton variant="ghost" onClick={clearFilters} className="px-4" icon={<AppIcon name="close" size={16} />}>
                {labels.clearFilters}
              </AppButton>
            ) : null}
          </div>
        </div>
      </AppCard>

      <AppCard className="grid gap-5 p-4 md:p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-1">
            <h2 className="text-lg font-black text-app-foreground">{labels.libraryTitle}</h2>
            <p className="text-sm leading-6 text-app-muted">{labels.libraryDescription}</p>
          </div>
          <AppBadge tone="primary">{filteredRows.length} / {rows.length}</AppBadge>
        </div>

        {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}
        {query.isError ? <AppErrorState title={labels.error} description={query.error instanceof Error ? query.error.message : String(query.error)} /> : null}
        {!query.isLoading && !query.isError && filteredRows.length === 0 ? (
          <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} />
        ) : null}

        {!query.isLoading && !query.isError && filteredRows.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredRows.map((media) => {
              const previewUrl = buildBackendAssetUrl(media.url);
              return (
                <article key={media.id} className="group grid overflow-hidden rounded-appXl border border-app-border bg-app-surfaceElevated/70 transition hover:-translate-y-0.5 hover:border-app-primary/35 hover:shadow-appCard">
                  <button type="button" onClick={() => setPreviewRow(media)} className="relative block aspect-[16/10] overflow-hidden bg-app-surface text-start">
                    {isImage(media) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt={media.alt_text_en ?? media.original_name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <span className="grid size-16 place-items-center rounded-appXl border border-app-border bg-app-surfaceElevated text-app-primary">
                          <AppIcon name={isDownloadFile(media) ? "archive" : "file"} size={28} />
                        </span>
                      </div>
                    )}
                    <span className="absolute end-3 top-3">
                      <AppBadge tone={mediaTone(media)}>{typeLabel(media)}</AppBadge>
                    </span>
                  </button>

                  <div className="grid gap-3 p-4">
                    <div className="grid gap-1">
                      <strong className="truncate text-sm text-app-foreground" title={media.original_name}>{media.original_name}</strong>
                      <span className="truncate text-xs text-app-muted" title={media.url}>{media.url}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-app-muted">
                      <span>{formatFileSize(media.file_size)}</span>
                      <span>•</span>
                      <span>{formatDate(media.created_at)}</span>
                      <AppBadge tone={statusTone(media)} className="ms-auto">
                        {media.is_used || Number(media.usage_count) > 0 ? labels.used : labels.unused}
                      </AppBadge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <AppButton variant="secondary" className="min-h-10 px-3" onClick={() => setPreviewRow(media)} icon={<AppIcon name="eye" size={16} />}>
                        {labels.preview}
                      </AppButton>
                      <AppButton variant="secondary" className="min-h-10 px-3" onClick={() => copyUrl(media)} icon={<AppIcon name={copiedId === media.id ? "check" : "copy"} size={16} />}>
                        {copiedId === media.id ? labels.copied : labels.copyUrl}
                      </AppButton>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </AppCard>

      <AppModal open={Boolean(previewRow)} title={labels.fileDetails} onClose={() => setPreviewRow(null)} size="lg">
        {previewRow ? (
          <div className="grid gap-5">
            <div className="overflow-hidden rounded-appXl border border-app-border bg-app-surfaceElevated">
              {isImage(previewRow) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={buildBackendAssetUrl(previewRow.url)} alt={previewRow.alt_text_en ?? previewRow.original_name} className="max-h-[420px] w-full object-contain" />
              ) : (
                <div className="grid min-h-52 place-items-center p-8 text-app-primary">
                  <AppIcon name={isDownloadFile(previewRow) ? "archive" : "file"} size={54} />
                </div>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="grid gap-3 rounded-appLg border border-app-border bg-app-surfaceElevated/70 p-4 text-sm">
                <div className="grid gap-1">
                  <span className="text-app-muted">{labels.file}</span>
                  <strong className="break-words text-app-foreground">{previewRow.original_name}</strong>
                </div>
                <div className="grid gap-1">
                  <span className="text-app-muted">{labels.type}</span>
                  <span><AppBadge tone={mediaTone(previewRow)}>{typeLabel(previewRow)}</AppBadge></span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <span className="text-app-muted">{labels.size}</span>
                    <strong className="text-app-foreground">{formatFileSize(previewRow.file_size)}</strong>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-app-muted">{labels.createdAt}</span>
                    <strong className="text-app-foreground">{formatDate(previewRow.created_at)}</strong>
                  </div>
                </div>
                <div className="grid gap-1">
                  <span className="text-app-muted">{labels.url}</span>
                  <span className="break-all text-app-foreground">{previewRow.url}</span>
                </div>
              </div>

              <div className="grid gap-3 rounded-appLg border border-app-border bg-app-surfaceElevated/70 p-4">
                <AppInput label={labels.altAr} value={readDraft(previewRow).ar} onChange={(event) => setDraft(previewRow, "ar", event.target.value)} />
                <AppInput label={labels.altEn} value={readDraft(previewRow).en} onChange={(event) => setDraft(previewRow, "en", event.target.value)} />
                <div className="flex flex-wrap gap-2 pt-2">
                  <AppButton onClick={() => saveAlt(previewRow)} icon={<AppIcon name="save" size={16} />}>
                    {labels.saveAlt}
                  </AppButton>
                  <AppButton variant="secondary" onClick={() => copyUrl(previewRow)} icon={<AppIcon name={copiedId === previewRow.id ? "check" : "copy"} size={16} />}>
                    {copiedId === previewRow.id ? labels.copied : labels.copyUrl}
                  </AppButton>
                  <AppButton variant="secondary" onClick={() => window.open(buildBackendAssetUrl(previewRow.url), "_blank", "noopener,noreferrer")} icon={<AppIcon name="external" size={16} />}>
                    {labels.open}
                  </AppButton>
                  <AppButton variant="danger" onClick={() => setDeleteRow(previewRow)} icon={<AppIcon name="trash" size={16} />}>
                    {labels.delete}
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </AppModal>

      <AppConfirmDialog
        open={Boolean(deleteRow)}
        title={labels.delete}
        description={labels.confirmDelete}
        confirmText={labels.yesDelete}
        cancelText={labels.cancel}
        onCancel={() => setDeleteRow(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

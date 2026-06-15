"use client";

/**
 * =====================================================
 * AdminMediaPicker
 * منتقي وسائط مركزي لاختيار الصور والملفات من المكتبة بدون نسخ ولصق يدوي.
 * يدعم البحث، المعاينة، الرفع السريع، والتحديد المباشر للرابط النسبي.
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useId, useMemo, useState } from "react";

import { buildBackendAssetUrl } from "@/shared/api/api-client";
import { listAdminItems, uploadAdminMedia } from "@/shared/api/admin-client";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppModal } from "@/shared/design-system/components/AppModal";

export type MediaPickerLabels = {
  mediaPickerTitle: string;
  mediaPickerDescription: string;
  mediaPickerSearch: string;
  mediaPickerEmptyTitle: string;
  mediaPickerEmptyDescription: string;
  uploadFromDevice: string;
  chooseFile: string;
  noFileSelected?: string;
  upload: string;
  select: string;
  open: string;
  refresh: string;
  error: string;
  loading: string;
};

type MediaRow = {
  id: string;
  original_name: string;
  mime_type: string;
  media_type: string;
  file_size: number;
  url: string;
  alt_text_ar?: string | null;
  alt_text_en?: string | null;
};

type AdminMediaPickerProps = {
  open: boolean;
  token: string;
  labels: MediaPickerLabels;
  imagesOnly?: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
};

function isImage(media: MediaRow) {
  return media.media_type === "image" || media.mime_type.startsWith("image/");
}

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

export function AdminMediaPicker({
  open,
  token,
  labels,
  imagesOnly = false,
  onClose,
  onSelect,
}: AdminMediaPickerProps) {
  const queryClient = useQueryClient();
  const uploadInputId = useId();
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const queryKey = useMemo(() => ["admin-media-picker", search], [search]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      listAdminItems("/admin/media", {
        token,
        search,
        skip: 0,
        limit: 90,
      }) as Promise<MediaRow[]>,
    enabled: open && Boolean(token),
  });

  const rows = (query.data ?? []).filter((row) =>
    imagesOnly ? isImage(row) : true,
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploaded = (await uploadAdminMedia(
        token,
        formData,
      )) as Partial<MediaRow>;
      await queryClient.invalidateQueries({ queryKey: ["admin-media-picker"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setFile(null);

      if (typeof uploaded.url === "string") {
        onSelect(uploaded.url);
        onClose();
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : labels.error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppModal
      open={open}
      title={labels.mediaPickerTitle}
      onClose={onClose}
      size="2xl"
    >
      <div className="grid gap-5">
        <p className="text-sm leading-6 text-app-muted">
          {labels.mediaPickerDescription}
        </p>

        <AppCard className="grid gap-4 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid gap-2">
              <span className="text-sm font-medium text-app-foreground">
                {labels.chooseFile}
              </span>
              <div className="grid gap-3 rounded-appLg border border-app-border bg-app-surface px-3 py-3 sm:grid-cols-[auto_1fr] sm:items-center">
                <label
                  htmlFor={uploadInputId}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-appMd border border-app-border bg-app-surfaceElevated px-4 text-sm font-black text-app-foreground transition hover:-translate-y-0.5 hover:border-app-primary/50 hover:text-app-primary"
                >
                  <AppIcon name="upload" size={17} />
                  <span>{labels.chooseFile}</span>
                </label>
                <input
                  id={uploadInputId}
                  type="file"
                  accept={imagesOnly ? "image/*" : undefined}
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <span className="min-w-0 truncate text-sm text-app-muted">
                  {file?.name ??
                    labels.noFileSelected ??
                    "لم يتم اختيار أي ملف"}
                </span>
              </div>
            </div>
            <AppButton
              disabled={!file || isUploading}
              onClick={handleUpload}
              icon={<AppIcon name={isUploading ? "loader" : "upload"} size={17} className={isUploading ? "animate-spin" : undefined} />}
            >
              {isUploading ? labels.loading : labels.uploadFromDevice}
            </AppButton>
          </div>
          {uploadError ? (
            <AppErrorState title={labels.error} description={uploadError} />
          ) : null}
        </AppCard>

        <AppCard className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <AppInput
            label={labels.mediaPickerSearch}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <AppButton
            variant="secondary"
            onClick={() => query.refetch()}
            icon={<AppIcon name="refresh" size={17} />}
          >
            {labels.refresh}
          </AppButton>
        </AppCard>

        {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}
        {query.isError ? (
          <AppErrorState title={labels.error} description={String(query.error)} />
        ) : null}

        {!query.isLoading && !query.isError && rows.length === 0 ? (
          <AppEmptyState
            title={labels.mediaPickerEmptyTitle}
            description={labels.mediaPickerEmptyDescription}
          />
        ) : null}

        {!query.isLoading && !query.isError && rows.length > 0 ? (
          <div className="grid max-h-[48vh] gap-3 overflow-auto pe-1 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((media) => {
              const previewUrl = buildBackendAssetUrl(media.url);
              return (
                <div
                  key={media.id}
                  className="grid gap-3 rounded-appLg border border-app-border bg-app-surface p-3 shadow-appSoft"
                >
                  <div className="flex h-36 items-center justify-center overflow-hidden rounded-appMd border border-app-border bg-app-surfaceElevated">
                    {isImage(media) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt={media.alt_text_en ?? media.original_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <AppIcon
                        name="file"
                        size={34}
                        className="text-app-muted"
                      />
                    )}
                  </div>

                  <div className="grid gap-1 text-start">
                    <strong className="truncate text-sm text-app-foreground">
                      {media.original_name}
                    </strong>
                    <span className="truncate text-xs text-app-muted">
                      {media.url}
                    </span>
                    <span className="text-xs text-app-muted">
                      {formatFileSize(media.file_size)}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <AppButton
                      className="min-h-9 px-3"
                      onClick={() => {
                        onSelect(media.url);
                        onClose();
                      }}
                      icon={<AppIcon name="check" size={15} />}
                    >
                      {labels.select}
                    </AppButton>
                    <AppButton
                      variant="secondary"
                      className="min-h-9 px-3"
                      onClick={() =>
                        window.open(previewUrl, "_blank", "noopener,noreferrer")
                      }
                      icon={<AppIcon name="external" size={15} />}
                    >
                      {labels.open}
                    </AppButton>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </AppModal>
  );
}

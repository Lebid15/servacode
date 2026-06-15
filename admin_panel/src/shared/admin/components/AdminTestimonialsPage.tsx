"use client";

/**
 * =====================================================
 * AdminTestimonialsPage
 * صفحة مخصصة لإدارة آراء العملاء وشهاداتهم في الموقع العام
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo, useState } from "react";

import { apiRequest, buildBackendAssetUrl } from "@/shared/api/api-client";
import { createAdminItem, deleteAdminItem, updateAdminItem } from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppConfirmDialog } from "@/shared/design-system/components/AppConfirmDialog";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppIcon, type IconName } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppModal } from "@/shared/design-system/components/AppModal";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { AppTable } from "@/shared/design-system/components/AppTable";
import { AppTextarea } from "@/shared/design-system/components/AppTextarea";
import type { Locale } from "@/shared/design-system/utils/direction";

type StatusFilter = "all" | "active" | "inactive" | "deleted";

type TestimonialRow = {
  id: string;
  client_name: string;
  company_name?: string | null;
  position?: string | null;
  text_ar: string;
  text_en: string;
  rating: number;
  image_url?: string | null;
  sort_order: number;
  is_active: boolean;
  is_deleted?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type TestimonialDraft = {
  client_name: string;
  company_name: string;
  position: string;
  text_ar: string;
  text_en: string;
  rating: number;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

export type AdminTestimonialsLabels = {
  eyebrow: string;
  title: string;
  description: string;
  refresh: string;
  create: string;
  edit: string;
  preview: string;
  search: string;
  searchPlaceholder: string;
  statusFilter: string;
  all: string;
  active: string;
  inactive: string;
  deleted: string;
  loading: string;
  error: string;
  emptyTitle: string;
  emptyDescription: string;
  save: string;
  cancel: string;
  close: string;
  delete: string;
  restore: string;
  activate: string;
  deactivate: string;
  openImage: string;
  confirmDeleteTitle: string;
  confirmDeleteDescription: string;
  confirmDelete: string;
  messages: {
    saved: string;
    deleted: string;
    restored: string;
    failed: string;
  };
  stats: {
    total: string;
    active: string;
    inactive: string;
    deleted: string;
    averageRating: string;
  };
  fields: {
    clientName: string;
    companyName: string;
    position: string;
    textAr: string;
    textEn: string;
    rating: string;
    imageUrl: string;
    sortOrder: string;
    isActive: string;
    createdAt: string;
    actions: string;
  };
  placeholders: {
    clientName: string;
    companyName: string;
    position: string;
    textAr: string;
    textEn: string;
    imageUrl: string;
  };
};

type AdminTestimonialsPageProps = {
  locale: Locale;
  labels: AdminTestimonialsLabels;
};

const endpoint = "/admin/testimonials";

const emptyDraft: TestimonialDraft = {
  client_name: "",
  company_name: "",
  position: "",
  text_ar: "",
  text_en: "",
  rating: 5,
  image_url: "",
  sort_order: 0,
  is_active: true
};

function queryString(params: Record<string, string | number | boolean | undefined | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const value = searchParams.toString();
  return value ? `?${value}` : "";
}

function statusTone(row: TestimonialRow): BadgeTone {
  if (row.is_deleted) {
    return "danger";
  }
  return row.is_active ? "success" : "neutral";
}

function statusLabel(row: TestimonialRow, labels: AdminTestimonialsLabels) {
  if (row.is_deleted) {
    return labels.deleted;
  }
  return row.is_active ? labels.active : labels.inactive;
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function stars(value: number) {
  const rating = Math.min(5, Math.max(1, Number(value) || 1));
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function titleFor(row: TestimonialRow) {
  return [row.client_name, row.company_name, row.position].filter(Boolean).join(" • ");
}

function textFor(row: TestimonialRow, locale: Locale) {
  return locale === "ar" ? row.text_ar || row.text_en : row.text_en || row.text_ar;
}

function toPayload(draft: TestimonialDraft): Record<string, unknown> {
  return {
    client_name: draft.client_name.trim(),
    company_name: draft.company_name.trim() || null,
    position: draft.position.trim() || null,
    text_ar: draft.text_ar.trim(),
    text_en: draft.text_en.trim(),
    rating: Number(draft.rating) || 5,
    image_url: draft.image_url.trim() || null,
    sort_order: Number(draft.sort_order) || 0,
    is_active: draft.is_active
  };
}

function draftFromRow(row: TestimonialRow): TestimonialDraft {
  return {
    client_name: row.client_name ?? "",
    company_name: row.company_name ?? "",
    position: row.position ?? "",
    text_ar: row.text_ar ?? "",
    text_en: row.text_en ?? "",
    rating: Number(row.rating) || 5,
    image_url: row.image_url ?? "",
    sort_order: Number(row.sort_order) || 0,
    is_active: Boolean(row.is_active)
  };
}

function statCard(title: string, value: string | number, icon: IconName) {
  return (
    <AppCard className="grid gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-app-muted">{title}</span>
        <span className="grid size-10 place-items-center rounded-appLg border border-app-border bg-app-surfaceElevated text-app-primary">
          <AppIcon name={icon} size={19} />
        </span>
      </div>
      <strong className="text-2xl font-black text-app-foreground">{value}</strong>
    </AppCard>
  );
}

export function AdminTestimonialsPage({ locale, labels }: AdminTestimonialsPageProps) {
  const queryClient = useQueryClient();
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingRow, setEditingRow] = useState<TestimonialRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<TestimonialRow | null>(null);
  const [draft, setDraft] = useState<TestimonialDraft>(emptyDraft);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryKey = useMemo(() => ["admin-testimonials", search], [search]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      apiRequest<TestimonialRow[]>(
        `${endpoint}${queryString({ search, include_deleted: true, skip: 0, limit: 200 })}`,
        { token }
      ),
    enabled: Boolean(token)
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && row.is_active && !row.is_deleted) ||
        (statusFilter === "inactive" && !row.is_active && !row.is_deleted) ||
        (statusFilter === "deleted" && Boolean(row.is_deleted));

      if (!matchesStatus) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const term = normalizeText(search);
      return [row.client_name, row.company_name, row.position, row.text_ar, row.text_en]
        .map(normalizeText)
        .some((value) => value.includes(term));
    });
  }, [rows, search, statusFilter]);

  const stats = useMemo(() => {
    const activeRows = rows.filter((row) => row.is_active && !row.is_deleted);
    const visibleRows = rows.filter((row) => !row.is_deleted);
    const average = visibleRows.length
      ? visibleRows.reduce((sum, row) => sum + (Number(row.rating) || 0), 0) / visibleRows.length
      : 0;

    return {
      total: visibleRows.length,
      active: activeRows.length,
      inactive: rows.filter((row) => !row.is_active && !row.is_deleted).length,
      deleted: rows.filter((row) => row.is_deleted).length,
      average: average ? average.toFixed(1) : "0"
    };
  }, [rows]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const openCreateModal = () => {
    setEditingRow(null);
    setDraft(emptyDraft);
    setActionMessage(null);
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (row: TestimonialRow) => {
    setEditingRow(row);
    setDraft(draftFromRow(row));
    setActionMessage(null);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!draft.client_name.trim() || !draft.text_ar.trim() || !draft.text_en.trim()) {
      setActionError(labels.messages.failed);
      return;
    }

    setIsSaving(true);
    setActionError(null);
    setActionMessage(null);

    try {
      if (editingRow) {
        await updateAdminItem(`${endpoint}/${editingRow.id}`, token, toPayload(draft));
      } else {
        await createAdminItem(endpoint, token, toPayload(draft));
      }
      setActionMessage(labels.messages.saved);
      setIsModalOpen(false);
      await invalidate();
    } catch {
      setActionError(labels.messages.failed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRow) {
      return;
    }

    try {
      await deleteAdminItem(`${endpoint}/${deleteRow.id}`, token);
      setDeleteRow(null);
      setActionMessage(labels.messages.deleted);
      await invalidate();
    } catch {
      setActionError(labels.messages.failed);
    }
  };

  const handleRestore = async (row: TestimonialRow) => {
    try {
      await apiRequest<Record<string, unknown>>(`${endpoint}/${row.id}/restore`, {
        method: "PATCH",
        token
      });
      setActionMessage(labels.messages.restored);
      await invalidate();
    } catch {
      setActionError(labels.messages.failed);
    }
  };

  const handleToggleActive = async (row: TestimonialRow) => {
    try {
      await updateAdminItem(`${endpoint}/${row.id}`, token, { is_active: !row.is_active });
      await invalidate();
    } catch {
      setActionError(labels.messages.failed);
    }
  };

  const columns = [
    {
      key: "client",
      header: labels.fields.clientName,
      render: (row: TestimonialRow) => {
        const imageUrl = buildBackendAssetUrl(row.image_url);
        return (
          <div className="flex min-w-56 items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-app-border bg-app-surfaceElevated text-app-primary">
              {imageUrl ? (
                <Image src={imageUrl} alt={row.client_name} width={48} height={48} unoptimized className="h-full w-full object-cover" />
              ) : (
                <AppIcon name="user" size={19} />
              )}
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-sm text-app-foreground">{row.client_name}</strong>
              <span className="block truncate text-xs text-app-muted">{[row.company_name, row.position].filter(Boolean).join(" • ") || "—"}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: "rating",
      header: labels.fields.rating,
      render: (row: TestimonialRow) => (
        <div className="grid gap-1">
          <span className="text-sm font-bold text-app-warning">{stars(row.rating)}</span>
          <span className="text-xs text-app-muted">{row.rating}/5</span>
        </div>
      )
    },
    {
      key: "text",
      header: labels.preview,
      render: (row: TestimonialRow) => <p className="line-clamp-2 max-w-md text-sm leading-6 text-app-muted">{textFor(row, locale)}</p>
    },
    {
      key: "sort",
      header: labels.fields.sortOrder,
      render: (row: TestimonialRow) => <AppBadge tone="neutral">{row.sort_order}</AppBadge>
    },
    {
      key: "status",
      header: labels.fields.isActive,
      render: (row: TestimonialRow) => <AppBadge tone={statusTone(row)}>{statusLabel(row, labels)}</AppBadge>
    },
    {
      key: "created_at",
      header: labels.fields.createdAt,
      render: (row: TestimonialRow) => <span className="text-sm text-app-muted">{formatDate(row.created_at, locale)}</span>
    },
    {
      key: "actions",
      header: labels.fields.actions,
      render: (row: TestimonialRow) => (
        <div className="flex flex-wrap items-center gap-2">
          {row.is_deleted ? (
            <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => handleRestore(row)}>
              {labels.restore}
            </AppButton>
          ) : (
            <>
              <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => openEditModal(row)} icon={<AppIcon name="edit" size={15} />}>
                {labels.edit}
              </AppButton>
              <AppButton variant="ghost" className="min-h-9 px-3" onClick={() => handleToggleActive(row)}>
                {row.is_active ? labels.deactivate : labels.activate}
              </AppButton>
              <AppButton variant="danger" className="min-h-9 px-3" onClick={() => setDeleteRow(row)} icon={<AppIcon name="trash" size={15} />}>
                {labels.delete}
              </AppButton>
            </>
          )}
        </div>
      )
    }
  ];

  const previewImage = buildBackendAssetUrl(draft.image_url);

  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow={labels.eyebrow}
        title={labels.title}
        description={labels.description}
        actions={
          <>
            <AppButton variant="secondary" onClick={() => query.refetch()} icon={<AppIcon name="refresh" size={17} />}>
              {labels.refresh}
            </AppButton>
            <AppButton onClick={openCreateModal} icon={<AppIcon name="plus" size={17} />}>
              {labels.create}
            </AppButton>
          </>
        }
      />

      {actionMessage ? (
        <AppCard className="border-app-success/30 bg-app-success/10 p-4 text-sm font-semibold text-app-success">{actionMessage}</AppCard>
      ) : null}
      {actionError ? <AppErrorState title={actionError} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCard(labels.stats.total, stats.total, "testimonials")}
        {statCard(labels.stats.active, stats.active, "check")}
        {statCard(labels.stats.inactive, stats.inactive, "archive")}
        {statCard(labels.stats.deleted, stats.deleted, "trash")}
        {statCard(labels.stats.averageRating, `${stats.average}/5`, "sparkles")}
      </div>

      <AppCard className="grid gap-4 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px] md:items-end">
          <AppInput
            label={labels.search}
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <AppSelect label={labels.statusFilter} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
            <option value="all">{labels.all}</option>
            <option value="active">{labels.active}</option>
            <option value="inactive">{labels.inactive}</option>
            <option value="deleted">{labels.deleted}</option>
          </AppSelect>
        </div>
      </AppCard>

      {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}
      {query.isError ? <AppErrorState title={labels.error} /> : null}

      {!query.isLoading && !query.isError ? (
        filteredRows.length ? (
          <AppTable columns={columns} rows={filteredRows} getRowKey={(row) => row.id} />
        ) : (
          <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} icon="testimonials" />
        )
      ) : null}

      <AppModal open={isModalOpen} title={editingRow ? labels.edit : labels.create} onClose={() => setIsModalOpen(false)} size="xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AppInput
                label={labels.fields.clientName}
                placeholder={labels.placeholders.clientName}
                value={draft.client_name}
                onChange={(event) => setDraft((current) => ({ ...current, client_name: event.target.value }))}
                required
              />
              <AppInput
                label={labels.fields.companyName}
                placeholder={labels.placeholders.companyName}
                value={draft.company_name}
                onChange={(event) => setDraft((current) => ({ ...current, company_name: event.target.value }))}
              />
              <AppInput
                label={labels.fields.position}
                placeholder={labels.placeholders.position}
                value={draft.position}
                onChange={(event) => setDraft((current) => ({ ...current, position: event.target.value }))}
              />
              <AppInput
                label={labels.fields.imageUrl}
                placeholder={labels.placeholders.imageUrl}
                value={draft.image_url}
                onChange={(event) => setDraft((current) => ({ ...current, image_url: event.target.value }))}
              />
              <AppSelect
                label={labels.fields.rating}
                value={String(draft.rating)}
                onChange={(event) => setDraft((current) => ({ ...current, rating: Number(event.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}/5
                  </option>
                ))}
              </AppSelect>
              <AppInput
                type="number"
                label={labels.fields.sortOrder}
                value={draft.sort_order}
                onChange={(event) => setDraft((current) => ({ ...current, sort_order: Number(event.target.value) }))}
              />
            </div>

            <AppTextarea
              label={labels.fields.textAr}
              placeholder={labels.placeholders.textAr}
              value={draft.text_ar}
              onChange={(event) => setDraft((current) => ({ ...current, text_ar: event.target.value }))}
              required
            />
            <AppTextarea
              label={labels.fields.textEn}
              placeholder={labels.placeholders.textEn}
              value={draft.text_en}
              onChange={(event) => setDraft((current) => ({ ...current, text_en: event.target.value }))}
              required
            />

            <AppSelect
              label={labels.fields.isActive}
              value={draft.is_active ? "active" : "inactive"}
              onChange={(event) => setDraft((current) => ({ ...current, is_active: event.target.value === "active" }))}
            >
              <option value="active">{labels.active}</option>
              <option value="inactive">{labels.inactive}</option>
            </AppSelect>
          </div>

          <AppCard className="h-fit p-5">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-app-border bg-app-surfaceElevated text-app-primary">
                  {previewImage ? (
                    <Image src={previewImage} alt="" width={64} height={64} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <AppIcon name="user" size={24} />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-app-foreground">{draft.client_name || labels.fields.clientName}</h3>
                  <p className="truncate text-sm text-app-muted">{[draft.company_name, draft.position].filter(Boolean).join(" • ") || labels.preview}</p>
                </div>
              </div>
              <div className="text-lg font-bold text-app-warning">{stars(draft.rating)}</div>
              <blockquote className="rounded-appLg border border-app-border bg-app-surfaceElevated p-4 text-sm leading-7 text-app-muted">
                {locale === "ar" ? draft.text_ar || labels.placeholders.textAr : draft.text_en || labels.placeholders.textEn}
              </blockquote>
              {previewImage ? (
                <a href={previewImage} target="_blank" rel="noreferrer" className="text-sm font-semibold text-app-primary underline-offset-4 hover:underline">
                  {labels.openImage}
                </a>
              ) : null}
            </div>
          </AppCard>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-app-border pt-5">
          <AppButton variant="secondary" onClick={() => setIsModalOpen(false)}>
            {labels.cancel}
          </AppButton>
          <AppButton onClick={handleSave} disabled={isSaving} icon={<AppIcon name="save" size={17} />}>
            {labels.save}
          </AppButton>
        </div>
      </AppModal>

      <AppConfirmDialog
        open={Boolean(deleteRow)}
        title={labels.confirmDeleteTitle}
        description={deleteRow ? `${labels.confirmDeleteDescription}\n${titleFor(deleteRow)}` : labels.confirmDeleteDescription}
        confirmText={labels.confirmDelete}
        cancelText={labels.cancel}
        onConfirm={handleDelete}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
}

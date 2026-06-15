"use client";

/**
 * =====================================================
 * AdminModulePage
 * صفحة CRUD عامة لوحدات الأدمن البسيطة
 * تمنع تكرار الجداول والفورمات داخل كل صفحة
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { buildBackendAssetUrl } from "@/shared/api/api-client";
import {
  createAdminItem,
  deleteAdminItem,
  listAdminItems,
  updateAdminItem,
} from "@/shared/api/admin-client";
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
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { AppTable } from "@/shared/design-system/components/AppTable";
import { AppTextarea } from "@/shared/design-system/components/AppTextarea";
import {
  AdminMediaPicker,
  type MediaPickerLabels,
} from "@/shared/admin/components/AdminMediaPicker";
import type {
  AdminFieldConfig,
  AdminModuleConfig,
} from "@/shared/admin/admin-module-types";
import {
  getNestedValue,
  toPayload,
  valueToText,
} from "@/shared/admin/admin-formatters";

type TableLabels = {
  search: string;
  searchPlaceholder: string;
  create: string;
  edit: string;
  delete: string;
  refresh: string;
  actions: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  save: string;
  close: string;
  confirmDelete: string;
  yesDelete: string;
  cancel: string;
  active: string;
  inactive: string;
  unknown: string;
  chooseFromLibrary: string;
  clearMedia: string;
  addItem: string;
  remove: string;
  item: string;
  keyLabel: string;
  valueLabel: string;
} & MediaPickerLabels;

type AdminModulePageProps = {
  config: AdminModuleConfig;
  labels: TableLabels;
};

function isImageMediaField(field: AdminFieldConfig) {
  return /(?:image|logo|icon|favicon|thumbnail|cover)/i.test(field.key);
}

function MediaUrlField({
  field,
  value,
  labels,
  token,
  onChange,
}: {
  field: AdminFieldConfig;
  value: unknown;
  labels: TableLabels;
  token: string;
  onChange: (value: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const textValue = String(value ?? "");
  const previewUrl = buildBackendAssetUrl(textValue);
  const isImageLike = /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(textValue);
  const imagesOnly = isImageMediaField(field);

  return (
    <div key={field.key} className="grid gap-2">
      {imagesOnly ? (
        <span className="flex min-h-6 items-center justify-between gap-2 text-sm font-medium text-app-foreground">
          <span>{field.label}</span>
        </span>
      ) : (
        <AppInput
          label={field.label}
          value={textValue}
          onChange={(event) => onChange(event.target.value)}
          required={field.required}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <AppButton
          type="button"
          variant="secondary"
          className="min-h-9 px-3"
          onClick={() => setPickerOpen(true)}
          icon={<AppIcon name="media" size={16} />}
        >
          {labels.chooseFromLibrary}
        </AppButton>
        {textValue ? (
          <AppButton
            type="button"
            variant="ghost"
            className="min-h-9 px-3"
            onClick={() => onChange("")}
          >
            {labels.clearMedia}
          </AppButton>
        ) : null}
      </div>

      {textValue ? (
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
              <AppIcon name="link" size={16} />
            )}
          </div>
          <span className="min-w-0 flex-1 truncate">{textValue}</span>
          <AppButton
            type="button"
            variant="ghost"
            className="min-h-8 px-2"
            onClick={() =>
              window.open(previewUrl, "_blank", "noopener,noreferrer")
            }
          >
            {labels.open}
          </AppButton>
        </div>
      ) : null}

      <AdminMediaPicker
        open={pickerOpen}
        token={token}
        labels={labels}
        imagesOnly={imagesOnly}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
      />
    </div>
  );
}

function normalizeObjectItem(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : {};
}

function buildEmptyItem(field: AdminFieldConfig): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  field.itemFields?.forEach((itemField) => {
    if (itemField.type === "number") {
      result[itemField.key] = 0;
    } else if (itemField.type === "boolean") {
      result[itemField.key] = false;
    } else if (itemField.type === "json-list") {
      result[itemField.key] = [];
    } else if (itemField.type === "key-value-list") {
      result[itemField.key] = {};
    } else {
      result[itemField.key] = "";
    }
  });
  return result;
}

function renderItemField({
  field,
  item,
  labels,
  token,
  onChange,
}: {
  field: AdminFieldConfig;
  item: Record<string, unknown>;
  labels: TableLabels;
  token: string;
  onChange: (key: string, value: unknown) => void;
}) {
  const value = item[field.key];

  if (field.type === "json-list") {
    return (
      <JsonListField
        key={field.key}
        field={field}
        value={value}
        labels={labels}
        token={token}
        onChange={(nextValue) => onChange(field.key, nextValue)}
      />
    );
  }

  if (field.type === "key-value-list") {
    return (
      <KeyValueListField
        key={field.key}
        field={field}
        value={value}
        labels={labels}
        onChange={(nextValue) => onChange(field.key, nextValue)}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <AppTextarea
        key={field.key}
        label={field.label}
        value={String(value ?? "")}
        onChange={(event) => onChange(field.key, event.target.value)}
        required={field.required}
      />
    );
  }

  if (field.type === "media-url") {
    return (
      <MediaUrlField
        key={field.key}
        field={field}
        value={value}
        labels={labels}
        token={token}
        onChange={(nextValue) => onChange(field.key, nextValue)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <AppSelect
        key={field.key}
        label={field.label}
        value={String(value ?? "")}
        onChange={(event) => onChange(field.key, event.target.value)}
        required={field.required}
      >
        <option value="">—</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </AppSelect>
    );
  }

  if (field.type === "boolean") {
    return (
      <label
        key={field.key}
        className="flex items-center justify-between rounded-appMd border border-app-border bg-app-surface px-4 py-3"
      >
        <span className="text-sm font-medium">{field.label}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.key, event.target.checked)}
          className="size-5 accent-current"
        />
      </label>
    );
  }

  return (
    <AppInput
      key={field.key}
      label={field.label}
      type={field.type === "number" ? "number" : "text"}
      value={String(value ?? "")}
      onChange={(event) =>
        onChange(
          field.key,
          field.type === "number"
            ? Number(event.target.value)
            : event.target.value,
        )
      }
      required={field.required}
    />
  );
}

function JsonListField({
  field,
  value,
  labels,
  token,
  onChange,
}: {
  field: AdminFieldConfig;
  value: unknown;
  labels: TableLabels;
  token: string;
  onChange: (value: Record<string, unknown>[]) => void;
}) {
  const items = Array.isArray(value) ? value.map(normalizeObjectItem) : [];

  const updateItem = (index: number, key: string, nextValue: unknown) => {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: nextValue } : item,
      ),
    );
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const addItem = () => {
    onChange([...items, buildEmptyItem(field)]);
  };

  return (
    <div
      key={field.key}
      className="grid gap-3 rounded-appLg border border-app-border bg-app-surface/60 p-4 md:col-span-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-black">{field.label}</span>
        <AppButton
          type="button"
          variant="secondary"
          className="min-h-9 px-3"
          onClick={addItem}
          icon={<AppIcon name="plus" size={16} />}
        >
          {labels.addItem}
        </AppButton>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-app-muted">{labels.emptyDescription}</p>
      ) : null}

      <div className="grid gap-3">
        {items.map((item, index) => (
          <AppCard key={index} className="grid gap-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black text-app-muted">
                {field.itemLabel || labels.item} #{index + 1}
              </span>
              <AppButton
                type="button"
                variant="danger"
                className="min-h-8 px-3"
                onClick={() => removeItem(index)}
                icon={<AppIcon name="trash" size={15} />}
              >
                {labels.remove}
              </AppButton>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {(field.itemFields ?? []).map((itemField) =>
                renderItemField({
                  field: itemField,
                  item,
                  labels,
                  token,
                  onChange: (key, nextValue) =>
                    updateItem(index, key, nextValue),
                }),
              )}
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}

function KeyValueListField({
  field,
  value,
  labels,
  onChange,
}: {
  field: AdminFieldConfig;
  value: unknown;
  labels: TableLabels;
  onChange: (value: Record<string, string>) => void;
}) {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const pairs = Object.entries(source).map(([key, itemValue]) => ({
    key,
    value: String(itemValue ?? ""),
  }));

  const emit = (nextPairs: Array<{ key: string; value: string }>) => {
    const next: Record<string, string> = {};
    nextPairs.forEach((pair) => {
      if (pair.key.trim()) {
        next[pair.key.trim()] = pair.value;
      }
    });
    onChange(next);
  };

  const updatePair = (
    index: number,
    part: "key" | "value",
    nextValue: string,
  ) => {
    emit(
      pairs.map((pair, pairIndex) =>
        pairIndex === index ? { ...pair, [part]: nextValue } : pair,
      ),
    );
  };

  return (
    <div
      key={field.key}
      className="grid gap-3 rounded-appLg border border-app-border bg-app-surface/60 p-4 md:col-span-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-black">{field.label}</span>
        <AppButton
          type="button"
          variant="secondary"
          className="min-h-9 px-3"
          onClick={() => emit([...pairs, { key: "", value: "" }])}
          icon={<AppIcon name="plus" size={16} />}
        >
          {labels.addItem}
        </AppButton>
      </div>
      {pairs.length === 0 ? (
        <p className="text-xs text-app-muted">{labels.emptyDescription}</p>
      ) : null}
      <div className="grid gap-3">
        {pairs.map((pair, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-appMd border border-app-border bg-app-surface p-3 md:grid-cols-[1fr_1.5fr_auto] md:items-end"
          >
            <AppInput
              label={labels.keyLabel}
              value={pair.key}
              onChange={(event) => updatePair(index, "key", event.target.value)}
            />
            <AppInput
              label={labels.valueLabel}
              value={pair.value}
              onChange={(event) =>
                updatePair(index, "value", event.target.value)
              }
            />
            <AppButton
              type="button"
              variant="danger"
              className="min-h-10 px-3"
              onClick={() =>
                emit(pairs.filter((_, pairIndex) => pairIndex !== index))
              }
              icon={<AppIcon name="trash" size={15} />}
            >
              {labels.remove}
            </AppButton>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderField(
  field: AdminFieldConfig,
  values: Record<string, unknown>,
  setValues: (values: Record<string, unknown>) => void,
  labels: TableLabels,
  token: string,
) {
  const value = values[field.key];

  const setValue = (nextValue: unknown) => {
    setValues({
      ...values,
      [field.key]: nextValue,
    });
  };

  if (field.type === "textarea") {
    return (
      <AppTextarea
        key={field.key}
        label={field.label}
        value={String(value ?? "")}
        onChange={(event) => setValue(event.target.value)}
        required={field.required}
      />
    );
  }

  if (field.type === "media-url") {
    return (
      <MediaUrlField
        key={field.key}
        field={field}
        value={value}
        labels={labels}
        token={token}
        onChange={(nextValue) => setValue(nextValue)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <AppSelect
        key={field.key}
        label={field.label}
        value={String(value ?? "")}
        onChange={(event) => setValue(event.target.value)}
        required={field.required}
      >
        <option value="">—</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </AppSelect>
    );
  }

  if (field.type === "boolean") {
    return (
      <label
        key={field.key}
        className="flex items-center justify-between rounded-appMd border border-app-border bg-app-surface px-4 py-3"
      >
        <span className="text-sm font-medium">{field.label}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => setValue(event.target.checked)}
          className="size-5 accent-current"
        />
      </label>
    );
  }

  return (
    <AppInput
      key={field.key}
      label={field.label}
      type={field.type === "number" ? "number" : "text"}
      value={String(value ?? "")}
      onChange={(event) =>
        setValue(
          field.type === "number"
            ? Number(event.target.value)
            : event.target.value,
        )
      }
      required={field.required}
    />
  );
}

export function AdminModulePage({ config, labels }: AdminModulePageProps) {
  const queryClient = useQueryClient();
  const { tokens } = useAdminAuth();

  const [search, setSearch] = useState("");
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(
    null,
  );
  const [formValues, setFormValues] = useState<Record<string, unknown>>(
    config.createInitialValues,
  );
  const [deleteRow, setDeleteRow] = useState<Record<string, unknown> | null>(
    null,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const token = tokens?.access_token ?? "";

  const queryKey = [config.endpoint, search];

  const query = useQuery({
    queryKey,
    queryFn: () =>
      listAdminItems(config.endpoint, {
        token,
        search,
        skip: 0,
        limit: 50,
      }),
    enabled: Boolean(token),
  });

  const rows = (query.data ?? []) as Record<string, unknown>[];

  const openCreate = () => {
    setFormError(null);
    setEditingRow(null);
    setFormValues(config.createInitialValues);
    setFormOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setFormError(null);
    setEditingRow(row);
    setFormValues({
      ...config.createInitialValues,
      ...row,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormError(null);
    setEditingRow(null);
    setFormValues(config.createInitialValues);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = toPayload(formValues);

      if (editingRow?.id) {
        await updateAdminItem(
          `${config.endpoint}/${editingRow.id}`,
          token,
          payload,
        );
      } else {
        await createAdminItem(config.endpoint, token, payload);
      }

      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      closeForm();
    } catch (exception) {
      setFormError(
        exception instanceof Error ? exception.message : labels.unknown,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRow?.id) {
      return;
    }

    await deleteAdminItem(`${config.endpoint}/${deleteRow.id}`, token);
    setDeleteRow(null);
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  return (
    <div className="grid gap-6">
      <AppPageHeader title={config.title} description={config.description} />

      <AppCard className="grid gap-4 p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <AppInput
            label={labels.search}
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="md:min-w-80"
          />

          <div className="flex flex-wrap gap-2">
            <AppButton
              variant="secondary"
              onClick={() => query.refetch()}
              icon={<AppIcon name="refresh" size={17} />}
            >
              {labels.refresh}
            </AppButton>
            <AppButton
              onClick={openCreate}
              icon={<AppIcon name="plus" size={17} />}
            >
              {labels.create}
            </AppButton>
          </div>
        </div>
      </AppCard>

      <AppCard className="p-4 md:p-5">
        {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}

        {query.isError ? (
          <AppErrorState
            title={labels.unknown}
            description={String(query.error)}
          />
        ) : null}

        {!query.isLoading && !query.isError && rows.length === 0 ? (
          <AppEmptyState
            title={labels.emptyTitle}
            description={labels.emptyDescription}
          />
        ) : null}

        {!query.isLoading && !query.isError && rows.length > 0 ? (
          <AppTable
            rows={rows}
            getRowKey={(row) => String(row.id)}
            columns={[
              ...config.columns.map((column) => ({
                key: column.key,
                header: column.label,
                render: (row: Record<string, unknown>) => {
                  const value = getNestedValue(row, column.key);

                  if (column.type === "badge") {
                    return (
                      <AppBadge tone={value ? "success" : "neutral"}>
                        {valueToText(value)}
                      </AppBadge>
                    );
                  }

                  if (column.type === "boolean") {
                    return (
                      <AppBadge tone={value ? "success" : "neutral"}>
                        {value ? labels.active : labels.inactive}
                      </AppBadge>
                    );
                  }

                  return <span>{valueToText(value)}</span>;
                },
              })),
              {
                key: "actions",
                header: labels.actions,
                render: (row: Record<string, unknown>) => (
                  <div className="flex flex-wrap gap-2">
                    <AppButton
                      variant="secondary"
                      className="min-h-10 px-3"
                      onClick={() => openEdit(row)}
                      icon={<AppIcon name="edit" size={16} />}
                    >
                      {labels.edit}
                    </AppButton>
                    {config.canDelete !== false ? (
                      <AppButton
                        variant="danger"
                        className="min-h-10 px-3"
                        onClick={() => setDeleteRow(row)}
                        icon={<AppIcon name="trash" size={16} />}
                      >
                        {labels.delete}
                      </AppButton>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />
        ) : null}
      </AppCard>

      <AppModal
        open={formOpen}
        title={editingRow ? labels.edit : labels.create}
        onClose={closeForm}
        size="xl"
      >
        <div className="grid gap-5">
          {formError ? (
            <AppErrorState title={labels.unknown} description={formError} />
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) =>
              renderField(field, formValues, setFormValues, labels, token),
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-app-border pt-4">
            <AppButton variant="ghost" onClick={closeForm}>
              {labels.close}
            </AppButton>
            <AppButton
              disabled={isSubmitting}
              onClick={handleSave}
              icon={<AppIcon name="save" size={17} />}
            >
              {labels.save}
            </AppButton>
          </div>
        </div>
      </AppModal>

      <AppConfirmDialog
        open={Boolean(deleteRow)}
        title={labels.delete}
        description={labels.confirmDelete}
        confirmText={labels.yesDelete}
        cancelText={labels.cancel}
        onCancel={() => setDeleteRow(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

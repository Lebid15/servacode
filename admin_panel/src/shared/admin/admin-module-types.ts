/**
 * =====================================================
 * أنواع وحدات لوحة الأدمن
 * تستخدم لبناء جداول وفورمات موحدة بدون تكرار
 * =====================================================
 */

export type AdminFieldType = "text" | "textarea" | "number" | "select" | "boolean" | "media-url" | "json-list" | "key-value-list";

export type AdminFieldOption = {
  label: string;
  value: string;
};

export type AdminFieldConfig = {
  key: string;
  label: string;
  type: AdminFieldType;
  required?: boolean;
  options?: AdminFieldOption[];
  itemLabel?: string;
  itemFields?: AdminFieldConfig[];
};

export type AdminColumnConfig = {
  key: string;
  label: string;
  type?: "text" | "badge" | "date" | "boolean";
};

export type AdminModuleConfig = {
  title: string;
  description: string;
  endpoint: string;
  columns: AdminColumnConfig[];
  fields: AdminFieldConfig[];
  createInitialValues: Record<string, unknown>;
  canDelete?: boolean;
};

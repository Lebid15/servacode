"use client";

/**
 * =====================================================
 * AdminRolesPage
 * صفحة إدارة الأدوار والصلاحيات بشكل احترافي
 * =====================================================
 */

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/shared/api/api-client";
import { ensureDefaultRoles } from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { valueToText } from "@/shared/admin/admin-formatters";
import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppConfirmDialog } from "@/shared/design-system/components/AppConfirmDialog";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppModal } from "@/shared/design-system/components/AppModal";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { AppTable } from "@/shared/design-system/components/AppTable";
import { AppTextarea } from "@/shared/design-system/components/AppTextarea";
import type { Locale } from "@/shared/design-system/utils/direction";

type Role = {
  id?: string;
  name?: string;
  display_name_ar?: string;
  display_name_en?: string;
  description_ar?: string | null;
  description_en?: string | null;
  permissions?: string[];
  is_system?: boolean;
  user_count?: number;
  created_at?: string;
  updated_at?: string;
};

type Permission = {
  key: string;
  category: string;
  label_ar: string;
  label_en: string;
  description_ar: string;
  description_en: string;
};

type RoleFormState = {
  id?: string;
  name: string;
  display_name_ar: string;
  display_name_en: string;
  description_ar: string;
  description_en: string;
  permissions: string[];
  is_system?: boolean;
};

type ConfirmState = {
  role?: Role;
};

type AdminRolesPageProps = {
  locale: Locale;
};

const emptyForm: RoleFormState = {
  name: "",
  display_name_ar: "",
  display_name_en: "",
  description_ar: "",
  description_en: "",
  permissions: []
};

const categoryOrder = ["overview", "platform", "content", "crm", "monitoring"];

function getLabels(locale: Locale) {
  const ar = locale === "ar";

  return {
    title: ar ? "الأدوار والصلاحيات" : "Roles & permissions",
    description: ar
      ? "إدارة أدوار مستخدمي لوحة الأدمن وتحديد ما يمكن لكل دور الوصول إليه داخل النظام."
      : "Manage admin panel roles and define what each role can access.",
    refresh: ar ? "تحديث" : "Refresh",
    ensureRoles: ar ? "تجهيز الأدوار الافتراضية" : "Ensure default roles",
    create: ar ? "إضافة دور مخصص" : "Add custom role",
    edit: ar ? "تعديل الدور" : "Edit role",
    close: ar ? "إغلاق" : "Close",
    save: ar ? "حفظ" : "Save",
    saving: ar ? "جارٍ الحفظ..." : "Saving...",
    search: ar ? "بحث" : "Search",
    searchPlaceholder: ar ? "ابحث باسم الدور أو الوصف" : "Search by role name or description",
    total: ar ? "إجمالي الأدوار" : "Total roles",
    systemRoles: ar ? "أدوار النظام" : "System roles",
    customRoles: ar ? "أدوار مخصصة" : "Custom roles",
    assignedUsers: ar ? "مستخدمون مرتبطون" : "Assigned users",
    name: ar ? "مفتاح الدور" : "Role key",
    titleAr: ar ? "الاسم العربي" : "Arabic name",
    titleEn: ar ? "الاسم الإنجليزي" : "English name",
    descriptionAr: ar ? "الوصف العربي" : "Arabic description",
    descriptionEn: ar ? "الوصف الإنجليزي" : "English description",
    type: ar ? "النوع" : "Type",
    users: ar ? "المستخدمون" : "Users",
    permissions: ar ? "الصلاحيات" : "Permissions",
    actions: ar ? "الإجراءات" : "Actions",
    details: ar ? "التفاصيل" : "Details",
    system: ar ? "نظامي" : "System",
    custom: ar ? "مخصص" : "Custom",
    locked: ar ? "محمي" : "Locked",
    editable: ar ? "قابل للتعديل" : "Editable",
    delete: ar ? "حذف" : "Delete",
    noPermissions: ar ? "لا توجد صلاحيات" : "No permissions",
    loading: ar ? "جارٍ تحميل الأدوار..." : "Loading roles...",
    emptyTitle: ar ? "لا توجد أدوار" : "No roles found",
    emptyDescription: ar ? "جهّز الأدوار الافتراضية أو أضف دورًا مخصصًا جديدًا." : "Ensure default roles or add a custom role.",
    errorTitle: ar ? "تعذر تحميل البيانات" : "Could not load data",
    unknownError: ar ? "حدث خطأ غير معروف." : "An unknown error occurred.",
    roleKeyHint: ar
      ? "استخدم أحرفًا إنجليزية وأرقامًا وشرطة فقط، مثل sales_manager. لا يمكن تعديل المفتاح بعد الإنشاء."
      : "Use English letters, numbers, and dashes only, such as sales_manager. The key cannot be changed later.",
    formDescription: ar
      ? "حدد اسم الدور ثم اختر الصلاحيات التي يحتاجها المستخدمون المرتبطون به فقط."
      : "Set the role name and choose only the permissions users assigned to this role need.",
    systemHint: ar
      ? "أدوار النظام يمكن تحديثها من زر تجهيز الأدوار الافتراضية، ولا يمكن حذفها من الواجهة."
      : "System roles can be refreshed using ensure defaults and cannot be deleted from the interface.",
    superAdminHint: ar
      ? "دور مدير المنصة الأعلى محمي، ولا يمكن تعديل صلاحياته من الواجهة."
      : "The Super Admin role is locked and its permissions cannot be changed from the interface.",
    selectAll: ar ? "تحديد الكل" : "Select all",
    clearAll: ar ? "إلغاء الكل" : "Clear all",
    confirmDeleteTitle: ar ? "حذف الدور؟" : "Delete role?",
    confirmDeleteDescription: ar
      ? "سيتم حذف الدور المخصص نهائيًا. لا يمكن حذف دور مرتبط بمستخدمين أو دور نظامي."
      : "The custom role will be permanently deleted. System roles and roles assigned to users cannot be deleted.",
    confirm: ar ? "تأكيد" : "Confirm",
    cancel: ar ? "إلغاء" : "Cancel",
    saved: ar ? "تم حفظ الدور بنجاح." : "Role saved successfully.",
    deletedDone: ar ? "تم حذف الدور." : "Role deleted.",
    rolesReady: ar ? "تم تجهيز الأدوار الافتراضية." : "Default roles are ready.",
    success: ar ? "تمت العملية بنجاح." : "Operation completed successfully.",
    overview: ar ? "نظرة عامة" : "Overview",
    platform: ar ? "إدارة المنصة" : "Platform management",
    content: ar ? "المحتوى" : "Content",
    crm: ar ? "الطلبات والعملاء" : "Requests & clients",
    monitoring: ar ? "المراقبة والتقارير" : "Monitoring & reports",
    notAvailable: "—"
  };
}

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

function roleLabel(role: Role, locale: Locale) {
  return locale === "ar" ? role.display_name_ar ?? role.name ?? "—" : role.display_name_en ?? role.name ?? "—";
}

function roleDescription(role: Role, locale: Locale) {
  return locale === "ar" ? role.description_ar ?? role.description_en ?? "" : role.description_en ?? role.description_ar ?? "";
}

function permissionLabel(permission: Permission, locale: Locale) {
  return locale === "ar" ? permission.label_ar : permission.label_en;
}

function permissionDescription(permission: Permission, locale: Locale) {
  return locale === "ar" ? permission.description_ar : permission.description_en;
}

function categoryLabel(category: string, labels: ReturnType<typeof getLabels>) {
  if (category === "overview") return labels.overview;
  if (category === "platform") return labels.platform;
  if (category === "content") return labels.content;
  if (category === "crm") return labels.crm;
  if (category === "monitoring") return labels.monitoring;
  return category;
}

function typeTone(role: Role): BadgeTone {
  return role.is_system ? "primary" : "success";
}

async function listRoles(token: string, search: string) {
  return apiRequest<Role[]>(`/roles${queryString({ search })}`, { token });
}

async function listPermissions(token: string) {
  return apiRequest<Permission[]>("/roles/permissions", { token });
}

async function createRole(token: string, payload: RoleFormState) {
  return apiRequest<Role>("/roles", {
    method: "POST",
    token,
    body: JSON.stringify({
      name: payload.name,
      display_name_ar: payload.display_name_ar,
      display_name_en: payload.display_name_en,
      description_ar: payload.description_ar || null,
      description_en: payload.description_en || null,
      permissions: payload.permissions
    })
  });
}

async function updateRole(token: string, roleId: string, payload: RoleFormState) {
  return apiRequest<Role>(`/roles/${roleId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({
      display_name_ar: payload.display_name_ar,
      display_name_en: payload.display_name_en,
      description_ar: payload.description_ar || null,
      description_en: payload.description_en || null,
      permissions: payload.permissions
    })
  });
}

async function deleteRole(token: string, roleId: string) {
  return apiRequest<Record<string, unknown>>(`/roles/${roleId}`, {
    method: "DELETE",
    token
  });
}

function statValue(value: number | undefined) {
  return String(value ?? 0);
}

export function AdminRolesPage({ locale }: AdminRolesPageProps) {
  const labels = useMemo(() => getLabels(locale), [locale]);
  const { tokens } = useAdminAuth();
  const queryClient = useQueryClient();
  const token = tokens?.access_token ?? "";

  const [search, setSearch] = useState("");
  const [form, setForm] = useState<RoleFormState | null>(null);
  const [viewRole, setViewRole] = useState<Role | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const rolesQuery = useQuery({
    queryKey: ["/roles", search],
    queryFn: () => listRoles(token, search),
    enabled: Boolean(token)
  });

  const permissionsQuery = useQuery({
    queryKey: ["/roles/permissions"],
    queryFn: () => listPermissions(token),
    enabled: Boolean(token)
  });

  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);
  const permissions = useMemo(() => permissionsQuery.data ?? [], [permissionsQuery.data]);

  const stats = useMemo(() => {
    return {
      total: roles.length,
      system: roles.filter((role) => role.is_system).length,
      custom: roles.filter((role) => !role.is_system).length,
      assignedUsers: roles.reduce((sum, role) => sum + (role.user_count ?? 0), 0)
    };
  }, [roles]);

  const permissionsByCategory = useMemo(() => {
    const groups = new Map<string, Permission[]>();
    permissions.forEach((permission) => {
      if (!groups.has(permission.category)) {
        groups.set(permission.category, []);
      }
      groups.get(permission.category)?.push(permission);
    });

    return Array.from(groups.entries()).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a[0]);
      const bIndex = categoryOrder.indexOf(b[0]);
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
  }, [permissions]);

  const selectedPermissionSet = useMemo(() => new Set(form?.permissions ?? []), [form?.permissions]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/roles"] });
    await queryClient.invalidateQueries({ queryKey: ["/roles/permissions"] });
  };

  const openCreate = () => {
    setError(null);
    setNotice(null);
    setForm(emptyForm);
  };

  const openEdit = (role: Role) => {
    setError(null);
    setNotice(null);
    setForm({
      id: role.id,
      name: role.name ?? "",
      display_name_ar: role.display_name_ar ?? "",
      display_name_en: role.display_name_en ?? "",
      description_ar: role.description_ar ?? "",
      description_en: role.description_en ?? "",
      permissions: role.permissions ?? [],
      is_system: role.is_system
    });
  };

  const setField = <K extends keyof RoleFormState>(field: K, value: RoleFormState[K]) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const togglePermission = (permission: string) => {
    if (!form || form.name === "super_admin") {
      return;
    }

    const next = selectedPermissionSet.has(permission)
      ? form.permissions.filter((item) => item !== permission)
      : [...form.permissions, permission];

    setField("permissions", next);
  };

  const setCategoryPermissions = (items: Permission[], checked: boolean) => {
    if (!form || form.name === "super_admin") {
      return;
    }

    const keys = items.map((item) => item.key);
    const current = new Set(form.permissions);

    keys.forEach((key) => {
      if (checked) {
        current.add(key);
      } else {
        current.delete(key);
      }
    });

    setField("permissions", Array.from(current));
  };

  const handleEnsureRoles = async () => {
    setError(null);
    setNotice(null);
    try {
      await ensureDefaultRoles(token);
      setNotice(labels.rolesReady);
      await invalidate();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : labels.unknownError);
    }
  };

  const handleSave = async () => {
    if (!form) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      if (form.id) {
        await updateRole(token, form.id, form);
      } else {
        await createRole(token, form);
      }
      setNotice(labels.saved);
      setForm(null);
      await invalidate();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : labels.unknownError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm?.role?.id) {
      return;
    }

    setError(null);
    setNotice(null);

    try {
      await deleteRole(token, confirm.role.id);
      setNotice(labels.deletedDone);
      setConfirm(null);
      await invalidate();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : labels.unknownError);
    }
  };

  const canEditPermissions = Boolean(form && form.name !== "super_admin");

  return (
    <div className="grid gap-6">
      <AppPageHeader title={labels.title} description={labels.description} />

      <div className="grid gap-4 md:grid-cols-4">
        <AppCard className="p-5">
          <p className="text-sm text-app-muted">{labels.total}</p>
          <p className="mt-2 text-3xl font-black text-app-foreground">{statValue(stats.total)}</p>
        </AppCard>
        <AppCard className="p-5">
          <p className="text-sm text-app-muted">{labels.systemRoles}</p>
          <p className="mt-2 text-3xl font-black text-app-primary">{statValue(stats.system)}</p>
        </AppCard>
        <AppCard className="p-5">
          <p className="text-sm text-app-muted">{labels.customRoles}</p>
          <p className="mt-2 text-3xl font-black text-app-success">{statValue(stats.custom)}</p>
        </AppCard>
        <AppCard className="p-5">
          <p className="text-sm text-app-muted">{labels.assignedUsers}</p>
          <p className="mt-2 text-3xl font-black text-app-warning">{statValue(stats.assignedUsers)}</p>
        </AppCard>
      </div>

      <AppCard className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <AppInput
          label={labels.search}
          placeholder={labels.searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <AppButton variant="secondary" onClick={() => rolesQuery.refetch()}>{labels.refresh}</AppButton>
          <AppButton variant="secondary" onClick={handleEnsureRoles}>{labels.ensureRoles}</AppButton>
          <AppButton onClick={openCreate}>{labels.create}</AppButton>
        </div>
      </AppCard>

      {notice ? (
        <AppCard className="border-app-success/30 bg-app-success/10 p-4 text-sm font-semibold text-app-success">
          {notice}
        </AppCard>
      ) : null}

      {error ? <AppErrorState title={labels.errorTitle} description={error} /> : null}

      <AppCard className="p-5">
        {rolesQuery.isLoading || permissionsQuery.isLoading ? <AppLoadingState text={labels.loading} /> : null}
        {rolesQuery.isError ? <AppErrorState title={labels.errorTitle} description={String(rolesQuery.error)} /> : null}
        {!rolesQuery.isLoading && !rolesQuery.isError && roles.length === 0 ? (
          <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} />
        ) : null}
        {!rolesQuery.isLoading && !rolesQuery.isError && roles.length > 0 ? (
          <AppTable
            rows={roles}
            getRowKey={(row) => String(row.id)}
            columns={[
              {
                key: "role",
                header: labels.titleAr,
                render: (row) => (
                  <div className="grid gap-1">
                    <span className="font-bold text-app-foreground">{roleLabel(row, locale)}</span>
                    <span className="text-xs text-app-muted">{valueToText(row.name)}</span>
                  </div>
                )
              },
              {
                key: "description",
                header: labels.details,
                render: (row) => <span className="line-clamp-2 text-sm text-app-muted">{roleDescription(row, locale) || labels.notAvailable}</span>
              },
              {
                key: "type",
                header: labels.type,
                render: (row) => <AppBadge tone={typeTone(row)}>{row.is_system ? labels.system : labels.custom}</AppBadge>
              },
              {
                key: "permissions",
                header: labels.permissions,
                render: (row) => <AppBadge tone="neutral">{row.permissions?.length ?? 0}</AppBadge>
              },
              {
                key: "users",
                header: labels.users,
                render: (row) => <AppBadge tone={(row.user_count ?? 0) > 0 ? "warning" : "neutral"}>{row.user_count ?? 0}</AppBadge>
              },
              {
                key: "actions",
                header: labels.actions,
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    <AppButton variant="ghost" className="min-h-9 px-3" onClick={() => setViewRole(row)}>{labels.details}</AppButton>
                    <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => openEdit(row)}>{labels.edit}</AppButton>
                    {!row.is_system ? (
                      <AppButton variant="danger" className="min-h-9 px-3" onClick={() => setConfirm({ role: row })}>{labels.delete}</AppButton>
                    ) : null}
                  </div>
                )
              }
            ]}
          />
        ) : null}
      </AppCard>

      <AppModal open={Boolean(form)} title={form?.id ? labels.edit : labels.create} onClose={() => setForm(null)} size="xl">
        {form ? (
          <div className="grid gap-6">
            <p className="text-sm text-app-muted">{labels.formDescription}</p>

            {form.is_system ? (
              <AppCard className="border-app-primary/30 bg-app-primary/10 p-4 text-sm text-app-primary">
                {form.name === "super_admin" ? labels.superAdminHint : labels.systemHint}
              </AppCard>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <AppInput
                label={labels.name}
                value={form.name}
                disabled={Boolean(form.id)}
                onChange={(event) => setField("name", event.target.value)}
              />
              <div className="grid content-end text-xs text-app-muted">{labels.roleKeyHint}</div>
              <AppInput
                label={labels.titleAr}
                value={form.display_name_ar}
                onChange={(event) => setField("display_name_ar", event.target.value)}
              />
              <AppInput
                label={labels.titleEn}
                value={form.display_name_en}
                onChange={(event) => setField("display_name_en", event.target.value)}
              />
              <AppTextarea
                label={labels.descriptionAr}
                value={form.description_ar}
                onChange={(event) => setField("description_ar", event.target.value)}
              />
              <AppTextarea
                label={labels.descriptionEn}
                value={form.description_en}
                onChange={(event) => setField("description_en", event.target.value)}
              />
            </div>

            <div className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-app-foreground">{labels.permissions}</h3>
                  <p className="text-sm text-app-muted">{form.permissions.length} / {permissions.length}</p>
                </div>
                <div className="flex gap-2">
                  <AppButton
                    variant="secondary"
                    disabled={!canEditPermissions}
                    onClick={() => setField("permissions", permissions.map((permission) => permission.key))}
                  >
                    {labels.selectAll}
                  </AppButton>
                  <AppButton variant="ghost" disabled={!canEditPermissions} onClick={() => setField("permissions", [])}>
                    {labels.clearAll}
                  </AppButton>
                </div>
              </div>

              {permissionsByCategory.map(([category, items]) => {
                const selectedCount = items.filter((item) => selectedPermissionSet.has(item.key)).length;
                const allSelected = selectedCount === items.length && items.length > 0;

                return (
                  <AppCard key={category} className="p-4">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-app-foreground">{categoryLabel(category, labels)}</h4>
                        <p className="text-xs text-app-muted">{selectedCount} / {items.length}</p>
                      </div>
                      <AppButton
                        variant="ghost"
                        className="min-h-9 px-3"
                        disabled={!canEditPermissions}
                        onClick={() => setCategoryPermissions(items, !allSelected)}
                      >
                        {allSelected ? labels.clearAll : labels.selectAll}
                      </AppButton>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {items.map((permission) => (
                        <label
                          key={permission.key}
                          className="flex cursor-pointer items-start gap-3 rounded-appMd border border-app-border bg-app-surfaceElevated/60 p-3 transition hover:border-app-primary/40"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-current"
                            checked={selectedPermissionSet.has(permission.key)}
                            disabled={!canEditPermissions}
                            onChange={() => togglePermission(permission.key)}
                          />
                          <span className="grid gap-1">
                            <span className="text-sm font-bold text-app-foreground">{permissionLabel(permission, locale)}</span>
                            <span className="text-xs text-app-muted">{permissionDescription(permission, locale)}</span>
                            <span className="text-[11px] text-app-muted">{permission.key}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </AppCard>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <AppButton variant="secondary" onClick={() => setForm(null)}>{labels.close}</AppButton>
              <AppButton onClick={handleSave} disabled={saving || !form.name || !form.display_name_ar || !form.display_name_en}>
                {saving ? labels.saving : labels.save}
              </AppButton>
            </div>
          </div>
        ) : null}
      </AppModal>

      <AppModal open={Boolean(viewRole)} title={viewRole ? roleLabel(viewRole, locale) : labels.details} onClose={() => setViewRole(null)} size="lg">
        {viewRole ? (
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-2">
              <AppBadge tone={typeTone(viewRole)}>{viewRole.is_system ? labels.system : labels.custom}</AppBadge>
              <AppBadge tone="neutral">{viewRole.permissions?.length ?? 0} {labels.permissions}</AppBadge>
              <AppBadge tone={(viewRole.user_count ?? 0) > 0 ? "warning" : "neutral"}>{viewRole.user_count ?? 0} {labels.users}</AppBadge>
            </div>
            <p className="text-app-muted">{roleDescription(viewRole, locale) || labels.notAvailable}</p>
            <div className="grid gap-3">
              {(viewRole.permissions ?? []).length === 0 ? (
                <AppEmptyState title={labels.noPermissions} description={labels.emptyDescription} />
              ) : (
                (viewRole.permissions ?? []).map((permissionKey) => {
                  const permission = permissions.find((item) => item.key === permissionKey);
                  return (
                    <div key={permissionKey} className="rounded-appMd border border-app-border bg-app-surfaceElevated/60 p-3">
                      <div className="font-bold text-app-foreground">{permission ? permissionLabel(permission, locale) : permissionKey}</div>
                      <div className="mt-1 text-sm text-app-muted">{permission ? permissionDescription(permission, locale) : permissionKey}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : null}
      </AppModal>

      <AppConfirmDialog
        open={Boolean(confirm?.role)}
        title={labels.confirmDeleteTitle}
        description={labels.confirmDeleteDescription}
        confirmText={labels.confirm}
        cancelText={labels.cancel}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

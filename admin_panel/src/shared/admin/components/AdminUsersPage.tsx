"use client";

/**
 * =====================================================
 * AdminUsersPage
 * صفحة إدارة مستخدمي لوحة الأدمن بشكل احترافي
 * =====================================================
 */

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/shared/api/api-client";
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
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { AppTable } from "@/shared/design-system/components/AppTable";
import type { Locale } from "@/shared/design-system/utils/direction";

type AdminRole = {
  id?: string;
  name?: string;
  display_name_ar?: string;
  display_name_en?: string;
  description_ar?: string | null;
  description_en?: string | null;
  permissions?: string[];
  is_system?: boolean;
};

type AdminUser = {
  id?: string;
  full_name?: string;
  username?: string;
  email?: string | null;
  phone?: string | null;
  role_id?: string;
  status?: "active" | "inactive" | "suspended" | string;
  is_superuser?: boolean;
  last_login_at?: string | null;
  failed_login_count?: number;
  locked_until?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  role?: AdminRole | null;
};

type UserFormState = {
  id?: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role_id: string;
  status: "active" | "inactive" | "suspended";
  is_superuser: boolean;
};

type ConfirmState = {
  type: "delete" | "restore" | "unlock" | null;
  user?: AdminUser;
};

type Labels = ReturnType<typeof getLabels>;

type AdminUsersPageProps = {
  locale: Locale;
};

const emptyForm: UserFormState = {
  full_name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  role_id: "",
  status: "active",
  is_superuser: false
};

function getLabels(locale: Locale) {
  const ar = locale === "ar";

  return {
    title: ar ? "المستخدمون" : "Users",
    description: ar
      ? "إدارة حسابات لوحة الأدمن، الأدوار، حالة الحسابات، كلمات المرور، والحسابات المقفلة."
      : "Manage admin panel accounts, roles, account status, passwords, and locked users.",
    refresh: ar ? "تحديث" : "Refresh",
    create: ar ? "إضافة مستخدم" : "Add user",
    edit: ar ? "تعديل المستخدم" : "Edit user",
    close: ar ? "إغلاق" : "Close",
    save: ar ? "حفظ" : "Save",
    saving: ar ? "جارٍ الحفظ..." : "Saving...",
    search: ar ? "بحث" : "Search",
    searchPlaceholder: ar ? "ابحث بالاسم أو اسم المستخدم أو البريد أو الهاتف" : "Search by name, username, email, or phone",
    allStatuses: ar ? "كل الحالات" : "All statuses",
    allRoles: ar ? "كل الأدوار" : "All roles",
    includeDeleted: ar ? "إظهار المحذوفين" : "Show deleted",
    active: ar ? "نشط" : "Active",
    inactive: ar ? "غير نشط" : "Inactive",
    suspended: ar ? "موقوف" : "Suspended",
    deleted: ar ? "محذوف" : "Deleted",
    locked: ar ? "مقفول" : "Locked",
    superuser: ar ? "مدير منصة" : "Super admin",
    normalUser: ar ? "مستخدم إداري" : "Admin user",
    total: ar ? "إجمالي المستخدمين" : "Total users",
    activeUsers: ar ? "مستخدمون نشطون" : "Active users",
    superusers: ar ? "مدراء المنصة" : "Super admins",
    lockedUsers: ar ? "حسابات مقفلة" : "Locked accounts",
    deletedUsers: ar ? "محذوفون" : "Deleted users",
    fullName: ar ? "الاسم الكامل" : "Full name",
    username: ar ? "اسم المستخدم" : "Username",
    email: ar ? "البريد الإلكتروني" : "Email",
    phone: ar ? "الهاتف" : "Phone",
    role: ar ? "الدور" : "Role",
    status: ar ? "الحالة" : "Status",
    accountType: ar ? "نوع الحساب" : "Account type",
    password: ar ? "كلمة المرور" : "Password",
    newPassword: ar ? "كلمة مرور جديدة" : "New password",
    lastLogin: ar ? "آخر دخول" : "Last login",
    failedAttempts: ar ? "محاولات فاشلة" : "Failed attempts",
    createdAt: ar ? "تاريخ الإنشاء" : "Created at",
    actions: ar ? "الإجراءات" : "Actions",
    details: ar ? "التفاصيل" : "Details",
    resetPassword: ar ? "تغيير كلمة المرور" : "Change password",
    delete: ar ? "حذف" : "Delete",
    restore: ar ? "استعادة" : "Restore",
    unlock: ar ? "فك القفل" : "Unlock",
    ensureRoles: ar ? "تجهيز الأدوار الافتراضية" : "Ensure default roles",
    loading: ar ? "جارٍ تحميل المستخدمين..." : "Loading users...",
    emptyTitle: ar ? "لا يوجد مستخدمون" : "No users found",
    emptyDescription: ar ? "ابدأ بإضافة مستخدم إداري جديد أو عدّل الفلاتر." : "Add a new admin user or change filters.",
    errorTitle: ar ? "تعذر تحميل البيانات" : "Could not load data",
    unknownError: ar ? "حدث خطأ غير معروف." : "An unknown error occurred.",
    formValidationError: ar
      ? "يرجى إدخال الاسم، اسم المستخدم، الدور، وكلمة مرور لا تقل عن 8 أحرف عند إنشاء المستخدم."
      : "Please enter the name, username, role, and an 8+ character password when creating a user.",
    formDescription: ar
      ? "أنشئ حسابًا إداريًا وحدد دوره وصلاحياته الأساسية. كلمة المرور مطلوبة عند الإنشاء واختيارية عند التعديل."
      : "Create an admin account and choose its role. Password is required on create and optional on edit.",
    roleHint: ar ? "الأدوار تحدد صلاحيات المستخدم داخل لوحة الأدمن." : "Roles control the user's permissions inside the admin panel.",
    passwordHint: ar
      ? "اترك الحقل فارغًا إذا كنت لا تريد تغيير كلمة المرور. الحد الأدنى 8 أحرف."
      : "Leave empty if you do not want to change the password. Minimum 8 characters.",
    confirmDeleteTitle: ar ? "حذف المستخدم؟" : "Delete user?",
    confirmDeleteDescription: ar
      ? "سيتم حذف المستخدم حذفًا ناعمًا ويمكن استعادته لاحقًا. لا يمكن حذف حسابك الحالي أو آخر مدير منصة نشط."
      : "The user will be soft deleted and can be restored later. You cannot delete your current account or the last active super admin.",
    confirmRestoreTitle: ar ? "استعادة المستخدم؟" : "Restore user?",
    confirmRestoreDescription: ar ? "سيعود المستخدم إلى قائمة الحسابات القابلة للإدارة." : "The user will return to the manageable account list.",
    confirmUnlockTitle: ar ? "فك قفل الحساب؟" : "Unlock account?",
    confirmUnlockDescription: ar
      ? "سيتم تصفير محاولات الدخول الفاشلة وإزالة القفل المؤقت."
      : "Failed login attempts will be reset and temporary lock removed.",
    confirm: ar ? "تأكيد" : "Confirm",
    cancel: ar ? "إلغاء" : "Cancel",
    rolesReady: ar ? "تم تجهيز الأدوار الافتراضية." : "Default roles are ready.",
    saved: ar ? "تم حفظ المستخدم بنجاح." : "User saved successfully.",
    deletedDone: ar ? "تم حذف المستخدم." : "User deleted.",
    restoredDone: ar ? "تمت استعادة المستخدم." : "User restored.",
    unlockedDone: ar ? "تم فك قفل المستخدم." : "User unlocked.",
    success: ar ? "تمت العملية بنجاح." : "Operation completed successfully.",
    permissions: ar ? "الصلاحيات" : "Permissions",
    noPermissions: ar ? "لا توجد صلاحيات مسجلة لهذا الدور." : "No permissions are registered for this role.",
    currentAccount: ar ? "حسابك الحالي" : "Current account",
    yes: ar ? "نعم" : "Yes",
    no: ar ? "لا" : "No",
    never: ar ? "لم يسجل دخولًا" : "Never logged in",
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

function roleLabel(role: AdminRole | undefined | null, locale: Locale) {
  if (!role) {
    return "—";
  }

  return locale === "ar" ? role.display_name_ar ?? role.name ?? "—" : role.display_name_en ?? role.name ?? "—";
}

function statusLabel(status: string | undefined, labels: Labels) {
  if (status === "active") {
    return labels.active;
  }
  if (status === "inactive") {
    return labels.inactive;
  }
  if (status === "suspended") {
    return labels.suspended;
  }
  return status || labels.notAvailable;
}

function statusTone(user: AdminUser): BadgeTone {
  if (user.is_deleted) {
    return "neutral";
  }

  if (user.locked_until) {
    return "warning";
  }

  if (user.status === "active") {
    return "success";
  }

  if (user.status === "suspended") {
    return "danger";
  }

  return "neutral";
}

function formatDate(value: string | null | undefined, locale: Locale, emptyValue: string) {
  if (!value) {
    return emptyValue;
  }

  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function isLocked(user: AdminUser) {
  if (!user.locked_until) {
    return false;
  }

  return new Date(user.locked_until).getTime() > Date.now();
}

function buildStats(users: AdminUser[]) {
  return {
    total: users.length,
    active: users.filter((user) => !user.is_deleted && user.status === "active").length,
    superusers: users.filter((user) => !user.is_deleted && user.is_superuser).length,
    locked: users.filter((user) => !user.is_deleted && isLocked(user)).length,
    deleted: users.filter((user) => user.is_deleted).length
  };
}

async function listUsers(token: string, params: { search?: string; status?: string; roleId?: string; includeDeleted?: boolean }) {
  return apiRequest<AdminUser[]>(
    `/users${queryString({
      search: params.search,
      status: params.status,
      role_id: params.roleId,
      include_deleted: params.includeDeleted,
      skip: 0,
      limit: 100
    })}`,
    { token }
  );
}

async function listRoles(token: string) {
  return apiRequest<AdminRole[]>("/roles", { token });
}

async function createUser(token: string, payload: Record<string, unknown>) {
  return apiRequest<AdminUser>("/users", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

async function updateUser(token: string, userId: string, payload: Record<string, unknown>) {
  return apiRequest<AdminUser>(`/users/${userId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
}

async function updateUserPassword(token: string, userId: string, password: string) {
  return apiRequest<Record<string, unknown>>(`/users/${userId}/password`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ password })
  });
}

async function deleteUser(token: string, userId: string) {
  return apiRequest<Record<string, unknown>>(`/users/${userId}`, {
    method: "DELETE",
    token
  });
}

async function restoreUser(token: string, userId: string) {
  return apiRequest<AdminUser>(`/users/${userId}/restore`, {
    method: "PATCH",
    token
  });
}

async function unlockUser(token: string, userId: string) {
  return apiRequest<AdminUser>(`/users/${userId}/unlock`, {
    method: "PATCH",
    token
  });
}

async function ensureDefaultRoles(token: string) {
  return apiRequest<AdminRole[]>("/roles/ensure-defaults", {
    method: "POST",
    token
  });
}

export function AdminUsersPage({ locale }: AdminUsersPageProps) {
  const labels = useMemo(() => getLabels(locale), [locale]);
  const { tokens, user: currentUser } = useAdminAuth();
  const queryClient = useQueryClient();
  const token = tokens?.access_token ?? "";

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [roleId, setRoleId] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [form, setForm] = useState<UserFormState | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({ type: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users", search, status, roleId, includeDeleted],
    queryFn: () => listUsers(token, { search, status, roleId, includeDeleted }),
    enabled: Boolean(token)
  });

  const rolesQuery = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => listRoles(token),
    enabled: Boolean(token)
  });

  const users = usersQuery.data ?? [];
  const roles = rolesQuery.data ?? [];
  const roleMap = new Map(roles.map((role) => [role.id, role]));
  const stats = buildStats(users);

  const showSuccess = (message: string) => setFeedback({ tone: "success", message });
  const showError = (error: unknown) => setFeedback({ tone: "danger", message: error instanceof Error ? error.message : labels.unknownError });

  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const openCreate = () => {
    setFeedback(null);
    setSelectedUser(null);
    setForm({ ...emptyForm, role_id: roles[0]?.id ?? "" });
  };

  const openEdit = (user: AdminUser) => {
    setFeedback(null);
    setSelectedUser(null);
    setForm({
      id: user.id,
      full_name: user.full_name ?? "",
      username: user.username ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      password: "",
      role_id: user.role_id ?? "",
      status: (user.status as UserFormState["status"]) ?? "active",
      is_superuser: Boolean(user.is_superuser)
    });
  };

  const closeForm = () => {
    setForm(null);
    setIsSubmitting(false);
  };

  const setFormValue = (key: keyof UserFormState, value: string | boolean) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSave = async () => {
    if (!form) {
      return;
    }

    const passwordValue = form.password.trim();
    const hasInvalidRequiredFields =
      !form.full_name.trim() ||
      !form.username.trim() ||
      !form.role_id ||
      (!form.id && passwordValue.length < 8) ||
      (Boolean(form.id) && passwordValue.length > 0 && passwordValue.length < 8);

    if (hasInvalidRequiredFields) {
      showError(new Error(labels.formValidationError));
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (form.id) {
        await updateUser(token, form.id, {
          full_name: form.full_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          role_id: form.role_id || null,
          status: form.status
        });

        if (passwordValue) {
          await updateUserPassword(token, form.id, passwordValue);
        }
      } else {
        await createUser(token, {
          full_name: form.full_name.trim(),
          username: form.username.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          password: passwordValue,
          role_id: form.role_id,
          status: form.status,
          is_superuser: form.is_superuser
        });
      }

      await invalidateUsers();
      closeForm();
      showSuccess(labels.saved);
    } catch (error) {
      showError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnsureRoles = async () => {
    setFeedback(null);
    try {
      await ensureDefaultRoles(token);
      await queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      showSuccess(labels.rolesReady);
    } catch (error) {
      showError(error);
    }
  };

  const handleConfirm = async () => {
    if (!confirm.type || !confirm.user?.id) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (confirm.type === "delete") {
        await deleteUser(token, confirm.user.id);
        showSuccess(labels.deletedDone);
      }
      if (confirm.type === "restore") {
        await restoreUser(token, confirm.user.id);
        showSuccess(labels.restoredDone);
      }
      if (confirm.type === "unlock") {
        await unlockUser(token, confirm.user.id);
        showSuccess(labels.unlockedDone);
      }

      await invalidateUsers();
      setConfirm({ type: null });
    } catch (error) {
      showError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmTitle =
    confirm.type === "delete" ? labels.confirmDeleteTitle : confirm.type === "restore" ? labels.confirmRestoreTitle : labels.confirmUnlockTitle;
  const confirmDescription =
    confirm.type === "delete"
      ? labels.confirmDeleteDescription
      : confirm.type === "restore"
        ? labels.confirmRestoreDescription
        : labels.confirmUnlockDescription;

  return (
    <div className="grid gap-6">
      <AppPageHeader title={labels.title} description={labels.description} />

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title={labels.total} value={stats.total} />
        <StatCard title={labels.activeUsers} value={stats.active} tone="success" />
        <StatCard title={labels.superusers} value={stats.superusers} tone="primary" />
        <StatCard title={labels.lockedUsers} value={stats.locked} tone="warning" />
        <StatCard title={labels.deletedUsers} value={stats.deleted} tone="danger" />
      </div>

      <AppCard className="grid gap-4 p-5">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr_0.7fr_auto] lg:items-end">
          <AppInput
            label={labels.search}
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <AppSelect label={labels.status} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">{labels.allStatuses}</option>
            <option value="active">{labels.active}</option>
            <option value="inactive">{labels.inactive}</option>
            <option value="suspended">{labels.suspended}</option>
          </AppSelect>
          <AppSelect label={labels.role} value={roleId} onChange={(event) => setRoleId(event.target.value)}>
            <option value="">{labels.allRoles}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {roleLabel(role, locale)}
              </option>
            ))}
          </AppSelect>
          <label className="flex min-h-11 items-center justify-between gap-3 rounded-appMd border border-app-border bg-app-surface px-4 py-3 text-sm font-semibold text-app-foreground">
            <span>{labels.includeDeleted}</span>
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(event) => setIncludeDeleted(event.target.checked)}
              className="size-5 accent-current"
            />
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <AppButton variant="secondary" onClick={() => usersQuery.refetch()}>
            {labels.refresh}
          </AppButton>
          <AppButton variant="secondary" onClick={handleEnsureRoles}>
            {labels.ensureRoles}
          </AppButton>
          <AppButton onClick={openCreate}>{labels.create}</AppButton>
        </div>

        {feedback ? <AppBadge tone={feedback.tone === "success" ? "success" : "danger"}>{feedback.message}</AppBadge> : null}
      </AppCard>

      <AppCard className="p-5">
        {usersQuery.isLoading || rolesQuery.isLoading ? <AppLoadingState text={labels.loading} /> : null}
        {usersQuery.isError ? <AppErrorState title={labels.errorTitle} description={String(usersQuery.error)} /> : null}
        {rolesQuery.isError ? <AppErrorState title={labels.errorTitle} description={String(rolesQuery.error)} /> : null}
        {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? (
          <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} />
        ) : null}
        {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? (
          <AppTable
            rows={users}
            getRowKey={(row) => String(row.id)}
            columns={[
              {
                key: "user",
                header: labels.fullName,
                render: (row) => (
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{valueToText(row.full_name)}</span>
                      {row.id === currentUser?.id ? <AppBadge tone="primary">{labels.currentAccount}</AppBadge> : null}
                      {row.is_superuser ? <AppBadge tone="primary">{labels.superuser}</AppBadge> : null}
                    </div>
                    <span className="text-xs text-app-muted">@{valueToText(row.username)}</span>
                  </div>
                )
              },
              {
                key: "contact",
                header: labels.email,
                render: (row) => (
                  <div className="grid gap-1 text-sm">
                    <span>{valueToText(row.email)}</span>
                    <span className="text-xs text-app-muted">{valueToText(row.phone)}</span>
                  </div>
                )
              },
              {
                key: "role",
                header: labels.role,
                render: (row) => <span>{roleLabel(row.role ?? roleMap.get(row.role_id), locale)}</span>
              },
              {
                key: "status",
                header: labels.status,
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    <AppBadge tone={statusTone(row)}>{row.is_deleted ? labels.deleted : isLocked(row) ? labels.locked : statusLabel(row.status, labels)}</AppBadge>
                    {(row.failed_login_count ?? 0) > 0 ? <AppBadge tone="warning">{labels.failedAttempts}: {row.failed_login_count}</AppBadge> : null}
                  </div>
                )
              },
              {
                key: "last_login",
                header: labels.lastLogin,
                render: (row) => <span className="text-sm text-app-muted">{formatDate(row.last_login_at, locale, labels.never)}</span>
              },
              {
                key: "actions",
                header: labels.actions,
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => setSelectedUser(row)}>
                      {labels.details}
                    </AppButton>
                    {!row.is_deleted ? (
                      <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => openEdit(row)}>
                        {labels.edit}
                      </AppButton>
                    ) : null}
                    {!row.is_deleted && isLocked(row) ? (
                      <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => setConfirm({ type: "unlock", user: row })}>
                        {labels.unlock}
                      </AppButton>
                    ) : null}
                    {row.is_deleted ? (
                      <AppButton variant="secondary" className="min-h-9 px-3" onClick={() => setConfirm({ type: "restore", user: row })}>
                        {labels.restore}
                      </AppButton>
                    ) : (
                      <AppButton variant="danger" className="min-h-9 px-3" onClick={() => setConfirm({ type: "delete", user: row })}>
                        {labels.delete}
                      </AppButton>
                    )}
                  </div>
                )
              }
            ]}
          />
        ) : null}
      </AppCard>

      <AppModal open={Boolean(form)} title={form?.id ? labels.edit : labels.create} onClose={closeForm} size="lg">
        {form ? (
          <div className="grid gap-5">
            <p className="text-sm text-app-muted">{labels.formDescription}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <AppInput label={labels.fullName} value={form.full_name} onChange={(event) => setFormValue("full_name", event.target.value)} required />
              <AppInput
                label={labels.username}
                value={form.username}
                onChange={(event) => setFormValue("username", event.target.value)}
                disabled={Boolean(form.id)}
                required
              />
              <AppInput label={labels.email} type="email" value={form.email} onChange={(event) => setFormValue("email", event.target.value)} />
              <AppInput label={labels.phone} value={form.phone} onChange={(event) => setFormValue("phone", event.target.value)} />
              <AppSelect label={labels.role} value={form.role_id} onChange={(event) => setFormValue("role_id", event.target.value)} required>
                <option value="">—</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {roleLabel(role, locale)}
                  </option>
                ))}
              </AppSelect>
              <AppSelect label={labels.status} value={form.status} onChange={(event) => setFormValue("status", event.target.value)} disabled={!form.id}>
                <option value="active">{labels.active}</option>
                <option value="inactive">{labels.inactive}</option>
                <option value="suspended">{labels.suspended}</option>
              </AppSelect>
              <AppInput
                label={form.id ? labels.newPassword : labels.password}
                type="password"
                value={form.password}
                onChange={(event) => setFormValue("password", event.target.value)}
                required={!form.id}
              />
              <label className="grid gap-2 rounded-appMd border border-app-border bg-app-surface px-4 py-3">
                <span className="text-sm font-medium text-app-foreground">{labels.accountType}</span>
                <div className="flex min-h-8 items-center justify-between gap-3">
                  <span className="text-sm text-app-muted">{form.is_superuser ? labels.superuser : labels.normalUser}</span>
                  <input
                    type="checkbox"
                    checked={form.is_superuser}
                    disabled={Boolean(form.id)}
                    onChange={(event) => setFormValue("is_superuser", event.target.checked)}
                    className="size-5 accent-current"
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-2 rounded-appMd border border-app-border bg-app-surfaceElevated/60 p-4 text-sm text-app-muted">
              <p>{labels.roleHint}</p>
              <p>{labels.passwordHint}</p>
            </div>

            <div className="flex justify-end gap-3">
              <AppButton variant="secondary" onClick={closeForm}>
                {labels.cancel}
              </AppButton>
              <AppButton disabled={isSubmitting} onClick={handleSave}>
                {isSubmitting ? labels.saving : labels.save}
              </AppButton>
            </div>
          </div>
        ) : null}
      </AppModal>

      <AppModal open={Boolean(selectedUser)} title={labels.details} onClose={() => setSelectedUser(null)} size="lg">
        {selectedUser ? <UserDetails user={selectedUser} roles={roles} labels={labels} locale={locale} /> : null}
      </AppModal>

      <AppConfirmDialog
        open={Boolean(confirm.type)}
        title={confirmTitle}
        description={confirmDescription}
        confirmText={labels.confirm}
        cancelText={labels.cancel}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ type: null })}
      />
    </div>
  );
}

function StatCard({ title, value, tone = "neutral" }: { title: string; value: number; tone?: BadgeTone }) {
  return (
    <AppCard className="grid gap-2 p-5">
      <span className="text-sm text-app-muted">{title}</span>
      <div className="flex items-center justify-between gap-3">
        <strong className="text-3xl font-extrabold text-app-foreground">{value}</strong>
        <AppBadge tone={tone}>{title}</AppBadge>
      </div>
    </AppCard>
  );
}

function UserDetails({ user, roles, labels, locale }: { user: AdminUser; roles: AdminRole[]; labels: Labels; locale: Locale }) {
  const role = user.role ?? roles.find((item) => item.id === user.role_id);

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 rounded-appLg border border-app-border bg-app-surfaceElevated/60 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-bold text-app-foreground">{valueToText(user.full_name)}</h3>
          {user.is_superuser ? <AppBadge tone="primary">{labels.superuser}</AppBadge> : null}
          <AppBadge tone={statusTone(user)}>{user.is_deleted ? labels.deleted : isLocked(user) ? labels.locked : statusLabel(user.status, labels)}</AppBadge>
        </div>
        <span className="text-sm text-app-muted">@{valueToText(user.username)}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <DetailItem label={labels.email} value={valueToText(user.email)} />
        <DetailItem label={labels.phone} value={valueToText(user.phone)} />
        <DetailItem label={labels.role} value={roleLabel(role, locale)} />
        <DetailItem label={labels.accountType} value={user.is_superuser ? labels.superuser : labels.normalUser} />
        <DetailItem label={labels.lastLogin} value={formatDate(user.last_login_at, locale, labels.never)} />
        <DetailItem label={labels.createdAt} value={formatDate(user.created_at, locale, labels.notAvailable)} />
        <DetailItem label={labels.failedAttempts} value={String(user.failed_login_count ?? 0)} />
        <DetailItem label={labels.locked} value={user.locked_until ? formatDate(user.locked_until, locale, labels.notAvailable) : labels.no} />
      </div>

      <div className="grid gap-2 rounded-appLg border border-app-border bg-app-surface p-4">
        <h4 className="font-bold text-app-foreground">{labels.permissions}</h4>
        {role?.permissions?.length ? (
          <div className="flex flex-wrap gap-2">
            {role.permissions.map((permission) => (
              <AppBadge key={permission} tone="neutral">
                {permission}
              </AppBadge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-app-muted">{labels.noPermissions}</p>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-appMd border border-app-border bg-app-surface px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">{label}</span>
      <span className="text-sm font-semibold text-app-foreground">{value}</span>
    </div>
  );
}

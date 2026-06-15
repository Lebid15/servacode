"use client";

/**
 * =====================================================
 * AdminProfilePage
 * صفحة حساب المستخدم الحالي: بيانات شخصية، صورة، تفضيلات، وأمان الحساب.
 * =====================================================
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  changeCurrentUserPassword,
  updateCurrentUserProfile,
  type AuthUser
} from "@/shared/api/auth-client";
import { buildBackendAssetUrl } from "@/shared/api/api-client";
import { AdminMediaPicker, type MediaPickerLabels } from "@/shared/admin/components/AdminMediaPicker";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { useTheme, type ThemeName } from "@/shared/design-system/themes/theme-provider";
import type { Locale } from "@/shared/design-system/utils/direction";

const themeOptions: ThemeName[] = ["blue-tech", "emerald-luxury"];

type ProfileFormState = {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type AdminProfilePageProps = {
  locale: Locale;
};

function getLabels(locale: Locale) {
  const ar = locale === "ar";

  return {
    title: ar ? "الملف الشخصي" : "Profile",
    description: ar
      ? "إدارة بيانات حسابك الشخصي داخل لوحة الأدمن، الصورة، التفضيلات، وكلمة المرور."
      : "Manage your admin account details, avatar, preferences, and password.",
    account: ar ? "بيانات الحساب" : "Account details",
    accountDescription: ar
      ? "هذه البيانات تخص المستخدم المسجل دخوله فقط ولا تغيّر هوية المنصة العامة."
      : "These details belong only to the signed-in user and do not change the platform identity.",
    avatar: ar ? "الصورة الشخصية" : "Profile photo",
    avatarDescription: ar
      ? "اختر صورة شخصية من مكتبة الوسائط أو اتركها فارغة ليظهر أول حرف من اسمك."
      : "Choose an avatar from the media library or keep it empty to show your initials.",
    chooseAvatar: ar ? "اختيار صورة" : "Choose image",
    removeAvatar: ar ? "إزالة الصورة" : "Remove image",
    fullName: ar ? "الاسم الكامل" : "Full name",
    username: ar ? "اسم المستخدم" : "Username",
    email: ar ? "البريد الإلكتروني" : "Email",
    phone: ar ? "الهاتف" : "Phone",
    role: ar ? "الدور" : "Role",
    status: ar ? "الحالة" : "Status",
    user: ar ? "المستخدم" : "User",
    active: ar ? "نشط" : "Active",
    superAdmin: ar ? "مدير منصة" : "Super admin",
    adminUser: ar ? "مستخدم إداري" : "Admin user",
    saveProfile: ar ? "حفظ البيانات" : "Save profile",
    saving: ar ? "جارٍ الحفظ..." : "Saving...",
    saved: ar ? "تم حفظ بيانات الحساب بنجاح." : "Profile saved successfully.",
    password: ar ? "الأمان وكلمة المرور" : "Security & password",
    passwordDescription: ar
      ? "غيّر كلمة مرور حسابك دوريًا. استخدم كلمة قوية لا تقل عن 8 أحرف."
      : "Change your account password regularly. Use a strong password of at least 8 characters.",
    currentPassword: ar ? "كلمة المرور الحالية" : "Current password",
    newPassword: ar ? "كلمة المرور الجديدة" : "New password",
    confirmPassword: ar ? "تأكيد كلمة المرور" : "Confirm password",
    changePassword: ar ? "تغيير كلمة المرور" : "Change password",
    passwordChanged: ar ? "تم تغيير كلمة المرور بنجاح." : "Password changed successfully.",
    passwordsMismatch: ar ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.",
    passwordTooShort: ar ? "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل." : "New password must be at least 8 characters.",
    preferences: ar ? "التفضيلات الشخصية" : "Personal preferences",
    preferencesDescription: ar
      ? "هذه التفضيلات تخص تجربتك أنت فقط داخل لوحة الأدمن."
      : "These preferences affect only your own admin panel experience.",
    language: ar ? "اللغة" : "Language",
    theme: ar ? "الثيم" : "Theme",
    arabic: ar ? "العربية" : "Arabic",
    english: ar ? "الإنجليزية" : "English",
    blueTech: ar ? "الأزرق التقني" : "Blue Tech",
    emeraldLuxury: ar ? "الزمردي الفاخر" : "Emerald Luxury",
    languageHint: ar ? "سيتم فتح نفس الصفحة باللغة المختارة." : "The same page will open in the selected language.",
    readonly: ar ? "للقراءة فقط" : "Read-only",
    showPassword: ar ? "إظهار كلمة المرور" : "Show password",
    hidePassword: ar ? "إخفاء كلمة المرور" : "Hide password",
    unknownError: ar ? "حدث خطأ غير معروف." : "An unknown error occurred.",
    mediaPickerTitle: ar ? "اختيار الصورة الشخصية" : "Choose profile photo",
    mediaPickerDescription: ar ? "اختر صورة من مكتبة الوسائط أو ارفع صورة جديدة." : "Choose an image from the media library or upload a new one.",
    mediaPickerSearch: ar ? "بحث في الصور" : "Search images",
    mediaPickerEmptyTitle: ar ? "لا توجد صور" : "No images found",
    mediaPickerEmptyDescription: ar ? "ارفع صورة جديدة أو غيّر عبارة البحث." : "Upload a new image or change your search.",
    uploadFromDevice: ar ? "رفع من الجهاز" : "Upload from device",
    chooseFile: ar ? "اختيار ملف" : "Choose file",
    noFileSelected: ar ? "لم يتم اختيار ملف" : "No file selected",
    upload: ar ? "رفع" : "Upload",
    select: ar ? "اختيار" : "Select",
    open: ar ? "فتح" : "Open",
    refresh: ar ? "تحديث" : "Refresh",
    error: ar ? "تعذر تحميل الوسائط" : "Could not load media",
    loading: ar ? "جارٍ تحميل الوسائط..." : "Loading media..."
  };
}

function roleLabel(user: AuthUser | null, locale: Locale) {
  if (!user?.role) {
    return user?.is_superuser ? (locale === "ar" ? "مدير منصة" : "Super admin") : "—";
  }

  return locale === "ar" ? user.role.display_name_ar ?? user.role.name : user.role.display_name_en ?? user.role.name;
}

function getInitials(user: AuthUser | null) {
  const value = user?.full_name || user?.username || "A";
  return value.trim().slice(0, 1).toUpperCase();
}

function normalizeProfileForm(user: AuthUser | null): ProfileFormState {
  return {
    fullName: user?.full_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    avatarUrl: user?.avatar_url ?? ""
  };
}

function PasswordVisibilityButton({ visible, label, onClick }: { visible: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="grid size-8 place-items-center rounded-full text-app-muted transition hover:bg-app-surfaceElevated hover:text-app-primary"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <AppIcon name={visible ? "eyeOff" : "eye"} size={17} />
    </button>
  );
}

export function AdminProfilePage({ locale }: AdminProfilePageProps) {
  const router = useRouter();
  const { user, tokens, updateUser } = useAdminAuth();
  const { theme, setTheme } = useTheme();
  const labels = useMemo(() => getLabels(locale), [locale]);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => normalizeProfileForm(user));
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setProfileForm(normalizeProfileForm(user));
  }, [user]);

  const mediaLabels: MediaPickerLabels = useMemo(
    () => ({
      mediaPickerTitle: labels.mediaPickerTitle,
      mediaPickerDescription: labels.mediaPickerDescription,
      mediaPickerSearch: labels.mediaPickerSearch,
      mediaPickerEmptyTitle: labels.mediaPickerEmptyTitle,
      mediaPickerEmptyDescription: labels.mediaPickerEmptyDescription,
      uploadFromDevice: labels.uploadFromDevice,
      chooseFile: labels.chooseFile,
      noFileSelected: labels.noFileSelected,
      upload: labels.upload,
      select: labels.select,
      open: labels.open,
      refresh: labels.refresh,
      error: labels.error,
      loading: labels.loading
    }),
    [labels]
  );

  const avatarPreviewUrl = profileForm.avatarUrl ? buildBackendAssetUrl(profileForm.avatarUrl) : "";

  const switchLanguage = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    router.push(`/${nextLocale}/admin/profile`);
  };

  const saveProfile = async () => {
    if (!tokens?.access_token || !user) {
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      const updatedUser = await updateCurrentUserProfile(tokens.access_token, {
        full_name: profileForm.fullName.trim(),
        email: profileForm.email.trim() || null,
        phone: profileForm.phone.trim() || null,
        avatar_url: profileForm.avatarUrl.trim() || null,
        preferred_locale: locale,
        preferred_theme: theme
      });

      updateUser(updatedUser);
      setProfileMessage(labels.saved);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : labels.unknownError);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!tokens?.access_token) {
      return;
    }

    setPasswordMessage(null);
    setPasswordError(null);

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(labels.passwordTooShort);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(labels.passwordsMismatch);
      return;
    }

    setIsChangingPassword(true);

    try {
      await changeCurrentUserPassword(tokens.access_token, {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage(labels.passwordChanged);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : labels.unknownError);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="grid gap-5">
      <AppPageHeader
        eyebrow={labels.account}
        title={labels.title}
        description={labels.description}
        actions={
          <AppButton
            onClick={saveProfile}
            disabled={isSavingProfile || !profileForm.fullName.trim()}
            icon={<AppIcon name={isSavingProfile ? "loader" : "save"} size={17} className={isSavingProfile ? "animate-spin" : undefined} />}
          >
            {isSavingProfile ? labels.saving : labels.saveProfile}
          </AppButton>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
        <AppCard className="grid content-start gap-5 p-5">
          <div className="grid justify-items-center gap-4 text-center">
            <div className="relative grid size-32 place-items-center overflow-hidden rounded-full border border-app-primary/35 bg-app-primary/12 text-4xl font-black text-app-primary shadow-appGlow">
              {avatarPreviewUrl ? (
                <span
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${avatarPreviewUrl})` }}
                  aria-label={labels.avatar}
                />
              ) : (
                <span>{getInitials(user)}</span>
              )}
            </div>
            <div className="grid gap-1">
              <h2 className="text-xl font-black text-app-foreground">{user?.full_name ?? user?.username ?? labels.user}</h2>
              <p className="text-sm text-app-muted">@{user?.username ?? labels.username}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <AppBadge tone={user?.is_superuser ? "primary" : "neutral"}>{user?.is_superuser ? labels.superAdmin : labels.adminUser}</AppBadge>
              <AppBadge tone="success">{labels.active}</AppBadge>
            </div>
          </div>

          <div className="grid gap-3 rounded-app2xl border border-app-border bg-app-surface/70 p-4">
            <p className="text-sm font-black text-app-foreground">{labels.avatar}</p>
            <p className="text-sm leading-6 text-app-muted">{labels.avatarDescription}</p>
            <div className="flex flex-wrap gap-2">
              <AppButton variant="secondary" onClick={() => setMediaPickerOpen(true)} icon={<AppIcon name="media" size={17} />}>
                {labels.chooseAvatar}
              </AppButton>
              {profileForm.avatarUrl ? (
                <AppButton variant="ghost" onClick={() => setProfileForm((current) => ({ ...current, avatarUrl: "" }))} icon={<AppIcon name="trash" size={17} />}>
                  {labels.removeAvatar}
                </AppButton>
              ) : null}
            </div>
          </div>
        </AppCard>

        <div className="grid gap-5">
          <AppCard className="grid gap-5 p-5">
            <div className="grid gap-1">
              <h2 className="text-lg font-black text-app-foreground">{labels.account}</h2>
              <p className="text-sm leading-6 text-app-muted">{labels.accountDescription}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AppInput label={labels.fullName} value={profileForm.fullName} onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))} />
              <AppInput label={labels.username} value={user?.username ?? ""} disabled startIcon={<AppIcon name="user" size={16} />} />
              <AppInput label={labels.email} value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} />
              <AppInput label={labels.phone} value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} />
              <AppInput label={labels.role} value={roleLabel(user, locale)} disabled startIcon={<AppIcon name="roles" size={16} />} />
              <AppInput label={labels.status} value={user?.status ?? labels.active} disabled startIcon={<AppIcon name="check" size={16} />} />
            </div>

            {profileMessage ? <p className="rounded-appLg border border-app-success/25 bg-app-success/10 p-3 text-sm font-bold text-app-success">{profileMessage}</p> : null}
            {profileError ? <p className="rounded-appLg border border-app-danger/25 bg-app-danger/10 p-3 text-sm font-bold text-app-danger">{profileError}</p> : null}
          </AppCard>

          <AppCard className="grid gap-5 p-5">
            <div className="grid gap-1">
              <h2 className="text-lg font-black text-app-foreground">{labels.preferences}</h2>
              <p className="text-sm leading-6 text-app-muted">{labels.preferencesDescription}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AppSelect label={labels.language} value={locale} onChange={(event) => switchLanguage(event.target.value as Locale)}>
                <option value="ar">{labels.arabic}</option>
                <option value="en">{labels.english}</option>
              </AppSelect>
              <AppSelect label={labels.theme} value={theme} onChange={(event) => setTheme(event.target.value as ThemeName)}>
                {themeOptions.map((themeName) => (
                  <option key={themeName} value={themeName}>
                    {themeName === "blue-tech" ? labels.blueTech : labels.emeraldLuxury}
                  </option>
                ))}
              </AppSelect>
            </div>
            <p className="text-xs leading-6 text-app-muted">{labels.languageHint}</p>
          </AppCard>

          <AppCard className="grid gap-5 p-5">
            <div className="grid gap-1">
              <h2 className="text-lg font-black text-app-foreground">{labels.password}</h2>
              <p className="text-sm leading-6 text-app-muted">{labels.passwordDescription}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <AppInput
                type={showCurrentPassword ? "text" : "password"}
                label={labels.currentPassword}
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                startIcon={<AppIcon name="lock" size={16} />}
                endAction={<PasswordVisibilityButton visible={showCurrentPassword} label={showCurrentPassword ? labels.hidePassword : labels.showPassword} onClick={() => setShowCurrentPassword((value) => !value)} />}
              />
              <AppInput
                type={showNewPassword ? "text" : "password"}
                label={labels.newPassword}
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                startIcon={<AppIcon name="lock" size={16} />}
                endAction={<PasswordVisibilityButton visible={showNewPassword} label={showNewPassword ? labels.hidePassword : labels.showPassword} onClick={() => setShowNewPassword((value) => !value)} />}
              />
              <AppInput
                type={showConfirmPassword ? "text" : "password"}
                label={labels.confirmPassword}
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                startIcon={<AppIcon name="lock" size={16} />}
                endAction={<PasswordVisibilityButton visible={showConfirmPassword} label={showConfirmPassword ? labels.hidePassword : labels.showPassword} onClick={() => setShowConfirmPassword((value) => !value)} />}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <AppButton
                variant="secondary"
                onClick={changePassword}
                disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                icon={<AppIcon name={isChangingPassword ? "loader" : "lock"} size={17} className={isChangingPassword ? "animate-spin" : undefined} />}
              >
                {isChangingPassword ? labels.saving : labels.changePassword}
              </AppButton>
              {passwordMessage ? <span className="text-sm font-bold text-app-success">{passwordMessage}</span> : null}
              {passwordError ? <span className="text-sm font-bold text-app-danger">{passwordError}</span> : null}
            </div>
          </AppCard>
        </div>
      </div>

      {tokens?.access_token ? (
        <AdminMediaPicker
          open={mediaPickerOpen}
          token={tokens.access_token}
          labels={mediaLabels}
          imagesOnly
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(url) => setProfileForm((current) => ({ ...current, avatarUrl: url }))}
        />
      ) : null}
    </div>
  );
}

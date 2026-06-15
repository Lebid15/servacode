#!/usr/bin/env node
/**
 * Admin Panel Release Check
 * فحص خفيف لإغلاق لوحة الأدمن بدون الحاجة إلى node_modules أو build.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "src");
const failures = [];
const warnings = [];

function p(file) {
  return path.join(root, file);
}

function exists(file) {
  return fs.existsSync(p(file));
}

function read(file) {
  return fs.readFileSync(p(file), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
      walk(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

const requiredFiles = [
  "src/shared/api/api-client.ts",
  "src/shared/api/admin-client.ts",
  "src/shared/api/auth-client.ts",
  "src/shared/auth/AdminAuthGuard.tsx",
  "src/shared/auth/AdminAuthProvider.tsx",
  "src/shared/design-system/layout/AdminShell.tsx",
  "src/shared/design-system/layout/Sidebar.tsx",
  "src/shared/design-system/layout/Topbar.tsx",
  "src/shared/admin/components/AdminDashboardLive.tsx",
  "src/shared/admin/components/AdminContentManagementPage.tsx",
  "src/shared/admin/components/AdminCustomersOverviewPage.tsx",
  "src/shared/admin/components/AdminCommunicationOverviewPage.tsx",
  "src/shared/admin/components/AdminAdministrationOverviewPage.tsx",
  "src/shared/admin/components/AdminServicesPage.tsx",
  "src/shared/admin/components/AdminProductsPage.tsx",
  "src/shared/admin/components/AdminAppsPage.tsx",
  "src/shared/admin/components/AdminPortfolioPage.tsx",
  "src/shared/admin/components/AdminUsersPage.tsx",
  "src/shared/admin/components/AdminSettingsPage.tsx",
  "src/shared/admin/components/AdminSettingsOverviewPage.tsx",
  "src/app/[locale]/admin/(protected)/settings/page.tsx",
  "src/app/[locale]/admin/reset-password/page.tsx",
  "src/app/[locale]/admin/reset-password/AdminResetPasswordPage.tsx",
  "src/shared/admin/components/AdminProfilePage.tsx",
  "src/shared/admin/components/AdminMediaLibraryPage.tsx",
  "src/shared/admin/components/AdminRolesPage.tsx",
];

for (const file of requiredFiles) {
  assert(exists(file), `Missing required admin file: ${file}`);
}

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts?.quality?.includes("type-check"), "package.json quality script must include type-check.");
assert(packageJson.scripts?.quality?.includes("lint"), "package.json quality script must include lint.");
assert(Boolean(packageJson.scripts?.build), "package.json must expose build script.");
assert(Boolean(packageJson.scripts?.["release-check"]), "package.json must expose release-check script.");

const apiClient = read("src/shared/api/api-client.ts");
assert(apiClient.includes("ApiClientError"), "API client must throw ApiClientError for unified error handling.");
assert(apiClient.includes("options.body instanceof FormData"), "API client must detect FormData uploads.");
assert(apiClient.includes("!isFormData"), "API client must not force JSON Content-Type for FormData uploads.");
assert(apiClient.includes("PUBLIC_SITE_BASE_URL"), "API client must centralize public site preview URL.");
assert(apiClient.includes("buildPublicSiteUrl"), "API client must expose buildPublicSiteUrl for previews.");

const adminClient = read("src/shared/api/admin-client.ts");
assert(adminClient.includes("applyBilingualFallbacks"), "Admin client must apply bilingual fallbacks before save.");
assert(adminClient.includes("preparePayloadBeforeSave"), "Admin client must prepare payload before create/update.");
assert(adminClient.includes("translateAdminContent"), "Admin client must route auto-translation through one function.");
assert(adminClient.includes("NEXT_PUBLIC_ADMIN_AUTO_TRANSLATE"), "Admin auto-translate toggle must be configurable.");
assert(adminClient.includes("/admin/translation/bulk"), "Admin translation bulk endpoint must be used.");
assert(adminClient.includes("/admin/settings-overview"), "Admin client must expose settings overview endpoint.");

const authProvider = read("src/shared/auth/AdminAuthProvider.tsx");
assert(authProvider.includes("localStorage"), "Admin auth provider should clearly own localStorage token usage until cookie migration.");
assert(authProvider.includes("getCurrentUser"), "Admin auth provider must validate current user through API.");
const authClient = read("src/shared/api/auth-client.ts");
assert(authClient.includes("remember_me"), "Auth client must support remember me login payload.");
assert(authClient.includes("/auth/forgot-password"), "Auth client must support forgot password endpoint.");
assert(authClient.includes("/auth/reset-password"), "Auth client must support reset password endpoint.");
const loginPage = read("src/app/[locale]/admin/login/AdminLoginPage.tsx");
assert(loginPage.includes("rememberMe"), "Admin login page must show remember me option.");
assert(loginPage.includes("requestPasswordReset"), "Admin login page must support forgot password request.");
const resetPasswordPage = read("src/app/[locale]/admin/reset-password/AdminResetPasswordPage.tsx");
assert(resetPasswordPage.includes("resetPassword"), "Admin reset password page must call resetPassword API.");

const previewFiles = [
  "src/shared/admin/components/AdminServicesPage.tsx",
  "src/shared/admin/components/AdminProductsPage.tsx",
  "src/shared/admin/components/AdminAppsPage.tsx",
  "src/shared/admin/components/AdminPortfolioPage.tsx",
];
for (const file of previewFiles) {
  const text = read(file);
  assert(text.includes("buildPublicSiteUrl"), `${file} must build preview links using buildPublicSiteUrl.`);
}

const formFiles = [
  "src/shared/admin/components/AdminServicesPage.tsx",
  "src/shared/admin/components/AdminProductsPage.tsx",
  "src/shared/admin/components/AdminAppsPage.tsx",
  "src/shared/admin/components/AdminPortfolioPage.tsx",
  "src/shared/admin/components/AdminUsersPage.tsx",
];
for (const file of formFiles) {
  const text = read(file);
  assert(/create(Admin)?Item|createUser|createAdminItem/.test(text), `${file} must create records through admin API client.`);
  assert(/update(Admin)?Item|updateUser|updateAdminItem/.test(text), `${file} must update records through admin API client.`);
}

for (const localeFile of ["src/shared/design-system/i18n/ar.json", "src/shared/design-system/i18n/en.json"]) {
  try {
    const json = JSON.parse(read(localeFile));
    assert(Boolean(json.admin), `${localeFile} missing admin dictionary.`);
    assert(Boolean(json.auth), `${localeFile} missing auth dictionary.`);
  } catch (error) {
    failures.push(`${localeFile} is not valid JSON: ${error.message}`);
  }
}

const allCode = walk(src).filter((file) => /\.(ts|tsx)$/.test(file));
for (const file of allCode) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  const text = fs.readFileSync(file, "utf8");
  warn(!text.includes("console.log("), `console.log found in ${rel}`);
  if (!rel.startsWith("src/shared/api/")) {
    assert(!/\bfetch\s*\(/.test(text), `Raw fetch call found outside shared API client: ${rel}`);
  }
  if (text.includes("dangerouslySetInnerHTML")) {
    assert(rel === "src/app/layout.tsx" && text.includes("localeBootstrapScript"), `dangerouslySetInnerHTML found in ${rel}; review before release.`);
  }
}


const contentPage = read("src/app/[locale]/admin/(protected)/content/page.tsx");
assert(contentPage.includes("AdminContentManagementPage"), "Content page must render the content management center instead of redirecting.");
const contentComponent = read("src/shared/admin/components/AdminContentManagementPage.tsx");
assert(contentComponent.includes("getAdminContentOverview"), "Content management center must read the backend content overview endpoint.");
assert(contentComponent.includes("manual_entry_required"), "Content management center must distinguish manual content from seeded content.");

const customersPage = read("src/app/[locale]/admin/(protected)/customers/page.tsx");
assert(customersPage.includes("AdminCustomersOverviewPage"), "Customers page must render the requests/customers overview instead of redirecting.");
const customersComponent = read("src/shared/admin/components/AdminCustomersOverviewPage.tsx");
assert(customersComponent.includes("getAdminCustomersOverview"), "Customers overview must read the backend customers overview endpoint.");
assert(customersComponent.includes("due_followups"), "Customers overview must include follow-up schedule coverage.");
assert(customersComponent.includes("latest_items"), "Customers overview must include latest incoming customer items.");
const customerTabs = read("src/shared/admin/components/AdminCustomerTabs.tsx");
assert(customerTabs.includes('key: "customers"'), "Customer tabs must include an overview tab.");




const administrationPage = read("src/app/[locale]/admin/(protected)/administration/page.tsx");
assert(administrationPage.includes("AdminAdministrationOverviewPage"), "Administration page must render the administration overview instead of redirecting.");
const administrationComponent = read("src/shared/admin/components/AdminAdministrationOverviewPage.tsx");
assert(administrationComponent.includes("getAdminAdministrationOverview"), "Administration overview must read the backend administration overview endpoint.");
assert(administrationComponent.includes("latest_activity"), "Administration overview must include latest audit activity.");
assert(administrationComponent.includes("roles"), "Administration overview must include role coverage.");

const communicationPage = read("src/app/[locale]/admin/(protected)/communication/page.tsx");
assert(communicationPage.includes("AdminCommunicationOverviewPage"), "Communication page must render the communication overview instead of redirecting.");
const communicationComponent = read("src/shared/admin/components/AdminCommunicationOverviewPage.tsx");
assert(communicationComponent.includes("getAdminCommunicationOverview"), "Communication overview must read the backend communication overview endpoint.");
assert(communicationComponent.includes("latest_notifications"), "Communication overview must show latest notifications.");
const communicationTabs = read("src/shared/admin/components/AdminCommunicationTabs.tsx");
assert(communicationTabs.includes('key: "overview"'), "Communication tabs must include an overview tab.");
const notificationsComponent = read("src/shared/admin/components/AdminNotificationsPage.tsx");
assert(notificationsComponent.includes('"support_request"'), "Notifications page must support support_request notifications.");
const emailTemplatesComponent = read("src/shared/admin/components/AdminEmailTemplatesPage.tsx");
assert(emailTemplatesComponent.includes("ensureDefaultEmailTemplates"), "Email templates page must expose default-template bootstrap action.");

console.log("Admin Panel Release Check");
console.log("=========================");
if (warnings.length) {
  console.log(`Warnings: ${warnings.length}`);
  for (const item of warnings) console.log(`- ${item}`);
}
if (failures.length) {
  console.error(`Failures: ${failures.length}`);
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}
console.log("OK: admin panel release checks passed.");


const settingsOverviewPage = read("src/shared/admin/components/AdminSettingsOverviewPage.tsx");
assert(settingsOverviewPage.includes("getAdminSettingsOverview"), "Settings overview page must use admin settings overview API.");
assert(settingsOverviewPage.includes("settings readiness") || settingsOverviewPage.includes("جاهزية الإعدادات"), "Settings overview page must communicate readiness clearly.");

const aiClient = read("src/shared/api/ai-client.ts");
assert(aiClient.includes("updateAdminAiSettings"), "AI client must support saving AI settings from admin.");
assert(aiClient.includes("testAdminAiSettings"), "AI client must support testing AI settings readiness.");
const aiSettingsPage = read("src/shared/admin/components/AdminAiSettingsPage.tsx");
assert(aiSettingsPage.includes("AI API Key"), "AI settings page must expose API key management with clear label.");
assert(aiSettingsPage.includes("enable_ai_everywhere"), "AI settings page must control enabling AI across admin forms.");

#!/usr/bin/env node
/**
 * Public Site Release Check
 * Lightweight checks that do not require Next.js/node_modules.
 * يفحص مؤشرات الإغلاق الأساسية بدون الحاجة إلى تشغيل build.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "src");
const failures = [];
const warnings = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
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

const requiredRoutes = [
  "src/app/page.tsx",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/manifest.ts",
  "src/app/[locale]/layout.tsx",
  "src/app/[locale]/(public)/layout.tsx",
  "src/app/[locale]/(public)/page.tsx",
  "src/app/[locale]/(public)/services/page.tsx",
  "src/app/[locale]/(public)/apps/page.tsx",
  "src/app/[locale]/(public)/products/page.tsx",
  "src/app/[locale]/(public)/portfolio/page.tsx",
  "src/app/[locale]/(public)/contact/page.tsx",
  "src/app/[locale]/(public)/quote-request/page.tsx",
  "src/app/[locale]/(public)/support/page.tsx",
  "src/app/[locale]/(public)/downloads/page.tsx",
  "src/app/[locale]/(public)/privacy/page.tsx",
  "src/app/[locale]/(public)/terms/page.tsx"
];

for (const route of requiredRoutes) {
  assert(exists(route), `Missing required public route: ${route}`);
}

for (const localeFile of [
  "src/shared/design-system/i18n/ar.json",
  "src/shared/design-system/i18n/en.json"
]) {
  try {
    const json = JSON.parse(read(localeFile));
    assert(Boolean(json.publicNav), `${localeFile} missing publicNav`);
    assert(Boolean(json.public), `${localeFile} missing public dictionary`);
  } catch (error) {
    failures.push(`${localeFile} is not valid JSON: ${error.message}`);
  }
}

const userFacingFiles = [
  "src/shared/design-system/i18n/ar.json",
  "src/shared/design-system/i18n/en.json"
];
const blockedVisiblePhrases = [
  "CompanyName",
  "Foundation Stage",
  "Stage 7",
  "Coming Soon",
  "coming soon",
  "فتح التطبيق",
  "محتوى تجريبي",
  "صفحة مؤقتة"
];
for (const file of userFacingFiles) {
  const text = read(file);
  for (const phrase of blockedVisiblePhrases) {
    assert(!text.includes(phrase), `Blocked visible phrase '${phrase}' found in ${file}`);
  }
}

const productionEnv = exists("../../.env.production.example")
  ? fs.readFileSync(path.join(root, "../../.env.production.example"), "utf8")
  : "";
if (productionEnv) {
  assert(
    productionEnv.includes("NEXT_PUBLIC_SHOW_DEMO_CONTENT=false"),
    "Production example must disable demo content."
  );
  assert(
    productionEnv.includes("NEXT_PUBLIC_ALLOW_INDEXING=true"),
    "Production example should explicitly enable indexing only for final domain."
  );
  assert(
    productionEnv.includes("AUTO_SEED_DEMO_CONTENT=false"),
    "Production example must disable backend demo auto-seed."
  );
}

const allTs = walk(src).filter((file) => /\.(ts|tsx)$/.test(file));
for (const file of allTs) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  const text = fs.readFileSync(file, "utf8");
  warn(!text.includes("console.log("), `console.log found in ${rel}`);
  if (!rel.startsWith("src/shared/api/")) {
    assert(!text.includes('from "./api-client"'), `Suspicious local api-client import found in ${rel}`);
  }
}

const metadataText = read("src/shared/seo/metadata.ts");
assert(metadataText.includes("NEXT_PUBLIC_ALLOW_INDEXING"), "Metadata must respect NEXT_PUBLIC_ALLOW_INDEXING.");
assert(metadataText.includes("x-default"), "Metadata must include x-default hreflang.");

const sitemapText = read("src/app/sitemap.ts");
assert(sitemapText.includes("getAppDownloads"), "Sitemap must include download_files support through getAppDownloads.");

const publicClientText = read("src/shared/api/public-client.ts");
assert(
  publicClientText.includes("getPublicStaticPage"),
  "Public client must expose getPublicStaticPage for legal/about pages."
);
assert(
  publicClientText.includes("extra_settings"),
  "Public settings type must expose extra_settings for backend-driven homepage content."
);

const homePageText = read("src/app/[locale]/(public)/page.tsx");
assert(
  homePageText.includes("getPublicHomeText"),
  "Homepage hero copy must be driven by backend settings extra_settings.home."
);
assert(
  homePageText.includes("getPublicHomeStringList"),
  "Homepage technology stack must support backend-driven lists."
);

const optimizedImageText = read("src/shared/public/components/PublicOptimizedImage.tsx");
assert(
  optimizedImageText.includes("buildBackendAssetUrl"),
  "PublicOptimizedImage must normalize backend asset URLs."
);

for (const file of allTs) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  const text = fs.readFileSync(file, "utf8");
  assert(!text.includes("<img"), `Raw <img> tag found in ${rel}; use PublicOptimizedImage.`);
  assert(
    !text.includes("@next/next/no-img-element"),
    `Disabled Next image lint rule found in ${rel}.`
  );
}


console.log("Public Site Release Check");
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
console.log("OK: public site release checks passed.");

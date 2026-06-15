/**
 * =====================================================
 * تنظيف كاش Next.js
 * يستخدم قبل تشغيل dev/build عند ظهور أخطاء .next
 * =====================================================
 */

import fs from "fs";
import path from "path";

const targets = [".next", path.join("node_modules", ".cache")];

for (const target of targets) {
  const fullPath = path.resolve(process.cwd(), target);

  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`Removed: ${target}`);
  } else {
    console.log(`Skipped: ${target}`);
  }
}

console.log("Public site cache cleanup completed.");

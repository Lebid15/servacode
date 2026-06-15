/**
 * =====================================================
 * إعداد ESLint للوحة الأدمن
 * يستخدم إعداد Next.js flat config مباشرة حتى يبقى متوافقًا مع Next 16+.
 * =====================================================
 */

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-unused-expressions": "error",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;

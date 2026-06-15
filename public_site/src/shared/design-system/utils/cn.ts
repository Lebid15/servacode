/**
 * =====================================================
 * cn
 * دمج كلاسات Tailwind بشكل آمن ومركزي
 * =====================================================
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

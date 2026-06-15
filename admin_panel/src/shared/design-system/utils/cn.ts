/**
 * =====================================================
 * دمج كلاسّات Tailwind
 * يستخدم clsx و tailwind-merge لمنع تضارب الكلاسات
 * =====================================================
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

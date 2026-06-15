"use client";

/**
 * =====================================================
 * AdminAiImageButton
 * زر يولد صورة/أيقونة بالذكاء الاصطناعي ويحفظها في مكتبة الوسائط
 * =====================================================
 */

import { useState } from "react";

import { generateAdminAiImage, type AiEntityType, type AiImageKind } from "@/shared/api/ai-client";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { cn } from "@/shared/design-system/utils/cn";

type AdminAiImageButtonProps = {
  token: string;
  entityType: AiEntityType;
  imageKind: AiImageKind;
  titleAr: string;
  shortDescriptionAr?: string;
  fullDescriptionAr?: string;
  contextAr?: string;
  label?: string;
  disabled?: boolean;
  onApply: (imageUrl: string) => void;
};

export function AdminAiImageButton({
  token,
  entityType,
  imageKind,
  titleAr,
  shortDescriptionAr,
  fullDescriptionAr,
  contextAr,
  label,
  disabled,
  onApply,
}: AdminAiImageButtonProps) {
  const [loading, setLoading] = useState(false);
  const canGenerate = Boolean(token) && Boolean(titleAr.trim()) && !disabled;
  const buttonLabel = label ?? (imageKind === "icon" ? "توليد أيقونة" : "توليد صورة");

  const handleClick = async () => {
    if (!canGenerate || loading) {
      return;
    }

    setLoading(true);
    try {
      const response = await generateAdminAiImage(token, {
        entity_type: entityType,
        image_kind: imageKind,
        title_ar: titleAr.trim(),
        short_description_ar: shortDescriptionAr?.trim() ?? "",
        full_description_ar: fullDescriptionAr?.trim() ?? "",
        context_ar: contextAr?.trim() ?? "",
        size: "1024x1024",
      });
      onApply(response.image_url);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "تعذر توليد الصورة بالذكاء الاصطناعي.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={!canGenerate || loading}
      onClick={handleClick}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-app-border bg-app-surfaceElevated px-3 text-xs font-black text-app-primary shadow-sm transition hover:-translate-y-0.5 hover:border-app-primary/60 hover:bg-app-primary/10 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
      )}
      title={canGenerate ? buttonLabel : "اكتب العنوان العربي أولًا"}
    >
      <AppIcon name={loading ? "loader" : imageKind === "icon" ? "sparkles" : "media"} size={14} className={loading ? "animate-spin" : undefined} />
      <span>{loading ? "جاري التوليد..." : buttonLabel}</span>
    </button>
  );
}

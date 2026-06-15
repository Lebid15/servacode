"use client";

/**
 * =====================================================
 * AdminAiFieldButton
 * زر صغير يولد محتوى الحقل مباشرة داخل النماذج
 * =====================================================
 */

import { useState } from "react";

import { generateAdminAiContent, type AiEntityType, type AiGeneratedContent, type AiTargetField } from "@/shared/api/ai-client";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { cn } from "@/shared/design-system/utils/cn";

type AdminAiFieldButtonProps = {
  token: string;
  entityType: AiEntityType;
  targetField: AiTargetField;
  titleAr: string;
  shortDescriptionAr?: string;
  fullDescriptionAr?: string;
  contextAr?: string;
  extraInstructions?: string;
  label?: string;
  disabled?: boolean;
  onApply: (content: AiGeneratedContent) => void;
};

export function AdminAiFieldButton({
  token,
  entityType,
  targetField,
  titleAr,
  shortDescriptionAr,
  fullDescriptionAr,
  contextAr,
  extraInstructions,
  label = "توليد",
  disabled,
  onApply,
}: AdminAiFieldButtonProps) {
  const [loading, setLoading] = useState(false);
  const canGenerate = Boolean(token) && Boolean(titleAr.trim()) && !disabled;

  const handleClick = async () => {
    if (!canGenerate || loading) {
      return;
    }

    setLoading(true);
    try {
      const response = await generateAdminAiContent(token, {
        entity_type: entityType,
        target_field: targetField,
        title_ar: titleAr.trim(),
        short_description_ar: shortDescriptionAr?.trim() ?? "",
        full_description_ar: fullDescriptionAr?.trim() ?? "",
        context_ar: contextAr?.trim() ?? "",
        extra_instructions: extraInstructions?.trim() ?? "",
        tone: "professional",
        target_audience: "businesses",
      });
      onApply(response.content);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "تعذر توليد المحتوى بالذكاء الاصطناعي.");
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
        "inline-flex min-h-7 items-center gap-1 rounded-full border border-app-border bg-app-surfaceElevated px-2.5 text-[11px] font-bold text-app-primary shadow-sm transition hover:-translate-y-0.5 hover:border-app-primary/60 hover:bg-app-primary/10 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
      )}
      title={canGenerate ? label : "اكتب العنوان العربي أولًا"}
    >
      <AppIcon name={loading ? "loader" : "sparkles"} size={13} className={loading ? "animate-spin" : undefined} />
      <span>{loading ? "جاري..." : label}</span>
    </button>
  );
}

/**
 * =====================================================
 * ContentBlockCard
 * بطاقة نصية منظمة للمشكلة/الحل/النتيجة أو وصف التفاصيل
 * =====================================================
 */

import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";

type ContentBlockCardProps = {
  icon: AppIconName;
  title: string;
  content?: string;
};

export function ContentBlockCard({ icon, title, content }: ContentBlockCardProps) {
  if (!content) {
    return null;
  }

  return (
    <AppCard className="grid h-full gap-4 p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-appPill border border-app-border bg-app-surfaceElevated">
          <AppIcon name={icon} className="text-app-primary" size={18} />
        </span>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <p className="leading-8 text-app-muted whitespace-pre-line">{content}</p>
    </AppCard>
  );
}

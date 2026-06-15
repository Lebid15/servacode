/**
 * =====================================================
 * Loading State
 * حالة تحميل عامة للمسارات
 * =====================================================
 */

import { AppSkeleton } from "@/shared/design-system/components/AppSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-5 py-10">
      <AppSkeleton className="h-16 w-2/3" />
      <AppSkeleton className="h-8 w-1/2" />
      <div className="grid gap-5 md:grid-cols-3">
        <AppSkeleton className="h-56" />
        <AppSkeleton className="h-56" />
        <AppSkeleton className="h-56" />
      </div>
    </main>
  );
}

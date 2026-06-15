"use client";

/**
 * =====================================================
 * AppPagination
 * شريط صفحات مركزي مبسط
 * =====================================================
 */

import { AppButton } from "./AppButton";

type AppPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function AppPagination({ page, totalPages, onPageChange }: AppPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <AppButton variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ‹
      </AppButton>
      <span className="rounded-full border border-app-border px-4 py-2 text-sm">
        {page} / {Math.max(totalPages, 1)}
      </span>
      <AppButton
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        ›
      </AppButton>
    </div>
  );
}

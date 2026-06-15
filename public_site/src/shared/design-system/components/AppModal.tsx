"use client";

/**
 * =====================================================
 * AppModal
 * نافذة منبثقة مركزية مبسطة
 * =====================================================
 */

import { AppButton } from "./AppButton";

type AppModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function AppModal({ open, title, children, onClose }: AppModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-appXl border border-app-border bg-app-surface p-6 shadow-appCard">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{title}</h2>
          <AppButton variant="ghost" onClick={onClose}>
            ×
          </AppButton>
        </div>
        {children}
      </div>
    </div>
  );
}

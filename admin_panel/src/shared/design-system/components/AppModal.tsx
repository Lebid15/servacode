"use client";

/**
 * =====================================================
 * AppModal
 * نافذة منبثقة مركزية مبسطة
 * =====================================================
 */

import { useEffect } from "react";

import { AppButton } from "./AppButton";
import { AppIcon } from "./AppIcon";

type AppModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: "md" | "lg" | "xl" | "2xl";
};

const sizeClasses = {
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  "2xl": "max-w-[min(96vw,96rem)]"
};

export function AppModal({ open, title, children, onClose, size = "md" }: AppModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className={`max-h-[94vh] w-full overflow-hidden rounded-appXl border border-app-border bg-app-surface shadow-appCard ${sizeClasses[size]}`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-app-border bg-app-surfaceElevated/70 px-5 py-4">
          <h2 className="text-lg font-bold text-app-foreground">{title}</h2>
          <AppButton variant="ghost" onClick={onClose} className="min-h-10 px-3" aria-label="Close" icon={<AppIcon name="close" size={18} />}>
            <span className="sr-only">Close</span>
          </AppButton>
        </div>
        <div className="max-h-[calc(94vh-4.5rem)] overflow-auto p-5">{children}</div>
      </div>
    </div>
  );
}

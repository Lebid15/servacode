"use client";

/**
 * =====================================================
 * AppConfirmDialog
 * حوار تأكيد مركزي مبسط
 * =====================================================
 */

import { AppButton } from "./AppButton";
import { AppModal } from "./AppModal";

type AppConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AppConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel
}: AppConfirmDialogProps) {
  return (
    <AppModal open={open} title={title} onClose={onCancel}>
      <div className="grid gap-5">
        <p className="text-app-muted">{description}</p>
        <div className="flex justify-end gap-3">
          <AppButton variant="secondary" onClick={onCancel}>
            {cancelText}
          </AppButton>
          <AppButton variant="danger" onClick={onConfirm}>
            {confirmText}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}

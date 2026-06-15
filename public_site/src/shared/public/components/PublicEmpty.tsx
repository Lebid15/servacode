/**
 * =====================================================
 * PublicEmpty
 * حالة عدم وجود بيانات في الموقع العام
 * =====================================================
 */

import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";

type PublicEmptyProps = {
  text: string;
};

export function PublicEmpty({ text }: PublicEmptyProps) {
  return <AppEmptyState title={text} />;
}

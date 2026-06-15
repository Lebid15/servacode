import { AdminProfilePage } from "@/shared/admin/components/AdminProfilePage";
import type { Locale } from "@/shared/design-system/utils/direction";

type AdminProfileRouteProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminProfileRoute({ params }: AdminProfileRouteProps) {
  const { locale } = await params;

  return <AdminProfilePage locale={locale as Locale} />;
}

/**
 * =====================================================
 * AdminLayout
 * أساس تخطيطي للوحة الأدمن
 * سيتم استخدامه فعليًا في المرحلة 8
 * =====================================================
 */

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  return <div className="min-h-screen bg-app-background text-app-foreground">{children}</div>;
}

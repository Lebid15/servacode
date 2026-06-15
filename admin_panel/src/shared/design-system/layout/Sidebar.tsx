/**
 * =====================================================
 * Sidebar
 * أساس السايدبار المركزي
 * مكوّن سايدبار قديم محفوظ للتوافق، والاعتماد الأساسي الآن على AdminShell
 * =====================================================
 */

type SidebarProps = {
  children?: React.ReactNode;
};

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="border-app-border bg-app-surface p-4">
      {children}
    </aside>
  );
}

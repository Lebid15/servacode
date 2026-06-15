/**
 * =====================================================
 * Topbar
 * أساس التوب بار المركزي
 * =====================================================
 */

type TopbarProps = {
  children?: React.ReactNode;
};

export function Topbar({ children }: TopbarProps) {
  return (
    <header className="border-b border-app-border bg-app-surface/80 p-4 backdrop-blur-xl">
      {children}
    </header>
  );
}

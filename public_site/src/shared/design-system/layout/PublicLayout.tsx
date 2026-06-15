/**
 * =====================================================
 * PublicLayout
 * أساس تخطيطي للموقع العام
 * سيتم توسيعه في مرحلة الموقع العام
 * =====================================================
 */

type PublicLayoutProps = {
  children: React.ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return <div className="min-h-screen">{children}</div>;
}

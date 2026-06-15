/**
 * =====================================================
 * Footer
 * أساس الفوتر المركزي للموقع العام
 * =====================================================
 */

type FooterProps = {
  children?: React.ReactNode;
};

export function Footer({ children }: FooterProps) {
  return <footer className="border-t border-app-border p-6">{children}</footer>;
}

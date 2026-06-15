/**
 * =====================================================
 * HomeProofStrip
 * شريط ثقة بصري بعد Hero يوضح قدرات الشركة بسرعة
 * =====================================================
 */

import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";

type ProofItem = {
  icon: AppIconName;
  title: string;
  description: string;
};

type HomeProofStripProps = {
  items: ProofItem[];
};

export function HomeProofStrip({ items }: HomeProofStripProps) {
  return (
    <section className="app-container pb-8 sm:pb-10">
      <AppCard className="premium-surface-strong p-3 sm:p-4 md:p-5">
        <div className="home-proof-grid">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-appXl border border-app-border bg-app-background/30 p-4 shadow-appSoft transition hover:-translate-y-1 hover:border-app-borderStrong sm:p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-app2Xl bg-app-surfaceElevated shadow-appGlowSoft">
                  <AppIcon name={item.icon} className="text-app-primary" size={22} />
                </span>
                <h3 className="text-lg font-black leading-tight">{item.title}</h3>
              </div>
              <p className="text-sm font-semibold leading-7 text-app-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </AppCard>
    </section>
  );
}

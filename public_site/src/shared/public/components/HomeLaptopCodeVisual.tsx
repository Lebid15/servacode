/**
 * =====================================================
 * HomeLaptopCodeVisual
 * عنصر بصري للصفحة الرئيسية: شاشة لابتوب بداخلها كود يُكتب
 * =====================================================
 */

import type { CSSProperties } from "react";

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppIcon } from "@/shared/design-system/components/AppIcon";

type HomeLaptopCodeVisualProps = {
  labels: {
    frontend: string;
    backend: string;
    deploy: string;
    scalable: string;
  };
};

type CodeLine = {
  text: string;
  width: string;
  delay: string;
  tone?: "muted" | "keyword" | "value" | "function" | "success";
};

const codeLines: CodeLine[] = [
  { text: "const project = await studio.build({", width: "36ch", delay: "0s", tone: "keyword" },
  { text: '  website: "fast",', width: "19ch", delay: "0.35s", tone: "value" },
  { text: '  dashboard: "secure",', width: "24ch", delay: "0.75s", tone: "value" },
  { text: '  api: "scalable",', width: "21ch", delay: "1.15s", tone: "value" },
  { text: '  apps: ["web", "desktop"],', width: "29ch", delay: "1.55s", tone: "value" },
  { text: "});", width: "4ch", delay: "1.95s", tone: "muted" },
  { text: "deploy(project).ready();", width: "24ch", delay: "2.35s", tone: "success" }
];

const toneClass: Record<NonNullable<CodeLine["tone"]>, string> = {
  muted: "text-app-muted",
  keyword: "text-app-primary",
  value: "text-[hsl(var(--color-accent))]",
  function: "text-[hsl(var(--color-accent-2))]",
  success: "text-[hsl(var(--color-success))]"
};

function lineStyle(width: string, delay: string): CSSProperties {
  return {
    "--code-line-width": width,
    "--code-line-delay": delay
  } as CSSProperties;
}

export function HomeLaptopCodeVisual({ labels }: HomeLaptopCodeVisualProps) {
  const metrics = [
    { label: labels.frontend, value: "UI" },
    { label: labels.backend, value: "API" },
    { label: labels.deploy, value: "CI/CD" }
  ];

  return (
    <div className="app-float relative mx-auto w-full max-w-[35rem] lg:max-w-none">
      <div className="absolute -inset-8 rounded-[3rem] bg-[hsl(var(--color-primary)/0.18)] blur-3xl" aria-hidden="true" />
      <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-app-border bg-[image:var(--gradient-card)] p-4 shadow-appCard sm:p-5 md:p-6">
        <div className="absolute end-[-5rem] top-[-5rem] h-64 w-64 rounded-full bg-[hsl(var(--color-primary)/0.22)] blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-[-6rem] start-[-6rem] h-72 w-72 rounded-full bg-[hsl(var(--color-accent)/0.18)] blur-3xl" aria-hidden="true" />
        <div className="absolute inset-0 app-grid-bg opacity-20" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-3">
            <AppBadge tone="primary" className="gap-2 px-3 py-1.5 text-xs">
              <AppIcon name="code" size={15} />
              {labels.scalable}
            </AppBadge>
            <div className="hidden items-center gap-2 rounded-appPill border border-app-border bg-app-surface/58 px-3 py-1.5 text-xs font-black text-app-muted sm:flex">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-success))] shadow-[0_0_18px_hsl(var(--color-success)/0.5)]" />
              Live build
            </div>
          </div>

          <div className="grid flex-1 place-items-center py-2">
            <div className="relative w-full max-w-[29rem]">
              <div className="absolute -inset-5 rounded-[2.2rem] bg-[hsl(var(--color-primary)/0.14)] blur-2xl" aria-hidden="true" />

              <div className="relative rounded-t-[1.6rem] border border-app-border bg-[hsl(var(--color-background-soft)/0.86)] p-2 shadow-appCard">
                <div className="overflow-hidden rounded-t-[1.15rem] border border-app-border bg-[hsl(var(--color-background)/0.92)]">
                  <div className="flex items-center justify-between border-b border-app-border bg-app-surface/80 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[hsl(var(--color-danger))]" />
                      <span className="h-3 w-3 rounded-full bg-[hsl(var(--color-warning))]" />
                      <span className="h-3 w-3 rounded-full bg-[hsl(var(--color-success))]" />
                    </div>
                    <div className="flex items-center gap-2 rounded-appPill bg-app-background/40 px-3 py-1 text-[0.68rem] font-black text-app-muted">
                      <AppIcon name="monitor" size={13} />
                      app/main.ts
                    </div>
                  </div>

                  <div className="relative min-h-[15.5rem] overflow-hidden p-4 font-mono text-[0.78rem] leading-7 sm:p-5 sm:text-[0.86rem] md:min-h-[17rem]">
                    <div className="absolute end-5 top-5 rounded-appPill border border-app-border bg-app-surface/60 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-app-muted">
                      TypeScript
                    </div>

                    <div className="mt-9 grid gap-1.5" dir="ltr">
                      {codeLines.map((line) => (
                        <div
                          key={`${line.text}-${line.delay}`}
                          className="app-code-line"
                          style={lineStyle(line.width, line.delay)}
                        >
                          <span className={toneClass[line.tone ?? "muted"]}>{line.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-2 rounded-appLg border border-app-border bg-app-surface/48 p-3" dir="ltr">
                      <div className="flex items-center justify-between text-[0.72rem] font-black text-app-muted">
                        <span>build status</span>
                        <span className="text-[hsl(var(--color-success))]">ready</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-appPill bg-app-surfaceElevated">
                        <div className="app-pulse-line h-full w-5/6 rounded-appPill bg-[image:var(--gradient-primary)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto h-5 w-[78%] rounded-b-[1.35rem] border border-t-0 border-app-border bg-[hsl(var(--color-surface-elevated)/0.92)] shadow-appSoft">
                <div className="mx-auto h-1.5 w-20 rounded-b-appPill bg-app-surface" />
              </div>
              <div className="mx-auto mt-2 h-3 w-[92%] rounded-[100%] bg-[hsl(var(--color-primary)/0.22)] blur-lg" aria-hidden="true" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {metrics.map((item) => (
              <div key={item.label} className="rounded-appLg border border-app-border bg-app-surface/62 px-3 py-3 text-center shadow-appSoft">
                <strong className="block text-base font-black text-app-primary sm:text-lg">{item.value}</strong>
                <span className="line-clamp-1 text-[0.68rem] font-bold text-app-muted sm:text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

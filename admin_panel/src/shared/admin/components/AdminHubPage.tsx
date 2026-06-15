/**
 * =====================================================
 * AdminHubPage
 * قالب مركزي لصفحات مراكز العمل داخل لوحة الأدمن.
 * يحول صفحات الأقسام العامة من نصوص تعريفية إلى بوابات عملية
 * فيها اختصارات واضحة، مسار عمل، وبطاقات إدارة منظمة.
 * =====================================================
 */

import Link from "next/link";

import { AppBadge, type BadgeTone } from "@/shared/design-system/components/AppBadge";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon, type IconName } from "@/shared/design-system/components/AppIcon";
import { cn } from "@/shared/design-system/utils/cn";

type AdminHubAction = {
  key: string;
  label: string;
  href: string;
  icon: IconName;
  tone?: BadgeTone;
};

export type AdminHubItem = {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: IconName;
  badge: string;
  tone: BadgeTone;
  meta?: string[];
};

export type AdminHubGroup = {
  key: string;
  title: string;
  description: string;
  items: AdminHubItem[];
  columns?: "two" | "three" | "four";
};

export type AdminHubStep = {
  key: string;
  title: string;
  description: string;
  icon: IconName;
};

type AdminHubPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  notice: string;
  heroIcon: IconName;
  actionLabel: string;
  quickActionsLabel: string;
  workflowTitle: string;
  workflowDescription: string;
  groups: AdminHubGroup[];
  quickActions: AdminHubAction[];
  workflow: AdminHubStep[];
};

const groupColumns: Record<NonNullable<AdminHubGroup["columns"]>, string> = {
  two: "md:grid-cols-2",
  three: "sm:grid-cols-2 xl:grid-cols-3",
  four: "sm:grid-cols-2 xl:grid-cols-4"
};

function AdminHubQuickAction({ action }: { action: AdminHubAction }) {
  return (
    <Link
      href={action.href}
      className={cn(
        "group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-black transition duration-200",
        "hover:-translate-y-0.5 hover:shadow-appCard focus:outline-none focus:ring-2 focus:ring-app-primary/35",
        action.tone === "primary"
          ? "border-app-primary bg-app-primary text-app-primaryForeground shadow-appGlow hover:bg-app-primary/95"
          : "border-app-border bg-app-surfaceElevated/85 text-app-foreground hover:border-app-primary/35 hover:bg-app-surface"
      )}
    >
      <AppIcon name={action.icon} size={17} />
      <span>{action.label}</span>
    </Link>
  );
}

function AdminHubItemCard({ item, actionLabel }: { item: AdminHubItem; actionLabel: string }) {
  return (
    <Link href={item.href} className="group block min-h-full focus:outline-none">
      <AppCard
        className={cn(
          "relative grid min-h-56 overflow-hidden p-5 transition duration-200",
          "hover:-translate-y-1 hover:border-app-primary/45 hover:bg-app-surface hover:shadow-appGlow",
          "group-focus-visible:border-app-primary/50 group-focus-visible:shadow-appGlow"
        )}
      >
        <div className="pointer-events-none absolute -top-14 end-8 size-36 rounded-full bg-app-primary/10 blur-3xl transition duration-200 group-hover:bg-app-primary/20" />
        <div className="pointer-events-none absolute -bottom-16 start-8 size-28 rounded-full bg-app-primary/5 blur-3xl" />

        <div className="relative grid h-full content-between gap-5">
          <div className="grid gap-4">
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-appLg border border-app-primary/25 bg-app-primary/12 text-app-primary shadow-appGlow">
                <AppIcon name={item.icon} size={22} />
              </span>
              <AppBadge tone={item.tone}>{item.badge}</AppBadge>
            </div>

            <div className="grid gap-2">
              <h2 className="text-lg font-black text-app-foreground">{item.title}</h2>
              <p className="text-sm leading-7 text-app-muted">{item.description}</p>
            </div>

            {item.meta?.length ? (
              <div className="flex flex-wrap gap-2">
                {item.meta.map((meta) => (
                  <span
                    key={meta}
                    className="rounded-full border border-app-border bg-app-surfaceElevated/75 px-3 py-1 text-xs font-bold text-app-muted"
                  >
                    {meta}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-app-border/70 pt-4 text-sm font-black text-app-primary">
            <span>{actionLabel}</span>
            <span className="grid size-9 place-items-center rounded-full border border-app-primary/25 bg-app-primary/10 transition duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
              <AppIcon name="next" size={16} />
            </span>
          </div>
        </div>
      </AppCard>
    </Link>
  );
}

function AdminHubGroupSection({ group, actionLabel }: { group: AdminHubGroup; actionLabel: string }) {
  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-1">
          <h2 className="text-base font-black text-app-foreground md:text-lg">{group.title}</h2>
          <p className="max-w-3xl text-sm leading-7 text-app-muted">{group.description}</p>
        </div>
        <AppBadge tone="neutral" className="w-fit">
          {group.items.length}
        </AppBadge>
      </div>

      <div className={cn("grid gap-4", groupColumns[group.columns ?? "three"])}>
        {group.items.map((item) => (
          <AdminHubItemCard key={item.key} item={item} actionLabel={actionLabel} />
        ))}
      </div>
    </section>
  );
}

function AdminHubWorkflow({
  title,
  description,
  steps
}: {
  title: string;
  description: string;
  steps: AdminHubStep[];
}) {
  return (
    <AppCard className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -top-20 end-8 size-40 rounded-full bg-app-primary/10 blur-3xl" />
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-center">
        <div className="grid gap-2">
          <h2 className="text-base font-black text-app-foreground md:text-lg">{title}</h2>
          <p className="text-sm leading-7 text-app-muted">{description}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className="relative overflow-hidden rounded-appLg border border-app-border bg-app-surfaceElevated/70 p-4"
            >
              <span className="absolute end-3 top-3 text-3xl font-black text-app-primary/10">0{index + 1}</span>
              <div className="relative grid gap-3">
                <span className="grid size-10 place-items-center rounded-appMd border border-app-primary/25 bg-app-primary/12 text-app-primary">
                  <AppIcon name={step.icon} size={18} />
                </span>
                <div className="grid gap-1">
                  <h3 className="text-sm font-black text-app-foreground">{step.title}</h3>
                  <p className="text-xs leading-6 text-app-muted">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppCard>
  );
}

export function AdminHubPage({
  eyebrow,
  title,
  description,
  notice,
  heroIcon,
  actionLabel,
  quickActionsLabel,
  workflowTitle,
  workflowDescription,
  groups,
  quickActions,
  workflow
}: AdminHubPageProps) {
  return (
    <div className="grid gap-6">
      <AppCard className="relative overflow-hidden p-5 md:p-6">
        <div className="pointer-events-none absolute -top-24 end-10 size-64 rounded-full bg-app-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 start-10 size-56 rounded-full bg-app-primary/8 blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.4fr)] xl:items-center">
          <div className="grid gap-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <span className="grid size-14 shrink-0 place-items-center rounded-appXl border border-app-primary/25 bg-app-primary/12 text-app-primary shadow-appGlow">
                <AppIcon name={heroIcon} size={25} />
              </span>
              <div className="grid gap-3">
                <AppBadge tone="primary" className="w-fit">
                  {eyebrow}
                </AppBadge>
                <div className="grid gap-2">
                  <h1 className="max-w-4xl text-2xl font-black tracking-tight text-app-foreground md:text-3xl">
                    {title}
                  </h1>
                  <p className="max-w-4xl text-sm leading-7 text-app-muted md:text-base">{description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-appLg border border-app-border bg-app-surfaceElevated/70 p-4 text-sm leading-7 text-app-muted">
              <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border border-app-primary/25 bg-app-primary/12 text-app-primary">
                <AppIcon name="check" size={15} />
              </span>
              <p>{notice}</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-appXl border border-app-border bg-app-surface/70 p-4 shadow-appCard">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black text-app-foreground">{quickActionsLabel}</h2>
              <AppIcon name="sparkles" size={17} className="text-app-primary" />
            </div>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <AdminHubQuickAction key={action.key} action={action} />
              ))}
            </div>
          </div>
        </div>
      </AppCard>

      <AdminHubWorkflow title={workflowTitle} description={workflowDescription} steps={workflow} />

      {groups.map((group) => (
        <AdminHubGroupSection key={group.key} group={group} actionLabel={actionLabel} />
      ))}
    </div>
  );
}

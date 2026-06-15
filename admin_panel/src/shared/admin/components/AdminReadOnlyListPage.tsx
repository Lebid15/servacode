"use client";

/**
 * =====================================================
 * AdminReadOnlyListPage
 * صفحة قراءة عامة للسجلات والتنبيهات والتحليلات
 * =====================================================
 */

import { useQuery } from "@tanstack/react-query";

import { listAdminItems } from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { AppTable } from "@/shared/design-system/components/AppTable";
import type { AdminColumnConfig } from "@/shared/admin/admin-module-types";
import { getNestedValue, valueToText } from "@/shared/admin/admin-formatters";

type AdminReadOnlyRow = Record<string, unknown>;

type AdminReadOnlyListPageProps = {
  title: string;
  description: string;
  endpoint: string;
  columns: AdminColumnConfig[];
  labels: {
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
    error: string;
  };
};

export function AdminReadOnlyListPage({
  title,
  description,
  endpoint,
  columns,
  labels
}: AdminReadOnlyListPageProps) {
  const { tokens } = useAdminAuth();
  const token = tokens?.access_token ?? "";

  const query = useQuery({
    queryKey: [endpoint],
    queryFn: () => listAdminItems(endpoint, { token, skip: 0, limit: 50 }),
    enabled: Boolean(token)
  });

  const rows = (query.data ?? []) as AdminReadOnlyRow[];

  return (
    <div className="grid gap-6">
      <AppPageHeader title={title} description={description} />

      <AppCard className="p-5">
        {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}
        {query.isError ? <AppErrorState title={labels.error} description={String(query.error)} /> : null}
        {!query.isLoading && !query.isError && rows.length === 0 ? (
          <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} />
        ) : null}
        {!query.isLoading && !query.isError && rows.length > 0 ? (
          <AppTable<AdminReadOnlyRow>
            rows={rows}
            getRowKey={(row) => String(row.id ?? row.created_at ?? Math.random())}
            columns={columns.map((column) => ({
              key: column.key,
              header: column.label,
              render: (row: AdminReadOnlyRow) => (
                <span>{valueToText(getNestedValue(row, column.key))}</span>
              )
            }))}
          />
        ) : null}
      </AppCard>
    </div>
  );
}

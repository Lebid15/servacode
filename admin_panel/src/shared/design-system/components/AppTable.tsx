/**
 * =====================================================
 * AppTable
 * جدول مركزي مبسط للوحة الأدمن والموقع
 * =====================================================
 */

import type { ReactNode } from "react";

import { cn } from "@/shared/design-system/utils/cn";

type AppTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type AppTableProps<T> = {
  columns: AppTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  className?: string;
};

export function AppTable<T>({ columns, rows, getRowKey, className }: AppTableProps<T>) {
  return (
    <div className={cn("w-full overflow-hidden rounded-appLg border border-app-border bg-app-surface", className)}>
      <div className="w-full overflow-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-app-surfaceElevated text-app-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn("px-4 py-3 text-start text-xs font-bold uppercase tracking-wide", column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="border-t border-app-border transition hover:bg-app-surfaceElevated/70">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3 align-middle text-app-foreground", column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

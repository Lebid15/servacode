/**
 * =====================================================
 * AppTable
 * جدول مركزي مبسط لمنطقة الإدارة والموقع
 * =====================================================
 */

import type { ReactNode } from "react";

import { cn } from "@/shared/design-system/utils/cn";

type AppTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type AppTableProps<T> = {
  columns: AppTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  className?: string;
};

export function AppTable<T>({ columns, rows, getRowKey, className }: AppTableProps<T>) {
  return (
    <div className={cn("w-full overflow-auto rounded-appLg border border-app-border", className)}>
      <table className="w-full min-w-[760px] border-collapse bg-app-surface text-sm">
        <thead className="bg-app-surfaceElevated text-app-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-start font-semibold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-t border-app-border">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 align-middle text-app-foreground">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

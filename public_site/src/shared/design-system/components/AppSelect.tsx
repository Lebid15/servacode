/**
 * =====================================================
 * AppSelect
 * قائمة اختيار مركزية
 * =====================================================
 */

import { cn } from "@/shared/design-system/utils/cn";

type AppSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export function AppSelect({ label, className, id, error, children, ...props }: AppSelectProps) {
  const selectId = id ?? props.name;
  const errorId = error && selectId ? `${selectId}-error` : undefined;

  return (
    <label className="grid gap-2 text-sm font-bold text-app-foreground/90" htmlFor={selectId}>
      {label ? <span>{label}</span> : null}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          "app-field-control min-h-12 rounded-appLg px-4 text-app-foreground outline-none transition",
          error ? "border-app-danger focus:border-app-danger" : "",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <span id={errorId} className="text-xs font-bold text-app-danger">{error}</span> : null}
    </label>
  );
}

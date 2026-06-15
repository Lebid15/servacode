/**
 * =====================================================
 * AppInput
 * حقل إدخال مركزي متناسق مع الهوية البصرية
 * =====================================================
 */

import { cn } from "@/shared/design-system/utils/cn";

type AppInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function AppInput({ label, className, id, error, ...props }: AppInputProps) {
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <label className="grid gap-2 text-sm font-bold text-app-foreground/90" htmlFor={inputId}>
      {label ? <span>{label}</span> : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          "app-field-control min-h-12 rounded-appLg px-4 text-app-foreground outline-none transition",
          error ? "border-app-danger focus:border-app-danger" : "",
          className
        )}
        {...props}
      />
      {error ? <span id={errorId} className="text-xs font-bold text-app-danger">{error}</span> : null}
    </label>
  );
}

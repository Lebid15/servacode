/**
 * =====================================================
 * AppTextarea
 * حقل نص طويل مركزي
 * =====================================================
 */

import { cn } from "@/shared/design-system/utils/cn";

type AppTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function AppTextarea({ label, className, id, error, ...props }: AppTextareaProps) {
  const textareaId = id ?? props.name;
  const errorId = error && textareaId ? `${textareaId}-error` : undefined;

  return (
    <label className="grid gap-2 text-sm font-bold text-app-foreground/90" htmlFor={textareaId}>
      {label ? <span>{label}</span> : null}
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          "app-field-control min-h-36 resize-y rounded-appLg px-4 py-3 text-app-foreground outline-none transition",
          error ? "border-app-danger focus:border-app-danger" : "",
          className
        )}
        {...props}
      />
      {error ? <span id={errorId} className="text-xs font-bold text-app-danger">{error}</span> : null}
    </label>
  );
}

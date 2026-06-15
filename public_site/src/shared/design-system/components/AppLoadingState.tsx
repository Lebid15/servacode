/**
 * =====================================================
 * AppLoadingState
 * حالة تحميل مركزية
 * =====================================================
 */

type AppLoadingStateProps = {
  text: string;
};

export function AppLoadingState({ text }: AppLoadingStateProps) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-appLg border border-app-border bg-app-surface">
      <span className="text-app-muted">{text}</span>
    </div>
  );
}

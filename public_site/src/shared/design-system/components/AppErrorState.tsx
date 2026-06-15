/**
 * =====================================================
 * AppErrorState
 * حالة خطأ مركزية
 * =====================================================
 */

type AppErrorStateProps = {
  title: string;
  description?: string;
};

export function AppErrorState({ title, description }: AppErrorStateProps) {
  return (
    <div className="grid min-h-40 place-items-center rounded-appLg border border-app-danger/30 bg-app-danger/10 p-6 text-center">
      <div className="grid gap-2">
        <h3 className="font-semibold text-app-danger">{title}</h3>
        {description ? <p className="text-sm text-app-muted">{description}</p> : null}
      </div>
    </div>
  );
}

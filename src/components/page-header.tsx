export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 pt-2">
      <div>
        <h1 className="font-heading text-xl font-bold text-white">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-white/40">{description}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

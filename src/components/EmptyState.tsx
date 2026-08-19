import emptyIceberg from "@/assets/empty-iceberg.png";

export function EmptyState({
  title = "Nog geen ijsbrekers hier...",
  description,
  action,
}: {
  title?: string | undefined;
  description?: string | undefined;
  action?: React.ReactNode | undefined;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <img
        src={emptyIceberg}
        alt="Waag de pinguïn staat alleen op een ijsberg"
        loading="lazy"
        width={1024}
        height={1024}
        className="mb-2 size-36 object-contain"
      />
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

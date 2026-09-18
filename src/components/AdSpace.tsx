import { cn } from "@/lib/utils";

export function AdSpace({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "mx-auto min-h-[100px] w-full max-w-5xl overflow-hidden sm:min-h-[280px]",
        className,
      )}
      data-ad-placement="reserved"
    />
  );
}
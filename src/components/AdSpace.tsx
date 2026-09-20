import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function AdSpace({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAd, setHasAd] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateVisibility = () => {
      const containsAd = Boolean(
        container.querySelector("ins.adsbygoogle, iframe, [data-ad-status='filled']"),
      );
      setHasAd(containsAd);
    };

    updateVisibility();
    const observer = new MutationObserver(updateVisibility);
    observer.observe(container, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden={!hasAd}
      className={cn(
        "mx-auto w-full max-w-5xl overflow-hidden",
        hasAd ? "min-h-[100px] sm:min-h-[280px]" : "h-0 min-h-0",
        hasAd && className,
      )}
      data-ad-placement="reserved"
      data-ad-visible={hasAd ? "true" : "false"}
    />
  );
}
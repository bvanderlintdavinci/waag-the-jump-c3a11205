import { cn } from "@/lib/utils";

export function Dare2MeetLogo({ className }: { className?: string | undefined }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width="100%"
      height="100%"
      role="img"
      aria-label="Dare2Meet logo"
      className={cn("size-9", className)}
    >
      <defs>
        <linearGradient id="pgAutumnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
        <linearGradient id="pgCharcoalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#292524" />
          <stop offset="100%" stopColor="#1C1917" />
        </linearGradient>
      </defs>

      <circle cx="256" cy="256" r="240" fill="#FAFAF9" stroke="#E7E5E4" strokeWidth="4" />

      <path
        d="M256 72 C 200 72, 160 115, 160 180 L 160 320 C 160 380, 200 420, 256 420 C 312 420, 352 380, 352 320 L 352 180 C 352 115, 312 72, 256 72 Z"
        fill="url(#pgCharcoalGrad)"
      />

      <path
        d="M256 160 C 220 160, 200 190, 200 240 L 200 320 C 200 360, 225 390, 256 390 C 287 390, 312 360, 312 320 L 312 240 C 312 190, 292 160, 256 160 Z"
        fill="#FFFFFF"
      />

      <path
        d="M160 210 C 140 250, 135 290, 150 330 C 160 355, 185 365, 195 335 C 205 305, 190 250, 160 210 Z"
        fill="url(#pgAutumnGrad)"
      />

      <polygon points="256,180 286,200 256,215" fill="url(#pgAutumnGrad)" />

      <circle cx="280" cy="155" r="7" fill="#FFFFFF" />
      <circle cx="282" cy="155" r="3" fill="#1C1917" />
    </svg>
  );
}

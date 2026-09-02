export function SectionDivider({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`relative h-12 w-full overflow-hidden sm:h-16 ${className}`}
    >
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className={`h-full w-full ${flip ? "-scale-y-100" : ""}`}
      >
        <path
          d="M0 32 C 360 64 1080 0 1440 32 L 1440 64 L 0 64 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

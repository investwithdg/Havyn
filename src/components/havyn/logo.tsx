import * as React from "react";

export const CaterpillarMark = ({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size * 1.97}
    height={size}
    viewBox="0 0 130 66"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Antennae */}
    <path d="M92 12Q84 2 78 4" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M108 12Q116 2 122 4" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />

    {/* Legs */}
    <path d="M12 54V60" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M27 50V56" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M43 46V52" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M60 42V48" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />

    {/* Body segments, drawn tail-to-head so each fill masks the previous
        segment's overlap and produces a pinched-waist beaded silhouette. */}
    <circle cx="16" cy="46" r="9" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="5" />
    <circle cx="30" cy="42" r="10" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="5" />
    <circle cx="46" cy="38" r="11" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="5" />
    <circle cx="63" cy="34" r="12" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="5" />
    <circle cx="81" cy="29" r="13" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="5" />
    <circle cx="100" cy="22" r="14" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="5" />
  </svg>
);

export const Logo = ({ withWordmark = true }: { withWordmark?: boolean }) => (
  <div className="flex items-center gap-2 text-primary">
    <CaterpillarMark size={22} />
    {withWordmark && <span className="font-bold text-lg font-headline">Havyn</span>}
  </div>
);

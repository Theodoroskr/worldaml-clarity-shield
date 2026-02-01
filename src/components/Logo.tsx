import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

// Wire Globe icon - minimal latitude/longitude lines
export const LogoIcon = ({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) => {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeMap[size], className)}
    >
      {/* Outer circle */}
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.8" />
      {/* Vertical meridian (center) */}
      <ellipse cx="16" cy="16" rx="5" ry="12" stroke="currentColor" strokeWidth="1.5" />
      {/* Horizontal equator */}
      <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="1.5" />
      {/* Upper latitude line */}
      <ellipse cx="16" cy="10" rx="10" ry="2.5" stroke="currentColor" strokeWidth="1.3" />
      {/* Lower latitude line */}
      <ellipse cx="16" cy="22" rx="10" ry="2.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
};

// Full logo with wordmark
export const Logo = ({ className, iconOnly = false, size = "md" }: LogoProps) => {
  const textSizeMap = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  if (iconOnly) {
    return <LogoIcon className={className} size={size} />;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoIcon size={size} className="text-navy" />
      <span className={cn("font-semibold tracking-tight text-navy", textSizeMap[size])}>
        World<span className="font-bold">AML</span>
      </span>
    </div>
  );
};

export default Logo;

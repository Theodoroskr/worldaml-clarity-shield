import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

// WorldAML "D" icon with globe-like stripes
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
      {/* Stylized "D" with diagonal globe stripes */}
      <path
        d="M6 4H16C22.627 4 28 9.373 28 16C28 22.627 22.627 28 16 28H6V4Z"
        fill="currentColor"
      />
      {/* Diagonal stripes creating globe effect */}
      <line x1="10" y1="28" x2="22" y2="4" stroke="white" strokeWidth="2.5" />
      <line x1="14" y1="28" x2="26" y2="4" stroke="white" strokeWidth="2.5" />
      <line x1="18" y1="28" x2="30" y2="4" stroke="white" strokeWidth="2.5" />
    </svg>
  );
};

// Full logo with wordmark matching WorldAML branding
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
    <div className={cn("flex items-center gap-1", className)}>
      <span className={cn("font-bold tracking-tight text-navy", textSizeMap[size])}>
        WORL
      </span>
      <LogoIcon size={size} className="text-navy -mx-0.5" />
      <span className={cn("font-bold tracking-tight text-navy", textSizeMap[size])}>
        AML
      </span>
    </div>
  );
};

export default Logo;

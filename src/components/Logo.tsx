import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

// Abstract connected nodes icon - represents global compliance network
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
      {/* Abstract grid/network representing global compliance */}
      <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" />
      <rect x="18" y="2" width="12" height="12" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="2" y="18" width="12" height="12" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="18" y="18" width="12" height="12" rx="2" fill="currentColor" opacity="0.4" />
      {/* Connecting lines */}
      <path d="M14 8H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 14V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 14V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 24H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

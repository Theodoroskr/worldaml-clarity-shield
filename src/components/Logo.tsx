import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

// Network Globe icon - nodes and connections suggesting global data infrastructure
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
      {/* Outer circle - the globe boundary */}
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Network nodes - strategic positions */}
      <circle cx="16" cy="6" r="1.3" fill="currentColor" /> {/* Top */}
      <circle cx="16" cy="26" r="1.3" fill="currentColor" /> {/* Bottom */}
      <circle cx="6" cy="16" r="1.3" fill="currentColor" /> {/* Left */}
      <circle cx="26" cy="16" r="1.3" fill="currentColor" /> {/* Right */}
      <circle cx="16" cy="16" r="1.5" fill="currentColor" /> {/* Center */}
      <circle cx="10" cy="10" r="1.2" fill="currentColor" /> {/* Top-left */}
      <circle cx="22" cy="10" r="1.2" fill="currentColor" /> {/* Top-right */}
      <circle cx="10" cy="22" r="1.2" fill="currentColor" /> {/* Bottom-left */}
      <circle cx="22" cy="22" r="1.2" fill="currentColor" /> {/* Bottom-right */}
      
      {/* Network connections - thin lines between nodes */}
      <line x1="16" y1="6" x2="16" y2="16" stroke="currentColor" strokeWidth="0.8" />
      <line x1="16" y1="16" x2="16" y2="26" stroke="currentColor" strokeWidth="0.8" />
      <line x1="6" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="0.8" />
      <line x1="16" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="0.8" />
      <line x1="10" y1="10" x2="16" y2="16" stroke="currentColor" strokeWidth="0.8" />
      <line x1="22" y1="10" x2="16" y2="16" stroke="currentColor" strokeWidth="0.8" />
      <line x1="10" y1="22" x2="16" y2="16" stroke="currentColor" strokeWidth="0.8" />
      <line x1="22" y1="22" x2="16" y2="16" stroke="currentColor" strokeWidth="0.8" />
      
      {/* Outer ring connections */}
      <line x1="16" y1="6" x2="22" y2="10" stroke="currentColor" strokeWidth="0.6" />
      <line x1="16" y1="6" x2="10" y2="10" stroke="currentColor" strokeWidth="0.6" />
      <line x1="26" y1="16" x2="22" y2="10" stroke="currentColor" strokeWidth="0.6" />
      <line x1="26" y1="16" x2="22" y2="22" stroke="currentColor" strokeWidth="0.6" />
      <line x1="16" y1="26" x2="22" y2="22" stroke="currentColor" strokeWidth="0.6" />
      <line x1="16" y1="26" x2="10" y2="22" stroke="currentColor" strokeWidth="0.6" />
      <line x1="6" y1="16" x2="10" y2="22" stroke="currentColor" strokeWidth="0.6" />
      <line x1="6" y1="16" x2="10" y2="10" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
};

// Full logo with wordmark and optional tagline
export const Logo = ({ className, iconOnly = false, size = "md", showTagline = false }: LogoProps) => {
  const textSizeMap = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const taglineSizeMap = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  if (iconOnly) {
    return <LogoIcon className={className} size={size} />;
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcon size={size} className="text-navy" />
      <div className="flex flex-col">
        <div className="flex items-baseline gap-0.5">
          <span className={cn("font-normal tracking-tight text-navy", textSizeMap[size])}>
            World
          </span>
          <span className={cn("font-semibold tracking-tight text-navy", textSizeMap[size])}>
            AML
          </span>
        </div>
        {showTagline && (
          <span className={cn(
            "text-text-tertiary tracking-wide uppercase leading-tight",
            taglineSizeMap[size]
          )}>
            Financial Crime Screening Infrastructure
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;

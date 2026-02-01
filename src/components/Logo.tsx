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
      {/* Shield-grid hybrid: protective shape with connected nodes */}
      {/* Outer shield path */}
      <path
        d="M16 2L4 7V15C4 22.18 9.12 28.76 16 30C22.88 28.76 28 22.18 28 15V7L16 2Z"
        fill="currentColor"
        opacity="0.1"
      />
      {/* Connected nodes forming a network within shield */}
      <circle cx="16" cy="10" r="2.5" fill="currentColor" />
      <circle cx="10" cy="17" r="2.5" fill="currentColor" />
      <circle cx="22" cy="17" r="2.5" fill="currentColor" />
      <circle cx="16" cy="24" r="2.5" fill="currentColor" />
      {/* Connection lines */}
      <path d="M16 12.5V21.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 11.5L11.5 15.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 11.5L20.5 15.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.5 17L13.5 21.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.5 17L18.5 21.5" stroke="currentColor" strokeWidth="1.5" />
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

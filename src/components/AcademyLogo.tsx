import { cn } from "@/lib/utils";
import { LogoIcon } from "./Logo";

interface AcademyLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}

/**
 * WorldAML Academy lockup — reuses the network-globe brand icon
 * with an "Academy" sub-wordmark. Stays visually consistent with
 * the main site logo (see src/components/Logo.tsx).
 */
export const AcademyLogo = ({
  className,
  iconOnly = false,
  size = "md",
  variant = "default",
}: AcademyLogoProps) => {
  const textSizeMap = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };
  const subSizeMap = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  const textTone = variant === "light" ? "text-white" : "text-navy";
  const subTone = variant === "light" ? "text-white/70" : "text-text-tertiary";

  if (iconOnly) {
    return <LogoIcon className={cn(textTone, className)} size={size} />;
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcon size={size} className={textTone} />
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline gap-0.5">
          <span className={cn("font-normal tracking-tight", textTone, textSizeMap[size])}>
            World
          </span>
          <span className={cn("font-semibold tracking-tight", textTone, textSizeMap[size])}>
            AML
          </span>
          <span
            className={cn(
              "ml-1.5 font-medium tracking-[0.18em] uppercase",
              subTone,
              subSizeMap[size]
            )}
          >
            Academy
          </span>
        </div>
      </div>
    </div>
  );
};

export default AcademyLogo;

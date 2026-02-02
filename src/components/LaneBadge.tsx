import { Badge } from "@/components/ui/badge";
import { Lane, LANE_LABELS } from "@/types/regions";
import { cn } from "@/lib/utils";

interface LaneBadgeProps {
  lane: Lane;
  className?: string;
}

export const LaneBadge = ({ lane, className }: LaneBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium px-3 py-1 rounded-full",
        lane === "platform" 
          ? "border-navy/30 bg-navy/5 text-navy" 
          : "border-teal/30 bg-teal/5 text-teal-dark",
        className
      )}
    >
      {LANE_LABELS[lane]}
    </Badge>
  );
};

export default LaneBadge;

import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegion } from "@/contexts/RegionContext";
import { Region, REGIONS } from "@/types/regions";

export const RegionSelector = () => {
  const { region, setRegion, isLoading } = useRegion();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Detecting...</span>
      </div>
    );
  }

  return (
    <Select value={region} onValueChange={(value) => setRegion(value as Region)}>
      <SelectTrigger
        aria-label="Select region"
        className="w-[125px] h-8 px-2 text-xs border-border bg-transparent hover:bg-secondary/60 transition-colors"
      >
        <Globe className="h-3.5 w-3.5 mr-1.5 text-text-secondary shrink-0" />
        <SelectValue className="truncate" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(REGIONS).map((r) => (
          <SelectItem key={r.id} value={r.id} className="text-xs">
            {r.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RegionSelector;

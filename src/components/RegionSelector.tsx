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
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Globe className="h-4 w-4" />
        <span>Detecting...</span>
      </div>
    );
  }

  return (
    <Select value={region} onValueChange={(value) => setRegion(value as Region)}>
      <SelectTrigger className="w-[160px] h-9 text-sm border-slate-200">
        <Globe className="h-4 w-4 mr-2 text-text-secondary" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(REGIONS).map((r) => (
          <SelectItem key={r.id} value={r.id}>
            {r.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RegionSelector;

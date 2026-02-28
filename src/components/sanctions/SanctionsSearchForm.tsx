import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COUNTRIES = [
  { code: "AF", name: "Afghanistan" }, { code: "BY", name: "Belarus" },
  { code: "CN", name: "China" }, { code: "CU", name: "Cuba" },
  { code: "IR", name: "Iran" }, { code: "IQ", name: "Iraq" },
  { code: "KP", name: "North Korea" }, { code: "LB", name: "Lebanon" },
  { code: "LY", name: "Libya" }, { code: "ML", name: "Mali" },
  { code: "MM", name: "Myanmar" }, { code: "NG", name: "Nigeria" },
  { code: "PK", name: "Pakistan" }, { code: "PS", name: "Palestine" },
  { code: "RU", name: "Russia" }, { code: "SO", name: "Somalia" },
  { code: "SS", name: "South Sudan" }, { code: "SD", name: "Sudan" },
  { code: "SY", name: "Syria" }, { code: "UA", name: "Ukraine" },
  { code: "VE", name: "Venezuela" }, { code: "YE", name: "Yemen" },
  { code: "ZW", name: "Zimbabwe" },
];

interface Props {
  onSearch: (params: { name: string; country: string; type: string }) => void;
  loading: boolean;
}

export const SanctionsSearchForm = ({ onSearch, loading }: Props) => {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("all");
  const [type, setType] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSearch({ name: name.trim(), country: country === "all" ? "" : country, type: type === "all" ? "" : type });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search-name" className="text-body-sm font-medium text-foreground">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="search-name"
          placeholder="e.g. Wagner Group, Al-Qaeda, Sberbank…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-base"
          maxLength={200}
          required
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-body-sm font-medium text-foreground">Country / Nationality</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Any country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any country</SelectItem>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-body-sm font-medium text-foreground">Entity Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any type</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="company">Company / Organisation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading || !name.trim()}>
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching…</>
        ) : (
          <><Search className="w-4 h-4 mr-2" /> Check Sanctions Lists</>
        )}
      </Button>
    </form>
  );
};

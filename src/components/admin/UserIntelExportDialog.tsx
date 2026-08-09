import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet } from "lucide-react";
import {
  DATE_PRESET_LABELS, DEFAULT_EXPORT_FIELDS, DatePreset, EXPORT_FIELDS, EnrichedUser,
  USER_TYPE_LABELS, UserType, resolveDatePreset,
} from "@/lib/adminUserIntel";

export type ExportScope = "all" | "filtered" | "selected";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  allUsers: EnrichedUser[];
  filteredUsers: EnrichedUser[];
  selectedUsers: EnrichedUser[];
  onExport: (rows: Record<string, string | number>[], meta: { count: number; scope: ExportScope; range: string; fields: number }, format: "csv" | "xlsx") => void;
}

export default function UserIntelExportDialog({ open, onOpenChange, allUsers, filteredUsers, selectedUsers, onExport }: Props) {
  const [scope, setScope] = useState<ExportScope>("filtered");
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [types, setTypes] = useState<UserType[]>([]);
  const [minRevenue, setMinRevenue] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxInactive, setMaxInactive] = useState("");
  const [fields, setFields] = useState<string[]>(DEFAULT_EXPORT_FIELDS);

  const base = scope === "all" ? allUsers : scope === "selected" ? selectedUsers : filteredUsers;
  const range = resolveDatePreset(preset, from, to);

  const rowsUsers = useMemo(() => {
    if (!range) return [];
    return base.filter((u) => {
      const t = new Date(u.registeredAt).getTime();
      if (isNaN(t) || t < range.from.getTime() || t > range.to.getTime()) return false;
      if (types.length && !types.some((x) => u.types.includes(x))) return false;
      if (minRevenue !== "" && u.revenueCents / 100 <= Number(minRevenue)) return false;
      if (minAge !== "" && (u.accountAgeDays ?? -1) < Number(minAge)) return false;
      if (maxInactive !== "" && (u.daysInactive ?? Infinity) > Number(maxInactive)) return false;
      return true;
    });
  }, [base, range?.from?.getTime(), range?.to?.getTime(), types, minRevenue, minAge, maxInactive]);

  const groups = useMemo(() => {
    const m = new Map<string, typeof EXPORT_FIELDS>();
    EXPORT_FIELDS.forEach((f) => m.set(f.group, [...(m.get(f.group) || []), f]));
    return [...m.entries()];
  }, []);

  const run = (format: "csv" | "xlsx") => {
    const chosen = EXPORT_FIELDS.filter((f) => fields.includes(f.id));
    const rows = rowsUsers.map((u) => Object.fromEntries(chosen.map((f) => [f.id, f.value(u)])));
    const label = preset === "custom" ? `${from} → ${to}` : DATE_PRESET_LABELS[preset];
    onExport(rows, { count: rows.length, scope, range: label, fields: chosen.length }, format);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Export users</DialogTitle></DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Scope</label>
              <Select value={scope} onValueChange={(v) => setScope(v as ExportScope)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All users ({allUsers.length})</SelectItem>
                  <SelectItem value="filtered">Current filtered results ({filteredUsers.length})</SelectItem>
                  <SelectItem value="selected">Selected users ({selectedUsers.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Timeline (registration date) — required</label>
              <Select value={preset} onValueChange={(v) => setPreset(v as DatePreset)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {(Object.keys(DATE_PRESET_LABELS) as DatePreset[]).map((k) => (
                    <SelectItem key={k} value={k}>{DATE_PRESET_LABELS[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs text-muted-foreground">From</label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
              <div className="space-y-1"><label className="text-xs text-muted-foreground">To</label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium">User types (any of)</label>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(USER_TYPE_LABELS) as UserType[]).map((t) => (
                <label key={t} className="flex items-center gap-1.5 text-xs">
                  <Checkbox checked={types.includes(t)} onCheckedChange={(c) => setTypes(c ? [...types, t] : types.filter((x) => x !== t))} />
                  {USER_TYPE_LABELS[t]}
                </label>
              ))}
              {types.length === 0 && <span className="text-[11px] text-muted-foreground">No selection = all types</span>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1"><label className="text-xs text-muted-foreground">Revenue greater than (€)</label>
              <Input type="number" value={minRevenue} onChange={(e) => setMinRevenue(e.target.value)} placeholder="any" /></div>
            <div className="space-y-1"><label className="text-xs text-muted-foreground">Account age ≥ (days)</label>
              <Input type="number" value={minAge} onChange={(e) => setMinAge(e.target.value)} placeholder="any" /></div>
            <div className="space-y-1"><label className="text-xs text-muted-foreground">Active within (days)</label>
              <Input type="number" value={maxInactive} onChange={(e) => setMaxInactive(e.target.value)} placeholder="any" /></div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Export fields ({fields.length})</label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => setFields(EXPORT_FIELDS.map((f) => f.id))}>Select all</Button>
                <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => setFields(DEFAULT_EXPORT_FIELDS)}>Reset</Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 rounded-lg border border-border p-3">
              {groups.map(([g, list]) => (
                <div key={g}>
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">{g}</p>
                  <div className="space-y-1">
                    {list.map((f) => (
                      <label key={f.id} className="flex items-center gap-1.5 text-[11px]">
                        <Checkbox checked={fields.includes(f.id)}
                          onCheckedChange={(c) => setFields(c ? [...fields, f.id] : fields.filter((x) => x !== f.id))} />
                        <span className="truncate">{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3 text-xs text-teal-900 space-y-1">
            <p className="font-semibold">Export summary</p>
            <p>Users matching criteria: <strong>{rowsUsers.length}</strong></p>
            <p>Scope: <strong>{scope === "all" ? "All users" : scope === "selected" ? "Selected users" : "Current filtered results"}</strong></p>
            <p>Date range: <strong>{preset === "custom" ? `${from || "?"} → ${to || "?"}` : DATE_PRESET_LABELS[preset]}</strong></p>
            <p>User types: <strong>{types.length ? types.map((t) => USER_TYPE_LABELS[t]).join(" + ") : "All"}</strong></p>
            <p>Fields: <strong>{fields.length}</strong></p>
            {!range && <p className="text-red-700">Select a valid custom range to continue.</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Badge variant="outline" className="mr-auto text-[11px]">Exports are logged in the admin audit trail</Badge>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" variant="outline" disabled={!range || !rowsUsers.length || !fields.length} onClick={() => run("xlsx")}>
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Export Excel
          </Button>
          <Button size="sm" disabled={!range || !rowsUsers.length || !fields.length} onClick={() => run("csv")}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

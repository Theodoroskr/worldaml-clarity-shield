import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Table2, Bookmark, Trash2, ArrowUpDown } from "lucide-react";
import {
  COLUMN_DEFS, DATE_PRESET_LABELS, DatePreset, EnrichedUser, FIELD_DEFS, FIELD_BY_ID,
  FilterCondition, FilterState, QUICK_SEGMENTS, SavedSegment, SORT_LABELS, SortKey,
  describeCondition, newCondition,
} from "@/lib/adminUserIntel";

interface Props {
  filters: FilterState;
  onFilters: (f: FilterState) => void;
  users: EnrichedUser[];
  matchCount: number;
  columns: string[];
  onColumns: (c: string[]) => void;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (k: SortKey, d: "asc" | "desc") => void;
  savedSegments: SavedSegment[];
  onSaveSegment: (name: string) => void;
  onDeleteSegment: (id: string) => void;
}

const dynamicOptions = (users: EnrichedUser[], key: string): Array<{ value: string; label: string }> => {
  const pick = (u: EnrichedUser): string[] => {
    switch (key) {
      case "source": return u.source ? [u.source] : [];
      case "country": return u.country ? [u.country] : [];
      case "domain": return u.domain ? [u.domain] : [];
      case "company": return u.company ? [u.company] : [];
      case "utm_source": return u.utm.utm_source ? [u.utm.utm_source] : [];
      case "utm_medium": return u.utm.utm_medium ? [u.utm.utm_medium] : [];
      case "utm_campaign": return u.utm.utm_campaign ? [u.utm.utm_campaign] : [];
      case "regulator": return u.p.regulator ? [u.p.regulator] : [];
      case "tier": return [u.tier];
      case "role": return u.roles.length ? u.roles : ["user"];
      default: return [];
    }
  };
  const set = new Set<string>();
  users.forEach((u) => pick(u).forEach((v) => set.add(v)));
  return [...set].sort().map((v) => ({ value: v, label: v }));
};

function MultiSelect({
  options, value, onChange, placeholder,
}: { options: Array<{ value: string; label: string }>; value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [q, setQ] = useState("");
  const list = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())).slice(0, 200);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 min-w-[150px] justify-start text-xs font-normal">
          {value.length ? `${value.length} selected` : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 bg-popover z-50" align="start">
        {options.length > 8 && (
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-8 text-xs mb-2" />
        )}
        <div className="max-h-60 overflow-auto space-y-1">
          {list.length === 0 && <p className="text-xs text-muted-foreground px-1 py-2">No values available in the current data.</p>}
          {list.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-xs px-1 py-1 rounded hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={value.includes(o.value)}
                onCheckedChange={(c) => onChange(c ? [...value, o.value] : value.filter((v) => v !== o.value))}
              />
              <span className="truncate">{o.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function UserIntelFilters({
  filters, onFilters, users, matchCount, columns, onColumns,
  sortKey, sortDir, onSort, savedSegments, onSaveSegment, onDeleteSegment,
}: Props) {
  const [segName, setSegName] = useState("");
  const groups = useMemo(() => {
    const m = new Map<string, typeof FIELD_DEFS>();
    FIELD_DEFS.forEach((f) => m.set(f.group, [...(m.get(f.group) || []), f]));
    return [...m.entries()];
  }, []);

  const update = (id: string, patch: Partial<FilterCondition>) =>
    onFilters({ ...filters, conditions: filters.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const remove = (id: string) => onFilters({ ...filters, conditions: filters.conditions.filter((c) => c.id !== id) });
  const add = () => onFilters({ ...filters, conditions: [...filters.conditions, newCondition()] });

  const renderValue = (c: FilterCondition) => {
    const def = FIELD_BY_ID[c.field];
    if (!def) return null;
    if (def.kind === "multi") {
      const opts = def.options || dynamicOptions(users, def.dynamic || "");
      return <MultiSelect options={opts} value={Array.isArray(c.value) ? c.value : []} onChange={(v) => update(c.id, { value: v })} placeholder="Any" />;
    }
    if (def.kind === "select") {
      return (
        <Select value={c.value || ""} onValueChange={(v) => update(c.id, { value: v })}>
          <SelectTrigger className="h-8 w-[170px] text-xs"><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {(def.options || []).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }
    if (def.kind === "date_preset") {
      return (
        <div className="flex items-center gap-1.5">
          <Select value={c.value || "30d"} onValueChange={(v) => update(c.id, { value: v })}>
            <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {(Object.keys(DATE_PRESET_LABELS) as DatePreset[]).map((k) => (
                <SelectItem key={k} value={k}>{DATE_PRESET_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {c.value === "custom" && (
            <>
              <Input type="date" className="h-8 w-[135px] text-xs" value={c.value2?.from || ""}
                onChange={(e) => update(c.id, { value2: { ...(c.value2 || {}), from: e.target.value } })} />
              <Input type="date" className="h-8 w-[135px] text-xs" value={c.value2?.to || ""}
                onChange={(e) => update(c.id, { value2: { ...(c.value2 || {}), to: e.target.value } })} />
            </>
          )}
        </div>
      );
    }
    if (def.kind === "number") {
      return (
        <div className="flex items-center gap-1.5">
          <Select value={c.operator} onValueChange={(v) => update(c.id, { operator: v as any })}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="gt">greater than</SelectItem>
              <SelectItem value="lt">less than</SelectItem>
              <SelectItem value="is">equals</SelectItem>
              <SelectItem value="between">between</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" className="h-8 w-[90px] text-xs" value={c.value ?? ""} onChange={(e) => update(c.id, { value: e.target.value })} />
          {c.operator === "between" && (
            <Input type="number" className="h-8 w-[90px] text-xs" value={c.value2 ?? ""} onChange={(e) => update(c.id, { value2: e.target.value })} />
          )}
        </div>
      );
    }
    return <Input className="h-8 w-[180px] text-xs" placeholder="Contains…" value={c.value ?? ""} onChange={(e) => update(c.id, { value: e.target.value })} />;
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card/50 p-3">
      {/* Quick segments */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mr-1">Quick segments</span>
        {QUICK_SEGMENTS.map((s) => (
          <Button key={s.id} variant="outline" size="sm" title={s.description}
            className="h-7 rounded-full px-2.5 text-[11px] font-normal"
            onClick={() => onFilters({ ...s.state, conditions: s.state.conditions.map((c) => ({ ...c, id: `${c.id}_${s.id}` })) })}>
            {s.label}
          </Button>
        ))}
      </div>

      {savedSegments.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mr-1">Saved</span>
          {savedSegments.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 pl-2.5 pr-1 py-0.5 text-[11px]">
              <button className="text-primary" onClick={() => onFilters(s.state)}>{s.name}</button>
              <button className="text-muted-foreground hover:text-destructive" onClick={() => onDeleteSegment(s.id)}>
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Condition rows */}
      <div className="space-y-2">
        {filters.conditions.map((c, idx) => (
          <div key={c.id} className="flex flex-wrap items-center gap-2">
            <span className="w-12 text-[11px] font-medium text-muted-foreground">
              {idx === 0 ? "Where" : filters.logic}
            </span>
            <Select value={c.field} onValueChange={(v) => onFilters({ ...filters, conditions: filters.conditions.map((x) => (x.id === c.id ? { ...newCondition(v), id: x.id } : x)) })}>
              <SelectTrigger className="h-8 w-[190px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-72">
                {groups.map(([g, fields]) => (
                  <div key={g}>
                    <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">{g}</div>
                    {fields.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {["multi", "select", "text"].includes(FIELD_BY_ID[c.field]?.kind) && (
              <Select value={c.operator} onValueChange={(v) => update(c.id, { operator: v as any })}>
                <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="is">{FIELD_BY_ID[c.field]?.kind === "text" ? "contains" : "is"}</SelectItem>
                  <SelectItem value="is_not">is not</SelectItem>
                </SelectContent>
              </Select>
            )}
            {renderValue(c)}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => remove(c.id)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={add}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add filter
        </Button>

        {filters.conditions.length > 1 && (
          <Select value={filters.logic} onValueChange={(v) => onFilters({ ...filters, logic: v as "AND" | "OR" })}>
            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="AND">Match ALL conditions</SelectItem>
              <SelectItem value="OR">Match ANY condition</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={sortKey} onValueChange={(v) => onSort(v as SortKey, sortDir)}>
            <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => <SelectItem key={k} value={k}>{SORT_LABELS[k]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onSort(sortKey, sortDir === "asc" ? "desc" : "asc")}>
            {sortDir === "asc" ? "Asc" : "Desc"}
          </Button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Table2 className="w-3.5 h-3.5 mr-1" /> Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2 bg-popover z-50" align="start">
            <div className="max-h-72 overflow-auto space-y-1">
              {COLUMN_DEFS.map((col) => (
                <label key={col.id} className="flex items-center gap-2 text-xs px-1 py-1 rounded hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={columns.includes(col.id)}
                    disabled={!col.optional}
                    onCheckedChange={(c) => onColumns(c ? [...columns, col.id] : columns.filter((x) => x !== col.id))}
                  />
                  <span>{col.label}</span>
                  {!col.optional && <span className="ml-auto text-[10px] text-muted-foreground">core</span>}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!filters.conditions.length}>
              <Bookmark className="w-3.5 h-3.5 mr-1" /> Save segment
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 bg-popover z-50" align="start">
            <Input className="h-8 text-xs mb-2" placeholder="Segment name" value={segName} onChange={(e) => setSegName(e.target.value)} />
            <Button size="sm" className="h-8 w-full text-xs" disabled={!segName.trim()}
              onClick={() => { onSaveSegment(segName.trim()); setSegName(""); }}>
              Save filter configuration
            </Button>
          </PopoverContent>
        </Popover>

        <span className="ml-auto text-xs font-medium text-foreground">
          {matchCount} user{matchCount === 1 ? "" : "s"} match these filters
        </span>
      </div>

      {filters.conditions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-2">
          {filters.conditions.map((c) => (
            <Badge key={c.id} variant="outline" className="gap-1 text-[11px] font-normal">
              {describeCondition(c)}
              <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => onFilters({ logic: "AND", conditions: [] })}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

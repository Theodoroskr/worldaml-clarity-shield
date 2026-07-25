import { useState, useRef, useMemo, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type MentionCandidate = {
  user_id: string;
  full_name: string | null;
  email: string | null;
};

type Props = {
  value: string;
  onChange: (value: string, mentions: string[]) => void;
  members: MentionCandidate[];
  placeholder?: string;
  rows?: number;
  className?: string;
};

function labelFor(m: MentionCandidate) {
  return (m.full_name || m.email || m.user_id.slice(0, 8)).replace(/\s+/g, "_");
}

export function extractMentions(text: string, members: MentionCandidate[]): string[] {
  const byLabel = new Map(members.map(m => [labelFor(m).toLowerCase(), m.user_id]));
  const found = new Set<string>();
  const re = /@([a-zA-Z0-9._-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const uid = byLabel.get(m[1].toLowerCase());
    if (uid) found.add(uid);
  }
  return Array.from(found);
}

export function MentionTextarea({ value, onChange, members, placeholder, rows = 2, className }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [caret, setCaret] = useState(0);

  const suggestions = useMemo(() => {
    if (query === null) return [];
    const q = query.toLowerCase();
    return members
      .filter(m => labelFor(m).toLowerCase().includes(q) || (m.email || "").toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, members]);

  useEffect(() => {
    const t = value.slice(0, caret);
    const at = t.lastIndexOf("@");
    if (at === -1) { setQuery(null); return; }
    const after = t.slice(at + 1);
    if (/\s/.test(after)) { setQuery(null); return; }
    if (at > 0 && !/\s/.test(t[at - 1])) { setQuery(null); return; }
    setQuery(after);
  }, [value, caret]);

  function pick(m: MentionCandidate) {
    const before = value.slice(0, caret);
    const at = before.lastIndexOf("@");
    const after = value.slice(caret);
    const replacement = `@${labelFor(m)} `;
    const next = before.slice(0, at) + replacement + after;
    const newCaret = at + replacement.length;
    const mentions = extractMentions(next, members);
    onChange(next, mentions);
    setQuery(null);
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(newCaret, newCaret);
    });
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={e => {
          setCaret(e.target.selectionStart ?? e.target.value.length);
          onChange(e.target.value, extractMentions(e.target.value, members));
        }}
        onKeyUp={e => setCaret((e.target as HTMLTextAreaElement).selectionStart ?? 0)}
        onClick={e => setCaret((e.target as HTMLTextAreaElement).selectionStart ?? 0)}
      />
      {query !== null && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-64 rounded-md border bg-popover text-popover-foreground shadow-md">
          {suggestions.map(m => (
            <button
              key={m.user_id}
              type="button"
              onClick={() => pick(m)}
              className="flex w-full flex-col items-start px-3 py-1.5 text-left text-sm hover:bg-accent"
            >
              <span>{m.full_name || m.email || m.user_id.slice(0, 8)}</span>
              {m.email && m.full_name && <span className="text-xs text-muted-foreground">{m.email}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function renderMentionText(text: string) {
  const parts = text.split(/(@[a-zA-Z0-9._-]+)/g);
  return parts.map((p, i) =>
    p.startsWith("@")
      ? <span key={i} className="text-primary font-medium">{p}</span>
      : <span key={i}>{p}</span>
  );
}

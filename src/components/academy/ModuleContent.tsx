import React, { useMemo } from "react";
import { Info, AlertTriangle, Lightbulb, Sparkles, BookMarked } from "lucide-react";

interface Props {
  content: string;
  className?: string;
}

type Heading = { id: string; text: string; level: number };

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

export const extractHeadings = (raw: string): Heading[] => {
  const lines = raw.replace(/\\n/g, "\n").split("\n");
  const headings: Heading[] = [];
  const seen = new Set<string>();
  let inFence = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = trimmed.match(/^(#{1,4})\s+(.*)$/);
    let text: string | null = null;
    let level = 2;
    if (m) {
      level = Math.max(2, m[1].length + 1); // # -> h2
      text = m[2].replace(/\*\*/g, "").trim();
    } else if (/^\*\*[^*]+\*\*:?$/.test(trimmed)) {
      text = trimmed.replace(/\*\*/g, "").replace(/:$/, "").trim();
      level = 3;
    }
    if (text) {
      let id = slugify(text);
      let suffix = 1;
      while (seen.has(id)) {
        id = `${slugify(text)}-${++suffix}`;
      }
      seen.add(id);
      headings.push({ id, text, level });
    }
  }
  return headings;
};

export const computeReadingMinutes = (raw: string): number => {
  const words = raw.replace(/\\n/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
  const tokens: React.ReactNode[] = [];
  // Order matters: links first, then bold/italic/code
  const regex =
    /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(?<!\*)\*([^*\n]+)\*(?!\*)|`([^`]+)`|(\bhttps?:\/\/[^\s)]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) tokens.push(text.slice(lastIndex, match.index));
    if (match[2] !== undefined) {
      tokens.push(
        <a
          key={`${keyPrefix}-l-${idx++}`}
          href={match[3]}
          target={match[3].startsWith("http") ? "_blank" : undefined}
          rel={match[3].startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-accent underline underline-offset-2 decoration-accent/40 hover:decoration-accent transition-colors"
        >
          {match[2]}
        </a>
      );
    } else if (match[5] !== undefined) {
      tokens.push(
        <strong key={`${keyPrefix}-b-${idx++}`} className="font-semibold text-foreground">
          {match[5]}
        </strong>
      );
    } else if (match[6] !== undefined) {
      tokens.push(
        <em key={`${keyPrefix}-i-${idx++}`} className="italic text-foreground/90">
          {match[6]}
        </em>
      );
    } else if (match[7] !== undefined) {
      tokens.push(
        <code
          key={`${keyPrefix}-c-${idx++}`}
          className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[0.875em] border border-primary/15"
        >
          {match[7]}
        </code>
      );
    } else if (match[8] !== undefined) {
      tokens.push(
        <a
          key={`${keyPrefix}-u-${idx++}`}
          href={match[8]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 decoration-accent/40 hover:decoration-accent break-all transition-colors"
        >
          {match[8]}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens.length ? tokens : [text];
};

const CALLOUT_STYLES: Record<
  string,
  { bg: string; border: string; iconColor: string; Icon: typeof Info; label: string }
> = {
  info: { bg: "bg-blue-500/5", border: "border-blue-500/30", iconColor: "text-blue-600 dark:text-blue-400", Icon: Info, label: "Info" },
  warning: { bg: "bg-amber-500/5", border: "border-amber-500/30", iconColor: "text-amber-600 dark:text-amber-400", Icon: AlertTriangle, label: "Warning" },
  tip: { bg: "bg-emerald-500/5", border: "border-emerald-500/30", iconColor: "text-emerald-600 dark:text-emerald-400", Icon: Lightbulb, label: "Tip" },
  key: { bg: "bg-primary/5", border: "border-primary/30", iconColor: "text-primary", Icon: Sparkles, label: "Key Takeaway" },
  definition: { bg: "bg-secondary/50", border: "border-border", iconColor: "text-foreground", Icon: BookMarked, label: "Definition" },
};

const Callout: React.FC<{ kind: string; title?: string; children: React.ReactNode }> = ({ kind, title, children }) => {
  const style = CALLOUT_STYLES[kind] || CALLOUT_STYLES.info;
  const { Icon } = style;
  return (
    <div className={`my-6 rounded-xl border ${style.border} ${style.bg} p-4 md:p-5`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex-shrink-0 ${style.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-caption font-semibold uppercase tracking-wide mb-1.5 ${style.iconColor}`}>
            {title || style.label}
          </p>
          <div className="text-foreground/90 text-body leading-[1.7] space-y-2">{children}</div>
        </div>
      </div>
    </div>
  );
};

const ModuleContent: React.FC<Props> = ({ content, className }) => {
  const elements = useMemo(() => {
    const lines = content.replace(/\\n/g, "\n").split("\n");
    const out: React.ReactNode[] = [];

    let listBuffer: { type: "ul" | "ol"; items: { content: string; marker?: string }[] } | null = null;
    let calloutBuffer: { kind: string; title?: string; lines: string[] } | null = null;
    let tableBuffer: string[] | null = null;
    let codeBuffer: { lang: string; lines: string[] } | null = null;
    const headingSeen = new Set<string>();

    const headingId = (text: string) => {
      let id = slugify(text);
      let suffix = 1;
      while (headingSeen.has(id)) id = `${slugify(text)}-${++suffix}`;
      headingSeen.add(id);
      return id;
    };

    const flushList = () => {
      if (!listBuffer) return;
      const { type, items } = listBuffer;
      const key = `list-${out.length}`;
      if (type === "ul") {
        out.push(
          <ul key={key} className="my-4 space-y-2">
            {items.map((it, ii) => (
              <li key={ii} className="flex items-start gap-3 pl-1">
                <span className="mt-[0.7em] flex-shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-foreground/85 text-body leading-[1.7]">{renderInline(it.content, `${key}-${ii}`)}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        out.push(
          <ol key={key} className="my-4 space-y-2">
            {items.map((it, ii) => (
              <li key={ii} className="flex items-start gap-3 pl-1">
                <span className="text-primary font-semibold flex-shrink-0 min-w-[1.5rem] text-body leading-[1.7]">{it.marker}</span>
                <span className="text-foreground/85 text-body leading-[1.7]">{renderInline(it.content, `${key}-${ii}`)}</span>
              </li>
            ))}
          </ol>
        );
      }
      listBuffer = null;
    };

    const flushTable = () => {
      if (!tableBuffer || tableBuffer.length < 2) {
        tableBuffer = null;
        return;
      }
      const rows = tableBuffer
        .map((r) => r.trim().replace(/^\|/, "").replace(/\|$/, ""))
        .map((r) => r.split("|").map((c) => c.trim()));
      const header = rows[0];
      // rows[1] is separator; skip it
      const body = rows.slice(2);
      const key = `tbl-${out.length}`;
      out.push(
        <div key={key} className="my-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-body-sm">
            <thead className="bg-primary/5">
              <tr>
                {header.map((h, hi) => (
                  <th key={hi} className="text-left font-semibold text-foreground px-4 py-2.5 border-b border-border">
                    {renderInline(h, `${key}-h-${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2.5 text-foreground/85 align-top">
                      {renderInline(cell, `${key}-r${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = null;
    };

    const flushCode = () => {
      if (!codeBuffer) return;
      const key = `code-${out.length}`;
      out.push(
        <pre key={key} className="my-5 overflow-x-auto rounded-lg border border-border bg-secondary/40 p-4">
          <code className="text-body-sm font-mono text-foreground whitespace-pre">{codeBuffer.lines.join("\n")}</code>
        </pre>
      );
      codeBuffer = null;
    };

    const flushCallout = () => {
      if (!calloutBuffer) return;
      const key = `co-${out.length}`;
      const { kind, title, lines: cLines } = calloutBuffer;
      // Recursively render lines inside callout as paragraphs / lists
      const inner: React.ReactNode[] = [];
      let innerList: { type: "ul" | "ol"; items: { content: string; marker?: string }[] } | null = null;
      const flushInnerList = () => {
        if (!innerList) return;
        const lk = `${key}-il-${inner.length}`;
        if (innerList.type === "ul") {
          inner.push(
            <ul key={lk} className="space-y-1.5">
              {innerList.items.map((it, ii) => (
                <li key={ii} className="flex items-start gap-2.5">
                  <span className="mt-[0.6em] h-1.5 w-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
                  <span>{renderInline(it.content, `${lk}-${ii}`)}</span>
                </li>
              ))}
            </ul>
          );
        } else {
          inner.push(
            <ol key={lk} className="space-y-1.5">
              {innerList.items.map((it, ii) => (
                <li key={ii} className="flex items-start gap-2.5">
                  <span className="font-semibold min-w-[1.25rem]">{it.marker}</span>
                  <span>{renderInline(it.content, `${lk}-${ii}`)}</span>
                </li>
              ))}
            </ol>
          );
        }
        innerList = null;
      };
      cLines.forEach((cl, ci) => {
        const t = cl.trim();
        if (!t) {
          flushInnerList();
          return;
        }
        if (/^[-*]\s+/.test(t)) {
          if (!innerList || innerList.type !== "ul") {
            flushInnerList();
            innerList = { type: "ul", items: [] };
          }
          innerList.items.push({ content: t.replace(/^[-*]\s+/, "") });
          return;
        }
        const ol = t.match(/^(\d+)[\.\)]\s+(.*)$/);
        if (ol) {
          if (!innerList || innerList.type !== "ol") {
            flushInnerList();
            innerList = { type: "ol", items: [] };
          }
          innerList.items.push({ marker: `${ol[1]}.`, content: ol[2] });
          return;
        }
        flushInnerList();
        inner.push(
          <p key={`${key}-p-${ci}`}>{renderInline(t, `${key}-p-${ci}`)}</p>
        );
      });
      flushInnerList();
      out.push(<Callout key={key} kind={kind} title={title}>{inner}</Callout>);
      calloutBuffer = null;
    };

    const flushAll = () => {
      flushList();
      flushTable();
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      const key = `l-${i}`;

      // Code fence
      if (trimmed.startsWith("```")) {
        if (codeBuffer) {
          flushCode();
        } else {
          flushAll();
          flushCallout();
          codeBuffer = { lang: trimmed.slice(3).trim(), lines: [] };
        }
        return;
      }
      if (codeBuffer) {
        codeBuffer.lines.push(line);
        return;
      }

      // Callout fence: :::kind  or  :::kind Optional Title  ... :::
      const calloutOpen = trimmed.match(/^:::(info|warning|tip|key|definition)(?:\s+(.+))?$/);
      if (calloutOpen) {
        flushAll();
        flushCallout();
        calloutBuffer = { kind: calloutOpen[1], title: calloutOpen[2], lines: [] };
        return;
      }
      if (trimmed === ":::" && calloutBuffer) {
        flushCallout();
        return;
      }
      if (calloutBuffer) {
        calloutBuffer.lines.push(line);
        return;
      }

      if (!trimmed) {
        flushAll();
        return;
      }

      // Table: row containing pipes, plus next-line separator
      if (trimmed.includes("|") && /^\|?.*\|.*\|?$/.test(trimmed)) {
        const next = (lines[i + 1] || "").trim();
        if (!tableBuffer && /^\|?[\s:|-]+$/.test(next) && next.includes("-")) {
          flushAll();
          tableBuffer = [trimmed];
          return;
        }
        if (tableBuffer) {
          tableBuffer.push(trimmed);
          return;
        }
      } else if (tableBuffer) {
        flushTable();
      }

      // Image
      const img = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (img) {
        flushAll();
        out.push(
          <figure key={key} className="my-6">
            <img
              src={img[2]}
              alt={img[1]}
              loading="lazy"
              className="w-full rounded-lg border border-border"
            />
            {img[1] && (
              <figcaption className="text-caption text-muted-foreground mt-2 text-center">{img[1]}</figcaption>
            )}
          </figure>
        );
        return;
      }

      // Headings
      const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        flushAll();
        const level = h[1].length;
        const text = h[2].replace(/\*\*/g, "");
        const id = headingId(text);
        if (level === 1) {
          out.push(
            <h2 key={key} id={id} className="text-2xl md:text-3xl font-bold text-primary mt-12 mb-4 scroll-mt-24 tracking-tight pl-4 border-l-4 border-accent">
              {text}
            </h2>
          );
        } else if (level === 2) {
          out.push(
            <h3 key={key} id={id} className="text-xl md:text-2xl font-semibold text-primary mt-10 mb-3 scroll-mt-24 tracking-tight">
              {text}
            </h3>
          );
        } else if (level === 3) {
          out.push(
            <h4 key={key} id={id} className="text-lg md:text-xl font-semibold text-foreground mt-8 mb-2 scroll-mt-24">
              {text}
            </h4>
          );
        } else {
          out.push(
            <h5 key={key} id={id} className="text-base font-semibold text-foreground mt-6 mb-2 uppercase tracking-wide">
              {text}
            </h5>
          );
        }
        return;
      }

      // Bold-only line treated as section heading (legacy content)
      if (/^\*\*[^*]+\*\*:?$/.test(trimmed)) {
        flushAll();
        const text = trimmed.replace(/\*\*/g, "").replace(/:$/, "");
        const id = headingId(text);
        out.push(
          <h3 key={key} id={id} className="text-xl md:text-2xl font-semibold text-foreground mt-10 mb-3 scroll-mt-24 tracking-tight">
            {text}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith("> ")) {
        flushAll();
        out.push(
          <blockquote key={key} className="my-5 pl-4 border-l-4 border-accent bg-accent/5 py-3 pr-4 rounded-r-md text-foreground/90 text-body leading-[1.7] italic">
            {renderInline(trimmed.slice(2), key)}
          </blockquote>
        );
        return;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        if (!listBuffer || listBuffer.type !== "ul") {
          flushAll();
          listBuffer = { type: "ul", items: [] };
        }
        listBuffer.items.push({ content: trimmed.replace(/^[-*]\s+/, "") });
        return;
      }

      const ol = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
      if (ol) {
        if (!listBuffer || listBuffer.type !== "ol") {
          flushAll();
          listBuffer = { type: "ol", items: [] };
        }
        listBuffer.items.push({ marker: `${ol[1]}.`, content: ol[2] });
        return;
      }

      flushAll();
      out.push(
        <p key={key} className="text-foreground/85 text-body leading-[1.75] my-3">
          {renderInline(trimmed, key)}
        </p>
      );
    });

    flushAll();
    flushCallout();
    flushCode();
    return out;
  }, [content]);

  return <div className={className}>{elements}</div>;
};

export default ModuleContent;

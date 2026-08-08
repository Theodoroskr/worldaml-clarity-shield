import { Badge } from "@/components/ui/badge";

type Section = {
  heading?: string;
  body?: string;
  bullets?: string[];
  type?: string;
  title?: string;
  subject?: string;
  preheader?: string;
  cta?: string;
  url?: string;
  landing_page?: string;
  hashtags?: string[];
};

export type AssetContent = {
  kind?: string;
  summary?: string;
  pages_target?: string;
  placeholders?: string[];
  pages?: { title: string; sections: Section[] }[];
  sections?: Section[];
  items?: Section[];
  governance?: string;
};

function Block({ s }: { s: Section }) {
  return (
    <div className="space-y-1.5">
      {(s.heading || s.title) && (
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-foreground">{s.heading || s.title}</h4>
          {s.type && (
            <Badge variant="outline" className="text-[10px]">
              {s.type}
            </Badge>
          )}
        </div>
      )}
      {s.subject && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">Subject:</span> {s.subject}
        </p>
      )}
      {s.preheader && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">Preheader:</span> {s.preheader}
        </p>
      )}
      {s.body && (
        <p className="text-sm text-foreground/85 whitespace-pre-line leading-relaxed">{s.body}</p>
      )}
      {s.bullets && (
        <ul className="space-y-1">
          {s.bullets.map((b) => (
            <li key={b} className="flex gap-2 text-sm text-foreground/85">
              <span className="text-teal">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {(s.cta || s.url || s.landing_page) && (
        <p className="text-xs text-muted-foreground">
          {s.cta && (
            <>
              <span className="font-medium text-foreground/80">CTA:</span> {s.cta}{" "}
            </>
          )}
          {(s.url || s.landing_page) && (
            <span className="font-mono break-all">{s.url || s.landing_page}</span>
          )}
        </p>
      )}
      {s.hashtags && <p className="text-xs text-muted-foreground">{s.hashtags.join(" ")}</p>}
    </div>
  );
}

export default function AssetContentReader({ content }: { content: AssetContent }) {
  return (
    <div className="space-y-6">
      {content.summary && (
        <p className="text-sm text-muted-foreground leading-relaxed">{content.summary}</p>
      )}
      {content.pages_target && (
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Target length: {content.pages_target}
        </p>
      )}
      {content.placeholders && content.placeholders.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {content.placeholders.map((p) => (
            <span
              key={p}
              className="text-[11px] font-mono px-2 py-0.5 rounded border border-border bg-muted/40 text-muted-foreground"
            >
              {p}
            </span>
          ))}
        </div>
      )}

      {content.pages?.map((p, i) => (
        <section key={p.title} className="rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-teal">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{p.title}</h3>
          </div>
          <div className="space-y-4">{p.sections?.map((s, j) => <Block key={j} s={s} />)}</div>
        </section>
      ))}

      {content.sections && (
        <section className="rounded-lg border border-border p-4 space-y-4">
          {content.sections.map((s, j) => (
            <Block key={j} s={s} />
          ))}
        </section>
      )}

      {content.items && (
        <div className="space-y-3">
          {content.items.map((s, j) => (
            <section key={j} className="rounded-lg border border-border p-4">
              <Block s={s} />
            </section>
          ))}
        </div>
      )}

      {content.governance && (
        <p className="text-xs text-muted-foreground border-l-2 border-teal pl-3">
          {content.governance}
        </p>
      )}
    </div>
  );
}

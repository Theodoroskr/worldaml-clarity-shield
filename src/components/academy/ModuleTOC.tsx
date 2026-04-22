import React from "react";
import { List } from "lucide-react";
import { extractHeadings } from "./ModuleContent";

interface Props {
  content: string;
}

const ModuleTOC: React.FC<Props> = ({ content }) => {
  const headings = extractHeadings(content);
  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="In this module"
      className="mb-8 rounded-xl border border-border bg-secondary/30 p-4 md:p-5"
    >
      <p className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        <List className="h-3.5 w-3.5" />
        In this module
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
            className="text-body-sm"
          >
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.replaceState(null, "", `#${h.id}`);
                }
              }}
              className="text-foreground/80 hover:text-primary transition-colors inline-block py-0.5"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ModuleTOC;

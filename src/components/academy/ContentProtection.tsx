import { ReactNode, useEffect } from "react";

let printStyleInjected = false;

const injectPrintStyle = () => {
  if (printStyleInjected || typeof document === "undefined") return;
  printStyleInjected = true;
  const style = document.createElement("style");
  style.setAttribute("data-academy-protection", "true");
  style.textContent = `
    @media print {
      .academy-protected,
      .academy-protected * {
        display: none !important;
        visibility: hidden !important;
      }
      body::after {
        content: "Printing protected content is not allowed — © WorldAML Academy";
        display: block;
        font-family: sans-serif;
        font-size: 18px;
        text-align: center;
        margin-top: 40vh;
        color: #000;
      }
    }
    .academy-protected {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
    .academy-protected img,
    .academy-protected svg {
      -webkit-user-drag: none;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
};

interface ContentProtectionProps {
  children: ReactNode;
  watermarkLabel?: string;
  className?: string;
}

const ContentProtection = ({ children, watermarkLabel, className = "" }: ContentProtectionProps) => {
  useEffect(() => {
    injectPrintStyle();

    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      // Block copy / cut / save / print / select-all
      if (mod && ["c", "x", "p", "s", "a"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }
      // PrintScreen — overwrite clipboard as deterrent
      if (key === "printscreen" || e.key === "PrintScreen") {
        try {
          navigator.clipboard?.writeText(
            "Screenshots of WorldAML Academy content are not permitted."
          );
        } catch {
          /* ignore */
        }
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  const block = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const label = watermarkLabel || "WorldAML Academy";
  const watermarkRow = Array.from({ length: 8 }, (_, i) => (
    <span key={i} className="mx-8">
      {label} · CONFIDENTIAL
    </span>
  ));

  return (
    <div
      className={`academy-protected relative ${className}`}
      onContextMenu={block}
      onCopy={block}
      onCut={block}
      onDragStart={block}
    >
      {/* Diagonal watermark overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none z-10"
        style={{ opacity: 0.06 }}
      >
        <div
          className="absolute inset-0 flex flex-col justify-around text-foreground text-xs font-semibold whitespace-nowrap"
          style={{ transform: "rotate(-30deg) scale(1.5)", transformOrigin: "center" }}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="flex">
              {watermarkRow}
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-0">{children}</div>
    </div>
  );
};

export default ContentProtection;

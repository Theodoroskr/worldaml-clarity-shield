import type { RecognitionStatus } from "@/hooks/useRecognition";
import { levelPresentation } from "@/lib/recognitionLevels";

/**
 * Renders a branded 1200x630 share card (WorldAML logo + member recognition).
 * Layout, navy base and WorldAML branding stay constant across levels; the
 * level name, recognition title, message, accent, emblem and achievement
 * counters are all driven by the member's real recognition status.
 */
const LOGO_SRC = "/email-logo.png";

const NAVY = "#0b1626";
const NAVY_2 = "#132234";
const TEAL = "#14b8a6";
const WHITE = "#ffffff";
const MUTED = "#94a3b8";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Recolours the logo to solid white so it sits directly on the navy card
 * (no white plate behind it). Transparency is preserved.
 */
function whitenLogo(img: HTMLImageElement, w: number, h: number): HTMLCanvasElement | null {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.round(w));
  off.height = Math.max(1, Math.round(h));
  const octx = off.getContext("2d");
  if (!octx) return null;
  octx.drawImage(img, 0, 0, off.width, off.height);
  // Drop any near-white/near-navy plate pixels, then paint remaining art white.
  try {
    const data = octx.getImageData(0, 0, off.width, off.height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      if (px[i + 3] > 0 && r > 235 && g > 235 && b > 235) px[i + 3] = 0;
    }
    octx.putImageData(data, 0, 0);
  } catch {
    // Canvas tainted (shouldn't happen for same-origin assets) — keep as-is.
  }
  octx.globalCompositeOperation = "source-in";
  octx.fillStyle = WHITE;
  octx.fillRect(0, 0, off.width, off.height);
  octx.globalCompositeOperation = "source-over";
  return off;
}


function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderRecognitionCard(
  r: RecognitionStatus,
  memberName?: string,
): Promise<Blob | null> {
  const W = 1200;
  const H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const preset = levelPresentation(r);
  const levelName = r.level?.name ?? "Member";
  const accent = preset.accent;

  // Background — navy always dominant
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, NAVY);
  bg.addColorStop(1, NAVY_2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Level-accent glow behind the emblem
  const glow = ctx.createRadialGradient(W - 190, 300, 20, W - 190, 300, 380);
  glow.addColorStop(0, preset.accentSoft);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top rule in the level accent
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 8);

  // Logo (constant branding)
  const logo = await loadImage(LOGO_SRC);
  if (logo) {
    const lw = 230;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, 72, 58, lw, lh);
  } else {
    ctx.fillStyle = WHITE;
    ctx.font = "bold 38px Arial, Helvetica, sans-serif";
    ctx.fillText("WorldAML", 72, 100);
  }

  const contentRight = 830; // leave room for the emblem

  // Eyebrow: WORLDAML ACADEMY · <level recognition title>
  ctx.fillStyle = accent;
  ctx.font = "bold 19px Arial, Helvetica, sans-serif";
  ctx.fillText(`WORLDAML ACADEMY · ${preset.recognitionTitle.toUpperCase()}`, 72, 186);

  // Member name
  const name = (memberName ?? "").trim();
  if (name) {
    ctx.fillStyle = WHITE;
    ctx.font = "bold 46px Arial, Helvetica, sans-serif";
    ctx.fillText(name, 72, 244);
  }

  // Level
  ctx.fillStyle = WHITE;
  ctx.font = "bold 62px Arial, Helvetica, sans-serif";
  ctx.fillText(levelName.toUpperCase(), 72, name ? 312 : 280);

  // Recognition message
  ctx.fillStyle = MUTED;
  ctx.font = "22px Arial, Helvetica, sans-serif";
  const msgLines = wrap(ctx, preset.message, contentRight - 72 - 20).slice(0, 3);
  msgLines.forEach((l, i) => ctx.fillText(l, 72, (name ? 352 : 320) + i * 30));

  // Emblem (right)
  const cx = W - 190;
  const cy = 300;
  ctx.beginPath();
  ctx.arc(cx, cy, 112, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = accent;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 96, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = accent;
  ctx.font = "bold 34px Arial, Helvetica, sans-serif";
  ctx.fillText(preset.emblem, cx, cy - 10);
  ctx.fillStyle = WHITE;
  ctx.font = "bold 20px Arial, Helvetica, sans-serif";
  ctx.fillText("MEMBER", cx, cy + 22);
  ctx.fillStyle = MUTED;
  ctx.font = "12px Arial, Helvetica, sans-serif";
  ctx.fillText("WORLDAML ACADEMY", cx, cy + 52);
  ctx.textAlign = "left";

  // Achievement data — always the member's real counts
  const specialisations = r.earnedBadges?.length ?? 0;
  const tiles = [
    {
      value: String(r.completedCourses ?? 0),
      label: r.completedCourses === 1 ? "Course completed" : "Courses completed",
      dim: false,
    },
    {
      value: String(r.certificates ?? 0),
      label: r.certificates === 1 ? "Certificate earned" : "Certificates earned",
      dim: (r.certificates ?? 0) === 0,
    },
    {
      value: String(specialisations),
      label: specialisations === 1 ? "Specialisation" : "Specialisations",
      dim: specialisations === 0,
    },
  ];

  const tw = 232;
  const th = 108;
  const ty = 424;
  tiles.forEach((t, i) => {
    const x = 72 + i * (tw + 18);
    ctx.fillStyle = t.dim ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)";
    roundedRect(ctx, x, ty, tw, th, 14);
    ctx.fill();
    ctx.strokeStyle = t.dim ? "rgba(255,255,255,0.10)" : `${accent}66`;
    ctx.lineWidth = 2;
    roundedRect(ctx, x, ty, tw, th, 14);
    ctx.stroke();

    ctx.fillStyle = t.dim ? "rgba(255,255,255,0.45)" : WHITE;
    ctx.font = "bold 40px Arial, Helvetica, sans-serif";
    ctx.fillText(t.value, x + 20, ty + 58);
    ctx.fillStyle = t.dim ? "rgba(148,163,184,0.65)" : MUTED;
    ctx.font = "17px Arial, Helvetica, sans-serif";
    ctx.fillText(t.label, x + 20, ty + 88);
  });

  // Earned specialisation names, elegantly listed (only when actually earned)
  if (specialisations > 0) {
    const names = r.earnedBadges.map((b) => b.name).join("  •  ");
    ctx.fillStyle = accent;
    ctx.font = "bold 13px Arial, Helvetica, sans-serif";
    ctx.fillText("SPECIALISATIONS", 782, ty + 46);
    ctx.fillStyle = WHITE;
    ctx.font = "18px Arial, Helvetica, sans-serif";
    const lines = wrap(ctx, names, W - 782 - 72).slice(0, 2);
    lines.forEach((l, i) => ctx.fillText(l, 782, ty + 74 + i * 24));
  }

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(72, 566, W - 144, 2);
  ctx.fillStyle = MUTED;
  ctx.font = "20px Arial, Helvetica, sans-serif";
  ctx.fillText("worldaml.com/academy", 72, 600);
  ctx.fillStyle = TEAL;
  ctx.font = "bold 20px Arial, Helvetica, sans-serif";
  const tagline = "WorldAML Academy Member Recognition";
  ctx.fillText(tagline, W - 72 - ctx.measureText(tagline).width, 600);

  return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

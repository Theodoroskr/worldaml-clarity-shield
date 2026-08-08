import type { RecognitionStatus } from "@/hooks/useRecognition";

/**
 * Renders a branded 1200x630 share card (WorldAML logo + member recognition)
 * that learners can attach to their LinkedIn / X / Facebook post.
 * Same-origin logo keeps the canvas untainted so it can be exported.
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

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderRecognitionCard(r: RecognitionStatus): Promise<Blob | null> {
  const W = 1200;
  const H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, NAVY);
  bg.addColorStop(1, NAVY_2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Teal glow accent
  const glow = ctx.createRadialGradient(W - 180, 150, 20, W - 180, 150, 420);
  glow.addColorStop(0, "rgba(20,184,166,0.28)");
  glow.addColorStop(1, "rgba(20,184,166,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top rule
  ctx.fillStyle = TEAL;
  ctx.fillRect(0, 0, W, 8);

  // Logo
  const logo = await loadImage(LOGO_SRC);
  if (logo) {
    const lw = 260;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, 72, 66, lw, lh);
  } else {
    ctx.fillStyle = WHITE;
    ctx.font = "bold 40px Arial, Helvetica, sans-serif";
    ctx.fillText("WorldAML", 72, 108);
  }

  // Eyebrow
  ctx.fillStyle = TEAL;
  ctx.font = "bold 20px Arial, Helvetica, sans-serif";
  ctx.fillText("WORLDAML ACADEMY · MEMBER RECOGNITION", 72, 214);

  // Level
  const level = r.level?.name ?? "Member";
  ctx.fillStyle = WHITE;
  ctx.font = "bold 76px Arial, Helvetica, sans-serif";
  ctx.fillText(level, 72, 300);

  ctx.fillStyle = MUTED;
  ctx.font = "26px Arial, Helvetica, sans-serif";
  ctx.fillText("AML · Sanctions · Financial Crime Compliance", 72, 344);

  // Stat tiles
  const tiles = [
    { value: String(r.completedCourses ?? 0), label: "Courses completed" },
    { value: String(r.certificates ?? 0), label: "Certificates earned" },
    { value: String(r.earnedBadges?.length ?? 0), label: "Specialisations" },
  ];
  const tw = 316;
  const th = 132;
  tiles.forEach((t, i) => {
    const x = 72 + i * (tw + 20);
    const y = 392;
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundedRect(ctx, x, y, tw, th, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(20,184,166,0.35)";
    ctx.lineWidth = 2;
    roundedRect(ctx, x, y, tw, th, 16);
    ctx.stroke();

    ctx.fillStyle = WHITE;
    ctx.font = "bold 46px Arial, Helvetica, sans-serif";
    ctx.fillText(t.value, x + 24, y + 66);
    ctx.fillStyle = MUTED;
    ctx.font = "20px Arial, Helvetica, sans-serif";
    ctx.fillText(t.label, x + 24, y + 102);
  });

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(72, 566, W - 144, 2);
  ctx.fillStyle = MUTED;
  ctx.font = "22px Arial, Helvetica, sans-serif";
  ctx.fillText("worldaml.com/academy", 72, 600);
  ctx.fillStyle = TEAL;
  ctx.font = "bold 22px Arial, Helvetica, sans-serif";
  const cpd = "CPD-accredited training";
  ctx.fillText(cpd, W - 72 - ctx.measureText(cpd).width, 600);

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

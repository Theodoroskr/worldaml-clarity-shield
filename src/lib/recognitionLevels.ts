import type { RecognitionStatus } from "@/hooks/useRecognition";

/**
 * Recognition presentation config, keyed by the EXISTING member level keys in
 * `academy_recognition_levels` (member, bronze, silver, gold, platinum, expert).
 * The levels themselves are awarded server-side — nothing here changes them.
 */
export interface LevelPresentation {
  /** Eyebrow above the member name, e.g. "Advanced Member Recognition". */
  recognitionTitle: string;
  /** One-line recognition statement shown on the card. */
  message: string;
  /** Short emblem label, e.g. "BRONZE". */
  emblem: string;
  /** Level accent colours (hex). */
  accent: string;
  accentSoft: string;
  /** Suggested caption opener (level inserted dynamically). */
  caption: string;
}

const DEFAULT_KEY = "member";

const LEVELS: Record<string, LevelPresentation> = {
  member: {
    recognitionTitle: "Member Recognition",
    message: "Recognised as a WorldAML Academy member beginning a structured path in AML & Financial Crime Compliance.",
    emblem: "MEMBER",
    accent: "#14b8a6",
    accentSoft: "rgba(20,184,166,0.30)",
    caption:
      "I've joined WorldAML Academy as a Member, starting a structured path of professional development across AML and financial crime compliance.",
  },
  bronze: {
    recognitionTitle: "Member Recognition",
    message: "Recognised for building a strong foundation in AML & Financial Crime Compliance.",
    emblem: "BRONZE",
    accent: "#c98a4b",
    accentSoft: "rgba(201,138,75,0.30)",
    caption:
      "I've reached Bronze Member status with WorldAML Academy, marking another step in my continued professional development across AML and financial crime compliance.",
  },
  silver: {
    recognitionTitle: "Advanced Member Recognition",
    message:
      "Recognised for continued advancement and demonstrated commitment to AML & Financial Crime Compliance.",
    emblem: "SILVER",
    accent: "#c8d2dc",
    accentSoft: "rgba(200,210,220,0.28)",
    caption:
      "I've reached Silver Member status with WorldAML Academy, continuing to build and advance my knowledge across AML and financial crime compliance.",
  },
  gold: {
    recognitionTitle: "Distinguished Member Recognition",
    message:
      "Recognised for advanced professional development and sustained achievement in AML & Financial Crime Compliance.",
    emblem: "GOLD",
    accent: "#d9b25c",
    accentSoft: "rgba(217,178,92,0.30)",
    caption:
      "I'm proud to have reached Gold Member status with WorldAML Academy, recognising my continued learning and professional development across AML and financial crime compliance.",
  },
  platinum: {
    recognitionTitle: "Elite Member Recognition",
    message:
      "Recognised for sustained, wide-ranging professional development across AML & Financial Crime Compliance.",
    emblem: "PLATINUM",
    accent: "#dfe6ec",
    accentSoft: "rgba(223,230,236,0.26)",
    caption:
      "I've reached Platinum Member status with WorldAML Academy, reflecting sustained learning and professional development across AML and financial crime compliance.",
  },
  expert: {
    recognitionTitle: "Expert Member Recognition",
    message:
      "Recognised for breadth and depth of continued learning across AML, sanctions and financial crime compliance.",
    emblem: "EXPERT",
    accent: "#2dd4bf",
    accentSoft: "rgba(45,212,191,0.30)",
    caption:
      "I've reached WorldAML Expert member status with WorldAML Academy, reflecting sustained, in-depth professional development across AML and financial crime compliance.",
  },
};

export function levelPresentation(r: RecognitionStatus): LevelPresentation {
  const key = (r.level?.key ?? DEFAULT_KEY).toLowerCase();
  return LEVELS[key] ?? LEVELS[DEFAULT_KEY];
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

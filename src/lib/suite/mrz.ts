// Deterministic ICAO Doc 9303 MRZ parser/validator (TD1, TD2, TD3).
// No characters are corrected and nothing is guessed: every problem is reported.

export type CheckStatus = "passed" | "failed" | "needs_review" | "not_checked";
export type MrzFormat = "TD1" | "TD2" | "TD3";

export interface FieldCheck {
  field: string;
  status: CheckStatus;
  message: string;
}

export interface MrzDate {
  raw: string;
  iso: string | null;
  ambiguous: boolean;
  note?: string;
}

export interface MrzParseResult {
  ok: boolean; // structure readable enough to extract fields
  format: MrzFormat | null;
  lines: string[];
  raw: string;
  structureErrors: string[];
  checks: FieldCheck[];
  fields: {
    documentType: string;
    issuingState: string;
    surname: string;
    givenNames: string;
    nameTruncated: boolean;
    documentNumber: string;
    nationality: string;
    dateOfBirth: MrzDate;
    sex: "M" | "F" | "X" | "";
    expiryDate: MrzDate;
    optional1: string;
    optional2: string;
  } | null;
}

const ALLOWED = /^[A-Z0-9<]+$/;

export function charValue(c: string): number {
  if (c === "<") return 0;
  if (c >= "0" && c <= "9") return c.charCodeAt(0) - 48;
  if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 55;
  return -1;
}

export function computeCheckDigit(input: string): number {
  const w = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    const v = charValue(input[i]);
    if (v < 0) return -1;
    sum += v * w[i % 3];
  }
  return sum % 10;
}

/** Normalise user/OCR text into lines. Only strips whitespace; never substitutes characters. */
export function normaliseMrzInput(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, "").toUpperCase())
    .filter((l) => l.length > 0);
}

function detectFormat(lines: string[]): MrzFormat | null {
  if (lines.length === 3 && lines.every((l) => l.length === 30)) return "TD1";
  if (lines.length === 2 && lines.every((l) => l.length === 36)) return "TD2";
  if (lines.length === 2 && lines.every((l) => l.length === 44)) return "TD3";
  return null;
}

function strip(s: string) {
  return s.replace(/<+$/g, "").replace(/</g, " ").trim();
}

function digitCheck(label: string, data: string, cd: string, opts: { allowEmpty?: boolean } = {}): FieldCheck {
  if (opts.allowEmpty && /^<+$/.test(data) && (cd === "<" || cd === "0")) {
    return { field: label, status: "not_checked", message: `${label} is empty, so there is nothing to check.` };
  }
  if (!/^[0-9]$/.test(cd)) {
    return { field: label, status: "failed", message: `${label}: the check digit position contains "${cd}", which is not a number.` };
  }
  const calc = computeCheckDigit(data);
  if (calc < 0) return { field: label, status: "failed", message: `${label} contains characters that are not allowed.` };
  if (String(calc) === cd) return { field: label, status: "passed", message: `${label} check digit matches.` };
  return {
    field: label,
    status: "failed",
    message: `${label}: the printed check digit is ${cd} but the data works out to ${calc}. The value may be misread or altered.`,
  };
}

function validMonthDay(yy: number, mm: number, dd: number, century: number) {
  const d = new Date(Date.UTC(century + yy, mm - 1, dd));
  return d.getUTCFullYear() === century + yy && d.getUTCMonth() === mm - 1 && d.getUTCDate() === dd;
}

export function parseMrzDate(raw: string, kind: "birth" | "expiry", today = new Date()): MrzDate {
  if (!/^[0-9]{6}$/.test(raw)) {
    return { raw, iso: null, ambiguous: true, note: "Date is incomplete or unknown on the document." };
  }
  const yy = +raw.slice(0, 2), mm = +raw.slice(2, 4), dd = +raw.slice(4, 6);
  if (!validMonthDay(yy, mm, dd, 2000) && !validMonthDay(yy, mm, dd, 1900)) {
    return { raw, iso: null, ambiguous: true, note: "Not a real calendar date." };
  }
  const iso = (c: number) => `${c + yy}-${raw.slice(2, 4)}-${raw.slice(4, 6)}`;
  const nowY = today.getUTCFullYear();
  if (kind === "expiry") {
    // Expiry dates are near the present; 1900s only if far in the future otherwise.
    const c = 2000 + yy - nowY > 50 ? 1900 : 2000;
    return { raw, iso: iso(c), ambiguous: false };
  }
  const in2000 = new Date(iso(2000)) <= today;
  const age1900 = nowY - (1900 + yy);
  if (!in2000) return { raw, iso: iso(1900), ambiguous: false };
  // Both centuries are possible: default to 2000s, flag when a 1900s birth is still plausible.
  if (age1900 > 110) return { raw, iso: iso(2000), ambiguous: false };
  return {
    raw,
    iso: iso(2000),
    ambiguous: true,
    note: `The century can't be read from the MRZ: ${iso(1900)} or ${iso(2000)}. Confirm against the document.`,
  };
}

function parseNames(field: string) {
  const [sur, ...rest] = field.split("<<");
  const nameTruncated = !field.endsWith("<");
  return {
    surname: strip(sur || ""),
    givenNames: strip(rest.join("<<")),
    nameTruncated,
  };
}

/** Extended document numbers (TD1/TD2): when the check digit slot holds '<'. */
function extendedDocNumber(base: string, optional: string): { number: string; cdData: string; cd: string } | null {
  const m = optional.match(/^([0-9A-Z]*?)([0-9])</) || optional.match(/^([0-9A-Z]*?)([0-9])$/);
  if (!m) return null;
  return { number: base + m[1], cdData: base + "<" + m[1], cd: m[2] };
}

export function parseMrz(text: string, today = new Date()): MrzParseResult {
  const lines = normaliseMrzInput(text);
  const raw = lines.join("\n");
  const structureErrors: string[] = [];
  const empty: MrzParseResult = { ok: false, format: null, lines, raw, structureErrors, checks: [], fields: null };

  if (lines.length === 0) {
    structureErrors.push("No MRZ text was provided.");
    return empty;
  }
  lines.forEach((l, i) => {
    if (!ALLOWED.test(l)) {
      const bad = Array.from(new Set(l.replace(/[A-Z0-9<]/g, "").split(""))).join(" ");
      structureErrors.push(`Line ${i + 1} contains characters not allowed in an MRZ: ${bad}`);
    }
  });
  const format = detectFormat(lines);
  if (!format) {
    structureErrors.push(
      `Unrecognised layout: ${lines.length} line(s) of length ${lines.map((l) => l.length).join(", ")}. ` +
        "Expected 3×30 (ID card, TD1), 2×36 (TD2) or 2×44 (passport, TD3).",
    );
    return { ...empty, structureErrors };
  }
  if (structureErrors.length) return { ...empty, format, structureErrors };

  const checks: FieldCheck[] = [];
  let documentType: string, issuingState: string, nameField: string, docNumber: string, nationality: string;
  let dob: string, sex: string, exp: string, opt1 = "", opt2 = "";

  if (format === "TD3") {
    const [l1, l2] = lines;
    documentType = strip(l1.slice(0, 2));
    issuingState = strip(l1.slice(2, 5));
    nameField = l1.slice(5);
    docNumber = strip(l2.slice(0, 9));
    nationality = strip(l2.slice(10, 13));
    dob = l2.slice(13, 19);
    sex = l2[20];
    exp = l2.slice(21, 27);
    opt1 = strip(l2.slice(28, 42));
    checks.push(digitCheck("Document number", l2.slice(0, 9), l2[9]));
    checks.push(digitCheck("Date of birth", dob, l2[19]));
    checks.push(digitCheck("Expiry date", exp, l2[27]));
    checks.push(digitCheck("Personal number", l2.slice(28, 42), l2[42], { allowEmpty: true }));
    checks.push(digitCheck("Composite", l2.slice(0, 10) + l2.slice(13, 20) + l2.slice(21, 43), l2[43]));
    if (l1[0] !== "P") structureErrors.push(`A TD3 document should start with "P" (passport) but starts with "${l1[0]}".`);
  } else if (format === "TD2") {
    const [l1, l2] = lines;
    documentType = strip(l1.slice(0, 2));
    issuingState = strip(l1.slice(2, 5));
    nameField = l1.slice(5);
    nationality = strip(l2.slice(10, 13));
    dob = l2.slice(13, 19);
    sex = l2[20];
    exp = l2.slice(21, 27);
    opt1 = strip(l2.slice(28, 35));
    if (l2[9] === "<") {
      const ext = extendedDocNumber(l2.slice(0, 9), l2.slice(28, 35));
      if (ext) {
        docNumber = strip(ext.number);
        checks.push(digitCheck("Document number (extended)", l2.slice(0, 9) + ext.number.slice(9), ext.cd));
      } else {
        docNumber = strip(l2.slice(0, 9));
        checks.push({ field: "Document number", status: "failed", message: "Check digit is missing and no extended number was found." });
      }
    } else {
      docNumber = strip(l2.slice(0, 9));
      checks.push(digitCheck("Document number", l2.slice(0, 9), l2[9]));
    }
    checks.push(digitCheck("Date of birth", dob, l2[19]));
    checks.push(digitCheck("Expiry date", exp, l2[27]));
    checks.push(digitCheck("Composite", l2.slice(0, 10) + l2.slice(13, 20) + l2.slice(21, 35), l2[35]));
  } else {
    const [l1, l2, l3] = lines;
    documentType = strip(l1.slice(0, 2));
    issuingState = strip(l1.slice(2, 5));
    dob = l2.slice(0, 6);
    sex = l2[7];
    exp = l2.slice(8, 14);
    nationality = strip(l2.slice(15, 18));
    opt1 = strip(l1.slice(15, 30));
    opt2 = strip(l2.slice(18, 29));
    nameField = l3;
    if (l1[14] === "<") {
      const ext = extendedDocNumber(l1.slice(5, 14), l1.slice(15, 30));
      if (ext) {
        docNumber = strip(ext.number);
        checks.push(digitCheck("Document number (extended)", l1.slice(5, 14) + ext.number.slice(9), ext.cd));
      } else {
        docNumber = strip(l1.slice(5, 14));
        checks.push({ field: "Document number", status: "failed", message: "Check digit is missing and no extended number was found." });
      }
    } else {
      docNumber = strip(l1.slice(5, 14));
      checks.push(digitCheck("Document number", l1.slice(5, 14), l1[14]));
    }
    checks.push(digitCheck("Date of birth", dob, l2[6]));
    checks.push(digitCheck("Expiry date", exp, l2[14]));
    checks.push(digitCheck("Composite", l1.slice(5, 30) + l2.slice(0, 7) + l2.slice(8, 15) + l2.slice(18, 29), l2[29]));
  }

  if (!/^[MFX<]$/.test(sex)) structureErrors.push(`Sex marker "${sex}" is not one of M, F, X or <.`);
  if (!/^[A-Z]{1,3}$/.test(issuingState)) structureErrors.push("Issuing state code is missing or malformed.");
  if (!/^[A-Z]{1,3}$/.test(nationality)) structureErrors.push("Nationality code is missing or malformed.");
  if (!nameField.includes("<<") && !/^[A-Z]/.test(nameField)) structureErrors.push("Name field is missing.");

  const names = parseNames(nameField);
  return {
    ok: true,
    format,
    lines,
    raw,
    structureErrors,
    checks,
    fields: {
      documentType,
      issuingState,
      ...names,
      documentNumber: docNumber,
      nationality,
      dateOfBirth: parseMrzDate(dob, "birth", today),
      sex: (sex === "<" ? "X" : sex) as any,
      expiryDate: parseMrzDate(exp, "expiry", today),
      optional1: opt1,
      optional2: opt2,
    },
  };
}

// ---------- Result sections ----------

export interface SectionResult {
  status: CheckStatus;
  summary: string;
  details: string[];
}

export function structureSection(r: MrzParseResult): SectionResult {
  if (!r.format) return { status: "failed", summary: "The MRZ layout could not be recognised.", details: r.structureErrors };
  const failed = r.checks.filter((c) => c.status === "failed");
  const details = [...r.structureErrors, ...r.checks.map((c) => c.message)];
  if (r.structureErrors.length || failed.length) {
    return { status: "failed", summary: `${failed.length + r.structureErrors.length} problem(s) found in the ${r.format} MRZ.`, details };
  }
  return { status: "passed", summary: `${r.format} layout and all check digits are consistent.`, details };
}

export function expirySection(r: MrzParseResult, today = new Date()): SectionResult {
  const e = r.fields?.expiryDate;
  if (!e) return { status: "not_checked", summary: "No expiry date available.", details: [] };
  if (!e.iso) return { status: "needs_review", summary: "Expiry date could not be read.", details: [e.note || ""] };
  const exp = new Date(e.iso + "T23:59:59Z");
  if (exp < today) return { status: "failed", summary: `Document expired on ${e.iso}.`, details: [] };
  const days = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
  if (days <= 90) return { status: "needs_review", summary: `Document expires soon (${e.iso}, in ${days} days).`, details: [] };
  return { status: "passed", summary: `Valid until ${e.iso}.`, details: [] };
}

export function extractionSection(r: MrzParseResult, method: "manual" | "upload" | "camera", ocrNotes: string[] = []): SectionResult {
  if (!r.fields) return { status: "failed", summary: "No fields could be extracted.", details: r.structureErrors };
  const details: string[] = [...ocrNotes];
  if (r.fields.dateOfBirth.ambiguous) details.push(r.fields.dateOfBirth.note || "Date of birth needs confirmation.");
  if (r.fields.nameTruncated) details.push("The name fills the whole MRZ field and may be truncated.");
  if (method !== "manual" && r.checks.some((c) => c.status === "failed"))
    details.push("Text was read from an image. Failed check digits may be OCR misreads (e.g. 0/O, 1/I, 5/S, 8/B) — compare with the document; nothing was auto-corrected.");
  if (ocrNotes.length && method !== "manual") details.push("The text reader flagged uncertain characters.");
  return details.length
    ? { status: "needs_review", summary: "Fields extracted with points to review.", details }
    : { status: "passed", summary: "All fields extracted cleanly.", details };
}

// ---------- Name comparison (truncation + transliteration) ----------

const TRANSLIT: Record<string, string[]> = {
  Ä: ["AE", "A"], Ö: ["OE", "O"], Ü: ["UE", "U"], ß: ["SS"], Å: ["AA", "A"], Æ: ["AE"], Ø: ["OE", "O"],
  Þ: ["TH"], Ð: ["D"], Ñ: ["N", "NXX"], Œ: ["OE"], Ĳ: ["IJ"],
};

/** Returns possible MRZ spellings of a name (upper, Latin, spaces/hyphens/apostrophes as separators). */
export function nameVariants(name: string): string[] {
  const up = name.toUpperCase();
  let variants = [""];
  for (const ch of up) {
    const opts = TRANSLIT[ch] ?? [ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
    const next: string[] = [];
    for (const v of variants) for (const o of opts) next.push(v + o);
    variants = Array.from(new Set(next)).slice(0, 16);
  }
  return variants.map((v) => v.replace(/[^A-Z]+/g, " ").trim());
}

function tokens(s: string) {
  return s.split(/\s+/).filter(Boolean);
}

export function compareNames(customerName: string, mrzSurname: string, mrzGiven: string, truncated: boolean): SectionResult & { matched: number; total: number } {
  const mrzTokens = tokens(`${mrzSurname} ${mrzGiven}`);
  if (!customerName.trim() || !mrzTokens.length) return { status: "not_checked", summary: "No name to compare.", details: [], matched: 0, total: 0 };
  let best = { matched: 0, total: 0 };
  for (const v of nameVariants(customerName)) {
    const ct = tokens(v);
    let matched = 0;
    for (const t of ct) {
      if (mrzTokens.includes(t)) matched++;
      else if (truncated && mrzTokens.length && t.startsWith(mrzTokens[mrzTokens.length - 1])) matched++;
    }
    if (matched / ct.length > best.matched / Math.max(best.total, 1) || best.total === 0) best = { matched, total: ct.length };
  }
  const details = truncated ? ["MRZ name may be truncated; partial last-name matches were accepted."] : [];
  if (best.matched === best.total) return { status: "passed", summary: "Name matches the customer record.", details, ...best };
  if (best.matched > 0) return { status: "needs_review", summary: `Partial name match (${best.matched}/${best.total} parts).`, details, ...best };
  return { status: "failed", summary: "Name does not match the customer record.", details, ...best };
}

// ---------- Country codes (ICAO alpha-3 → display name) ----------

const A3 =
  "AFG:AF ALB:AL DZA:DZ AND:AD AGO:AO ATG:AG ARG:AR ARM:AM AUS:AU AUT:AT AZE:AZ BHS:BS BHR:BH BGD:BD BRB:BB BLR:BY BEL:BE BLZ:BZ BEN:BJ BTN:BT BOL:BO BIH:BA BWA:BW BRA:BR BRN:BN BGR:BG BFA:BF BDI:BI CPV:CV KHM:KH CMR:CM CAN:CA CAF:CF TCD:TD CHL:CL CHN:CN COL:CO COM:KM COG:CG COD:CD CRI:CR CIV:CI HRV:HR CUB:CU CYP:CY CZE:CZ DNK:DK DJI:DJ DMA:DM DOM:DO ECU:EC EGY:EG SLV:SV GNQ:GQ ERI:ER EST:EE SWZ:SZ ETH:ET FJI:FJ FIN:FI FRA:FR GAB:GA GMB:GM GEO:GE D:DE DEU:DE GHA:GH GRC:GR GRD:GD GTM:GT GIN:GN GNB:GW GUY:GY HTI:HT HND:HN HKG:HK HUN:HU ISL:IS IND:IN IDN:ID IRN:IR IRQ:IQ IRL:IE ISR:IL ITA:IT JAM:JM JPN:JP JOR:JO KAZ:KZ KEN:KE KIR:KI PRK:KP KOR:KR KWT:KW KGZ:KG LAO:LA LVA:LV LBN:LB LSO:LS LBR:LR LBY:LY LIE:LI LTU:LT LUX:LU MAC:MO MDG:MG MWI:MW MYS:MY MDV:MV MLI:ML MLT:MT MHL:MH MRT:MR MUS:MU MEX:MX FSM:FM MDA:MD MCO:MC MNG:MN MNE:ME MAR:MA MOZ:MZ MMR:MM NAM:NA NRU:NR NPL:NP NLD:NL NZL:NZ NIC:NI NER:NE NGA:NG MKD:MK NOR:NO OMN:OM PAK:PK PLW:PW PSE:PS PAN:PA PNG:PG PRY:PY PER:PE PHL:PH POL:PL PRT:PT QAT:QA ROU:RO RUS:RU RWA:RW KNA:KN LCA:LC VCT:VC WSM:WS SMR:SM STP:ST SAU:SA SEN:SN SRB:RS SYC:SC SLE:SL SGP:SG SVK:SK SVN:SI SLB:SB SOM:SO ZAF:ZA SSD:SS ESP:ES LKA:LK SDN:SD SUR:SR SWE:SE CHE:CH SYR:SY TWN:TW TJK:TJ TZA:TZ THA:TH TLS:TL TGO:TG TON:TO TTO:TT TUN:TN TUR:TR TKM:TM TUV:TV UGA:UG UKR:UA ARE:AE GBR:GB USA:US URY:UY UZB:UZ VUT:VU VAT:VA VEN:VE VNM:VN YEM:YE ZMB:ZM ZWE:ZW RKS:XK GBD:GB GBN:GB GBO:GB GBP:GB GBS:GB";
const A3_MAP: Record<string, string> = Object.fromEntries(A3.split(" ").map((p) => p.split(":")));
const SPECIAL: Record<string, string> = {
  EUE: "European Union", UNO: "United Nations", UNA: "United Nations agency", UNK: "Kosovo (UN)",
  XXA: "Stateless", XXB: "Refugee", XXC: "Refugee (other)", XXX: "Unspecified nationality",
  XOM: "Sovereign Military Order of Malta", XPO: "Interpol",
};

export function countryName(code: string): string | null {
  if (SPECIAL[code]) return SPECIAL[code];
  const a2 = A3_MAP[code];
  if (!a2) return null;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(a2) ?? null;
  } catch {
    return null;
  }
}

export function countryAlpha2(code: string): string | null {
  return A3_MAP[code] ?? null;
}

export function maskDocNumber(n: string) {
  if (!n) return "";
  return n.length <= 3 ? "•".repeat(n.length) : "•".repeat(n.length - 3) + n.slice(-3);
}

export const MRZ_DISCLAIMER =
  "MRZ checks assess encoded data consistency. They do not establish document authenticity or the identity of the holder.";

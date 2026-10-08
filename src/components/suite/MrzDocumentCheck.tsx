import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, Camera, CheckCircle2, ClipboardPaste, Info, Loader2, MinusCircle, RefreshCcw, ScanLine, Search, Upload, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { revealPii } from "@/lib/suite/pii";
import {
  MRZ_DISCLAIMER, compareNames, countryAlpha2, countryName, expirySection, extractionSection,
  maskDocNumber, parseMrz, structureSection, type CheckStatus, type MrzParseResult, type SectionResult,
} from "@/lib/suite/mrz";

type Method = "manual" | "upload" | "camera";

export interface MrzCustomer {
  id: string;
  name: string;
  country: string | null;
  onboarding_data: Record<string, any> | null;
  date_of_birth_masked?: string | null;
}

const STATUS_LABEL: Record<CheckStatus, string> = {
  passed: "Passed", failed: "Failed", needs_review: "Needs review", not_checked: "Not checked",
};
const STATUS_CLASS: Record<CheckStatus, string> = {
  passed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  needs_review: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  not_checked: "bg-muted text-muted-foreground border-border",
};

function StatusBadge({ s }: { s: CheckStatus }) {
  return <Badge variant="outline" className={cn("text-[10px]", STATUS_CLASS[s])}>{STATUS_LABEL[s]}</Badge>;
}

const SECTION_STYLE: Record<CheckStatus, string> = {
  passed: "border-emerald-500/40 bg-emerald-500/5",
  failed: "border-destructive/40 bg-destructive/5",
  needs_review: "border-amber-500/40 bg-amber-500/5",
  not_checked: "border-border bg-muted/30",
};
const SECTION_ICON: Record<CheckStatus, typeof CheckCircle2> = {
  passed: CheckCircle2, failed: XCircle, needs_review: AlertTriangle, not_checked: MinusCircle,
};
const SECTION_ICON_CLASS: Record<CheckStatus, string> = {
  passed: "text-emerald-600", failed: "text-destructive", needs_review: "text-amber-600", not_checked: "text-muted-foreground",
};

function Section({ title, r }: { title: string; r: SectionResult }) {
  const Icon = SECTION_ICON[r.status];
  return (
    <div className={cn("rounded-md border-l-4 border p-3 space-y-1.5", SECTION_STYLE[r.status])}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold flex items-center gap-1.5">
          <Icon className={cn("w-3.5 h-3.5", SECTION_ICON_CLASS[r.status])} />{title}
        </p>
        <StatusBadge s={r.status} />
      </div>
      <p className="text-xs text-muted-foreground">{r.summary}</p>
      {r.details.filter(Boolean).length > 0 && (
        <ul className="space-y-1">
          {r.details.filter(Boolean).map((d, i) => {
            const bad = /fail|mismatch|does not match|expired|not allowed|problem|misread|altered|missing|malformed/i.test(d);
            const warn = !bad && /review|ambiguous|truncated|uncertain|confirm|soon|not checked|not compared/i.test(d);
            return (
              <li key={i} className={cn(
                "text-[11px] rounded px-2 py-1 flex items-start gap-1.5",
                bad ? "bg-destructive/10 text-destructive" : warn ? "bg-amber-500/10 text-amber-700 dark:text-amber-500" : "text-muted-foreground",
              )}>
                {bad && <XCircle className="w-3 h-3 mt-0.5 shrink-0" />}
                {warn && <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />}
                <span>{d}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

async function downscale(file: Blob): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.9);
}

const OCR_ERRORS: Record<string, string> = {
  unsupported_image: "That file type isn't supported. Use a JPG, PNG or WebP photo.",
  image_too_large: "The image is too large. Use a photo under 8 MB.",
  rate_limited: "Too many reads right now. Wait a moment and retry.",
  credits_exhausted: "The text reader is out of credits. Paste the MRZ text instead.",
  ocr_not_configured: "The text reader isn't set up. Paste the MRZ text instead.",
  not_permitted: "You don't have access to this customer.",
};

export function MrzDocumentCheck({ customer, open, onOpenChange, onUpdated }: {
  customer: MrzCustomer;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onUpdated: (patch: Record<string, any>) => void;
}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Method>("upload");
  const [text, setText] = useState("");
  const [method, setMethod] = useState<Method>("manual");
  const [ocrNotes, setOcrNotes] = useState<string[]>([]);
  const [reading, setReading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [result, setResult] = useState<MrzParseResult | null>(null);
  const [customerDob, setCustomerDob] = useState<string | null | undefined>(undefined);
  const [dobError, setDobError] = useState<string | null>(null);
  const [apply, setApply] = useState<Record<string, boolean>>({});
  const [decision, setDecision] = useState<"accepted" | "needs_review" | "rejected">("needs_review");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camError, setCamError] = useState<string | null>(null);

  const reset = () => {
    setText(""); setResult(null); setOcrNotes([]); setOcrError(null); setLastImage(null);
    setCustomerDob(undefined); setDobError(null); setApply({}); setNote(""); setSaved(false); setDecision("needs_review");
  };

  const stopCamera = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; };
  useEffect(() => { if (!open) { stopCamera(); reset(); } }, [open]);
  useEffect(() => {
    if (!open || tab !== "camera" || result) { stopCamera(); return; }
    setCamError(null);
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 } } })
      .then((s) => { streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s; })
      .catch(() => setCamError("Camera unavailable or permission denied. Upload a photo or paste the MRZ instead."));
    return stopCamera;
  }, [open, tab, result]);

  const runOcr = async (dataUrl: string, m: Method) => {
    setReading(true); setOcrError(null); setLastImage(dataUrl);
    const { data, error } = await supabase.functions.invoke("mrz-ocr", { body: { image: dataUrl, customer_id: customer.id } });
    setReading(false);
    if (error || data?.error) {
      let code = data?.error;
      try { code = code || (await (error as any)?.context?.json())?.error; } catch { /* ignore */ }
      setOcrError(OCR_ERRORS[code] || "The image couldn't be read. Retry or paste the MRZ text.");
      return;
    }
    if (!data.found) { setOcrError(`Unreadable image: ${data.note || "no MRZ found"}. Retake the photo with the MRZ lines flat and in focus.`); return; }
    const notes: string[] = [];
    if (data.uncertain) notes.push("Some characters were hard to read (shown as '?'). Compare with the document.");
    setText(data.lines.join("\n"));
    setOcrNotes(notes);
    setMethod(m);
    validate(data.lines.join("\n"), m, notes);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) { setOcrError(OCR_ERRORS.unsupported_image); return; }
    try { await runOcr(await downscale(f), "upload"); } catch { setOcrError("That image couldn't be opened."); }
  };

  const capture = async () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/jpeg", 0.92));
    await runOcr(await downscale(blob), "camera");
  };

  const validate = (t: string, m: Method, notes: string[]) => {
    const r = parseMrz(t);
    setResult(r);
    if (r.fields) {
      const f = r.fields;
      const od = customer.onboarding_data || {};
      const a2 = countryAlpha2(f.nationality);
      // Pre-tick only fields that are currently empty — never overwrite silently.
      setApply({
        name: false,
        date_of_birth: !customer.date_of_birth_masked && !!f.dateOfBirth.iso && !f.dateOfBirth.ambiguous,
        nationality: !od.nationality && !!a2,
        document_number: false,
      });
    }
    setMethod(m);
    setOcrNotes(notes);
  };

  const f = result?.fields;
  const sections = useMemo(() => {
    if (!result) return null;
    const structure = structureSection(result);
    const expiry = expirySection(result);
    const extraction = extractionSection(result, method, ocrNotes);
    const nameR = f ? compareNames(customer.name, f.surname, f.givenNames, f.nameTruncated) : null;
    const details: string[] = [];
    const statuses: CheckStatus[] = [];
    if (nameR) { statuses.push(nameR.status); details.push(`Name: ${nameR.summary}`, ...nameR.details); }
    const custNat = customer.onboarding_data?.nationality as string | undefined;
    const mrzNat = f ? countryAlpha2(f.nationality) : null;
    if (custNat && mrzNat) {
      const ok = custNat.toUpperCase() === mrzNat;
      statuses.push(ok ? "passed" : "failed");
      details.push(`Nationality: ${ok ? "matches" : `record says ${custNat}, MRZ says ${f!.nationality}`}.`);
    } else details.push("Nationality: not on the customer record — not checked.");
    if (customerDob !== undefined && f?.dateOfBirth.iso) {
      if (!customerDob) details.push("Date of birth: not on the customer record — not checked.");
      else {
        const ok = customerDob.slice(0, 10) === f.dateOfBirth.iso;
        statuses.push(ok ? (f.dateOfBirth.ambiguous ? "needs_review" : "passed") : "failed");
        details.push(`Date of birth: ${ok ? "matches" : "does not match the customer record"}.`);
      }
    } else details.push(dobError ? `Date of birth: ${dobError}` : "Date of birth: not compared yet (needs a logged reveal).");
    const status: CheckStatus = statuses.includes("failed") ? "failed" : statuses.includes("needs_review") ? "needs_review"
      : statuses.length === 0 ? "not_checked" : statuses.length < 3 ? "needs_review" : "passed";
    const consistency: SectionResult = {
      status, details,
      summary: status === "passed" ? "Consistent with the customer record." : status === "failed" ? "Differences found against the customer record." : status === "not_checked" ? "Nothing to compare." : "Partly compared — review the points below.",
    };
    return { structure, expiry, extraction, consistency };
  }, [result, method, ocrNotes, customer, customerDob, dobError, f]);

  const compareDob = async () => {
    setDobError(null);
    try {
      const pii = await revealPii("suite_customers", customer.id, "MRZ document check — date of birth comparison");
      setCustomerDob(pii.date_of_birth ?? null);
    } catch (e: any) { setDobError(e.message); }
  };

  const fullName = f ? `${f.givenNames} ${f.surname}`.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "";
  const mrzNatA2 = f ? countryAlpha2(f.nationality) : null;

  const save = async () => {
    if (!result || !sections) return;
    setSaving(true);
    try {
      const updates: Record<string, any> = {};
      const changed: Record<string, string> = {};
      const od = { ...(customer.onboarding_data || {}) };
      if (f && apply.name) { updates.name = fullName; changed.name = "updated"; }
      if (f && apply.date_of_birth && f.dateOfBirth.iso) { updates.date_of_birth = f.dateOfBirth.iso; changed.date_of_birth = "updated"; }
      if (f && apply.nationality && mrzNatA2) { od.nationality = mrzNatA2; changed.nationality = "updated"; }
      if (f && apply.document_number && f.documentNumber) {
        od[f.documentType.startsWith("P") ? "passport_number" : "id_number"] = f.documentNumber;
        changed.document_number = "updated";
      }
      if (changed.nationality || changed.document_number) updates.onboarding_data = od;
      if (Object.keys(updates).length) {
        const { error } = await supabase.from("suite_customers").update(updates as any).eq("id", customer.id);
        if (error) throw error;
      }
      const results = {
        structure: sections.structure.status, expiry: sections.expiry.status,
        extraction: sections.extraction.status, consistency: sections.consistency.status,
        check_digits: result.checks.map((c) => ({ field: c.field, status: c.status })),
        ambiguous_dob: !!f?.dateOfBirth.ambiguous,
      };
      const { error } = await supabase.rpc("suite_record_mrz_check" as never, {
        _customer: customer.id, _method: method, _format: result.format, _results: results,
        _raw: result.raw, _changes: changed, _decision: decision, _note: note || null,
        _doc_masked: f ? maskDocNumber(f.documentNumber) : null,
      } as never);
      if (error) throw error;
      const patch: Record<string, any> = {};
      if (updates.name) patch.name = updates.name;
      if (updates.onboarding_data) patch.onboarding_data = od;
      if (updates.date_of_birth) patch.date_of_birth_masked = "••••-••-••";
      onUpdated(patch);
      setSaved(true);
      toast.success("MRZ check recorded in the audit trail");
    } catch (e: any) {
      toast.error(/not_permitted/.test(e.message) ? "You don't have access to this customer." : e.message);
    } finally { setSaving(false); }
  };

  const screenName = apply.name || !f ? (apply.name ? fullName : customer.name) : customer.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ScanLine className="w-4 h-4" /> MRZ Document Check</DialogTitle>
          <DialogDescription>{customer.name} — ICAO Doc 9303 (passports TD3, ID cards TD1, TD2)</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 rounded-md border border-border bg-muted/40 p-2.5 text-xs">
          <Info className="w-4 h-4 shrink-0 text-muted-foreground" />
          <p>{MRZ_DISCLAIMER}</p>
        </div>

        {!result && (
          <Tabs value={tab} onValueChange={(v) => { setTab(v as Method); setOcrError(null); }}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="upload"><Upload className="w-3.5 h-3.5 mr-1" />Upload</TabsTrigger>
              <TabsTrigger value="camera"><Camera className="w-3.5 h-3.5 mr-1" />Camera</TabsTrigger>
              <TabsTrigger value="manual"><ClipboardPaste className="w-3.5 h-3.5 mr-1" />Paste MRZ</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-2">
              <label className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border p-8 text-sm text-muted-foreground cursor-pointer hover:bg-muted/40">
                <Upload className="w-5 h-5" />
                Choose a photo of the passport data page or ID card back (JPG, PNG, WebP)
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={reading}
                  onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              <p className="text-[11px] text-muted-foreground">The photo is read once and not stored.</p>
            </TabsContent>
            <TabsContent value="camera" className="space-y-2">
              {camError ? <p className="text-xs text-destructive">{camError}</p> : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md bg-muted aspect-video object-cover" />
                  <Button onClick={capture} disabled={reading} className="w-full"><Camera className="w-4 h-4 mr-1" />Capture</Button>
                </>
              )}
            </TabsContent>
            <TabsContent value="manual" className="space-y-2">
              <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="font-mono text-xs"
                placeholder={"P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<\nL898902C36UTO7408122F1204159ZE184226B<<<<<10"} />
              <Button onClick={() => validate(text, "manual", [])} disabled={!text.trim()}>Validate</Button>
            </TabsContent>
            {reading && <p className="flex items-center gap-2 text-xs text-muted-foreground mt-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Reading the MRZ…</p>}
            {ocrError && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                <span>{ocrError}</span>
                {lastImage && <Button size="sm" variant="outline" onClick={() => runOcr(lastImage, tab === "camera" ? "camera" : "upload")}><RefreshCcw className="w-3 h-3 mr-1" />Retry</Button>}
              </div>
            )}
          </Tabs>
        )}

        {result && sections && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Raw MRZ ({method === "manual" ? "pasted" : method === "camera" ? "camera" : "uploaded image"})</p>
              <div className="rounded-md bg-muted p-2 text-[11px] font-mono overflow-x-auto space-y-0.5">
                {result.lines.map((line, i) => {
                  const badChars = !/^[A-Z0-9<]+$/.test(line);
                  const expected = result.format === "TD1" ? 30 : result.format === "TD2" ? 36 : result.format === "TD3" ? 44 : null;
                  const badLen = expected !== null && line.length !== expected;
                  const bad = badChars || badLen;
                  return (
                    <div key={i} className={cn("flex gap-2 rounded px-1", bad && "bg-destructive/15 ring-1 ring-destructive/30")}>
                      <span className="select-none text-muted-foreground/60 w-4 text-right shrink-0">{i + 1}</span>
                      <span className={cn(bad && "text-destructive")}>{line}</span>
                      {bad && (
                        <span className="ml-auto text-[10px] font-sans text-destructive shrink-0">
                          {badChars ? "invalid characters" : `length ${line.length}, expected ${expected}`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {result.checks.length > 0 && (
              <div className="rounded-md border border-border divide-y divide-border">
                <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Check digit breakdown</p>
                {result.checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-[11px]">
                    {c.status === "passed" ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      : c.status === "failed" ? <XCircle className="w-3 h-3 text-destructive shrink-0" />
                      : <MinusCircle className="w-3 h-3 text-muted-foreground shrink-0" />}
                    <span className="font-medium shrink-0">{c.field}</span>
                    <span className="text-muted-foreground truncate">{c.message}</span>
                    <StatusBadge s={c.status} />
                  </div>
                ))}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-2">
              <Section title="MRZ structure & check digits" r={sections.structure} />
              <Section title="Document expiry" r={sections.expiry} />
              <Section title="Extraction quality" r={sections.extraction} />
              <Section title="Consistency with customer record" r={sections.consistency} />
            </div>
            {f && customerDob === undefined && (
              <Button size="sm" variant="outline" onClick={compareDob}>Compare date of birth (logged)</Button>
            )}

            {f && (
              <div className="rounded-md border border-border">
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground border-b border-border">
                  <span>Field</span><span>Customer record</span><span>From MRZ</span><span>Apply</span>
                </div>
                {[
                  { k: "name", label: "Name", cur: customer.name, mrz: fullName, note: f.nameTruncated ? "may be truncated" : "no accents in MRZ" },
                  { k: "date_of_birth", label: "Date of birth", cur: customerDob ?? customer.date_of_birth_masked ?? "—", mrz: f.dateOfBirth.iso ?? `unreadable (${f.dateOfBirth.raw})`, note: f.dateOfBirth.ambiguous ? "century ambiguous" : "", disabled: !f.dateOfBirth.iso },
                  { k: "nationality", label: "Nationality", cur: customer.onboarding_data?.nationality ?? "—", mrz: `${f.nationality}${countryName(f.nationality) ? ` · ${countryName(f.nationality)}` : ""}`, disabled: !mrzNatA2 },
                  { k: "document_number", label: "Document number", cur: "—", mrz: `${f.documentType} · ${f.documentNumber}` },
                ].map((row) => (
                  <div key={row.k} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-3 py-2 text-xs items-center border-b border-border last:border-0">
                    <span className="font-medium">{row.label}</span>
                    <span className="font-mono truncate">{row.cur}</span>
                    <span className="font-mono truncate">{row.mrz}{row.note && <span className="block text-[10px] text-muted-foreground font-sans">{row.note}</span>}</span>
                    <Checkbox checked={!!apply[row.k]} disabled={row.disabled || saved}
                      onCheckedChange={(v) => setApply((a) => ({ ...a, [row.k]: !!v }))} aria-label={`Apply ${row.label}`} />
                  </div>
                ))}
                <div className="px-3 py-2 text-[11px] text-muted-foreground grid grid-cols-2 gap-1">
                  <span>Issuing state: {f.issuingState} {countryName(f.issuingState) ? `(${countryName(f.issuingState)})` : ""}</span>
                  <span>Sex: {f.sex || "—"}</span>
                  <span>Expiry: {f.expiryDate.iso ?? f.expiryDate.raw}</span>
                  <span>Format: {result.format}</span>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-[200px_1fr] gap-2">
              <Select value={decision} onValueChange={(v) => setDecision(v as any)} disabled={saved}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="accepted">Reviewer: accept result</SelectItem>
                  <SelectItem value="needs_review">Reviewer: needs review</SelectItem>
                  <SelectItem value="rejected">Reviewer: reject document</SelectItem>
                </SelectContent>
              </Select>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={1} placeholder="Reviewer note (optional)" disabled={saved} className="text-xs min-h-9" />
            </div>
            <p className="text-[11px] text-muted-foreground">Ticked fields are written to the customer record only when you confirm. The customer is not marked "Identity verified" by this check.</p>

            <div className="flex flex-wrap justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={reset}><RefreshCcw className="w-3.5 h-3.5 mr-1" />Check another document</Button>
              <div className="flex gap-2">
                {saved && (
                  <Button variant="outline" size="sm" onClick={() => navigate(`/suite/screening?q=${encodeURIComponent(screenName)}`)}>
                    <Search className="w-3.5 h-3.5 mr-1" />Screen confirmed name
                  </Button>
                )}
                <Button size="sm" onClick={save} disabled={saving || saved}>
                  {saving && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                  {saved ? "Recorded" : Object.values(apply).some(Boolean) ? "Confirm changes & record check" : "Record check"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, HelpCircle, AlertTriangle, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  APPLICATION_STATUS_LABEL, APPLICATION_STATUS_STYLE, PORTAL_ACCESS_LABEL, PORTAL_ACCESS_STYLE,
  DEFAULT_COMMISSION, applicationAge, findPossibleDuplicates, toPercent,
} from "@/lib/partnerLifecycle";

const VERTICALS = ["banking", "fintech", "crypto", "igaming", "payments", "legal"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] uppercase tracking-wide text-text-secondary">{label}</div>
      <div className="text-sm text-navy break-words">{children ?? "—"}</div>
    </div>
  );
}

interface Props {
  app: any | null;
  partners: any[];
  applications: any[];
  onClose: () => void;
  onDone: () => void;
}

type Mode = "review" | "approve" | "reject" | "more_info";

export default function PartnerApplicationReviewDialog({
  app, partners, applications, onClose, onDone,
}: Props) {
  const [mode, setMode] = useState<Mode>("review");
  const [busy, setBusy] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);
  const [emailFailed, setEmailFailed] = useState<null | { type: string; applicationId: string }>(null);

  const existingPartner = useMemo(
    () => partners.find((p: any) => p.user_id === app?.user_id) ?? null,
    [partners, app?.user_id],
  );

  const [form, setForm] = useState<any>({
    partner_type: "referral",
    commission_rate: 5,
    certification_level: "none",
    verticals: [] as string[],
    manager_id: "",
    internal_notes: "",
    grant_portal: true,
  });
  const [message, setMessage] = useState("");
  const [notifyApplicant, setNotifyApplicant] = useState(true);

  useEffect(() => {
    if (!app) return;
    setMode("review");
    setMessage("");
    setEmailFailed(null);
    setNotifyApplicant(true);
    setForm({
      partner_type: existingPartner?.partner_type ?? app.partner_type ?? "referral",
      commission_rate:
        existingPartner?.commission_rate != null
          ? toPercent(existingPartner.commission_rate)
          : DEFAULT_COMMISSION[app.partner_type] ?? 5,
      certification_level: existingPartner?.certification_level ?? "none",
      verticals: existingPartner?.verticals ?? [],
      manager_id: existingPartner?.partner_manager_id ?? "",
      internal_notes: app.internal_notes ?? existingPartner?.internal_notes ?? "",
      grant_portal: true,
    });
  }, [app?.id]);

  useEffect(() => {
    supabase
      .from("partner_managers" as any)
      .select("id,name,email,is_active")
      .eq("is_active", true)
      .then(({ data }) => setManagers((data as any[]) ?? []));
  }, []);

  const duplicates = useMemo(
    () => (app ? findPossibleDuplicates(app, partners, applications) : []),
    [app, partners, applications],
  );

  if (!app) return null;

  const portalAccess = existingPartner?.portal_access ?? "not_granted";

  const sendLifecycleEmail = async (type: "approved" | "rejected" | "more_info") => {
    const { error } = await supabase.functions.invoke("partner-lifecycle-email", {
      body: { application_id: app.id, type, message: message || null },
    });
    if (error) {
      console.error("partner-lifecycle-email failed:", error);
      setEmailFailed({ type, applicationId: app.id });
      return false;
    }
    return true;
  };

  const retryEmail = async () => {
    if (!emailFailed) return;
    setBusy(true);
    const ok = await sendLifecycleEmail(emailFailed.type as any);
    setBusy(false);
    if (ok) {
      setEmailFailed(null);
      toast.success("Email sent");
    } else {
      toast.error("Email still failing — check the function logs");
    }
  };

  const approve = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("admin_approve_partner_application" as any, {
      _app_id: app.id,
      _partner_type: form.partner_type,
      _commission_rate: Number(form.commission_rate) || 0,
      _certification: form.certification_level || "none",
      _verticals: form.verticals?.length ? form.verticals : null,
      _manager_id: form.manager_id || null,
      _grant_portal: form.grant_portal,
      _internal_notes: form.internal_notes || null,
    } as any);
    if (error) {
      setBusy(false);
      toast.error(error.message || "Approval failed");
      return;
    }
    // Approval is committed — an email failure must never undo it.
    const sent = notifyApplicant ? await sendLifecycleEmail("approved") : true;
    setBusy(false);
    onDone();
    if (sent) {
      toast.success("Partner approved and portal access updated");
      onClose();
    } else {
      toast.warning("Partner approved successfully — email notification failed");
    }
  };

  const review = async (decision: "rejected" | "more_info") => {
    if (!message.trim()) {
      toast.error(decision === "rejected" ? "A reason is required" : "A message is required");
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc("admin_review_partner_application" as any, {
      _app_id: app.id,
      _decision: decision,
      _message: message.trim(),
    } as any);
    if (error) {
      setBusy(false);
      toast.error(error.message || "Update failed");
      return;
    }
    const sent = notifyApplicant ? await sendLifecycleEmail(decision) : true;
    setBusy(false);
    onDone();
    if (sent) {
      toast.success(decision === "rejected" ? "Application rejected" : "More information requested");
      onClose();
    } else {
      toast.warning("Application updated — email notification failed");
    }
  };

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {app.company_name}
            <Badge className={APPLICATION_STATUS_STYLE[app.status]}>
              {APPLICATION_STATUS_LABEL[app.status] ?? app.status}
            </Badge>
            <Badge variant="outline" className={PORTAL_ACCESS_STYLE[portalAccess]}>
              Portal: {PORTAL_ACCESS_LABEL[portalAccess]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {applicationAge(app.created_at)} · submitted{" "}
            {new Date(app.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </DialogDescription>
        </DialogHeader>

        {emailFailed && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 flex items-start gap-2">
            <Mail className="h-4 w-4 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">Email notification failed</div>
              <div className="text-xs">The decision was saved. Only the email did not go out.</div>
            </div>
            <Button size="sm" variant="outline" onClick={retryEmail} disabled={busy}>Retry email</Button>
          </div>
        )}

        {duplicates.length > 0 && (
          <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" /> Possible existing partner
            </div>
            <ul className="mt-1 space-y-0.5 text-xs">
              {duplicates.map((d, i) => (
                <li key={i}>• {d.reason}: <span className="font-medium">{d.label || "—"}</span></li>
              ))}
            </ul>
            <p className="text-[11px] mt-1 opacity-80">Records are never merged automatically — review before approving.</p>
          </div>
        )}

        {/* Read-only application detail */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal">Company</div>
            <Field label="Company name">{app.company_name}</Field>
            <Field label="Website">
              {app.website ? (
                <a href={app.website} target="_blank" rel="noreferrer" className="text-teal hover:underline">{app.website}</a>
              ) : null}
            </Field>
            <Field label="Country">{app.country}</Field>
            <Field label="Phone">{app.contact_phone}</Field>
          </div>
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal">Contact</div>
            <Field label="Name">{app.contact_name}</Field>
            <Field label="Email">
              {app.contact_email ? (
                <a href={`mailto:${app.contact_email}`} className="text-teal hover:underline">{app.contact_email}</a>
              ) : null}
            </Field>
            <Field label="Requested partner type">
              <span className="capitalize">{app.partner_type}</span>
            </Field>
            <Field label="Existing WorldAML account">
              {app.user_id ? "Yes — access will be added to the existing identity" : "No"}
            </Field>
          </div>
        </div>

        {(app.description || app.notes || app.review_message) && (
          <div className="space-y-2">
            <Separator />
            {app.description && <Field label="Application message">{app.description}</Field>}
            {app.notes && <Field label="Notes">{app.notes}</Field>}
            {app.review_message && <Field label="Last message to applicant">{app.review_message}</Field>}
          </div>
        )}

        <Separator />

        {mode === "review" && (
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal">Decision</div>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setMode("approve")}>
                <CheckCircle className="h-4 w-4 mr-2" /> Approve Partner
              </Button>
              <Button variant="outline" onClick={() => setMode("more_info")}>
                <HelpCircle className="h-4 w-4 mr-2" /> Request More Information
              </Button>
              <Button variant="outline" className="text-red-700 border-red-300 hover:bg-red-50" onClick={() => setMode("reject")}>
                <XCircle className="h-4 w-4 mr-2" /> Reject Application
              </Button>
            </div>
            {app.status !== "pending" && (
              <p className="text-xs text-text-secondary">
                This application is already marked “{APPLICATION_STATUS_LABEL[app.status] ?? app.status}”. Re-deciding updates the record and is audit-logged; the application is never deleted.
              </p>
            )}
          </div>
        )}

        {mode === "approve" && (
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal">Internal partner setup</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Approved partner type</Label>
                <Select
                  value={form.partner_type}
                  onValueChange={(v) =>
                    setForm({ ...form, partner_type: v, commission_rate: DEFAULT_COMMISSION[v] ?? form.commission_rate })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">Referral Partner</SelectItem>
                    <SelectItem value="affiliate">Affiliate</SelectItem>
                    <SelectItem value="reseller">Reseller</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Commission %</Label>
                <Input
                  type="number" min="0" max="100" step="0.5"
                  value={form.commission_rate}
                  onChange={(e) => setForm({ ...form, commission_rate: e.target.value })}
                />
                <p className="text-[11px] text-text-secondary mt-1">
                  Programme default for {form.partner_type}: {DEFAULT_COMMISSION[form.partner_type] ?? "—"}%
                </p>
              </div>
              <div>
                <Label>Certification</Label>
                <Select value={form.certification_level} onValueChange={(v) => setForm({ ...form, certification_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned partner manager</Label>
                <Select
                  value={form.manager_id || "__none__"}
                  onValueChange={(v) => setForm({ ...form, manager_id: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Unassigned</SelectItem>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Verticals</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {VERTICALS.map((v) => {
                  const active = (form.verticals ?? []).includes(v);
                  return (
                    <Button
                      key={v}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="capitalize"
                      onClick={() =>
                        setForm({
                          ...form,
                          verticals: active
                            ? form.verticals.filter((x: string) => x !== v)
                            : [...(form.verticals ?? []), v],
                        })
                      }
                    >
                      {v === "igaming" ? "iGaming" : v}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Internal notes</Label>
              <Textarea
                rows={2}
                value={form.internal_notes}
                onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
                placeholder="Visible to WorldAML staff only"
              />
            </div>

            <div className="rounded-md border border-divider bg-surface-subtle/50 p-3 space-y-2">
              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={form.grant_portal}
                  onCheckedChange={(v) => setForm({ ...form, grant_portal: !!v })}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-semibold text-navy">Activate Partner Portal access</span>
                  <span className="block text-xs text-text-secondary">
                    Grants this WorldAML identity access to /partner/* — validated server-side. Existing Academy or Business access is unaffected.
                  </span>
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={notifyApplicant} onCheckedChange={(v) => setNotifyApplicant(!!v)} />
                <span>Send approval email to {app.contact_email || "the applicant"}</span>
              </label>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setMode("review")} disabled={busy}>Back</Button>
              <Button onClick={approve} disabled={busy} className="bg-green-600 hover:bg-green-700">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Approve &amp; Activate Partner
              </Button>
            </DialogFooter>
          </div>
        )}

        {(mode === "reject" || mode === "more_info") && (
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal">
              {mode === "reject" ? "Rejection reason" : "Information required"}
            </div>
            <Textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                mode === "reject"
                  ? "Internal reason — included in the applicant email only if you send one."
                  : "Tell the applicant exactly what is still needed."
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={notifyApplicant} onCheckedChange={(v) => setNotifyApplicant(!!v)} />
              <span>
                Send {mode === "reject" ? "rejection" : "request"} email to {app.contact_email || "the applicant"}
              </span>
            </label>
            <p className="text-xs text-text-secondary">
              The application is kept for audit and history. No Academy or Business access is changed.
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setMode("review")} disabled={busy}>Back</Button>
              <Button
                onClick={() => review(mode === "reject" ? "rejected" : "more_info")}
                disabled={busy}
                className={mode === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {mode === "reject" ? "Reject application" : "Request information"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

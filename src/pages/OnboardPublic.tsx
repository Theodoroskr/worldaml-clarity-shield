import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Upload, FileText, X, AlertCircle } from "lucide-react";

type FieldType =
  | "text" | "email" | "phone" | "number" | "textarea"
  | "select" | "checkbox" | "date" | "address" | "file" | "heading";

interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  format?: "" | "email" | "url" | "alpha" | "alphanumeric";
  allowedFileTypes?: string[];
  maxFileSizeMb?: number;
}

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  key: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  validation?: FieldValidation;
}

interface Branding {
  logo_url: string | null;
  primary_color: string;
  company_name: string | null;
  support_email: string | null;
  show_powered_by: boolean;
}

interface OnboardingForm {
  id: string;
  organisation_id: string;
  name: string;
  description: string | null;
  branding: Branding;
  schema: FormField[];
  required_checks: { kyc: boolean; kyb: boolean; sof: boolean; documents: string[] };
  redirect_url: string | null;
  is_active: boolean;
}

const FORMAT_REGEX: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/[^\s]+$/,
  alpha: /^[A-Za-z\s-]+$/,
  alphanumeric: /^[A-Za-z0-9\s-]+$/,
};

function validateField(f: FormField, raw: any, file: File | null): string | null {
  const v = f.validation || {};
  const isEmpty =
    f.type === "file"
      ? !file
      : f.type === "checkbox"
      ? !raw
      : raw === undefined || raw === null || String(raw).trim() === "";

  if (f.required && isEmpty) return `${f.label} is required`;
  if (isEmpty) return null;

  if (["text", "textarea", "email", "phone", "address", "date", "select"].includes(f.type)) {
    const str = String(raw);
    if (v.minLength != null && str.length < v.minLength)
      return `${f.label} must be at least ${v.minLength} characters`;
    if (v.maxLength != null && str.length > v.maxLength)
      return `${f.label} must be at most ${v.maxLength} characters`;

    const fmt = f.type === "email" ? "email" : v.format || "";
    if (fmt && FORMAT_REGEX[fmt] && !FORMAT_REGEX[fmt].test(str)) {
      if (fmt === "email") return `${f.label} must be a valid email address`;
      if (fmt === "url") return `${f.label} must be a valid URL (starting with http/https)`;
      if (fmt === "alpha") return `${f.label} must contain only letters`;
      if (fmt === "alphanumeric") return `${f.label} must contain only letters and numbers`;
    }
    if (v.pattern) {
      try {
        if (!new RegExp(v.pattern).test(str))
          return v.patternMessage || `${f.label} has an invalid format`;
      } catch { /* ignore malformed regex */ }
    }
    if (f.type === "select" && f.options && !f.options.includes(str)) {
      return `${f.label} must be one of the available options`;
    }
  }

  if (f.type === "number") {
    const num = Number(raw);
    if (Number.isNaN(num)) return `${f.label} must be a number`;
    if (v.min != null && num < v.min) return `${f.label} must be at least ${v.min}`;
    if (v.max != null && num > v.max) return `${f.label} must be at most ${v.max}`;
  }

  if (f.type === "file" && file) {
    const maxMb = v.maxFileSizeMb ?? 10;
    if (file.size > maxMb * 1024 * 1024) return `${f.label} must be at most ${maxMb} MB`;
    const allowed = v.allowedFileTypes && v.allowedFileTypes.length
      ? v.allowedFileTypes
      : ["pdf", "jpg", "jpeg", "png"];
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!allowed.includes(ext))
      return `${f.label} must be one of: ${allowed.join(", ").toUpperCase()}`;
  }

  return null;
}

export default function OnboardPublic() {
  const { token } = useParams<{ token: string }>();
  const [form, setForm] = useState<OnboardingForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [fieldFiles, setFieldFiles] = useState<Record<string, File | null>>({});
  const [docFiles, setDocFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const { data, error } = await supabase
        .from("suite_onboarding_forms")
        .select("id,organisation_id,name,description,branding,schema,required_checks,redirect_url,is_active")
        .eq("id", token)
        .eq("is_active", true)
        .maybeSingle();
      if (error || !data) setNotFound(true);
      else setForm(data as any);
      setLoading(false);
    };
    load();
  }, [token]);

  const primary = form?.branding?.primary_color || "#0f766e";

  const setValue = (key: string, v: any) => {
    setValues((s) => ({ ...s, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const setFieldFile = (key: string, file: File | null) => {
    setFieldFiles((s) => ({ ...s, [key]: file }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const setDocFile = (doc: string, file: File | null) => {
    setDocFiles((s) => ({ ...s, [doc]: file }));
    const k = `__doc__${doc}`;
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const uploadFile = async (file: File, folder: string, subkey: string) => {
    if (!form) throw new Error("form missing");
    const ext = file.name.split(".").pop() || "bin";
    const rand = crypto.randomUUID();
    const path = `${form.id}/${folder}/${rand}-${subkey}.${ext}`;
    const { error } = await supabase.storage
      .from("onboarding-submissions")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    return { path, name: file.name, size: file.size, type: file.type };
  };

  const validateAll = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form) return errs;
    for (const f of form.schema) {
      if (f.type === "heading") continue;
      const err = validateField(f, values[f.key], fieldFiles[f.key] || null);
      if (err) errs[f.key] = err;
    }
    for (const doc of form.required_checks?.documents || []) {
      if (!docFiles[doc]) errs[`__doc__${doc}`] = `${doc} is required`;
      else if (docFiles[doc]!.size > 10 * 1024 * 1024)
        errs[`__doc__${doc}`] = `${doc} must be at most 10 MB`;
    }
    return errs;
  };

  const handleSubmit = async () => {
    if (!form) return;
    setServerError(null);
    const errs = validateAll();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      const el = fieldRefs.current[firstKey];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const dataOut: Record<string, any> = { ...values };
      for (const f of form.schema) {
        if (f.type === "file" && fieldFiles[f.key]) {
          const meta = await uploadFile(fieldFiles[f.key]!, "fields", f.key);
          dataOut[f.key] = meta;
        }
      }
      const documents: any[] = [];
      for (const doc of form.required_checks?.documents || []) {
        if (docFiles[doc]) {
          const meta = await uploadFile(docFiles[doc]!, "documents", doc.replace(/\s+/g, "_"));
          documents.push({ requirement: doc, ...meta });
        }
      }

      const findByKey = (needle: RegExp) => {
        const f = form.schema.find(
          (x) => x.type !== "heading" && (needle.test(x.key) || needle.test(x.label))
        );
        return f ? dataOut[f.key] : undefined;
      };
      const applicant_email =
        findByKey(/email/i) ||
        (form.schema.find((x) => x.type === "email") &&
          dataOut[form.schema.find((x) => x.type === "email")!.key]);
      const applicant_name = findByKey(/name|full.?name|company/i) || null;

      const { error } = await supabase.from("suite_onboarding_submissions").insert({
        form_id: form.id,
        organisation_id: form.organisation_id,
        applicant_email: applicant_email || null,
        applicant_name: applicant_name || null,
        applicant_type: form.required_checks?.kyb ? "business" : "individual",
        data: dataOut,
        documents,
        status: "pending",
        user_agent: navigator.userAgent,
      });
      if (error) throw error;

      setSubmitted(true);
      if (form.redirect_url) {
        setTimeout(() => { window.location.href = form.redirect_url!; }, 1500);
      }
    } catch (e: any) {
      const msg = e?.message || "Failed to submit";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const pageStyle = useMemo(
    () => ({ "--brand": primary } as React.CSSProperties),
    [primary]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">Form not available</h1>
          <p className="text-muted-foreground text-sm">
            This onboarding link is invalid or has been deactivated. Please contact
            the organisation that shared it with you.
          </p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4" style={pageStyle}>
        <Card className="p-10 max-w-lg text-center">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${primary}20`, color: primary }}
          >
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Submission received</h1>
          <p className="text-muted-foreground">
            Thank you. {form.branding.company_name || "The team"} will review your
            information and get back to you shortly
            {form.branding.support_email ? ` at ${form.branding.support_email}` : ""}.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" style={pageStyle}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <header className="mb-8 text-center">
          {form.branding.logo_url && (
            <img
              src={form.branding.logo_url}
              alt={form.branding.company_name || form.name}
              className="h-12 mx-auto mb-4 object-contain"
            />
          )}
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">{form.name}</h1>
          {form.description && (
            <p className="text-muted-foreground mt-2 text-sm md:text-base">{form.description}</p>
          )}
        </header>

        <Card className="p-6 md:p-8 space-y-5">
          {form.schema.map((f) => {
            if (f.type === "heading") {
              return (
                <div key={f.id} className="pt-4 first:pt-0">
                  <h2 className="text-lg font-semibold text-foreground border-b pb-2">
                    {f.label}
                  </h2>
                </div>
              );
            }
            const err = errors[f.key];
            const invalid = !!err;
            const ariaProps = {
              "aria-invalid": invalid || undefined,
              "aria-describedby": invalid ? `${f.id}-err` : undefined,
            } as const;
            return (
              <div
                key={f.id}
                ref={(el) => { fieldRefs.current[f.key] = el; }}
                className="space-y-1.5 scroll-mt-24"
              >
                <Label className="flex items-center gap-1">
                  {f.label}
                  {f.required && <span className="text-destructive">*</span>}
                </Label>
                {f.helpText && <p className="text-xs text-muted-foreground">{f.helpText}</p>}
                {(() => {
                  const errCls = invalid ? "border-destructive focus-visible:ring-destructive/30" : "";
                  switch (f.type) {
                    case "textarea":
                      return (
                        <Textarea
                          {...ariaProps}
                          className={errCls}
                          placeholder={f.placeholder}
                          value={values[f.key] || ""}
                          onChange={(e) => setValue(f.key, e.target.value)}
                          rows={4}
                        />
                      );
                    case "select":
                      return (
                        <Select value={values[f.key] || ""} onValueChange={(v) => setValue(f.key, v)}>
                          <SelectTrigger {...ariaProps} className={errCls}>
                            <SelectValue placeholder={f.placeholder || "Select..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {(f.options || []).map((o) => (
                              <SelectItem key={o} value={o}>{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    case "checkbox":
                      return (
                        <div className="flex items-start gap-2 pt-1">
                          <Checkbox
                            id={f.id}
                            checked={!!values[f.key]}
                            onCheckedChange={(v) => setValue(f.key, !!v)}
                          />
                          <label htmlFor={f.id} className="text-sm text-muted-foreground leading-tight">
                            {f.placeholder || "I confirm"}
                          </label>
                        </div>
                      );
                    case "file":
                      return (
                        <FilePicker
                          file={fieldFiles[f.key] || null}
                          onChange={(file) => setFieldFile(f.key, file)}
                          allowed={f.validation?.allowedFileTypes}
                          maxMb={f.validation?.maxFileSizeMb ?? 10}
                          invalid={invalid}
                        />
                      );
                    case "address":
                      return (
                        <Textarea
                          {...ariaProps}
                          className={errCls}
                          placeholder={f.placeholder || "Street, City, Postal code, Country"}
                          value={values[f.key] || ""}
                          onChange={(e) => setValue(f.key, e.target.value)}
                          rows={3}
                        />
                      );
                    default:
                      return (
                        <Input
                          {...ariaProps}
                          className={errCls}
                          type={
                            f.type === "email" ? "email" :
                            f.type === "phone" ? "tel" :
                            f.type === "number" ? "number" :
                            f.type === "date" ? "date" : "text"
                          }
                          placeholder={f.placeholder}
                          value={values[f.key] || ""}
                          onChange={(e) => setValue(f.key, e.target.value)}
                        />
                      );
                  }
                })()}
                {invalid && (
                  <p id={`${f.id}-err`} className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {err}
                  </p>
                )}
              </div>
            );
          })}

          {(form.required_checks?.documents?.length || 0) > 0 && (
            <div className="pt-4 space-y-3 border-t">
              <h2 className="text-lg font-semibold text-foreground">Required documents</h2>
              <p className="text-xs text-muted-foreground">
                Please upload clear copies. Accepted formats: PDF, JPG, PNG (max 10MB each).
              </p>
              {form.required_checks.documents.map((doc) => {
                const k = `__doc__${doc}`;
                const err = errors[k];
                return (
                  <div
                    key={doc}
                    ref={(el) => { fieldRefs.current[k] = el; }}
                    className="space-y-1.5 scroll-mt-24"
                  >
                    <Label className="flex items-center gap-1">
                      {doc} <span className="text-destructive">*</span>
                    </Label>
                    <FilePicker
                      file={docFiles[doc] || null}
                      onChange={(file) => setDocFile(doc, file)}
                      invalid={!!err}
                    />
                    {err && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {err}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {serverError && (
            <div className="border border-destructive/40 bg-destructive/10 text-destructive text-sm rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">Could not submit</div>
                <div className="text-xs opacity-90">{serverError}</div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full"
              style={{ backgroundColor: primary }}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</>
              ) : (
                "Submit application"
              )}
            </Button>
          </div>
        </Card>

        {form.branding.show_powered_by && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Secure onboarding powered by <span className="font-semibold">WorldAML</span>
          </p>
        )}
      </div>
    </div>
  );
}

function FilePicker({
  file,
  onChange,
  allowed,
  maxMb = 10,
  invalid,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  allowed?: string[];
  maxMb?: number;
  invalid?: boolean;
}) {
  const accept =
    allowed && allowed.length
      ? allowed.map((e) => `.${e}`).join(",")
      : ".pdf,.jpg,.jpeg,.png";
  return (
    <div>
      {file ? (
        <div className={`flex items-center gap-2 p-2 border rounded-md bg-muted/40 ${invalid ? "border-destructive" : ""}`}>
          <FileText className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{file.name}</div>
            <div className="text-[11px] text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={() => onChange(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label
          className={`flex items-center justify-center gap-2 p-3 border border-dashed rounded-md cursor-pointer hover:bg-muted/40 text-sm text-muted-foreground ${
            invalid ? "border-destructive text-destructive" : ""
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>
            Click to upload ({(allowed && allowed.length ? allowed : ["pdf","jpg","png"]).join(", ").toUpperCase()} · max {maxMb}MB)
          </span>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > maxMb * 1024 * 1024) {
                toast.error(`File exceeds ${maxMb}MB`);
                return;
              }
              const ext = (f.name.split(".").pop() || "").toLowerCase();
              const list = allowed && allowed.length ? allowed : ["pdf", "jpg", "jpeg", "png"];
              if (!list.includes(ext)) {
                toast.error(`Only ${list.join(", ").toUpperCase()} files allowed`);
                return;
              }
              onChange(f);
            }}
          />
        </label>
      )}
    </div>
  );
}

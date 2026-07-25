import { useEffect, useMemo, useState } from "react";
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
import { Loader2, CheckCircle2, Upload, FileText, X } from "lucide-react";

type FieldType =
  | "text" | "email" | "phone" | "number" | "textarea"
  | "select" | "checkbox" | "date" | "address" | "file" | "heading";

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  key: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
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

export default function OnboardPublic() {
  const { token } = useParams<{ token: string }>();
  const [form, setForm] = useState<OnboardingForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [fieldFiles, setFieldFiles] = useState<Record<string, File | null>>({});
  const [docFiles, setDocFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const { data, error } = await supabase
        .from("suite_onboarding_forms")
        .select("id,organisation_id,name,description,branding,schema,required_checks,redirect_url,is_active")
        .eq("id", token)
        .eq("is_active", true)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
      } else {
        setForm(data as any);
      }
      setLoading(false);
    };
    load();
  }, [token]);

  const primary = form?.branding?.primary_color || "#0f766e";

  const setValue = (key: string, v: any) => setValues((s) => ({ ...s, [key]: v }));

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

  const validate = (): string | null => {
    if (!form) return "Form not loaded";
    for (const f of form.schema) {
      if (f.type === "heading") continue;
      if (!f.required) continue;
      if (f.type === "file") {
        if (!fieldFiles[f.key]) return `${f.label} is required`;
      } else if (f.type === "checkbox") {
        if (!values[f.key]) return `${f.label} is required`;
      } else {
        const v = values[f.key];
        if (v === undefined || v === null || String(v).trim() === "") return `${f.label} is required`;
      }
    }
    for (const doc of form.required_checks?.documents || []) {
      if (!docFiles[doc]) return `${doc} document is required`;
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!form) return;
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    try {
      // Upload field files
      const dataOut: Record<string, any> = { ...values };
      for (const f of form.schema) {
        if (f.type === "file" && fieldFiles[f.key]) {
          const meta = await uploadFile(fieldFiles[f.key]!, "fields", f.key);
          dataOut[f.key] = meta;
        }
      }
      // Upload required documents
      const documents: any[] = [];
      for (const doc of form.required_checks?.documents || []) {
        if (docFiles[doc]) {
          const meta = await uploadFile(docFiles[doc]!, "documents", doc.replace(/\s+/g, "_"));
          documents.push({ requirement: doc, ...meta });
        }
      }

      // Infer applicant fields
      const findByKey = (needle: RegExp) => {
        const f = form.schema.find(
          (x) => x.type !== "heading" && (needle.test(x.key) || needle.test(x.label))
        );
        return f ? dataOut[f.key] : undefined;
      };
      const applicant_email =
        findByKey(/email/i) ||
        form.schema.find((x) => x.type === "email") &&
          dataOut[form.schema.find((x) => x.type === "email")!.key];
      const applicant_name =
        findByKey(/name|full.?name|company/i) || null;

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
        setTimeout(() => {
          window.location.href = form.redirect_url!;
        }, 1500);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to submit");
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
            const common = (
              <Label className="flex items-center gap-1">
                {f.label}
                {f.required && <span className="text-destructive">*</span>}
              </Label>
            );
            return (
              <div key={f.id} className="space-y-1.5">
                {common}
                {f.helpText && <p className="text-xs text-muted-foreground">{f.helpText}</p>}
                {(() => {
                  switch (f.type) {
                    case "textarea":
                      return (
                        <Textarea
                          placeholder={f.placeholder}
                          value={values[f.key] || ""}
                          onChange={(e) => setValue(f.key, e.target.value)}
                          rows={4}
                        />
                      );
                    case "select":
                      return (
                        <Select value={values[f.key] || ""} onValueChange={(v) => setValue(f.key, v)}>
                          <SelectTrigger>
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
                          onChange={(file) => setFieldFiles((s) => ({ ...s, [f.key]: file }))}
                        />
                      );
                    case "address":
                      return (
                        <Textarea
                          placeholder={f.placeholder || "Street, City, Postal code, Country"}
                          value={values[f.key] || ""}
                          onChange={(e) => setValue(f.key, e.target.value)}
                          rows={3}
                        />
                      );
                    default:
                      return (
                        <Input
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
              </div>
            );
          })}

          {(form.required_checks?.documents?.length || 0) > 0 && (
            <div className="pt-4 space-y-3 border-t">
              <h2 className="text-lg font-semibold text-foreground">Required documents</h2>
              <p className="text-xs text-muted-foreground">
                Please upload clear copies. Accepted formats: PDF, JPG, PNG (max 10MB each).
              </p>
              {form.required_checks.documents.map((doc) => (
                <div key={doc} className="space-y-1.5">
                  <Label className="flex items-center gap-1">
                    {doc} <span className="text-destructive">*</span>
                  </Label>
                  <FilePicker
                    file={docFiles[doc] || null}
                    onChange={(file) => setDocFiles((s) => ({ ...s, [doc]: file }))}
                  />
                </div>
              ))}
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
}: {
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      {file ? (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/40">
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
        <label className="flex items-center justify-center gap-2 p-3 border border-dashed rounded-md cursor-pointer hover:bg-muted/40 text-sm text-muted-foreground">
          <Upload className="w-4 h-4" />
          <span>Click to upload</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.size > 10 * 1024 * 1024) {
                toast.error("File exceeds 10MB");
                return;
              }
              onChange(f || null);
            }}
          />
        </label>
      )}
    </div>
  );
}

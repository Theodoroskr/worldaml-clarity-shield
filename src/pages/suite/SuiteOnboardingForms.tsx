import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  GripVertical,
  ArrowLeft,
  Save,
  Loader2,
  Copy,
  Type,
  Mail,
  Phone,
  Hash,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Calendar,
  MapPin,
  FileUp,
  Heading,
  History,
  Rocket,
  Undo2,
  GitCompareArrows,
  ExternalLink,
  Share2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

// ---------- Types ----------
type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "date"
  | "address"
  | "file"
  | "heading";

interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  format?: "" | "email" | "url" | "alpha" | "alphanumeric";
  allowedFileTypes?: string[]; // e.g. ["pdf","jpg"]
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
  options?: string[]; // for select
  validation?: FieldValidation;
}

interface RequiredChecks {
  kyc: boolean;
  kyb: boolean;
  sof: boolean;
  documents: string[];
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
  slug: string;
  name: string;
  description: string | null;
  branding: Branding;
  schema: FormField[];
  required_checks: RequiredChecks;
  redirect_url: string | null;
  is_active: boolean;
  created_at: string;
  published_version_id?: string | null;
  current_draft_version_id?: string | null;
  latest_version_number?: number | null;
}

interface FormVersion {
  id: string;
  form_id: string;
  version_number: number;
  status: "draft" | "published" | "archived";
  name: string;
  description: string | null;
  notes: string | null;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  schema?: FormField[];
  required_checks?: RequiredChecks;
  branding?: Branding;
  redirect_url?: string | null;
}

const FIELD_LIBRARY: { type: FieldType; label: string; icon: any }[] = [
  { type: "heading", label: "Section heading", icon: Heading },
  { type: "text", label: "Short text", icon: Type },
  { type: "textarea", label: "Long text", icon: AlignLeft },
  { type: "email", label: "Email", icon: Mail },
  { type: "phone", label: "Phone", icon: Phone },
  { type: "number", label: "Number", icon: Hash },
  { type: "select", label: "Dropdown", icon: ChevronDown },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "date", label: "Date", icon: Calendar },
  { type: "address", label: "Address", icon: MapPin },
  { type: "file", label: "File upload", icon: FileUp },
];

const DOC_TYPES = [
  "Passport",
  "National ID",
  "Driver License",
  "Proof of Address",
  "Bank Statement",
  "Certificate of Incorporation",
  "Articles of Association",
  "UBO Declaration",
  "Source of Funds Evidence",
];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

const defaultField = (type: FieldType): FormField => ({
  id: crypto.randomUUID(),
  type,
  label:
    type === "heading"
      ? "Section title"
      : FIELD_LIBRARY.find((f) => f.type === type)?.label || "Field",
  key: `field_${Math.random().toString(36).slice(2, 7)}`,
  required: false,
  options: type === "select" ? ["Option 1", "Option 2"] : undefined,
});

// ---------- Sortable field row ----------
function SortableField({
  field,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
}: {
  field: FormField;
  onEdit: (f: FormField) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });
  const Icon = FIELD_LIBRARY.find((f) => f.type === field.type)?.icon || Type;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      onClick={onSelect}
      className={`group flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer transition-colors ${
        isSelected ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-primary/40"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">
          {field.type} · {field.key}
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(field.id);
        }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// ---------- Main component ----------
export default function SuiteOnboardingForms() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [forms, setForms] = useState<OnboardingForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [checks, setChecks] = useState<RequiredChecks>({
    kyc: false,
    kyb: false,
    sof: false,
    documents: [],
  });
  const [branding, setBranding] = useState<Branding>({
    logo_url: null,
    primary_color: "#0f766e",
    company_name: null,
    support_email: null,
    show_powered_by: true,
  });
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [publishedVersionId, setPublishedVersionId] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [latestVersionNumber, setLatestVersionNumber] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [versions, setVersions] = useState<FormVersion[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishNotes, setPublishNotes] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareForm, setShareForm] = useState<OnboardingForm | null>(null);
  const [copied, setCopied] = useState(false);

  const publicUrl = (form: OnboardingForm) => `${window.location.origin}/onboard/${form.id}`;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchForms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suite_onboarding_forms")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load forms");
    setForms((data as unknown as OnboardingForm[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (!id) {
      setEditingId(null);
      return;
    }
    if (id === "new") {
      resetEditor();
      setEditingId("new");
      return;
    }
    const wf = forms.find((f) => f.id === id);
    if (wf) loadIntoEditor(wf);
    else setEditingId(id); // load once list ready
  }, [id, forms]);

  const resetEditor = () => {
    setName("");
    setSlug("");
    setDescription("");
    setFields([]);
    setSelectedFieldId(null);
    setChecks({ kyc: false, kyb: false, sof: false, documents: [] });
    setBranding({
      logo_url: null,
      primary_color: "#0f766e",
      company_name: null,
      support_email: null,
      show_powered_by: true,
    });
    setRedirectUrl("");
    setIsActive(false);
    setPublishedVersionId(null);
    setCurrentDraftId(null);
    setLatestVersionNumber(0);
    setHasUnsavedChanges(false);
    setVersions([]);
  };

  const loadVersions = async (formId: string) => {
    const { data } = await supabase
      .from("suite_onboarding_form_versions")
      .select("*")
      .eq("form_id", formId)
      .order("version_number", { ascending: false });
    setVersions((data as any as FormVersion[]) || []);
  };

  const loadIntoEditor = (f: OnboardingForm) => {
    setEditingId(f.id);
    setName(f.name);
    setSlug(f.slug);
    setDescription(f.description || "");
    setFields((f.schema as FormField[]) || []);
    setChecks(
      (f.required_checks as RequiredChecks) || {
        kyc: false,
        kyb: false,
        sof: false,
        documents: [],
      }
    );
    setBranding(f.branding as Branding);
    setRedirectUrl(f.redirect_url || "");
    setIsActive(f.is_active);
    setPublishedVersionId(f.published_version_id ?? null);
    setCurrentDraftId(f.current_draft_version_id ?? null);
    setLatestVersionNumber(f.latest_version_number ?? 0);
    setHasUnsavedChanges(false);
    setSelectedFieldId(null);
    loadVersions(f.id);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setFields((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const addField = (type: FieldType) => {
    const f = defaultField(type);
    setFields((prev) => [...prev, f]);
    setSelectedFieldId(f.id);
  };

  const updateField = (updated: FormField) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const deleteField = (fid: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fid));
    if (selectedFieldId === fid) setSelectedFieldId(null);
  };

  const selected = fields.find((f) => f.id === selectedFieldId) || null;

  // Any editor mutation marks the working copy dirty
  useEffect(() => {
    if (editingId && editingId !== "new") setHasUnsavedChanges(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, description, fields, checks, branding, redirectUrl]);

  const saveForm = async () => {
    if (!name.trim()) {
      toast.error("Form name is required");
      return;
    }
    setSaving(true);

    const { data: orgId } = await supabase.rpc("current_user_org_id");
    if (!orgId) {
      toast.error("No Suite organisation found for your account");
      setSaving(false);
      return;
    }

    // New form: create the parent row (inactive by default) then save its first draft
    if (!editingId || editingId === "new") {
      const { data: created, error: createErr } = await supabase
        .from("suite_onboarding_forms")
        .insert({
          name,
          slug: slug || slugify(name),
          description: description || null,
          schema: fields as any,
          required_checks: checks as any,
          branding: branding as any,
          redirect_url: redirectUrl || null,
          is_active: false,
          user_id: user!.id,
          organisation_id: orgId as unknown as string,
        })
        .select()
        .single();

      if (createErr || !created) {
        toast.error(createErr?.message || "Failed to create form");
        setSaving(false);
        return;
      }

      const { error: draftErr } = await supabase.rpc("onboarding_form_save_draft", {
        _form_id: created.id,
        _name: name,
        _description: description || null,
        _schema: fields as any,
        _required_checks: checks as any,
        _branding: branding as any,
        _redirect_url: redirectUrl || null,
      });
      if (draftErr) toast.error(`Draft not saved: ${draftErr.message}`);
      else toast.success("Draft saved. Publish when you're ready to go live.");

      setSaving(false);
      fetchForms();
      navigate(`/suite/onboarding-forms/${created.id}`);
      return;
    }

    // Existing form: save draft snapshot only (does not affect live version)
    const { error } = await supabase.rpc("onboarding_form_save_draft", {
      _form_id: editingId,
      _name: name,
      _description: description || null,
      _schema: fields as any,
      _required_checks: checks as any,
      _branding: branding as any,
      _redirect_url: redirectUrl || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Draft saved");
      setHasUnsavedChanges(false);
      // Refresh form + versions
      const { data: refreshed } = await supabase
        .from("suite_onboarding_forms")
        .select("*")
        .eq("id", editingId)
        .single();
      if (refreshed) {
        setCurrentDraftId((refreshed as any).current_draft_version_id ?? null);
        setLatestVersionNumber((refreshed as any).latest_version_number ?? 0);
      }
      loadVersions(editingId);
    }
    setSaving(false);
    fetchForms();
  };

  const publishForm = async () => {
    if (!editingId || editingId === "new") return;
    // Auto-save any pending edits first so the publish reflects them
    if (hasUnsavedChanges) {
      await saveForm();
    }
    setPublishing(true);
    const { error } = await supabase.rpc("onboarding_form_publish", {
      _form_id: editingId,
      _notes: publishNotes || null,
    });
    setPublishing(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Form published — public link now serves the new version");
    setPublishOpen(false);
    setPublishNotes("");
    // Refresh
    const { data: refreshed } = await supabase
      .from("suite_onboarding_forms")
      .select("*")
      .eq("id", editingId)
      .single();
    if (refreshed) loadIntoEditor(refreshed as any);
    fetchForms();
  };

  const rollbackToVersion = async (versionId: string, versionNumber: number) => {
    if (!editingId || editingId === "new") return;
    if (!confirm(`Roll back to v${versionNumber}? This will replace the live form with the v${versionNumber} snapshot.`)) return;
    setRollingBackId(versionId);
    const { error } = await supabase.rpc("onboarding_form_rollback", {
      _form_id: editingId,
      _version_id: versionId,
      _notes: `Rollback to v${versionNumber}`,
    });
    setRollingBackId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Rolled back to v${versionNumber}`);
    setVersionsOpen(false);
    const { data: refreshed } = await supabase
      .from("suite_onboarding_forms")
      .select("*")
      .eq("id", editingId)
      .single();
    if (refreshed) loadIntoEditor(refreshed as any);
    fetchForms();
  };

  const deleteForm = async (fid: string) => {
    if (!confirm("Delete this form? This cannot be undone.")) return;
    const { error } = await supabase.from("suite_onboarding_forms").delete().eq("id", fid);
    if (error) toast.error(error.message);
    else {
      toast.success("Form deleted");
      fetchForms();
    }
  };

  const openShare = (form: OnboardingForm) => {
    setShareForm(form);
    setCopied(false);
    setShareOpen(true);
  };

  const copyCurrentUrl = async () => {
    if (!shareForm) return;
    await navigator.clipboard.writeText(publicUrl(shareForm));
    setCopied(true);
    toast.success("Public link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  // ------- List view -------
  if (!editingId) {
    return (
      <div className="p-6 space-y-5 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Onboarding Forms</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Design custom onboarding forms your clients can fill in from a shareable link.
            </p>
          </div>
          <Button onClick={() => navigate("/suite/onboarding-forms/new")}>
            <Plus className="w-4 h-4 mr-1.5" /> New Form
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : forms.length === 0 ? (
          <Card className="p-12 text-center text-sm text-muted-foreground">
            No onboarding forms yet. Create one to start collecting client submissions.
          </Card>
        ) : (
          <div className="grid gap-3">
            {forms.map((f) => (
              <Card
                key={f.id}
                className="p-4 flex items-center justify-between hover:border-primary/40 transition-colors"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/suite/onboarding-forms/${f.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-foreground">{f.name}</div>
                    <Badge variant={f.is_active ? "default" : "outline"} className="text-[10px]">
                      {f.is_active ? "Live" : "Draft"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {(f.schema || []).length} fields · slug: {f.slug}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => copyPublicUrl(f)}>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Link
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteForm(f.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ------- Editor view -------
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3 shrink-0">
        <Button size="sm" variant="ghost" onClick={() => navigate("/suite/onboarding-forms")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Input
          className="w-64 h-8 text-sm font-medium"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!editingId || editingId === "new") setSlug(slugify(e.target.value));
          }}
          placeholder="Form name (e.g. Corporate KYB)"
        />
        <div className="flex items-center gap-2">
          {publishedVersionId ? (
            <Badge variant="default" className="text-[10px]">
              Live · v{versions.find((v) => v.id === publishedVersionId)?.version_number ?? "?"}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">Never published</Badge>
          )}
          {(currentDraftId || hasUnsavedChanges) && (
            <Badge variant="secondary" className="text-[10px]">
              Draft{hasUnsavedChanges ? " · unsaved" : ""}
            </Badge>
          )}
        </div>
        <div className="flex-1" />
        <Button
          size="sm"
          variant="outline"
          disabled={!editingId || editingId === "new"}
          onClick={() => setVersionsOpen(true)}
        >
          <History className="w-3.5 h-3.5 mr-1" /> Versions
        </Button>
        <Button size="sm" variant="outline" onClick={saveForm} disabled={saving}>
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1" />
          )}
          Save draft
        </Button>
        <Button
          size="sm"
          onClick={() => setPublishOpen(true)}
          disabled={!editingId || editingId === "new" || (!currentDraftId && !hasUnsavedChanges)}
        >
          <Rocket className="w-3.5 h-3.5 mr-1" /> Publish
        </Button>
      </div>

      {/* Versions dialog */}
      <Dialog
        open={versionsOpen}
        onOpenChange={(o) => {
          setVersionsOpen(o);
          if (!o) {
            setCompareA(null);
            setCompareB(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
            <DialogDescription>
              Every draft and publish is captured. Roll back to any previous version, or pick two versions below to see exactly what changed.
            </DialogDescription>
          </DialogHeader>

          {/* Compare selectors */}
          {versions.length >= 2 && (
            <div className="flex flex-wrap items-end gap-2 rounded-md border border-border bg-muted/30 p-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Base</label>
                <select
                  className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                  value={compareA ?? ""}
                  onChange={(e) => setCompareA(e.target.value || null)}
                >
                  <option value="">Select version…</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version_number} {v.id === publishedVersionId ? "(live)" : v.id === currentDraftId ? "(draft)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-muted-foreground pb-1.5">→</div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Compare to</label>
                <select
                  className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                  value={compareB ?? ""}
                  onChange={(e) => setCompareB(e.target.value || null)}
                >
                  <option value="">Select version…</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version_number} {v.id === publishedVersionId ? "(live)" : v.id === currentDraftId ? "(draft)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              {(compareA || compareB) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto"
                  onClick={() => {
                    setCompareA(null);
                    setCompareB(null);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          )}

          {/* Diff panel */}
          {compareA && compareB && compareA !== compareB && (
            <VersionDiffPanel
              a={versions.find((v) => v.id === compareA)!}
              b={versions.find((v) => v.id === compareB)!}
            />
          )}
          {compareA && compareB && compareA === compareB && (
            <div className="text-xs text-muted-foreground">Pick two different versions to compare.</div>
          )}

          <div className="max-h-[45vh] overflow-y-auto -mx-6 px-6 divide-y divide-border">
            {versions.length === 0 && (
              <div className="text-sm text-muted-foreground py-6">No versions yet.</div>
            )}
            {versions.map((v) => {
              const isPublished = v.id === publishedVersionId;
              const isDraft = v.id === currentDraftId;
              return (
                <div key={v.id} className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">v{v.version_number}</span>
                      {isPublished && <Badge className="text-[10px]">Live</Badge>}
                      {isDraft && <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
                      {!isPublished && !isDraft && v.status === "archived" && (
                        <Badge variant="outline" className="text-[10px]">Archived</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {v.published_at
                        ? `Published ${new Date(v.published_at).toLocaleString()}`
                        : `Updated ${new Date(v.updated_at).toLocaleString()}`}
                      {v.notes ? ` · ${v.notes}` : ""}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (!compareA || (compareA && compareB)) {
                        setCompareA(v.id);
                        setCompareB(null);
                      } else {
                        setCompareB(v.id);
                      }
                    }}
                    title={!compareA ? "Set as base" : "Compare to base"}
                  >
                    <GitCompareArrows className="w-3.5 h-3.5 mr-1" />
                    {!compareA ? "Base" : compareA === v.id ? "Base ✓" : "Compare"}
                  </Button>
                  {!isPublished && v.status !== "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={rollingBackId === v.id}
                      onClick={() => rollbackToVersion(v.id, v.version_number)}
                    >
                      {rollingBackId === v.id ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      ) : (
                        <Undo2 className="w-3.5 h-3.5 mr-1" />
                      )}
                      Roll back
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>


      {/* Publish dialog */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish new version</DialogTitle>
            <DialogDescription>
              Your draft will become the live version served at the public onboarding link. The previous live version stays in history and can be rolled back to at any time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Release notes (optional)</Label>
            <Textarea
              rows={3}
              value={publishNotes}
              onChange={(e) => setPublishNotes(e.target.value)}
              placeholder="e.g. Added source-of-funds question and required proof-of-address"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)} disabled={publishing}>
              Cancel
            </Button>
            <Button onClick={publishForm} disabled={publishing}>
              {publishing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Rocket className="w-3.5 h-3.5 mr-1" />}
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex-1 grid grid-cols-[220px_1fr_320px] min-h-0 overflow-hidden">
        {/* Left: field library */}
        <aside className="border-r border-border bg-muted/20 overflow-y-auto p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Field library
          </div>
          <div className="space-y-1">
            {FIELD_LIBRARY.map((f) => (
              <button
                key={f.type}
                onClick={() => addField(f.type)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-foreground hover:bg-card border border-transparent hover:border-border transition-colors"
              >
                <f.icon className="w-4 h-4 text-muted-foreground" />
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-2 px-1">
            Required checks
          </div>
          <div className="space-y-2 px-1">
            {(["kyc", "kyb", "sof"] as const).map((k) => (
              <label key={k} className="flex items-center justify-between text-sm">
                <span className="uppercase text-xs">{k}</span>
                <Switch
                  checked={checks[k]}
                  onCheckedChange={(v) => setChecks({ ...checks, [k]: v })}
                />
              </label>
            ))}
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-2 px-1">
            Required documents
          </div>
          <div className="space-y-1.5 px-1">
            {DOC_TYPES.map((d) => (
              <label key={d} className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={checks.documents.includes(d)}
                  onChange={(e) => {
                    setChecks({
                      ...checks,
                      documents: e.target.checked
                        ? [...checks.documents, d]
                        : checks.documents.filter((x) => x !== d),
                    });
                  }}
                />
                {d}
              </label>
            ))}
          </div>
        </aside>

        {/* Center: canvas */}
        <div className="overflow-y-auto p-6 bg-muted/10">
          <Card className="max-w-2xl mx-auto p-6">
            <div className="pb-4 mb-4 border-b border-border">
              <Input
                className="border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Untitled form"
              />
              <Textarea
                className="border-none px-0 shadow-none focus-visible:ring-0 resize-none text-sm text-muted-foreground min-h-0"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description shown to your client…"
              />
            </div>

            {fields.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-lg py-16 text-center text-sm text-muted-foreground">
                Add fields from the left library to build your form
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {fields.map((f) => (
                      <SortableField
                        key={f.id}
                        field={f}
                        onEdit={updateField}
                        onDelete={deleteField}
                        isSelected={selectedFieldId === f.id}
                        onSelect={() => setSelectedFieldId(f.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </Card>
        </div>

        {/* Right: inspector */}
        <aside className="border-l border-border bg-card overflow-y-auto p-4 space-y-4">
          {selected ? (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Field settings
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={selected.label}
                    onChange={(e) => updateField({ ...selected, label: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Key (internal name)</Label>
                  <Input
                    value={selected.key}
                    onChange={(e) =>
                      updateField({
                        ...selected,
                        key: e.target.value.replace(/[^a-zA-Z0-9_]/g, "_"),
                      })
                    }
                  />
                </div>
                {selected.type !== "heading" && selected.type !== "checkbox" && (
                  <div>
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={selected.placeholder || ""}
                      onChange={(e) =>
                        updateField({ ...selected, placeholder: e.target.value })
                      }
                    />
                  </div>
                )}
                <div>
                  <Label className="text-xs">Help text</Label>
                  <Textarea
                    rows={2}
                    value={selected.helpText || ""}
                    onChange={(e) => updateField({ ...selected, helpText: e.target.value })}
                  />
                </div>
                {selected.type === "select" && (
                  <div>
                    <Label className="text-xs">Options (one per line)</Label>
                    <Textarea
                      rows={4}
                      value={(selected.options || []).join("\n")}
                      onChange={(e) =>
                        updateField({
                          ...selected,
                          options: e.target.value.split("\n").filter(Boolean),
                        })
                      }
                    />
                  </div>
                )}
                {selected.type !== "heading" && (
                  <label className="flex items-center justify-between text-sm">
                    <span>Required</span>
                    <Switch
                      checked={!!selected.required}
                      onCheckedChange={(v) => updateField({ ...selected, required: v })}
                    />
                  </label>
                )}

                {selected.type !== "heading" && selected.type !== "checkbox" && (
                  <div className="pt-3 border-t border-border space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Validation
                    </div>

                    {(["text", "textarea", "email", "phone", "address"].includes(selected.type)) && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Min length</Label>
                            <Input
                              type="number"
                              min={0}
                              value={selected.validation?.minLength ?? ""}
                              onChange={(e) =>
                                updateField({
                                  ...selected,
                                  validation: {
                                    ...selected.validation,
                                    minLength: e.target.value === "" ? undefined : Number(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Max length</Label>
                            <Input
                              type="number"
                              min={0}
                              value={selected.validation?.maxLength ?? ""}
                              onChange={(e) =>
                                updateField({
                                  ...selected,
                                  validation: {
                                    ...selected.validation,
                                    maxLength: e.target.value === "" ? undefined : Number(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Format preset</Label>
                          <Select
                            value={selected.validation?.format || "none"}
                            onValueChange={(v) =>
                              updateField({
                                ...selected,
                                validation: {
                                  ...selected.validation,
                                  format: (v === "none" ? "" : v) as FieldValidation["format"],
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="url">URL</SelectItem>
                              <SelectItem value="alpha">Letters only</SelectItem>
                              <SelectItem value="alphanumeric">Letters &amp; numbers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Regex pattern (advanced)</Label>
                          <Input
                            placeholder="^[A-Z]{2}[0-9]{6}$"
                            value={selected.validation?.pattern || ""}
                            onChange={(e) =>
                              updateField({
                                ...selected,
                                validation: { ...selected.validation, pattern: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Error message if pattern fails</Label>
                          <Input
                            placeholder="Please enter a valid value"
                            value={selected.validation?.patternMessage || ""}
                            onChange={(e) =>
                              updateField({
                                ...selected,
                                validation: {
                                  ...selected.validation,
                                  patternMessage: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </>
                    )}

                    {selected.type === "number" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Min value</Label>
                          <Input
                            type="number"
                            value={selected.validation?.min ?? ""}
                            onChange={(e) =>
                              updateField({
                                ...selected,
                                validation: {
                                  ...selected.validation,
                                  min: e.target.value === "" ? undefined : Number(e.target.value),
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Max value</Label>
                          <Input
                            type="number"
                            value={selected.validation?.max ?? ""}
                            onChange={(e) =>
                              updateField({
                                ...selected,
                                validation: {
                                  ...selected.validation,
                                  max: e.target.value === "" ? undefined : Number(e.target.value),
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {selected.type === "file" && (
                      <>
                        <div>
                          <Label className="text-xs">Allowed file types (comma-separated)</Label>
                          <Input
                            placeholder="pdf, jpg, png"
                            value={(selected.validation?.allowedFileTypes || []).join(", ")}
                            onChange={(e) =>
                              updateField({
                                ...selected,
                                validation: {
                                  ...selected.validation,
                                  allowedFileTypes: e.target.value
                                    .split(",")
                                    .map((s) => s.trim().replace(/^\./, "").toLowerCase())
                                    .filter(Boolean),
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Max file size (MB)</Label>
                          <Input
                            type="number"
                            min={1}
                            placeholder="10"
                            value={selected.validation?.maxFileSizeMb ?? ""}
                            onChange={(e) =>
                              updateField({
                                ...selected,
                                validation: {
                                  ...selected.validation,
                                  maxFileSizeMb:
                                    e.target.value === "" ? undefined : Number(e.target.value),
                                },
                              })
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Form settings
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs">Primary color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="w-9 h-9 rounded border border-border"
                      value={branding.primary_color}
                      onChange={(e) =>
                        setBranding({ ...branding, primary_color: e.target.value })
                      }
                    />
                    <Input
                      value={branding.primary_color}
                      onChange={(e) =>
                        setBranding({ ...branding, primary_color: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Logo URL</Label>
                  <Input
                    value={branding.logo_url || ""}
                    onChange={(e) =>
                      setBranding({ ...branding, logo_url: e.target.value || null })
                    }
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <Label className="text-xs">Company name shown</Label>
                  <Input
                    value={branding.company_name || ""}
                    onChange={(e) =>
                      setBranding({ ...branding, company_name: e.target.value || null })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Support email</Label>
                  <Input
                    type="email"
                    value={branding.support_email || ""}
                    onChange={(e) =>
                      setBranding({ ...branding, support_email: e.target.value || null })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Redirect URL after submit</Label>
                  <Input
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="https://client.com/thanks"
                  />
                </div>
                <label className="flex items-center justify-between text-sm">
                  <span>Show "Powered by WorldAML"</span>
                  <Switch
                    checked={branding.show_powered_by}
                    onCheckedChange={(v) =>
                      setBranding({ ...branding, show_powered_by: v })
                    }
                  />
                </label>
                <p className="text-[11px] text-muted-foreground pt-2">
                  Click a field on the canvas to edit its settings.
                </p>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

// ============================================================
// Version diff panel
// ============================================================
function VersionDiffPanel({ a, b }: { a: FormVersion; b: FormVersion }) {
  const metaRows: Array<{ label: string; av: string; bv: string }> = [
    { label: "Name", av: a.name || "—", bv: b.name || "—" },
    { label: "Description", av: a.description || "—", bv: b.description || "—" },
    { label: "Redirect URL", av: a.redirect_url || "—", bv: b.redirect_url || "—" },
    {
      label: "Primary color",
      av: a.branding?.primary_color || "—",
      bv: b.branding?.primary_color || "—",
    },
    {
      label: "Support email",
      av: a.branding?.support_email || "—",
      bv: b.branding?.support_email || "—",
    },
    {
      label: "Show 'Powered by'",
      av: String(a.branding?.show_powered_by ?? true),
      bv: String(b.branding?.show_powered_by ?? true),
    },
    {
      label: "KYC required",
      av: String(a.required_checks?.kyc ?? false),
      bv: String(b.required_checks?.kyc ?? false),
    },
    {
      label: "KYB required",
      av: String(a.required_checks?.kyb ?? false),
      bv: String(b.required_checks?.kyb ?? false),
    },
    {
      label: "SoF required",
      av: String(a.required_checks?.sof ?? false),
      bv: String(b.required_checks?.sof ?? false),
    },
    {
      label: "Required documents",
      av: (a.required_checks?.documents || []).join(", ") || "—",
      bv: (b.required_checks?.documents || []).join(", ") || "—",
    },
  ];

  const aFields = a.schema || [];
  const bFields = b.schema || [];
  const aMap = new Map(aFields.map((f) => [f.id, f]));
  const bMap = new Map(bFields.map((f) => [f.id, f]));

  const added = bFields.filter((f) => !aMap.has(f.id));
  const removed = aFields.filter((f) => !bMap.has(f.id));
  const modified: Array<{ id: string; label: string; changes: Array<{ prop: string; av: string; bv: string }> }> = [];

  for (const bf of bFields) {
    const af = aMap.get(bf.id);
    if (!af) continue;
    const changes: Array<{ prop: string; av: string; bv: string }> = [];
    const props: Array<keyof FormField> = ["type", "label", "key", "placeholder", "required", "helpText"];
    for (const p of props) {
      const av = af[p];
      const bv = bf[p];
      if ((av ?? "") !== (bv ?? "")) {
        changes.push({ prop: String(p), av: String(av ?? "—"), bv: String(bv ?? "—") });
      }
    }
    const aOpts = (af.options || []).join("|");
    const bOpts = (bf.options || []).join("|");
    if (aOpts !== bOpts) {
      changes.push({
        prop: "options",
        av: af.options?.join(", ") || "—",
        bv: bf.options?.join(", ") || "—",
      });
    }
    const aVal = JSON.stringify(af.validation || {});
    const bVal = JSON.stringify(bf.validation || {});
    if (aVal !== bVal) {
      changes.push({ prop: "validation", av: aVal, bv: bVal });
    }
    if (changes.length) modified.push({ id: bf.id, label: bf.label || bf.key || bf.id, changes });
  }

  const metaChanged = metaRows.filter((r) => r.av !== r.bv);
  const hasAnyChange = metaChanged.length + added.length + removed.length + modified.length > 0;

  return (
    <div className="rounded-md border border-border bg-background p-3 space-y-4 text-sm">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">v{a.version_number}</span> → <span className="font-medium text-foreground">v{b.version_number}</span>
        </span>
        <span>
          {added.length} added · {removed.length} removed · {modified.length} modified · {metaChanged.length} meta
        </span>
      </div>

      {!hasAnyChange && (
        <div className="text-xs text-muted-foreground">These two versions are identical.</div>
      )}

      {metaChanged.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Settings</div>
          <div className="rounded border border-border divide-y divide-border">
            {metaChanged.map((r) => (
              <div key={r.label} className="grid grid-cols-[140px_1fr_1fr] gap-2 px-2 py-1.5 text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="line-through text-destructive/80 break-words">{r.av}</span>
                <span className="text-emerald-600 dark:text-emerald-400 break-words">{r.bv}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {added.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Fields added</div>
          <ul className="space-y-1">
            {added.map((f) => (
              <li key={f.id} className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                + {f.label || f.key} <span className="text-muted-foreground">({f.type})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {removed.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Fields removed</div>
          <ul className="space-y-1">
            {removed.map((f) => (
              <li key={f.id} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">
                − {f.label || f.key} <span className="text-muted-foreground">({f.type})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {modified.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Fields modified</div>
          <div className="space-y-2">
            {modified.map((m) => (
              <div key={m.id} className="rounded border border-border">
                <div className="px-2 py-1 text-xs font-medium bg-muted/40">{m.label}</div>
                <div className="divide-y divide-border">
                  {m.changes.map((c) => (
                    <div key={c.prop} className="grid grid-cols-[100px_1fr_1fr] gap-2 px-2 py-1.5 text-xs">
                      <span className="text-muted-foreground">{c.prop}</span>
                      <span className="line-through text-destructive/80 break-words">{c.av}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 break-words">{c.bv}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

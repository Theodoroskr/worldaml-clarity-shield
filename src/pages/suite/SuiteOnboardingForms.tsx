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

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  key: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[]; // for select
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
    setSelectedFieldId(null);
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

  const saveForm = async () => {
    if (!name.trim()) {
      toast.error("Form name is required");
      return;
    }
    setSaving(true);

    // resolve organisation_id
    const { data: orgId } = await supabase.rpc("current_user_org_id");
    if (!orgId) {
      toast.error("No Suite organisation found for your account");
      setSaving(false);
      return;
    }

    const payload = {
      name,
      slug: slug || slugify(name),
      description: description || null,
      schema: fields as any,
      required_checks: checks as any,
      branding: branding as any,
      redirect_url: redirectUrl || null,
      is_active: isActive,
    };

    if (editingId && editingId !== "new") {
      const { error } = await supabase
        .from("suite_onboarding_forms")
        .update(payload)
        .eq("id", editingId);
      if (error) toast.error(error.message);
      else toast.success("Form saved");
    } else {
      const { data, error } = await supabase
        .from("suite_onboarding_forms")
        .insert({
          ...payload,
          user_id: user!.id,
          organisation_id: orgId as unknown as string,
        })
        .select()
        .single();
      if (error) toast.error(error.message);
      else {
        toast.success("Form created");
        navigate(`/suite/onboarding-forms/${data.id}`);
      }
    }
    setSaving(false);
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

  const copyPublicUrl = (form: OnboardingForm) => {
    const url = `${window.location.origin}/onboard/${form.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied");
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Live</span>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
        <div className="flex-1" />
        <Button size="sm" onClick={saveForm} disabled={saving}>
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1" />
          )}
          Save
        </Button>
      </div>

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

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Plus, GripVertical, Trash2, Eye, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  showIf?: { field: string; value: string };
}

interface Template {
  id: string;
  name: string;
  form_type: string;
  fields: Field[];
  is_active: boolean;
  created_at: string;
}

const FIELD_TYPES = ["text", "email", "date", "select", "country", "checkbox", "file", "textarea"];

const genId = () => Math.random().toString(36).slice(2, 8);

export default function AdminForms() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_form_templates").select("*").order("created_at", { ascending: false });
    setTemplates((data || []).map((d: any) => ({ ...d, fields: (d.fields || []) as Field[] })));
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const createNew = () => {
    setEditing({
      id: "",
      name: "",
      form_type: "kyc",
      fields: [
        { id: genId(), label: "Full Name", type: "text", required: true },
        { id: genId(), label: "Email", type: "email", required: true },
        { id: genId(), label: "Date of Birth", type: "date", required: true },
        { id: genId(), label: "Country", type: "country", required: true },
      ],
      is_active: false,
      created_at: "",
    });
  };

  const addField = () => {
    if (!editing) return;
    setEditing({ ...editing, fields: [...editing.fields, { id: genId(), label: "", type: "text", required: false }] });
  };

  const updateField = (idx: number, updates: Partial<Field>) => {
    if (!editing) return;
    const fields = [...editing.fields];
    fields[idx] = { ...fields[idx], ...updates };
    setEditing({ ...editing, fields });
  };

  const removeField = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, fields: editing.fields.filter((_, i) => i !== idx) });
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    if (!editing) return;
    const fields = [...editing.fields];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= fields.length) return;
    [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
    setEditing({ ...editing, fields });
  };

  const saveTemplate = async () => {
    if (!editing || !editing.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    if (editing.id) {
      const { error } = await supabase.from("admin_form_templates").update({
        name: editing.name,
        form_type: editing.form_type,
        fields: editing.fields as any,
        is_active: editing.is_active,
      }).eq("id", editing.id);
      if (error) toast.error("Failed to save"); else toast.success("Template saved");
    } else {
      const { error } = await supabase.from("admin_form_templates").insert({
        name: editing.name,
        form_type: editing.form_type,
        fields: editing.fields as any,
        is_active: editing.is_active,
        created_by: user!.id,
      });
      if (error) toast.error("Failed to create"); else toast.success("Template created");
    }
    setSaving(false);
    setEditing(null);
    fetchTemplates();
  };

  const toggleActive = async (t: Template) => {
    await supabase.from("admin_form_templates").update({ is_active: !t.is_active }).eq("id", t.id);
    fetchTemplates();
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-foreground">Onboarding Forms</h1><p className="text-xs text-muted-foreground">Create custom KYC/KYB intake forms</p></div>
        <Button size="sm" onClick={createNew}><Plus className="w-3.5 h-3.5 mr-1" /> New Template</Button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div> : (
        <div className="grid gap-3">
          {templates.map(t => (
            <div key={t.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.form_type.toUpperCase()} · {t.fields.length} fields</div>
                </div>
                <Badge variant={t.is_active ? "default" : "outline"} className="text-xs">{t.is_active ? "Active" : "Draft"}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleActive(t)}>
                  {t.is_active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(t)}>Edit</Button>
              </div>
            </div>
          ))}
          {templates.length === 0 && <div className="text-center py-12 text-sm text-muted-foreground">No form templates yet. Create one to get started.</div>}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Template" : "New Form Template"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Name</label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Individual KYC Form" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Type</label>
                  <Select value={editing.form_type} onValueChange={v => setEditing({ ...editing, form_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="kyc">KYC</SelectItem><SelectItem value="kyb">KYB</SelectItem><SelectItem value="edd">EDD</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Fields</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPreview(!preview)}><Eye className="w-3 h-3 mr-1" />{preview ? "Editor" : "Preview"}</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addField}><Plus className="w-3 h-3 mr-1" />Add Field</Button>
                </div>
              </div>

              {preview ? (
                <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                  <h4 className="font-semibold text-foreground text-sm">{editing.name || "Form Preview"}</h4>
                  {editing.fields.map(f => (
                    <div key={f.id}>
                      <label className="text-xs font-medium text-foreground">{f.label} {f.required && <span className="text-destructive">*</span>}</label>
                      {f.type === "textarea" ? <textarea className="w-full mt-1 p-2 text-sm border border-border rounded bg-background" rows={3} /> :
                       f.type === "select" ? <select className="w-full mt-1 p-2 text-sm border border-border rounded bg-background"><option>Select…</option>{(f.options || []).map(o => <option key={o}>{o}</option>)}</select> :
                       f.type === "checkbox" ? <div className="mt-1"><input type="checkbox" className="mr-2" /><span className="text-sm">{f.label}</span></div> :
                       <input type={f.type === "country" ? "text" : f.type} className="w-full mt-1 p-2 text-sm border border-border rounded bg-background" placeholder={f.type === "country" ? "Country…" : ""} />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {editing.fields.map((f, i) => (
                    <div key={f.id} className="flex items-center gap-2 bg-muted/20 rounded-md p-2 border border-border">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveField(i, -1)} className="text-muted-foreground hover:text-foreground text-xs">▲</button>
                        <button onClick={() => moveField(i, 1)} className="text-muted-foreground hover:text-foreground text-xs">▼</button>
                      </div>
                      <Input className="flex-1 h-8 text-xs" value={f.label} onChange={e => updateField(i, { label: e.target.value })} placeholder="Field label" />
                      <Select value={f.type} onValueChange={v => updateField(i, { type: v })}>
                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{FIELD_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                      </Select>
                      <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Switch checked={f.required} onCheckedChange={v => updateField(i, { required: v })} className="scale-75" /> Req
                      </label>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => removeField(i)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveTemplate} disabled={saving}>{saving && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}<Save className="w-3.5 h-3.5 mr-1" />Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

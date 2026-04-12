import { useState } from "react";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface CustomField {
  id: string;
  label: string;
  key: string;
  type: "text" | "email" | "date" | "number" | "select" | "textarea" | "country" | "checkbox";
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select type
  section?: string;
}

const FIELD_TYPES: { value: CustomField["type"]; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "textarea", label: "Long Text" },
  { value: "country", label: "Country" },
  { value: "checkbox", label: "Checkbox" },
];

interface FormFieldBuilderProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  formType: "kyc" | "kyb";
}

export default function FormFieldBuilder({ fields, onChange, onClose, onSave, saving, formType }: FormFieldBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newOptionText, setNewOptionText] = useState("");

  const addField = () => {
    const id = `cf_${Date.now()}`;
    const newField: CustomField = {
      id,
      label: "New Field",
      key: `custom_${Date.now()}`,
      type: "text",
      required: false,
      placeholder: "",
      section: "Custom Fields",
    };
    onChange([...fields, newField]);
    setEditingId(id);
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const addOption = (fieldId: string) => {
    if (!newOptionText.trim()) return;
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    updateField(fieldId, { options: [...(field.options || []), newOptionText.trim()] });
    setNewOptionText("");
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    updateField(fieldId, { options: (field.options || []).filter((_, i) => i !== optionIndex) });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground text-sm">
              {formType === "kyc" ? "KYC" : "KYB"} Form Builder
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Add, remove, and reorder custom fields for onboarding
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="text-xs h-7" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save Template"}
          </Button>
        </div>
      </div>

      {/* Field list */}
      <div className="space-y-2 mb-4">
        {fields.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            No custom fields yet. Click "Add Field" to get started.
          </div>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className={cn(
            "border rounded-lg transition-all",
            editingId === field.id ? "border-primary/50 bg-primary/5" : "border-border bg-background"
          )}>
            {/* Field header row */}
            <div className="flex items-center gap-2 px-3 py-2">
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0 cursor-grab" />

              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => moveField(index, -1)} disabled={index === 0}>
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => moveField(index, 1)} disabled={index === fields.length - 1}>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-foreground truncate block">{field.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}
                  {field.required && " · Required"}
                </span>
              </div>

              <Button variant="ghost" size="sm" className="h-6 text-xs px-2"
                onClick={() => setEditingId(editingId === field.id ? null : field.id)}>
                {editingId === field.id ? "Done" : "Edit"}
              </Button>

              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeField(field.id)}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>

            {/* Expanded edit panel */}
            {editingId === field.id && (
              <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Label</label>
                    <Input value={field.label} onChange={e => updateField(field.id, { label: e.target.value })}
                      className="h-8 text-xs" placeholder="Field Label" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Field Key</label>
                    <Input value={field.key} onChange={e => updateField(field.id, { key: e.target.value.replace(/\s/g, "_").toLowerCase() })}
                      className="h-8 text-xs font-mono" placeholder="field_key" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Type</label>
                    <Select value={field.type} onValueChange={(v: CustomField["type"]) => updateField(field.id, { type: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Placeholder</label>
                    <Input value={field.placeholder || ""} onChange={e => updateField(field.id, { placeholder: e.target.value })}
                      className="h-8 text-xs" placeholder="Placeholder text" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Section Name</label>
                    <Input value={field.section || ""} onChange={e => updateField(field.id, { section: e.target.value })}
                      className="h-8 text-xs" placeholder="Custom Fields" />
                  </div>
                  <div className="flex items-end gap-2 pb-0.5">
                    <label className="text-[10px] font-medium text-muted-foreground">Required</label>
                    <Switch checked={field.required} onCheckedChange={v => updateField(field.id, { required: v })} />
                  </div>
                </div>

                {/* Dropdown options */}
                {field.type === "select" && (
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Dropdown Options</label>
                    <div className="space-y-1 mb-2">
                      {(field.options || []).map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <span className="text-xs flex-1 bg-muted/50 px-2 py-1 rounded">{opt}</span>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => removeOption(field.id, oi)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newOptionText} onChange={e => setNewOptionText(e.target.value)}
                        className="h-7 text-xs flex-1" placeholder="Add option…"
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOption(field.id); } }} />
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addOption(field.id)}>Add</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add field button */}
      <Button variant="outline" size="sm" className="w-full text-xs" onClick={addField}>
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Field
      </Button>
    </div>
  );
}

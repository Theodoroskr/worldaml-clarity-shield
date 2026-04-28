import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DEFAULTS = {
  inflow_high_multiplier: 1.5,
  inflow_low_multiplier: 0.3,
  foreign_countries_min: 3,
  high_severity_variance_pct: 100,
  min_confidence_for_auto_clear: 80,
};

type Thresholds = typeof DEFAULTS;

export function SofThresholdsDialog({
  open,
  onOpenChange,
  organisationId,
  userId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  organisationId: string | null;
  userId: string | null;
  onSaved?: () => void;
}) {
  const { toast } = useToast();
  const [values, setValues] = useState<Thresholds>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !organisationId) return;
    setLoading(true);
    (async () => {
      const { data } = await (supabase as any)
        .from("suite_sof_thresholds")
        .select("*")
        .eq("organisation_id", organisationId)
        .maybeSingle();
      if (data) {
        setValues({
          inflow_high_multiplier: Number(data.inflow_high_multiplier),
          inflow_low_multiplier: Number(data.inflow_low_multiplier),
          foreign_countries_min: Number(data.foreign_countries_min),
          high_severity_variance_pct: Number(data.high_severity_variance_pct),
          min_confidence_for_auto_clear: Number(data.min_confidence_for_auto_clear),
        });
      } else {
        setValues(DEFAULTS);
      }
      setLoading(false);
    })();
  }, [open, organisationId]);

  const validate = (): string | null => {
    if (!(values.inflow_high_multiplier >= 1 && values.inflow_high_multiplier <= 10))
      return "High inflow multiplier must be between 1 and 10";
    if (!(values.inflow_low_multiplier > 0 && values.inflow_low_multiplier <= 1))
      return "Low inflow multiplier must be > 0 and ≤ 1";
    if (!(values.foreign_countries_min >= 0 && values.foreign_countries_min <= 50))
      return "Foreign countries minimum must be between 0 and 50";
    if (!(values.high_severity_variance_pct >= 0 && values.high_severity_variance_pct <= 1000))
      return "High-severity variance % must be between 0 and 1000";
    if (!(values.min_confidence_for_auto_clear >= 0 && values.min_confidence_for_auto_clear <= 100))
      return "Auto-clear confidence must be between 0 and 100";
    return null;
  };

  const save = async () => {
    if (!organisationId) return;
    const err = validate();
    if (err) { toast({ title: "Invalid value", description: err, variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await (supabase as any)
      .from("suite_sof_thresholds")
      .upsert({
        organisation_id: organisationId,
        ...values,
        updated_by: userId,
      }, { onConflict: "organisation_id" });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Thresholds updated", description: "Re-run the AI on a declaration to apply." });
    onSaved?.();
    onOpenChange(false);
  };

  const Field = (props: {
    label: string; help: string; k: keyof Thresholds; step?: string; min?: number; max?: number; suffix?: string;
  }) => (
    <div className="space-y-1">
      <Label className="text-xs">{props.label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step={props.step || "0.1"}
          min={props.min}
          max={props.max}
          value={values[props.k]}
          onChange={(e) => setValues((v) => ({ ...v, [props.k]: Number(e.target.value) }))}
          className="h-8"
        />
        {props.suffix && <span className="text-xs text-muted-foreground">{props.suffix}</span>}
      </div>
      <p className="text-[11px] text-muted-foreground">{props.help}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>SoF AI thresholds</DialogTitle>
          <DialogDescription>
            Tune when the AI raises variance and foreign-counterparty flags for your organisation.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
          </div>
        ) : (
          <div className="space-y-3">
            <Field
              label="High inflow multiplier"
              help="Flag when actual 12-month inflows exceed declared income × this value."
              k="inflow_high_multiplier" step="0.1" min={1} max={10} suffix="× declared"
            />
            <Field
              label="Low inflow multiplier"
              help="Flag when actual inflows fall below declared income × this value."
              k="inflow_low_multiplier" step="0.05" min={0.05} max={1} suffix="× declared"
            />
            <Field
              label="Foreign counterparty countries (min)"
              help="Flag when this many distinct foreign counterparty countries appear."
              k="foreign_countries_min" step="1" min={0} max={50} suffix="countries"
            />
            <Field
              label="High-severity variance %"
              help="Variance above this percentage marks the inflow flag as high severity."
              k="high_severity_variance_pct" step="10" min={0} max={1000} suffix="%"
            />
            <Field
              label="Min confidence for auto-clear"
              help="UI threshold for showing a 'high confidence' badge on the score."
              k="min_confidence_for_auto_clear" step="1" min={0} max={100} suffix="/ 100"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving || loading}>
            {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

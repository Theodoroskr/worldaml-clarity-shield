import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Circle, Clock, FileText, Upload, XCircle, ListChecks } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type IncomeSource = { type: string; description: string; amount: number; percentage?: number };
type SofDoc = {
  id: string;
  document_type: string;
  file_name: string;
  verification_status: string;
};

/**
 * Required document types per source-of-funds / wealth category.
 * Aligned with FATF R.10/12 and EU 6AMLD Art. 18a evidentiary expectations.
 * Each source needs at least one verified doc from `required` and is strengthened by `recommended`.
 */
export const EVIDENCE_MAP: Record<
  string,
  { label: string; required: string[]; recommended: string[]; guidance: string }
> = {
  salary: {
    label: "Salary / Employment",
    required: ["payslip", "tax_return"],
    recommended: ["bank_statement"],
    guidance: "3 most recent payslips + latest annual tax return. Bank statement showing salary credits strengthens the file.",
  },
  business: {
    label: "Business Income",
    required: ["business_financials", "tax_return"],
    recommended: ["bank_statement"],
    guidance: "Audited financials (P&L, balance sheet) for the last 2 years + corporate tax return. Beneficial-ownership disclosure if not already on file.",
  },
  investments: {
    label: "Investments / Dividends",
    required: ["dividend_statement"],
    recommended: ["bank_statement", "tax_return"],
    guidance: "Broker statements, dividend vouchers, or fund manager reports covering the declared period.",
  },
  inheritance: {
    label: "Inheritance",
    required: ["inheritance_cert"],
    recommended: ["bank_statement"],
    guidance: "Grant of probate, will, or notarised inheritance certificate. Bank confirmation of inbound transfer.",
  },
  sale_of_asset: {
    label: "Sale of Asset",
    required: ["sale_deed"],
    recommended: ["bank_statement"],
    guidance: "Notarised sale deed (property/vehicle/shares) + bank credit confirming proceeds.",
  },
  gift: {
    label: "Gift",
    required: ["other"],
    recommended: ["bank_statement"],
    guidance: "Signed gift letter from donor + donor source-of-funds evidence + bank credit.",
  },
  savings: {
    label: "Accumulated Savings",
    required: ["bank_statement"],
    recommended: ["tax_return"],
    guidance: "12+ months of bank/savings account statements demonstrating accumulation pattern.",
  },
  pension: {
    label: "Pension",
    required: ["other"],
    recommended: ["bank_statement"],
    guidance: "Pension award letter or annual pension statement + bank credits.",
  },
  other: {
    label: "Other",
    required: ["other"],
    recommended: ["bank_statement"],
    guidance: "Provide any official documentation supporting the declared origin of funds.",
  },
};

interface Props {
  incomeSources: IncomeSource[];
  wealthSources: IncomeSource[];
  documents: SofDoc[];
  currency: string;
  canEdit: boolean;
  onUpload: (documentType: string) => void;
}

type SourceRow = IncomeSource & { kind: "income" | "wealth"; key: string };

export function SofEvidenceChecklist({
  incomeSources,
  wealthSources,
  documents,
  currency,
  canEdit,
  onUpload,
}: Props) {
  const rows: SourceRow[] = useMemo(() => {
    const all: SourceRow[] = [];
    (incomeSources || []).forEach((s, i) =>
      all.push({ ...s, kind: "income", key: `income-${i}` }),
    );
    (wealthSources || []).forEach((s, i) =>
      all.push({ ...s, kind: "wealth", key: `wealth-${i}` }),
    );
    return all;
  }, [incomeSources, wealthSources]);

  const docCounts = useMemo(() => {
    const map: Record<string, { verified: number; pending: number; rejected: number }> = {};
    documents.forEach((d) => {
      map[d.document_type] ||= { verified: 0, pending: 0, rejected: 0 };
      if (d.verification_status === "verified") map[d.document_type].verified++;
      else if (d.verification_status === "rejected") map[d.document_type].rejected++;
      else map[d.document_type].pending++;
    });
    return map;
  }, [documents]);

  const stats = useMemo(() => {
    let totalRequired = 0;
    let satisfied = 0;
    rows.forEach((r) => {
      const cfg = EVIDENCE_MAP[r.type] || EVIDENCE_MAP.other;
      cfg.required.forEach((rt) => {
        totalRequired++;
        if ((docCounts[rt]?.verified ?? 0) > 0) satisfied++;
      });
    });
    return { totalRequired, satisfied, pct: totalRequired === 0 ? 0 : Math.round((satisfied / totalRequired) * 100) };
  }, [rows, docCounts]);

  if (rows.length === 0) {
    return (
      <Card className="p-4 text-sm text-muted-foreground border-dashed">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4" />
          Add at least one income or wealth source to generate the evidence checklist.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-accent" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Evidence Checklist
          </span>
          <Badge variant="outline" className="text-[10px]">
            {stats.satisfied}/{stats.totalRequired} required satisfied
          </Badge>
        </div>
        <div className="flex items-center gap-2 min-w-[160px]">
          <Progress value={stats.pct} className="h-2 w-32" />
          <span className="text-xs text-muted-foreground font-mono">{stats.pct}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row, idx) => {
          const cfg = EVIDENCE_MAP[row.type] || EVIDENCE_MAP.other;
          const requiredSatisfied = cfg.required.every((rt) => (docCounts[rt]?.verified ?? 0) > 0);
          return (
            <Card key={row.key} className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="mt-0.5">
                    {requiredSatisfied ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Step {idx + 1}
                      </span>
                      <span className="font-semibold">{cfg.label}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {row.kind}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        {currency} {Number(row.amount || 0).toLocaleString()}
                      </span>
                    </div>
                    {row.description && (
                      <p className="text-sm text-foreground/80 mt-1">{row.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{cfg.guidance}</p>
                  </div>
                </div>
              </div>

              {/* Required docs */}
              <div className="mt-3 ml-8 space-y-1.5">
                {cfg.required.map((rt) => {
                  const counts = docCounts[rt] || { verified: 0, pending: 0, rejected: 0 };
                  const ok = counts.verified > 0;
                  return (
                    <DocRow
                      key={`req-${row.key}-${rt}`}
                      docType={rt}
                      counts={counts}
                      required
                      ok={ok}
                      canEdit={canEdit}
                      onUpload={() => onUpload(rt)}
                    />
                  );
                })}
                {cfg.recommended.length > 0 && (
                  <div className="pt-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Recommended (strengthens file)
                    </div>
                    {cfg.recommended.map((rt) => {
                      const counts = docCounts[rt] || { verified: 0, pending: 0, rejected: 0 };
                      const ok = counts.verified > 0;
                      return (
                        <DocRow
                          key={`rec-${row.key}-${rt}`}
                          docType={rt}
                          counts={counts}
                          required={false}
                          ok={ok}
                          canEdit={canEdit}
                          onUpload={() => onUpload(rt)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DocRow({
  docType,
  counts,
  required,
  ok,
  canEdit,
  onUpload,
}: {
  docType: string;
  counts: { verified: number; pending: number; rejected: number };
  required: boolean;
  ok: boolean;
  canEdit: boolean;
  onUpload: () => void;
}) {
  const label = docType.replace(/_/g, " ");
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <Checkbox checked={ok} disabled className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
        <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="capitalize truncate">{label}</span>
        {required && <Badge variant="outline" className="text-[9px] h-4 px-1 border-amber-500/40 text-amber-700 dark:text-amber-400">required</Badge>}
        <div className="flex items-center gap-1 ml-1">
          {counts.verified > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />{counts.verified}
            </span>
          )}
          {counts.pending > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600">
              <Clock className="w-3 h-3" />{counts.pending}
            </span>
          )}
          {counts.rejected > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-red-600">
              <XCircle className="w-3 h-3" />{counts.rejected}
            </span>
          )}
        </div>
      </div>
      {canEdit && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs"
          onClick={onUpload}
        >
          <Upload className="w-3 h-3 mr-1" />
          Upload
        </Button>
      )}
    </div>
  );
}

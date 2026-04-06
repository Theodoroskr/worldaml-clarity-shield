import { useState } from "react";
import { CheckCircle2, Circle, Clock, User, Building2, ChevronRight, FileCheck, Shield, Camera, Fingerprint, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const LIFECYCLE_STAGES = ["Lead Captured", "KYC Initiated", "Document Submitted", "Identity Verified", "Risk Rated", "Compliance Approved", "Active Client"] as const;
type LifecycleStage = typeof LIFECYCLE_STAGES[number];

interface OnboardingClient {
  id: string; name: string; type: "Individual" | "Corporate"; nationality: string;
  stage: LifecycleStage; risk: string; channel: string; created: string; assignee: string;
}

const clients: OnboardingClient[] = [
  { id: "ONB-2026-0089", name: "Nikos Georgiou", type: "Individual", nationality: "CY", stage: "KYC Initiated", risk: "Medium", channel: "Web Portal", created: "08/03/2026", assignee: "T. Kringou" },
  { id: "ONB-2026-0087", name: "Investco Holdings Ltd.", type: "Corporate", nationality: "BVI", stage: "Document Submitted", risk: "High", channel: "Relationship Manager", created: "07/03/2026", assignee: "M. Nicolaou" },
  { id: "ONB-2026-0083", name: "Sophie Lambert", type: "Individual", nationality: "FR", stage: "Identity Verified", risk: "Low", channel: "Mobile App", created: "06/03/2026", assignee: "T. Kringou" },
  { id: "ONB-2026-0078", name: "Zeynep Arslan", type: "Individual", nationality: "TR", stage: "Risk Rated", risk: "Medium", channel: "Web Portal", created: "05/03/2026", assignee: "A. Charalambous" },
  { id: "ONB-2026-0071", name: "Atlas Capital Partners LLP", type: "Corporate", nationality: "UK", stage: "Compliance Approved", risk: "Low", channel: "Relationship Manager", created: "03/03/2026", assignee: "M. Nicolaou" },
  { id: "ONB-2026-0065", name: "Rania Khalil", type: "Individual", nationality: "LB", stage: "Active Client", risk: "High", channel: "Branch", created: "01/03/2026", assignee: "T. Kringou" },
  { id: "ONB-2026-0060", name: "Stavros Antoniadis", type: "Individual", nationality: "GR", stage: "Lead Captured", risk: "—", channel: "Web Portal", created: "09/03/2026", assignee: "Unassigned" },
];

const stageColor = (s: LifecycleStage): string => {
  const m: Record<LifecycleStage, string> = {
    "Lead Captured": "bg-slate-100 text-slate-600 border-slate-200",
    "KYC Initiated": "bg-blue-50 text-blue-700 border-blue-200",
    "Document Submitted": "bg-sky-50 text-sky-700 border-sky-200",
    "Identity Verified": "bg-violet-50 text-violet-700 border-violet-200",
    "Risk Rated": "bg-amber-50 text-amber-700 border-amber-200",
    "Compliance Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Active Client": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return m[s];
};

const riskBadge = (r: string) => {
  const m: Record<string, string> = { Low: "bg-emerald-50 text-emerald-700 border-emerald-200", Medium: "bg-amber-50 text-amber-700 border-amber-200", High: "bg-red-50 text-red-700 border-red-200", "—": "bg-muted text-muted-foreground border-border" };
  return m[r] ?? "bg-muted text-muted-foreground border-border";
};

const stageIdx = (s: LifecycleStage) => LIFECYCLE_STAGES.indexOf(s);

const kycSteps = [
  { icon: User, title: "Personal Information", desc: "Name, DOB, nationality, contact details", status: "complete" },
  { icon: Camera, title: "Identity Document Upload", desc: "Passport or national ID scan", status: "complete" },
  { icon: Fingerprint, title: "Liveness / Biometric Check", desc: "Selfie match & liveness verification", status: "complete" },
  { icon: FileCheck, title: "Address Verification", desc: "Utility bill or bank statement < 3 months", status: "pending" },
  { icon: Globe, title: "Sanctions & PEP Screening", desc: "Automated screen against global watchlists", status: "processing" },
  { icon: Shield, title: "Risk Classification", desc: "Risk score calculation and tier assignment", status: "locked" },
];

export default function SuiteOnboarding() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selected, setSelected] = useState<OnboardingClient | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const stages = ["All", ...LIFECYCLE_STAGES];
  const filtered = filter === "All" ? clients : clients.filter(c => c.stage === filter);

  if (view === "detail" && selected) {
    const si = stageIdx(selected.stage);
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-card flex items-center gap-4">
          <button onClick={() => setView("list")} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-foreground">{selected.name}</h1>
              <span className={cn("text-xs px-2 py-0.5 rounded-full border font-semibold", riskBadge(selected.risk))}>{selected.risk} Risk</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">{selected.id}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{selected.channel} · {selected.nationality} · {selected.assignee} · Started {selected.created}</p>
          </div>
          <button className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium">Advance →</button>
        </div>

        <div className="px-6 py-3 bg-muted/20 border-b border-border overflow-x-auto">
          <div className="flex items-center gap-0 min-w-max">
            {LIFECYCLE_STAGES.map((s, i) => {
              const done = i < si; const active = i === si;
              return (
                <div key={s} className="flex items-center">
                  <div className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium",
                    done && "text-emerald-700 bg-emerald-50",
                    active && "text-primary-foreground bg-primary",
                    !done && !active && "text-muted-foreground"
                  )}>
                    {done ? <CheckCircle2 className="w-3 h-3" /> : active ? <Clock className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    <span>{s}</span>
                  </div>
                  {i < LIFECYCLE_STAGES.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 mx-0.5" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl grid grid-cols-2 gap-5">
            <div className="col-span-2 bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">KYC Journey</h3></div>
              <div className="grid grid-cols-3 gap-0 divide-x divide-border">
                {kycSteps.map((step, i) => (
                  <div key={i} className={cn("p-4 flex flex-col gap-2", i >= 3 && "border-t border-border")}>
                    <div className="flex items-center justify-between">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center",
                        step.status === "complete" ? "bg-emerald-100 text-emerald-600" :
                        step.status === "processing" ? "bg-blue-100 text-blue-600" :
                        step.status === "pending" ? "bg-amber-100 text-amber-600" : "bg-muted text-muted-foreground"
                      )}><step.icon className="w-3.5 h-3.5" /></div>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                        step.status === "complete" ? "bg-emerald-50 text-emerald-700" :
                        step.status === "processing" ? "bg-blue-50 text-blue-700" :
                        step.status === "pending" ? "bg-amber-50 text-amber-700" : "text-muted-foreground"
                      )}>{step.status === "locked" ? "Locked" : step.status.charAt(0).toUpperCase() + step.status.slice(1)}</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{step.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Client Data</h3>
              <div className="space-y-2">
                {[["Full Name", selected.name], ["Nationality", selected.nationality], ["Client Type", selected.type], ["Channel", selected.channel], ["Assigned To", selected.assignee], ["Date Started", selected.created]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Screening Results</h3>
              <div className="space-y-2">
                {[{ list: "Sanctions (OFAC)", result: "No Match", ok: true }, { list: "Sanctions (EU)", result: "No Match", ok: true }, { list: "PEP Database", result: "No Match", ok: true }, { list: "Adverse Media", result: "1 Article Found", ok: false }, { list: "Internal Watchlist", result: "No Match", ok: true }].map(r => (
                  <div key={r.list} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{r.list}</span>
                    <span className={cn("font-semibold", r.ok ? "text-emerald-600" : "text-amber-600")}>{r.result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Client Onboarding Lifecycle</h1>
          <p className="text-xs text-muted-foreground mt-0.5">End-to-end KYC onboarding pipeline · {clients.length} active applications</p>
        </div>
        <button className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium">+ Start Onboarding</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: "New This Week", value: "12", sub: "3 high-risk", color: "text-foreground" },
          { label: "Awaiting Documents", value: "5", sub: "Reminder sent", color: "text-amber-600" },
          { label: "Pending Approval", value: "4", sub: "In sign-off queue", color: "text-blue-600" },
          { label: "Avg. Completion", value: "4.8d", sub: "Last 30 days", color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-xs font-medium text-foreground mt-0.5">{s.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap mb-4">
        {stages.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("text-[10px] px-2.5 py-1 rounded-full font-medium border transition-colors",
              filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/50"
            )}>{s}{s !== "All" && <span className="ml-1 opacity-60">{clients.filter(c => c.stage === s).length}</span>}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Client", "Type", "Nationality", "Risk", "Stage", "Assigned", "Started", ""].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-muted/20 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {c.type === "Individual" ? <User className="w-3 h-3 text-primary" /> : <Building2 className="w-3 h-3 text-primary" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{c.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{c.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.type}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{c.nationality}</td>
                <td className="px-4 py-3"><span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold", riskBadge(c.risk))}>{c.risk}</span></td>
                <td className="px-4 py-3"><span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold", stageColor(c.stage))}>{c.stage}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.assignee}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{c.created}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setSelected(c); setView("detail"); }}
                    className="opacity-0 group-hover:opacity-100 text-xs text-primary hover:underline transition-opacity">Open →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

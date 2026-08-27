import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BUSINESS_SOLUTIONS } from "@/lib/businessCatalogue";
import { SolutionCard, TalkToExpert } from "@/components/business/SolutionCard";
import { useBusinessWorkspace } from "@/hooks/useBusinessWorkspace";

const LANES = ["All", "WorldAML Platform", "Data Source", "Training"] as const;

export default function BusinessSolutions() {
  const { ownedKeys, track } = useBusinessWorkspace();
  const [lane, setLane] = useState<string>("All");
  const [q, setQ] = useState("");

  useEffect(() => { track("solutions_viewed"); }, [track]);

  const list = BUSINESS_SOLUTIONS.filter((s) =>
    (lane === "All" || s.lane === lane) &&
    (q.trim() === "" || `${s.name} ${s.tagline} ${s.capabilities.join(" ")}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Explore Solutions</h1>
        <p className="text-muted-foreground">Compare WorldAML solutions and activate what your compliance programme needs.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={lane} onValueChange={setLane}>
          <TabsList>
            {LANES.map((l) => <TabsTrigger key={l} value={l}>{l}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search solutions and capabilities…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((s) => (
          <SolutionCard
            key={s.key}
            solution={s}
            status={ownedKeys.includes(s.key) ? "Active" : s.plans.some((p) => p.checkout || p.configureUrl) ? "Available" : "Contact Sales"}
            onView={() => track("product_viewed", s.key)}
          />
        ))}
      </div>

      {list.length === 0 && <p className="text-sm text-muted-foreground">No solutions match that search.</p>}

      <TalkToExpert />
    </div>
  );
}

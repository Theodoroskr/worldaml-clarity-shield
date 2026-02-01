import { User, AlertTriangle, Shield, Newspaper, Calendar, Globe, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const entityData = {
  name: "John Michael Smith",
  dob: "15 March 1978",
  nationality: "United Kingdom",
  screeningId: "SCR-2024-00847",
  riskLevel: "High",
  matchConfidence: 94,
  screening: {
    sanctions: { status: "No match", count: 0 },
    pep: { status: "Match", detail: "Tier 2 - Family Member of PEP" },
    adverseMedia: { status: "Found", count: 3, sources: ["Financial Times", "Reuters"] },
  },
};

const ConfidenceIndicator = ({ value }: { value: number }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-surface-subtle rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-body font-semibold text-accent">{value}%</span>
    </div>
  );
};

export const EntityProfileCard = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="mb-8">
          <h2 className="text-headline mb-2">Individual Screening Result</h2>
          <p className="text-body text-text-secondary">
            Comprehensive profile view with screening breakdown and match confidence.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <Card className="lg:col-span-2 border border-divider shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-surface-subtle">
                    <User className="h-6 w-6 text-text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-title">{entityData.name}</CardTitle>
                    <p className="text-body-sm text-text-secondary">Individual Entity</p>
                  </div>
                </div>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                  {entityData.riskLevel} Risk
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Entity Details */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 bg-surface-subtle rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-caption text-text-tertiary">Date of Birth</p>
                    <p className="text-body-sm font-medium">{entityData.dob}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-caption text-text-tertiary">Nationality</p>
                    <p className="text-body-sm font-medium">{entityData.nationality}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-caption text-text-tertiary">Screening ID</p>
                    <p className="text-body-sm font-medium font-mono">{entityData.screeningId}</p>
                  </div>
                </div>
              </div>

              {/* Match Confidence */}
              <div>
                <p className="text-body-sm font-medium mb-3">Match Confidence</p>
                <ConfidenceIndicator value={entityData.matchConfidence} />
              </div>

              {/* Screening Breakdown */}
              <div className="space-y-3">
                <p className="text-body-sm font-medium">Screening Results</p>
                
                {/* Sanctions */}
                <div className="flex items-center justify-between p-3 bg-surface-subtle rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-text-secondary" />
                    <span className="text-body-sm">Sanctions</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                    {entityData.screening.sanctions.status}
                  </Badge>
                </div>

                {/* PEP */}
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <div>
                      <span className="text-body-sm">Politically Exposed Person (PEP)</span>
                      <p className="text-caption text-text-secondary">{entityData.screening.pep.detail}</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                    {entityData.screening.pep.status}
                  </Badge>
                </div>

                {/* Adverse Media */}
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Newspaper className="h-5 w-5 text-amber-600" />
                    <div>
                      <span className="text-body-sm">Adverse Media</span>
                      <p className="text-caption text-text-secondary">
                        {entityData.screening.adverseMedia.count} articles from {entityData.screening.adverseMedia.sources.join(", ")}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                    {entityData.screening.adverseMedia.count} Found
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Source Transparency Panel */}
          <Card className="border border-divider shadow-none h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-title">Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-body-sm text-text-secondary">
                This screening was performed against the following authoritative databases:
              </p>
              <ul className="space-y-2 text-body-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  UN Consolidated Sanctions List
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  OFAC SDN List
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  EU Sanctions List
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  HM Treasury Sanctions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Global PEP Database
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Adverse Media Index (50+ sources)
                </li>
              </ul>
              <p className="text-caption text-text-tertiary pt-2 border-t border-divider">
                Last updated: 2 hours ago
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default EntityProfileCard;

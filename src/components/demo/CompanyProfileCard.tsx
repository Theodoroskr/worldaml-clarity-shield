import { Building2, Users, MapPin, FileText, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const companyData = {
  name: "Global Trading Partners Ltd",
  jurisdiction: "United Kingdom",
  companyNumber: "12345678",
  riskLevel: "Medium",
  lastScreened: "2 hours ago",
  ubos: {
    total: 3,
    screened: 2,
  },
  directors: [
    { name: "Sarah Johnson", role: "Director", status: "Clear", screened: true },
    { name: "Michael Chen", role: "Director", status: "Clear", screened: true },
    { name: "James Wilson", role: "Director", status: "Review Required", screened: true },
    { name: "Emma Thompson", role: "Secretary", status: "Clear", screened: true },
  ],
};

export const CompanyProfileCard = () => {
  return (
    <section className="section-padding">
      <div className="container-enterprise">
        <div className="mb-8">
          <h2 className="text-headline mb-2">Company Screening Result</h2>
          <p className="text-body text-text-secondary">
            Corporate profile with UBO and director screening, plus source transparency.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Company Card */}
          <Card className="lg:col-span-2 border border-divider shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-surface-subtle">
                    <Building2 className="h-6 w-6 text-text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-title">{companyData.name}</CardTitle>
                    <p className="text-body-sm text-text-secondary">Corporate Entity</p>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                  {companyData.riskLevel} Risk
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Details */}
              <div className="grid sm:grid-cols-3 gap-4 p-4 bg-surface-subtle rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-caption text-text-tertiary">Jurisdiction</p>
                    <p className="text-body-sm font-medium">{companyData.jurisdiction}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-caption text-text-tertiary">Company Number</p>
                    <p className="text-body-sm font-medium font-mono">{companyData.companyNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-caption text-text-tertiary">Last Screened</p>
                    <p className="text-body-sm font-medium">{companyData.lastScreened}</p>
                  </div>
                </div>
              </div>

              {/* UBO Status */}
              <div className="p-4 border border-divider rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-text-secondary" />
                    <span className="text-body-sm font-medium">Ultimate Beneficial Owners (UBOs)</span>
                  </div>
                  <Badge variant="secondary">
                    {companyData.ubos.screened}/{companyData.ubos.total} Screened
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-surface-subtle rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(companyData.ubos.screened / companyData.ubos.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-caption text-text-secondary">
                    {Math.round((companyData.ubos.screened / companyData.ubos.total) * 100)}%
                  </span>
                </div>
              </div>

              {/* Directors Table */}
              <div>
                <p className="text-body-sm font-medium mb-3">Directors & Officers</p>
                <Table>
                  <TableHeader>
                    <TableRow className="border-divider hover:bg-transparent">
                      <TableHead className="text-text-secondary font-medium">Name</TableHead>
                      <TableHead className="text-text-secondary font-medium">Role</TableHead>
                      <TableHead className="text-text-secondary font-medium">Status</TableHead>
                      <TableHead className="text-text-secondary font-medium text-right">Screened</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyData.directors.map((director, index) => (
                      <TableRow key={index} className="border-divider">
                        <TableCell className="font-medium">{director.name}</TableCell>
                        <TableCell className="text-text-secondary">{director.role}</TableCell>
                        <TableCell>
                          {director.status === "Clear" ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                              {director.status}
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                              {director.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {director.screened ? (
                            <CheckCircle className="h-4 w-4 text-emerald-600 ml-auto" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-600 ml-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Source Transparency Panel */}
          <Card className="border border-divider shadow-none h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-title">Corporate Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-body-sm text-text-secondary">
                Corporate records verified against:
              </p>
              <ul className="space-y-2 text-body-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Companies House (UK)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Global Corporate Registry
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  OpenCorporates Database
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Dun & Bradstreet Records
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  GLEIF LEI Registry
                </li>
              </ul>
              <div className="pt-4 border-t border-divider space-y-2">
                <p className="text-caption text-text-tertiary">Registry Data Freshness</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-body-sm">Verified within 24 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CompanyProfileCard;

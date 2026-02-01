import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    label: "Total Screenings Today",
    value: "1,247",
    icon: Activity,
    change: "+12%",
  },
  {
    label: "Pending Review",
    value: "23",
    icon: Clock,
    change: null,
  },
  {
    label: "Alerts (High Confidence)",
    value: "8",
    icon: AlertTriangle,
    change: null,
  },
  {
    label: "Clear",
    value: "1,216",
    icon: CheckCircle,
    change: null,
  },
];

const recentActivity = [
  {
    entity: "John Smith",
    type: "Individual",
    status: "Review Required",
    confidence: "94%",
    timestamp: "2 min ago",
  },
  {
    entity: "Acme Holdings Ltd",
    type: "Company",
    status: "Clear",
    confidence: "—",
    timestamp: "5 min ago",
  },
  {
    entity: "Maria González",
    type: "Individual",
    status: "Match Confirmed",
    confidence: "98%",
    timestamp: "12 min ago",
  },
  {
    entity: "Nexus Finance GmbH",
    type: "Company",
    status: "Review Required",
    confidence: "87%",
    timestamp: "18 min ago",
  },
  {
    entity: "Ahmed Al-Rashid",
    type: "Individual",
    status: "Clear",
    confidence: "—",
    timestamp: "24 min ago",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Review Required":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">{status}</Badge>;
    case "Match Confirmed":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">{status}</Badge>;
    case "Clear":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const DashboardOverview = () => {
  return (
    <section className="section-padding">
      <div className="container-enterprise">
        <div className="mb-8">
          <h2 className="text-headline mb-2">Screening Overview</h2>
          <p className="text-body text-text-secondary">
            Real-time monitoring of screening activity across your organization.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border border-divider shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-sm text-text-secondary mb-1">{stat.label}</p>
                    <p className="text-headline font-semibold">{stat.value}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-subtle">
                    <stat.icon className="h-5 w-5 text-text-secondary" />
                  </div>
                </div>
                {stat.change && (
                  <p className="text-caption text-accent mt-2">{stat.change} from yesterday</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Table */}
        <Card className="border border-divider shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-title">Recent Screening Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="border-divider hover:bg-transparent">
                  <TableHead className="text-text-secondary font-medium">Entity</TableHead>
                  <TableHead className="text-text-secondary font-medium">Type</TableHead>
                  <TableHead className="text-text-secondary font-medium">Status</TableHead>
                  <TableHead className="text-text-secondary font-medium">Confidence</TableHead>
                  <TableHead className="text-text-secondary font-medium text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((item, index) => (
                  <TableRow key={index} className="border-divider">
                    <TableCell className="font-medium">{item.entity}</TableCell>
                    <TableCell className="text-text-secondary">{item.type}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {item.confidence !== "—" ? (
                        <span className="text-accent font-medium">{item.confidence}</span>
                      ) : (
                        <span className="text-text-tertiary">{item.confidence}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-text-secondary">{item.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DashboardOverview;

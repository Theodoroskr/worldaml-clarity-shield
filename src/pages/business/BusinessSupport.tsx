import { Link } from "react-router-dom";
import { LifeBuoy, Mail, MessageSquareQuote, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBusinessWorkspace } from "@/hooks/useBusinessWorkspace";
import { riskAlertHelp } from "@/lib/riskAlertHelp";

export default function BusinessSupport() {
  const { account } = useBusinessWorkspace();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Get help with your WorldAML products, billing or account.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><MessageSquareQuote className="w-4 h-4 text-teal" /> Talk to your account team</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Product advice, plan changes, enterprise deployments and consultations for {account?.company_name}.
            </p>
            <Button asChild variant="accent"><Link to="/business/quotes">Request a consultation</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4 text-teal" /> Email support</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Technical and account queries, answered by the WorldAML team.</p>
            <Button asChild variant="outline"><a href="mailto:info@worldaml.com">info@worldaml.com</a></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-teal" /> API documentation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Integration guides and endpoint reference for the WorldAML API.</p>
            <Button asChild variant="outline"><Link to="/platform/api">Open documentation</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><LifeBuoy className="w-4 h-4 text-teal" /> Billing questions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Invoices, payment methods and renewals are managed in Plans & Billing.</p>
            <Button asChild variant="outline"><Link to="/business/billing">Go to billing</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-teal" /> Screening risk alerts guide</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{riskAlertHelp.summary}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              {riskAlertHelp.articles.map((a) => (
                <li key={a.title}><span className="font-medium text-foreground">{a.title}.</span> {a.body}</li>
              ))}
            </ul>
            <Button asChild variant="outline"><Link to="/screening/risk-alerts">Manage risk alert rules</Link></Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

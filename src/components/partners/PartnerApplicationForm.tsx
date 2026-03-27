import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PartnerApplicationForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    website: "",
    partner_type: "referral" as "referral" | "affiliate" | "reseller",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.company_name.trim()) { toast.error("Company name is required"); return; }

    setLoading(true);
    const { error } = await supabase.from("partner_applications").insert({
      user_id: user.id,
      company_name: form.company_name.trim(),
      website: form.website.trim() || null,
      partner_type: form.partner_type,
      description: form.description.trim() || null,
    } as any);

    if (error) {
      toast.error("Failed to submit application. Please try again.");
      console.error(error);
    } else {
      setSubmitted(true);
      toast.success("Application submitted!");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto border-divider">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle className="h-12 w-12 text-teal mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-navy mb-2">Application Submitted</h3>
          <p className="text-text-secondary">We'll review your application and get back to you within 48 hours.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto border-divider">
      <CardHeader>
        <CardTitle className="text-navy">Partner Application</CardTitle>
        <CardDescription>Tell us about your business and how you'd like to partner.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="company_name">Company Name *</Label>
            <Input id="company_name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required maxLength={200} />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" placeholder="https://" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} maxLength={500} />
          </div>
          <div>
            <Label htmlFor="partner_type">Partner Type *</Label>
            <Select value={form.partner_type} onValueChange={(v) => setForm({ ...form, partner_type: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="referral">Referral Partner</SelectItem>
                <SelectItem value="affiliate">Affiliate Partner</SelectItem>
                <SelectItem value="reseller">Reseller Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">How do you plan to refer clients?</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} maxLength={2000} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PartnerApplicationForm;

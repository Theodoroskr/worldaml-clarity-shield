import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, CheckCircle2, LifeBuoy, Loader2, Mail, Search } from "lucide-react";
import ScreeningLayout from "@/components/screening/ScreeningLayout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  HELP_CATEGORY_ORDER, SUPPORT_CATEGORIES, searchHelpArticles, type HelpCategory,
} from "@/lib/screening/helpContent";

/**
 * Full-page Help & support for the Screening & Monitoring workspace:
 * searchable static articles plus a support ticket form.
 */
export default function ScreeningHelp() {
  const { pathname, search } = useLocation();
  const { toast } = useToast();
  const [query, setQuery] = useState("");

  const [category, setCategory] = useState<string>(SUPPORT_CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const results = searchHelpArticles(query);
    return HELP_CATEGORY_ORDER.map((cat) => ({
      category: cat as HelpCategory,
      items: results.filter((a) => a.category === cat),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const resultCount = grouped.reduce((n, g) => n + g.items.length, 0);

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        toast({
          title: "Sign in required",
          description: "Please sign in to send a support request.",
          variant: "destructive",
        });
        return;
      }
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: userId,
          product: "screening",
          category,
          subject: subject.trim(),
          message: message.trim(),
          page_path: `${pathname}${search}`,
        })
        .select("reference")
        .single();
      if (error) throw error;
      setReference(data?.reference ?? null);
      setSubject("");
      setMessage("");
    } catch (err) {
      toast({
        title: "Could not send your request",
        description: err instanceof Error ? err.message : "Please try again or email info@worldaml.com.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreeningLayout
      head={<SEO title="Help & support | Screening & Monitoring" description="Guidance for screening, match review, monitoring and billing, plus direct support from the WorldAML team." />}
    >
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-teal" aria-hidden="true" />
            Help &amp; support
          </h1>
          <p className="text-muted-foreground">
            Guidance for screening, match review, monitoring and billing.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
          {/* Articles */}
          <div className="space-y-5 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles…"
                className="pl-9"
                aria-label="Search help articles"
              />
            </div>

            {query && (
              <p className="text-xs text-muted-foreground">
                {resultCount} {resultCount === 1 ? "article" : "articles"} matching “{query}”
              </p>
            )}

            {grouped.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-3">
                <p>No article matches that search.</p>
                <Button size="sm" variant="accent" asChild>
                  <a href="#contact-support">Ask our support team</a>
                </Button>
              </div>
            ) : (
              grouped.map((group) => (
                <section key={group.category} className="space-y-2">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.category}
                  </h2>
                  <Accordion type="multiple" className="border border-border rounded-lg divide-y divide-border bg-card">
                    {group.items.map((article) => (
                      <AccordionItem key={article.id} value={article.id} className="border-0 px-4">
                        <AccordionTrigger className="text-sm text-left hover:no-underline py-3.5">
                          {article.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-3">
                          <p>{article.body}</p>
                          {article.link && (
                            <Button asChild size="sm" variant="outline">
                              <Link to={article.link.to}>{article.link.label}</Link>
                            </Button>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))
            )}

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-teal" aria-hidden="true" /> More resources
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/screening-monitoring/pricing">Packages</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/platform/api" target="_blank" rel="noopener noreferrer">API documentation</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href="mailto:info@worldaml.com">
                    <Mail className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" /> info@worldaml.com
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Contact support */}
          <Card id="contact-support" className="lg:sticky lg:top-6 scroll-mt-6">
            <CardHeader>
              <CardTitle className="text-base">Contact support</CardTitle>
              <CardDescription>
                Send a request to the WorldAML team — we reply by email, usually within one business day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reference ? (
                <div className="rounded-lg border border-teal/40 bg-teal/5 p-4 space-y-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-teal" aria-hidden="true" />
                    Request sent
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your reference is <span className="font-mono font-medium text-foreground">{reference}</span>.
                    Our team replies by email, usually within one business day.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setReference(null)}>
                    Send another request
                  </Button>
                </div>
              ) : (
                <form onSubmit={submitTicket} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="help-category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="help-category"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {SUPPORT_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="help-subject">Subject</Label>
                    <Input
                      id="help-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Short summary of your question"
                      maxLength={140}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="help-message">Message</Label>
                    <Textarea
                      id="help-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you were doing and what you expected to happen."
                      rows={6}
                      maxLength={4000}
                      required
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    We include the page you are on ({pathname}) so we can reproduce the issue faster.
                  </p>

                  <Button type="submit" variant="accent" disabled={submitting} className="w-full">
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</>
                    ) : (
                      "Send request"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ScreeningLayout>
  );
}

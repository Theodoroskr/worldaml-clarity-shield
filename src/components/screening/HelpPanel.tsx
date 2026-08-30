import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, CheckCircle2, LifeBuoy, Loader2, Mail, Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface HelpPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Slide-over help module for the Screening & Monitoring workspace:
 * searchable static articles plus a support ticket form.
 */
export default function HelpPanel({ open, onOpenChange }: HelpPanelProps) {
  const { pathname, search } = useLocation();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("articles");

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border text-left">
          <SheetTitle className="flex items-center gap-2 text-base">
            <LifeBuoy className="h-4 w-4 text-teal" aria-hidden="true" />
            Help & support
          </SheetTitle>
          <SheetDescription>
            Guidance for screening, match review, monitoring and billing.
          </SheetDescription>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-5 pt-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="contact">Contact support</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="articles" className="flex-1 min-h-0 overflow-y-auto px-5 py-4 mt-0 space-y-4">
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
                <Button size="sm" variant="accent" onClick={() => setTab("contact")}>
                  Ask our support team
                </Button>
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.category} className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.category}
                  </p>
                  <Accordion type="multiple" className="border border-border rounded-lg divide-y divide-border">
                    {group.items.map((article) => (
                      <AccordionItem key={article.id} value={article.id} className="border-0 px-3">
                        <AccordionTrigger className="text-sm text-left hover:no-underline py-3">
                          {article.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-3">
                          <p>{article.body}</p>
                          {article.link && (
                            <Button asChild size="sm" variant="outline">
                              <Link to={article.link.to} onClick={() => onOpenChange(false)}>
                                {article.link.label}
                              </Link>
                            </Button>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))
            )}

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-teal" aria-hidden="true" /> More resources
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/screening-monitoring/pricing" onClick={() => onOpenChange(false)}>Packages</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/platform/api" onClick={() => onOpenChange(false)}>API documentation</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href="mailto:info@worldaml.com">
                    <Mail className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" /> info@worldaml.com
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="flex-1 min-h-0 overflow-y-auto px-5 py-4 mt-0">
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
                    rows={7}
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
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

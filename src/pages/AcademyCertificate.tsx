import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Award, Download, Linkedin, Twitter, Share2, ArrowLeft, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const AcademyCertificate = () => {
  const { token } = useParams();
  const { toast } = useToast();

  const { data: cert, isLoading } = useQuery({
    queryKey: ["academy-certificate", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_certificates")
        .select("*, academy_courses(*)")
        .eq("share_token", token)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const course = cert?.academy_courses as any;

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareTwitter = () => {
    const text = `I just earned my "${course?.title}" certificate from WorldAML Academy! 🎓`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied!", description: "Certificate link copied to clipboard." });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading certificate...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-headline text-foreground mb-4">Certificate Not Found</h1>
            <Button asChild><Link to="/academy">Browse Academy</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${cert.holder_name} — ${course?.title} Certificate | WorldAML Academy`}
        description={`${cert.holder_name} earned the ${course?.title} certificate from WorldAML Academy with a score of ${cert.score}%.`}
        canonical={`/academy/certificate/${token}`}
        
      />
      <Header />
      <main className="flex-1">
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <Link to="/academy" className="text-muted-foreground text-body-sm hover:text-foreground inline-flex items-center gap-1 mb-8">
              <ArrowLeft className="h-4 w-4" /> Back to Academy
            </Link>

            {/* Certificate Card */}
            <div className="max-w-3xl mx-auto">
              <div className="relative rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-white via-secondary/20 to-white p-8 md:p-12 text-center shadow-lg">
                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />

                <div className="mb-6">
                  <Award className="h-16 w-16 text-accent mx-auto mb-4" />
                  <p className="text-caption uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                    Certificate of Completion
                  </p>
                  <h1 className="text-headline text-foreground">{course?.title}</h1>
                </div>

                <p className="text-body text-muted-foreground mb-1">This certifies that</p>
                <h2 className="text-display text-primary mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  {cert.holder_name}
                </h2>

                <p className="text-body text-muted-foreground mb-6">
                  has successfully completed the <strong>{course?.title}</strong> course 
                  at WorldAML Academy with a score of <strong>{cert.score}%</strong>.
                </p>

                <div className="flex items-center justify-center gap-6 text-body-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Verified
                  </span>
                  <span>Issued: {format(new Date(cert.issued_at), "dd MMMM yyyy")}</span>
                  <span>ID: {cert.share_token.toUpperCase()}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-caption text-muted-foreground">
                    WorldAML Academy — www.worldaml.com/academy
                  </p>
                </div>
              </div>

              {/* Share Actions */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button variant="default" onClick={shareLinkedIn}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  Share on LinkedIn
                </Button>
                <Button variant="outline" onClick={shareTwitter}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Share on X
                </Button>
                <Button variant="outline" onClick={copyLink}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>

              <p className="text-center text-caption text-muted-foreground mt-4">
                This certificate can be verified at this URL by anyone.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyCertificate;

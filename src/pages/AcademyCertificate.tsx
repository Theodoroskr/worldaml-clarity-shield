import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Award, Linkedin, Share2, ArrowLeft, CheckCircle, BookOpen, ExternalLink, Copy, Download, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const PUBLISHED_ORIGIN = "https://worldaml-clarity-shield.lovable.app";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const AcademyCertificate = () => {
  const { token } = useParams();
  const { toast } = useToast();

  const { data: cert, isLoading } = useQuery({
    queryKey: ["academy-certificate", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_certificate_by_token", { _token: token! });
      if (error) throw error;
      return data as any;
    },
  });

  const course = cert?.academy_courses as any;
  const certificateUrl = `${PUBLISHED_ORIGIN}/academy/certificate/${token}`;
  const shareUrl = `${SUPABASE_URL}/functions/v1/certificate-og?token=${token}`;
  const shareText = course ? `I just earned my "${course.title}" certificate from WorldAML Academy! 🎓` : "";

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareX = () => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Certificate link copied to clipboard." });
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast({ title: "Link copied!", description: "Certificate link copied to clipboard." });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl });
      } catch { /* user cancelled */ }
    }
  };

  const downloadBadge = () => {
    const title = course?.title || "Course";
    const score = cert?.score || 0;
    const cpd = course?.cpd_hours || 0;
    const cpdText = cpd > 0 ? ` • ${cpd} CPD` : "";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1a365d"/>
          <stop offset="100%" stop-color="#2563eb"/>
        </linearGradient>
      </defs>
      <rect width="480" height="120" rx="16" fill="url(#bg)"/>
      <text x="60" y="48" font-family="Arial,sans-serif" font-size="18" font-weight="bold" fill="white">${title.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</text>
      <text x="60" y="72" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,0.85)">WorldAML Academy • ${score}%${cpdText}</text>
      <text x="60" y="96" font-family="Arial,sans-serif" font-size="11" fill="rgba(255,255,255,0.6)">Verified Certificate</text>
      <circle cx="28" cy="60" r="16" fill="rgba(255,255,255,0.15)"/>
      <text x="28" y="65" font-family="Arial,sans-serif" font-size="16" fill="white" text-anchor="middle">🎓</text>
      <circle cx="452" cy="60" r="12" fill="rgba(255,255,255,0.15)"/>
      <text x="452" y="65" font-family="Arial,sans-serif" font-size="14" fill="#4ade80" text-anchor="middle">✓</text>
    </svg>`;

    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 960, 240);
      const link = document.createElement("a");
      link.download = `worldaml-badge-${course?.slug || "certificate"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
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

            <div className="max-w-3xl mx-auto">
              {/* Certificate Card */}
              <div className="relative rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-white via-secondary/20 to-white p-8 md:p-12 text-center shadow-lg">
                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-primary tracking-tight">WorldAML Academy</h3>
                  <p className="text-body-sm text-muted-foreground">Compliance Education &amp; Certification</p>
                  <div className="w-16 h-px bg-border mx-auto mt-4 mb-4" />
                  <p className="text-caption uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                    Certificate of Completion
                  </p>
                  <h1 className="text-headline text-foreground">{course?.title}</h1>
                </div>

                <p className="text-body text-muted-foreground mb-1">This certifies that</p>
                <h2 className="text-display text-primary mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  {cert.holder_name}
                </h2>

                <p className="text-body text-muted-foreground mb-2">
                  has successfully completed the <strong>{course?.title}</strong> course
                  at WorldAML Academy with a score of <strong>{cert.score}%</strong>.
                </p>

                {course?.cpd_hours > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-secondary/40 text-foreground rounded-full px-4 py-1.5 text-body-sm font-medium mb-6">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Accredited for {course.cpd_hours} CPD Hour{course.cpd_hours !== 1 ? "s" : ""}
                  </div>
                )}

                <div className="flex items-center justify-center gap-6 text-body-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Verified
                  </span>
                  <span>Issued: {format(new Date(cert.issued_at), "dd MMMM yyyy")}</span>
                  <span>ID: {cert.share_token.toUpperCase()}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2">
                  <Award className="h-4 w-4 text-accent" />
                  <p className="text-caption text-muted-foreground">
                    WorldAML Academy — www.worldaml.com/academy
                  </p>
                </div>
              </div>

              {/* Shareable Badge */}
              <div className="mt-8 p-6 rounded-xl border border-border bg-muted/30 text-center">
                <p className="text-body-sm font-semibold text-foreground mb-3">Your Shareable Badge</p>
                <div className="inline-flex items-center gap-3 bg-primary text-primary-foreground rounded-lg px-5 py-3 shadow-md">
                  <Award className="h-6 w-6 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold leading-tight">{course?.title}</p>
                    <p className="text-xs opacity-80">WorldAML Academy • {cert.score}%{course?.cpd_hours > 0 ? ` • ${course.cpd_hours} CPD` : ""}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 shrink-0 opacity-80" />
                </div>
                <p className="text-caption text-muted-foreground mt-3">
                  Share this badge on your profile or resume
                </p>
              </div>

              {/* Share Actions */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button variant="default" onClick={shareLinkedIn}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  Share on LinkedIn
                </Button>
                <Button variant="outline" onClick={shareX}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Share on X
                </Button>
                <Button variant="outline" onClick={copyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                {typeof navigator !== "undefined" && navigator.share && (
                  <Button variant="outline" onClick={nativeShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
                <Button variant="outline" onClick={downloadBadge}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Badge
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

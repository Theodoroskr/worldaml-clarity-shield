import { useEffect, useMemo, useState } from "react";
import { Share2, Linkedin, Twitter, Facebook, Copy, Check, Mail, Download, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRecognition, trackRecognition, type RecognitionStatus } from "@/hooks/useRecognition";
import { renderRecognitionCard, downloadBlob } from "@/lib/recognitionShareImage";

const ACADEMY_URL = "https://worldaml.com/academy";
const LINKEDIN_PAGE = "https://www.linkedin.com/company/worldaml";
const HASHTAGS = ["AML", "Compliance", "FinancialCrime", "KYC", "Sanctions", "CPD", "WorldAML"];

/** Suggested post copy — includes hyperlinks, mentions and hashtags. */
export function buildShareMessage(r: RecognitionStatus, network: "linkedin" | "x" | "facebook" | "email") {
  const level = r.level?.name ?? "Member";
  const courses = `${r.completedCourses} CPD-accredited course${r.completedCourses === 1 ? "" : "s"}`;
  const certs = r.certificates > 0
    ? ` and ${r.certificates} verified certificate${r.certificates === 1 ? "" : "s"}`
    : "";
  const badges = r.earnedBadges.length
    ? `\n\nSpecialisations earned: ${r.earnedBadges.map((b) => b.name).join(", ")}.`
    : "";

  const mention = network === "x" ? "@WorldAML" : "WorldAML";
  const tags = network === "email" ? "" : `\n\n${HASHTAGS.map((h) => `#${h}`).join(" ")}`;

  const body =
    `I've reached ${level} status with ${mention} Academy — ${courses}${certs} completed in anti-money laundering, sanctions screening and financial crime compliance.${badges}` +
    `\n\nExplore the WorldAML Academy: ${ACADEMY_URL}` +
    (network === "linkedin" ? `\nWorldAML on LinkedIn: ${LINKEDIN_PAGE}` : "") +
    tags;

  return network === "x" && body.length > 275
    ? `I've reached ${level} status with @WorldAML Academy — ${courses} in AML & financial crime compliance.\n\n${ACADEMY_URL}\n\n#AML #Compliance #KYC #CPD`
    : body;
}

export default function ShareRecognition({
  data,
  variant = "outline",
  size = "sm",
  className,
}: {
  data?: RecognitionStatus;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "default";
  className?: string;
}) {
  const live = useRecognition();
  const r = data ?? live;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const message = useMemo(() => (r ? buildShareMessage(r, "linkedin") : ""), [r]);
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? message;

  // Branded share image (WorldAML logo + recognition level) generated on open.
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);

  useEffect(() => {
    if (!open || !r?.level || imageUrl) return;
    let cancelled = false;
    setImageBusy(true);
    renderRecognitionCard(r)
      .then((blob) => {
        if (cancelled || !blob) return;
        setImageBlob(blob);
        setImageUrl(URL.createObjectURL(blob));
      })
      .finally(() => !cancelled && setImageBusy(false));
    return () => { cancelled = true; };
  }, [open, r, imageUrl]);

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  if (!r?.authenticated || !r.level) return null;

  const levelName = r.level.name;

  const downloadImage = () => {
    if (!imageBlob) return;
    trackRecognition("share_image_download");
    downloadBlob(imageBlob, `worldaml-${levelName.toLowerCase().replace(/\s+/g, "-")}-recognition.png`);
    toast({ title: "Image downloaded", description: "Attach it to your social post for maximum reach." });
  };

  const copyImage = async () => {
    if (!imageBlob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": imageBlob })]);
      trackRecognition("share_image_copy");
      toast({ title: "Image copied", description: "Paste it directly into your post." });
    } catch {
      downloadImage();
    }
  };


  const share = (network: "linkedin" | "x" | "facebook") => {
    trackRecognition(`share_${network}`);
    const url =
      network === "linkedin"
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(ACADEMY_URL)}`
        : network === "x"
          ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareMessage(r, "x"))}&url=${encodeURIComponent(ACADEMY_URL)}`
          : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ACADEMY_URL)}&quote=${encodeURIComponent(buildShareMessage(r, "facebook"))}`;
    window.open(url, "_blank", "noopener,noreferrer,width=680,height=640");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackRecognition("share_copy");
      toast({ title: "Post copied", description: "Paste it into your social post before publishing." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Select the text and copy it manually.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className} onClick={() => trackRecognition("share_open")}>
          <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share your {r.level.name} status</DialogTitle>
          <DialogDescription>
            LinkedIn and X don't accept pre-filled text — copy the suggested post first, then paste it into the
            share window that opens.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setDraft(e.target.value)}
          rows={9}
          className="text-sm leading-relaxed"
          aria-label="Suggested post"
        />

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-accent" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy post"}
          </Button>
          <Button size="sm" onClick={() => share("linkedin")}>
            <Linkedin className="h-3.5 w-3.5 mr-1.5" /> LinkedIn
          </Button>
          <Button variant="outline" size="sm" onClick={() => share("x")}>
            <Twitter className="h-3.5 w-3.5 mr-1.5" /> X
          </Button>
          <Button variant="outline" size="sm" onClick={() => share("facebook")}>
            <Facebook className="h-3.5 w-3.5 mr-1.5" /> Facebook
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a
              href={`mailto:?subject=${encodeURIComponent(`My WorldAML Academy ${r.level.name} status`)}&body=${encodeURIComponent(buildShareMessage(r, "email"))}`}
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" /> Email
            </a>
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Tip: tag <span className="text-foreground">WorldAML</span> in your post so your network can follow the
          Academy, and keep the hashtags — they help compliance peers find your update.
        </p>
      </DialogContent>
    </Dialog>
  );
}

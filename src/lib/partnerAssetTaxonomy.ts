import {
  BookOpen,
  FileText,
  Presentation,
  Share2,
  Mail,
  Boxes,
  Palette,
  Image as ImageIcon,
  Video,
  Layers,
  type LucideIcon,
} from "lucide-react";

/** Hub tabs shown on /partner/assets */
export const ASSET_TABS: { id: string; label: string; categories: string[] | null }[] = [
  { id: "all", label: "All assets", categories: null },
  { id: "brochure", label: "Brochures", categories: ["brochure"] },
  { id: "one_pager", label: "Product one-pagers", categories: ["one_pager"] },
  { id: "presentation", label: "Presentations", categories: ["presentation", "deck"] },
  { id: "social", label: "Social media", categories: ["social", "banner"] },
  { id: "email", label: "Email campaigns", categories: ["email_template", "email_campaign"] },
  { id: "campaign_kit", label: "Campaign kits", categories: ["campaign_kit"] },
  { id: "brand", label: "Brand assets", categories: ["brand_asset", "logo", "brand_guide"] },
  { id: "cobrandable", label: "Co-brandable", categories: null },
];

export const CATEGORY_LABEL: Record<string, string> = {
  brochure: "Brochure",
  one_pager: "One-pager",
  presentation: "Presentation",
  deck: "Deck",
  social: "Social",
  banner: "Banner",
  email_template: "Email template",
  email_campaign: "Email campaign",
  campaign_kit: "Campaign kit",
  brand_asset: "Brand asset",
  logo: "Logo",
  brand_guide: "Brand guide",
  case_study: "Case study",
  contract: "Contract",
  video: "Video",
};

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  brochure: BookOpen,
  one_pager: FileText,
  presentation: Presentation,
  deck: Presentation,
  social: Share2,
  banner: ImageIcon,
  email_template: Mail,
  email_campaign: Mail,
  campaign_kit: Boxes,
  brand_asset: Palette,
  logo: ImageIcon,
  brand_guide: Layers,
  case_study: BookOpen,
  contract: FileText,
  video: Video,
};

export const ADMIN_CATEGORIES = Object.keys(CATEGORY_LABEL);

export const ASSET_STATUSES = ["draft", "approved", "archived"] as const;

export const LANGUAGES = ["English", "Greek", "French", "German", "Spanish", "Arabic"];

export const INDUSTRIES = [
  "All industries",
  "Banking",
  "Fintech / EMI",
  "Payments",
  "Gaming / iGaming",
  "Corporate services",
  "Crypto / VASP",
];

export const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "updated", label: "Recently updated" },
  { id: "az", label: "A–Z" },
];

export function isNew(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
}

export function isUpdated(createdAt: string, updatedAt: string) {
  return (
    !isNew(createdAt) &&
    Date.now() - new Date(updatedAt).getTime() < 30 * 24 * 60 * 60 * 1000
  );
}

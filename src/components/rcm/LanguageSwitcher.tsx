import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <Select value={i18n.language?.startsWith("ar") ? "ar" : "en"} onValueChange={(v) => i18n.changeLanguage(v)}>
        <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t("rcm.common.english")}</SelectItem>
          <SelectItem value="ar">{t("rcm.common.arabic")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

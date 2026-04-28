import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";

export function RcmPlaceholder({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{t(titleKey)}</h1>
      <Card className="p-12 text-center text-muted-foreground border-dashed">
        Module scaffolded. CRUD UI ships in the next iteration — schema, RLS and demo data are already live.
      </Card>
    </div>
  );
}

export default RcmPlaceholder;

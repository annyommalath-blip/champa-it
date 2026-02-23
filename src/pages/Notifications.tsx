import { Bell } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Notifications() {
  const { t } = useLanguage();

  return (
    <div className="px-5 py-5 space-y-4 md:max-w-2xl md:mx-auto md:px-8 md:py-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("notifications.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("notifications.subtitle")}</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Bell className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">{t("notifications.empty")}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("notifications.emptyDesc")}</p>
      </div>
    </div>
  );
}

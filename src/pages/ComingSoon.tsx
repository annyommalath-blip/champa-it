import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function ComingSoon({ title, description, ctaLabel, ctaTo }: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaTo?: string;
}) {
  return (
    <div className="px-5 py-5 space-y-5 md:max-w-md md:mx-auto md:px-8 md:py-8 animate-fade-in">
      <Link to="/profile" className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-page-title text-foreground">{title}</h1>

      <div className="bento-card p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-primary" strokeWidth={1.6} />
        </div>
        <p className="text-[14px] text-muted-foreground leading-relaxed">{description}</p>
        {ctaLabel && ctaTo && (
          <Link to={ctaTo}><button className="btn-primary">{ctaLabel}</button></Link>
        )}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({ title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn(className)}>
      <h2 className="typo-section-title">{title}</h2>
      {description ? <p className="typo-caption text-muted-foreground">{description}</p> : null}
    </div>
  );
}

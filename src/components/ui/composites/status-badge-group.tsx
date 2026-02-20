import { Badge, type BadgeProps } from "@/components/ui/badge";

export type StatusBadgeItem = {
  label: string;
  variant: BadgeProps["variant"];
};

export type StatusBadgeGroupProps = {
  items: StatusBadgeItem[];
  className?: string;
};

export function StatusBadgeGroup({ items, className }: StatusBadgeGroupProps) {
  return (
    <div className={["flex flex-wrap items-center gap-2", className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <Badge key={`${item.variant}-${item.label}`} variant={item.variant}>
          {item.label}
        </Badge>
      ))}
    </div>
  );
}

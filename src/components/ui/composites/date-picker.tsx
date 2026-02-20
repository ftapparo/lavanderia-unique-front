import { useMemo, useState } from "react";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/components/ui/foundation/date-time.utils";
import type { DateValue } from "@/components/ui/foundation/date-time.types";
import type { Locale } from "date-fns";

export type DatePickerProps = {
  value?: DateValue;
  onChange?: (date: DateValue) => void;
  placeholder?: string;
  locale?: Locale;
  disabled?: boolean;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione a data",
  locale = ptBR,
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const buttonLabel = useMemo(() => {
    return value ? formatDate(value) : placeholder;
  }, [value, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-between font-normal !bg-card hover:!bg-card", className)}
          disabled={disabled}
        >
          <span>{buttonLabel}</span>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2" align="start">
        <Calendar
          locale={locale}
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

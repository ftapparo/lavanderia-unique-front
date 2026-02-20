import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateTime, joinDateTime, splitDateTime, toIsoDate } from "@/components/ui/foundation/date-time.utils";

export type DateTimePickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  locale?: Locale;
  disabled?: boolean;
  className?: string;
};

const ITEM_HEIGHT = 36;
const REPEAT_SEGMENTS = 5;
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

export function DateTimePicker({
  value,
  onChange,
  locale = ptBR,
  disabled,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timeValue, setTimeValue] = useState("00:00");
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const centeredRef = useRef(false);

  const [hour = "00", minute = "00"] = timeValue.split(":");

  const repeatedHours = useMemo(() => Array.from({ length: REPEAT_SEGMENTS }).flatMap(() => HOURS), []);
  const repeatedMinutes = useMemo(() => Array.from({ length: REPEAT_SEGMENTS }).flatMap(() => MINUTES), []);

  useEffect(() => {
    if (!value) return;
    const { date, time } = splitDateTime(value);
    if (date) {
      const parsed = new Date(`${date}T00:00:00`);
      if (!Number.isNaN(parsed.getTime())) setSelectedDate(parsed);
    }
    if (time) setTimeValue(time);
  }, [value]);

  const getMiddleIndex = (values: string[], selected: string) => {
    const selectedIndex = Math.max(0, values.indexOf(selected));
    return Math.floor(REPEAT_SEGMENTS / 2) * values.length + selectedIndex;
  };

  useEffect(() => {
    if (!open) {
      centeredRef.current = false;
      return;
    }
    if (centeredRef.current) return;
    centeredRef.current = true;

    const frame = window.requestAnimationFrame(() => {
      if (hourListRef.current) hourListRef.current.scrollTop = getMiddleIndex(HOURS, hour) * ITEM_HEIGHT;
      if (minuteListRef.current) minuteListRef.current.scrollTop = getMiddleIndex(MINUTES, minute) * ITEM_HEIGHT;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, hour, minute]);

  const emitValue = (nextDate: Date | undefined, nextTime: string) => {
    if (!nextDate) return;
    const next = joinDateTime(toIsoDate(nextDate), nextTime);
    onChange?.(next);
  };

  const setHour = (nextHour: string) => {
    const nextTime = `${nextHour}:${minute}`;
    setTimeValue(nextTime);
    emitValue(selectedDate, nextTime);
  };

  const setMinute = (nextMinute: string) => {
    const nextTime = `${hour}:${nextMinute}`;
    setTimeValue(nextTime);
    emitValue(selectedDate, nextTime);
  };

  const setDate = (nextDate?: Date) => {
    if (!nextDate) return;
    setSelectedDate(nextDate);
    emitValue(nextDate, timeValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-between font-normal !bg-card hover:!bg-card", className)}
          disabled={disabled}
        >
          <span>{formatDateTime(value ?? "", "pt-BR") || "Selecione data e hora"}</span>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit max-w-none p-2" align="start">
        <div className="flex items-start gap-3">
          <Calendar locale={locale} mode="single" selected={selectedDate} onSelect={setDate} />
          <div className="border-l pl-3">
            <div className="grid grid-cols-2 divide-x">
              <div ref={hourListRef} className="no-scrollbar h-64 w-[60px] overflow-y-auto pr-1">
                <div className="grid p-1">
                  {repeatedHours.map((item, index) => (
                    <Button
                      key={`dh-${index}-${item}`}
                      type="button"
                      size="sm"
                      variant={item === hour ? "default" : "ghost"}
                      className="h-9 px-0 justify-center rounded-md"
                      onClick={() => setHour(item)}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
              <div ref={minuteListRef} className="no-scrollbar h-64 w-[60px] overflow-y-auto pl-1">
                <div className="grid p-1">
                  {repeatedMinutes.map((item, index) => (
                    <Button
                      key={`dm-${index}-${item}`}
                      type="button"
                      size="sm"
                      variant={item === minute ? "default" : "ghost"}
                      className="h-9 px-0 justify-center rounded-md"
                      onClick={() => setMinute(item)}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type TimePickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  hourStep?: number;
  minuteStep?: number;
  loop?: boolean;
  disabled?: boolean;
  className?: string;
};

const ITEM_HEIGHT = 36;
const REPEAT_SEGMENTS = 5;

const buildTimeValues = (max: number, step: number) => {
  const safeStep = Math.max(1, step);
  const values: string[] = [];
  for (let i = 0; i < max; i += safeStep) values.push(i.toString().padStart(2, "0"));
  return values;
};

export function TimePicker({
  value = "00:00",
  onChange,
  hourStep = 1,
  minuteStep = 1,
  loop = true,
  disabled,
  className,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [hour = "00", minute = "00"] = value.split(":");
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const centeredRef = useRef(false);

  const hours = useMemo(() => buildTimeValues(24, hourStep), [hourStep]);
  const minutes = useMemo(() => buildTimeValues(60, minuteStep), [minuteStep]);
  const repeatedHours = useMemo(
    () => (loop ? Array.from({ length: REPEAT_SEGMENTS }).flatMap(() => hours) : hours),
    [hours, loop],
  );
  const repeatedMinutes = useMemo(
    () => (loop ? Array.from({ length: REPEAT_SEGMENTS }).flatMap(() => minutes) : minutes),
    [minutes, loop],
  );

  const getMiddleIndex = (values: string[], selected: string) => {
    const selectedIndex = Math.max(0, values.indexOf(selected));
    if (!loop) return selectedIndex;
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
      if (hourListRef.current) {
        hourListRef.current.scrollTop = getMiddleIndex(hours, hour) * ITEM_HEIGHT;
      }
      if (minuteListRef.current) {
        minuteListRef.current.scrollTop = getMiddleIndex(minutes, minute) * ITEM_HEIGHT;
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, hour, minute, hours, minutes]);

  const changeHour = (nextHour: string) => onChange?.(`${nextHour}:${minute}`);
  const changeMinute = (nextMinute: string) => onChange?.(`${hour}:${nextMinute}`);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-between font-normal !bg-card hover:!bg-card", className)}
          disabled={disabled}
        >
          <span>{value}</span>
          <Clock3 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit max-w-none p-2" align="start">
        <div className="grid grid-cols-2 divide-x">
          <div ref={hourListRef} className="no-scrollbar h-52 w-[60px] overflow-y-auto pr-1">
            <div className="grid p-1">
              {repeatedHours.map((item, index) => (
                <Button
                  key={`h-${index}-${item}`}
                  type="button"
                  size="sm"
                  variant={item === hour ? "default" : "ghost"}
                  className="h-9 px-0 justify-center rounded-md"
                  onClick={() => changeHour(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>

          <div ref={minuteListRef} className="no-scrollbar h-52 w-[60px] overflow-y-auto pl-1">
            <div className="grid p-1">
              {repeatedMinutes.map((item, index) => (
                <Button
                  key={`m-${index}-${item}`}
                  type="button"
                  size="sm"
                  variant={item === minute ? "default" : "ghost"}
                  className="h-9 px-0 justify-center rounded-md"
                  onClick={() => changeMinute(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

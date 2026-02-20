import { useMemo, useState } from "react";
import { ptBR } from "date-fns/locale";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives";
import { Label } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import { DatePicker, DateTimePicker, TimePicker } from "@/components/ui/composites";
import { formatDateTime, joinDateTime, splitDateTime, toIsoDate } from "@/components/ui/foundation/date-time.utils";

const timezones = ["America/Sao_Paulo", "America/New_York", "UTC", "Europe/Lisbon"] as const;

export default function ComponentsShowcaseFive() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeValue, setTimeValue] = useState("14:30");
  const [dateTimeValue, setDateTimeValue] = useState("2026-02-18T14:30");
  const [timezone, setTimezone] = useState<(typeof timezones)[number]>("America/Sao_Paulo");

  const dateValue = selectedDate ? toIsoDate(selectedDate) : "";

  const formattedDate = useMemo(() => {
    if (!selectedDate) return "Nenhuma data selecionada";
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "full",
      timeZone: timezone,
    }).format(selectedDate);
  }, [selectedDate, timezone]);

  const formattedDateTime = useMemo(() => {
    return formatDateTime(dateTimeValue, "pt-BR", timezone) || "-";
  }, [dateTimeValue, timezone]);

  const onDateChange = (nextDate: Date | undefined) => {
    setSelectedDate(nextDate);
    if (!nextDate) return;
    setDateTimeValue(joinDateTime(toIsoDate(nextDate), timeValue));
  };

  const onTimeChange = (nextTime: string) => {
    setTimeValue(nextTime);
    if (!selectedDate) return;
    setDateTimeValue(joinDateTime(toIsoDate(selectedDate), nextTime));
  };

  const onDateTimeChange = (nextDateTime: string) => {
    setDateTimeValue(nextDateTime);
    const { date, time } = splitDateTime(nextDateTime);
    if (date) {
      const parsed = new Date(`${date}T00:00:00`);
      if (!Number.isNaN(parsed.getTime())) setSelectedDate(parsed);
    }
    if (time) setTimeValue(time);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Showcase de Componentes 5"
        description="Data e hora em um layout unico: calendario, pickers reutilizaveis e preview formatado."
      />

      <Card>
        <CardHeader>
          <CardTitle>Calendar + Date/Time Inputs</CardTitle>
          <CardDescription>
            Date picker, time picker e datetime picker reutilizaveis no padrao do design system interno.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 max-w-[280px]">
            <Label className="block">Date Picker (Popover)</Label>
            <DatePicker value={selectedDate} onChange={onDateChange} locale={ptBR} className="w-full" />
          </div>

          <div className="space-y-2 max-w-[280px]">
            <Label className="block">Time Picker (Popover)</Label>
            <TimePicker value={timeValue} onChange={onTimeChange} className="w-full" loop />
          </div>

          <div className="space-y-2 md:col-span-2 max-w-[380px]">
            <Label className="block">DateTime Picker (Popover)</Label>
            <DateTimePicker value={dateTimeValue} onChange={onDateTimeChange} locale={ptBR} className="w-full" />
          </div>

          <div className="space-y-2 md:col-span-2 max-w-[280px]">
            <Label className="block">Timezone para preview</Label>
            <Select value={timezone} onValueChange={(value: (typeof timezones)[number]) => setTimezone(value)}>
              <SelectTrigger className="w-full !bg-card">
                <SelectValue placeholder="Selecione timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 rounded-md border bg-muted/50 px-3 py-2 text-sm md:col-span-2">
            <p>
              <span className="font-medium">Data formatada:</span> {formattedDate}
            </p>
            <p>
              <span className="font-medium">Date:</span> {dateValue || "-"}
            </p>
            <p>
              <span className="font-medium">Time:</span> {timeValue || "-"}
            </p>
            <p>
              <span className="font-medium">DateTime (formatado):</span> {formattedDateTime}
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}


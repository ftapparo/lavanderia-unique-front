const pad2 = (value: number) => String(value).padStart(2, "0");

export const toIsoDate = (date: Date): string => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

export const isValidDate = (value: string): boolean => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

export const joinDateTime = (date: string, time: string): string => {
  if (!date || !time) return "";
  return `${date}T${time}`;
};

export const splitDateTime = (value: string): { date: string; time: string } => {
  const [date = "", time = ""] = value.split("T");
  return { date, time: time.slice(0, 5) };
};

export const formatDate = (date: Date | undefined, locale = "pt-BR"): string => {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
};

export const formatDateTime = (value: string, locale = "pt-BR", timeZone?: string): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data invalida";

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
};

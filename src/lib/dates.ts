import {
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  parseISO,
} from "date-fns";
import { plural } from "./format";

export function formatDate(iso: string) {
  return format(parseISO(iso), "dd.MM.yyyy");
}

export function formatTimeLeft(iso: string) {
  const days = differenceInCalendarDays(parseISO(iso), new Date());
  if (days < 0) return "истёк";
  if (days === 0) return "истекает сегодня";
  const verb = plural(days, ["остался", "осталось", "осталось"]);
  return `${verb} ${days} ${plural(days, ["день", "дня", "дней"])}`;
}

export function formatTime(iso: string, seconds = false) {
  return format(parseISO(iso), seconds ? "HH:mm:ss" : "HH:mm");
}

export function formatDayMonth(iso: string) {
  return format(parseISO(iso), "dd.MM");
}

export function formatAgo(iso: string, now = new Date()) {
  const minutes = differenceInMinutes(now, parseISO(iso));
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч. назад`;
  return `${Math.floor(hours / 24)} дн. назад`;
}

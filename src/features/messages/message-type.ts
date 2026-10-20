import type { StatusTone } from "@/components/status-badge";
import type { MessageType } from "./types";

export const messageTypeMeta: Record<
  MessageType,
  { label: string; tone: StatusTone }
> = {
  push: { label: "Push", tone: "blue" },
  sms: { label: "SMS", tone: "orange" },
  deposit: { label: "Зачисление", tone: "green" },
  statement: { label: "Выписка", tone: "primary" },
};

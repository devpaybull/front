import type { BroadcastStatus } from "./types";

export const broadcastStatusMeta: Record<
  BroadcastStatus,
  { label: string; note: string; tone: string }
> = {
  queued: { label: "В очереди", note: "Ждёт отправки", tone: "text-orange" },
  sending: { label: "Отправляется", note: "Идёт рассылка", tone: "text-blue" },
  sent: {
    label: "Отправлено",
    note: "Доставлено всем трейдерам",
    tone: "text-green",
  },
  partial: {
    label: "Частично отправлено",
    note: "Не доставлено части трейдеров",
    tone: "text-orange",
  },
  failed: {
    label: "Ошибка",
    note: "Не удалось отправить",
    tone: "text-destructive",
  },
};

import type { StatusTone } from "@/components/status-badge";
import type { WithdrawalStatus } from "./types";

export const withdrawalStatusMeta: Record<
  WithdrawalStatus,
  { label: string; tone: StatusTone }
> = {
  done: { label: "Выполнено", tone: "green" },
  processing: { label: "В обработке", tone: "orange" },
  queued: { label: "В очереди", tone: "blue" },
  error: { label: "Ошибка", tone: "red" },
};

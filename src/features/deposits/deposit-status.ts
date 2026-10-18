import type { StatusTone } from "@/components/status-badge";
import type { DepositStatus } from "./types";

export const depositStatusMeta: Record<
  DepositStatus,
  { label: string; tab: string; tone: StatusTone }
> = {
  processing: { label: "В процессе", tab: "В процессе", tone: "orange" },
  problem: { label: "Проблема", tab: "Проблемные", tone: "red" },
  credited: { label: "Зачислено", tab: "Зачислено", tone: "green" },
  refunded: { label: "Возврат", tab: "Возврат", tone: "blue" },
};

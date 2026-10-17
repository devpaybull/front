import type { BalanceOperation, BalanceReason } from "./types";

export const balanceReasonLabels: Record<BalanceReason, string> = {
  escrow: "Эскроу сделки",
  deposit: "Успешный депозит",
  withdrawal: "Вывод USDT",
};

export const balanceTypeLabels: Record<BalanceOperation["type"], string> = {
  deals: "Сделки",
  deposit: "Ввод",
  withdrawal: "Вывод",
};

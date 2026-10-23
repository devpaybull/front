import { StatusBadge } from "@/components/status-badge";
import type { RequestDirection, RequestResult } from "./types";

export const directionLabels: Record<RequestDirection, string> = {
  payIn: "Покупка pay-in",
  payOut: "Продажа pay-out",
};

export const ResultBadge = ({ result }: { result: RequestResult }) =>
  result === "created" ? (
    <StatusBadge tone="green">Создана</StatusBadge>
  ) : (
    <StatusBadge tone="red">Не создана</StatusBadge>
  );

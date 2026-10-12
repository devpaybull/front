import type { EntityRef, PaymentMethod, UserRef } from "@/features/users/types";
import type { DealMethodTab } from "./schemas";

export type DealStatus =
  | "active"
  | "pending"
  | "appeal"
  | "receiptCheck"
  | "manualCheck"
  | "recalculated"
  | "completed"
  | "cancelled";

export type Deal = {
  id: string;
  createdAt: string;
  deadline: string | null;
  status: DealStatus;
  method: PaymentMethod;
  direction: "in" | "out";
  amount: string;
  processor: UserRef | null;
  telegram: { username: string; group: string } | null;
  merchant: EntityRef;
  requisite: { bank: string; holder: string; phone: string };
};

export type DealList = {
  counts: Record<DealMethodTab | "all", number>;
  items: Deal[];
};

export type DealFilterOptions = {
  traders: string[];
  cascades: string[];
  merchantGroups: string[];
};

export type DealHistoryEntry = {
  id: string;
  createdAt: string;
  kind:
    | "created"
    | "completed"
    | "cancelled"
    | "appeal"
    | "amountChanged"
    | "traderAssigned";
  text: string;
};

export type DealKind = "deal" | "buyout";

export type DealDetails = Deal & {
  merchantDealId: string | null;
  cascadeDealId: string | null;
  kind: DealKind;
  merchantUserId: string;
  send: string;
  receive: string;
  rate: string;
  payment: {
    holder: string | null;
    bank: string;
    phone: string | null;
    card: string | null;
  };
  fees: {
    merchant: { amount: string; percent: string };
    trader: { amount: string; percent: string } | null;
    cascade: { amount: string; percent: string } | null;
    leads: { amount: string; count: number } | null;
  };
  files: { id: string; name: string; url: string | null }[];
  history: DealHistoryEntry[];
};

export type DealAction = "complete" | "dispute" | "cancel" | "callback";

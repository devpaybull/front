import type { UserRef } from "@/features/users/types";

export type DepositStatus = "processing" | "problem" | "credited" | "refunded";

export type AmlFlag =
  | "exchange"
  | "lawEnforcement"
  | "gambling"
  | "sanctions"
  | "scam";

export type Deposit = {
  id: string;
  number: number;
  windowMinutes: number;
  status: DepositStatus;
  user: UserRef;
  amount: string;
  fee: string;
  address: string;
  transactions: number;
  txHash: string | null;
  aml: {
    source: string;
    risk: number;
    checkedAt: string;
    flags: AmlFlag[];
  } | null;
  createdAt: string;
};

export type DepositList = {
  counts: Record<DepositStatus | "all", number>;
  items: Deposit[];
};

export type DepositStats = {
  total: number;
  inProgress: number;
  processing: number;
  problem: number;
  amlFailed: number;
  credited24h: string;
  credited24hCount: number;
  successRate: number;
};

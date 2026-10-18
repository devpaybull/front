import type { UserRef } from "@/features/users/types";

export type WithdrawalStatus = "done" | "processing" | "queued" | "error";

export type Withdrawal = {
  id: string;
  number: number;
  status: WithdrawalStatus;
  user: UserRef;
  address: string;
  transactions: number;
  txHash: string | null;
  amount: string;
  fee: string;
  createdAt: string;
};

export type WithdrawalList = {
  counts: Record<WithdrawalStatus | "all", number>;
  items: Withdrawal[];
};

export type WithdrawalStats = {
  queued: number;
  active: number;
  processing: number;
  stale: number;
  manualReview: number;
  toReview: number;
  paid24h: string;
  paid24hCount: number;
  successRate: number;
};

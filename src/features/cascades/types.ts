import type { PaymentMethod } from "@/features/users/types";

export type Cascade = {
  id: string;
  name: string;
  userId: string;
  enabled: boolean;
  priority: number;
  volumeToday: { rub: string; usdt: string };
  dealsPerMinute: number;
  amountRange: { min: string; max: string };
  merchants: { count: number; all: boolean };
  balance: { total: string; withoutActive: string; limit: string };
};

export type CascadeList = { items: Cascade[] };

export type CascadeRequestResult = "success" | "error";

export type CascadeRequest = {
  id: string;
  createdAt: string;
  cascade: { id: string; name: string };
  method: PaymentMethod;
  direction: "payIn" | "payOut";
  amount: string;
  bank: string | null;
  result: CascadeRequestResult;
  httpStatus: number;
  responseMs: number;
  body: unknown;
  response: unknown;
};

export type CascadeRequestList = {
  items: CascadeRequest[];
  counts: Record<"all" | CascadeRequestResult, number>;
};

export type CascadeRequestFilterOptions = {
  cascades: string[];
  banks: string[];
  methods: { value: PaymentMethod; label: string }[];
};

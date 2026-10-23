import type { EntityRef, PaymentMethod, UserRef } from "@/features/users/types";

export type RequestResult = "created" | "rejected";

export type RequestDirection = "payIn" | "payOut";

export type MerchantRequest = {
  id: string;
  createdAt: string;
  merchant: EntityRef;
  method: PaymentMethod;
  methodName: string;
  direction: RequestDirection;
  amount: string;
  bank: string | null;
  merchantUserId: string;
  result: RequestResult;
  processor: UserRef | null;
  responseMs: number;
};

export type MerchantRequestCounts = Record<"all" | RequestResult, number>;

export type MerchantRequestList = {
  items: MerchantRequest[];
  counts: MerchantRequestCounts;
};

export type MerchantRequestDetails = MerchantRequest & {
  processing: string;
  errorCode: string | null;
  dealId: string | null;
  processingMs: number;
  headers: Record<string, string>;
  body: unknown;
  response: unknown;
};

export type MerchantRequestFilterOptions = {
  banks: string[];
  methods: { value: PaymentMethod; label: string }[];
};

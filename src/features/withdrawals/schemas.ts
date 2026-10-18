import { z } from "zod";

export const withdrawalStatuses = [
  "done",
  "processing",
  "queued",
  "error",
] as const;

export const withdrawalSortFields = [
  "number",
  "user",
  "transactions",
  "amount",
  "fee",
  "createdAt",
] as const;
export type WithdrawalSortField = (typeof withdrawalSortFields)[number];

export const withdrawalsSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  status: z.enum(withdrawalStatuses).optional().catch(undefined),
  sort: z.enum(withdrawalSortFields).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
});
export type WithdrawalsSearch = z.infer<typeof withdrawalsSearchSchema>;

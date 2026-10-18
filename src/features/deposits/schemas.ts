import { z } from "zod";

export const depositStatuses = [
  "processing",
  "problem",
  "credited",
  "refunded",
] as const;

export const depositSortFields = [
  "number",
  "user",
  "amount",
  "createdAt",
] as const;
export type DepositSortField = (typeof depositSortFields)[number];

export const depositsSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  status: z.enum(depositStatuses).optional().catch(undefined),
  sort: z.enum(depositSortFields).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
});
export type DepositsSearch = z.infer<typeof depositsSearchSchema>;

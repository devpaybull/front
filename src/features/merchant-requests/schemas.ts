import { z } from "zod";

export const requestResults = ["created", "rejected"] as const;

export const requestSortFields = [
  "createdAt",
  "merchant",
  "amount",
  "merchantUserId",
] as const;
export type RequestSortField = (typeof requestSortFields)[number];

const text = z.string().optional().catch(undefined);
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);
const amount = z.coerce.number().int().min(0).optional().catch(undefined);

export const requestsSearchSchema = z.object({
  q: text,
  result: z.enum(requestResults).optional().catch(undefined),
  sort: z.enum(requestSortFields).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
  open: text,
  from: day,
  to: day,
  amountFrom: amount,
  amountTo: amount,
  bank: text,
  method: text,
  direction: z.enum(["payIn", "payOut"]).optional().catch(undefined),
});
export type RequestsSearch = z.infer<typeof requestsSearchSchema>;

export type RequestFilters = Pick<
  RequestsSearch,
  "from" | "to" | "amountFrom" | "amountTo" | "bank" | "method" | "direction"
>;

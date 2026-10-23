import { z } from "zod";

const text = z.string().optional().catch(undefined);
const order = z.enum(["asc", "desc"]).optional().catch(undefined);

export const cascadeSortFields = [
  "priority",
  "volume",
  "dealsPerMinute",
  "merchants",
  "balance",
] as const;
export type CascadeSortField = (typeof cascadeSortFields)[number];

export const cascadesSearchSchema = z.object({
  q: text,
  status: z.enum(["on", "off"]).optional().catch(undefined),
  sort: z.enum(cascadeSortFields).optional().catch(undefined),
  order,
});
export type CascadesSearch = z.infer<typeof cascadesSearchSchema>;

export const cascadeRequestSortFields = [
  "createdAt",
  "amount",
  "bank",
  "responseMs",
] as const;
export type CascadeRequestSortField = (typeof cascadeRequestSortFields)[number];

const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);
const amount = z.coerce.number().int().min(0).optional().catch(undefined);

export const cascadeRequestsSearchSchema = z.object({
  q: text,
  result: z.enum(["success", "error"]).optional().catch(undefined),
  sort: z.enum(cascadeRequestSortFields).optional().catch(undefined),
  order,
  open: text,
  from: day,
  to: day,
  cascade: text,
  amountFrom: amount,
  amountTo: amount,
  bank: text,
  method: text,
});
export type CascadeRequestsSearch = z.infer<typeof cascadeRequestsSearchSchema>;

export type CascadeRequestFilters = Pick<
  CascadeRequestsSearch,
  "from" | "to" | "cascade" | "amountFrom" | "amountTo" | "bank" | "method"
>;

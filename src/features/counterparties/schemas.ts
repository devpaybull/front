import { z } from "zod";
import type { CounterpartyRequisite } from "./types";

export const counterpartySortFields = [
  "id",
  "activity",
  "conversion",
  "averageCheck",
  "week",
  "month",
  "all",
] as const;
export type CounterpartySortField = (typeof counterpartySortFields)[number];

const yesNo = z.enum(["yes", "no"]).optional().catch(undefined);
const text = z.string().optional().catch(undefined);
const amount = z.coerce.number().int().min(0).optional().catch(undefined);

export const counterpartyFiltersSchema = z.object({
  trader: text,
  merchant: text,
  requisite: text,
  status: z.enum(["active", "disabled"]).optional().catch(undefined),
  blacklisted: yesNo,
  autoEnableBlocked: yesNo,
  bound: yesNo,
  vol30From: amount,
  vol30To: amount,
  vol60From: amount,
  vol60To: amount,
  vol90From: amount,
  vol90To: amount,
  allFrom: amount,
  allTo: amount,
  paid30From: amount,
  paid30To: amount,
  requests30From: amount,
  requests30To: amount,
});
export type CounterpartyFilters = z.infer<typeof counterpartyFiltersSchema>;

export const counterpartiesSearchSchema = counterpartyFiltersSchema.extend({
  q: text,
  sort: z.enum(counterpartySortFields).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
});
export type CounterpartiesSearch = z.infer<typeof counterpartiesSearchSchema>;

const requisite = z
  .custom<CounterpartyRequisite | null>()
  .refine((r) => r != null, "Выберите реквизит");

export const bindRequisiteSchema = z.object({
  bindType: z
    .enum(["cardsOrSbp", "cards", "sbp"])
    .nullable()
    .refine((t) => t !== null, "Выберите тип"),
  channel: z.enum(["sbp", "card"]),
  requisite,
});
export type BindRequisiteForm = z.input<typeof bindRequisiteSchema>;

export const replaceRequisiteSchema = z.object({ requisite });
export type ReplaceRequisiteForm = z.input<typeof replaceRequisiteSchema>;

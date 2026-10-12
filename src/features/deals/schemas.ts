import { z } from "zod";
import { amountSchema } from "@/lib/schemas";

export const dealMethodTabs = [
  "c2c",
  "sbp",
  "ka",
  "transgran_sbp",
  "mobile",
  "qr",
] as const;
export type DealMethodTab = (typeof dealMethodTabs)[number];

export const dealStatusValues = [
  "active",
  "pending",
  "appeal",
  "receiptCheck",
  "manualCheck",
  "recalculated",
  "completed",
  "cancelled",
] as const;

export const dealListSortFields = ["createdAt", "amount"] as const;
export type DealListSortField = (typeof dealListSortFields)[number];

const text = z.string().optional().catch(undefined);
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);
const wholeAmount = z.coerce
  .number()
  .int()
  .nonnegative()
  .optional()
  .catch(undefined);

export const dealListSearchSchema = z.object({
  q: text,
  method: z.enum(dealMethodTabs).optional().catch(undefined),
  sort: z.enum(dealListSortFields).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
  from: day,
  to: day,
  status: z.enum(dealStatusValues).optional().catch(undefined),
  amountFrom: wholeAmount,
  amountTo: wholeAmount,
  trader: text,
  cascade: text,
  merchantGroup: text,
  counterparty: text,
  requisite: text,
});
export type DealListSearch = z.infer<typeof dealListSearchSchema>;

export type DealFilters = Omit<
  DealListSearch,
  "q" | "method" | "sort" | "order"
>;

export const dealAmountSchema = z.object({
  amount: amountSchema("Введите сумму").refine(
    (value) => Number(value) > 0,
    "Сумма должна быть больше 0",
  ),
});
export type DealAmountForm = z.input<typeof dealAmountSchema>;
export type DealAmount = z.output<typeof dealAmountSchema>;

export const assignTraderSchema = z.object({
  trader: z
    .object({ id: z.string(), login: z.string() })
    .nullable()
    .refine((trader) => trader !== null, "Выберите трейдера"),
});
export type AssignTraderForm = z.input<typeof assignTraderSchema>;

const MAX_RECEIPT = 5 * 1024 * 1024;

export const disputeSchema = z.object({
  receipt: z
    .instanceof(File)
    .nullable()
    .refine((file) => file !== null, "Загрузите чек")
    .refine(
      (file) =>
        !file ||
        file.type === "application/pdf" ||
        file.type.startsWith("image/"),
      "Только PDF или изображение",
    )
    .refine((file) => !file || file.size <= MAX_RECEIPT, "Файл больше 5 мб")
    .transform((file) => file as File),
  amount: amountSchema("Укажите сумму"),
});
export type DisputeForm = z.input<typeof disputeSchema>;
export type Dispute = z.output<typeof disputeSchema>;

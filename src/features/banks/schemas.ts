import { z } from "zod";

export const bankSortFields = ["name", "channels"] as const;
export type BankSortField = (typeof bankSortFields)[number];

export const banksSearchSchema = z.object({
  currency: z.string().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  sort: z.enum(bankSortFields).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
});
export type BanksSearch = z.infer<typeof banksSearchSchema>;

export const bankRequisiteTypes = ["p2p", "sbp", "card", "account"] as const;

export const newBankSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Введите идентификатор")
    .regex(/^[a-z0-9_-]+$/, "Латиница в нижнем регистре, цифры, _ и -"),
  name: z.string().trim().min(1, "Введите название банка"),
  country: z.string().trim(),
  currency: z.string().min(1, "Выберите валюту"),
  crossBorderCurrencies: z.array(z.string()),
  requisiteTypes: z.array(z.enum(bankRequisiteTypes)),
  askHolderName: z.boolean(),
});
export type NewBankForm = z.infer<typeof newBankSchema>;

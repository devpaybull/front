import { z } from "zod";
import { amountSchema as amount } from "@/lib/schemas";
import { rateCurrencies } from "./currencies";

export const userSortFields = [
  "login",
  "balance",
  "deposit",
  "rate",
  "registeredAt",
  "cascade",
  "merchant",
] as const;
export type UserSortField = (typeof userSortFields)[number];

export const usersSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  role: z
    .enum([
      "trader",
      "lead_trader",
      "cascade",
      "merchant",
      "merchant_support",
      "merchant_agent",
      "admin",
      "super_admin",
    ])
    .optional()
    .catch(undefined),
  sort: z.enum(userSortFields).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
});

export type UsersSearch = z.infer<typeof usersSearchSchema>;

const pickedUser = z
  .object({ id: z.string(), login: z.string() })
  .nullable()
  .refine((user) => user !== null, "Выберите пользователя");

export const noteSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Напишите пометку")
    .max(2000, "Не длиннее 2000 символов"),
});
export type NoteForm = z.infer<typeof noteSchema>;

export const transferSchema = (balance: string) =>
  z.object({
    recipient: pickedUser,
    amount: amount("Введите сумму")
      .refine((value) => Number(value) > 0, "Сумма должна быть больше 0")
      .refine(
        (value) => Number(value) <= Number(balance),
        "Больше, чем на балансе",
      ),
    comment: z.string().trim().max(500, "Не длиннее 500 символов"),
  });

export type TransferForm = z.input<ReturnType<typeof transferSchema>>;
export type Transfer = z.output<ReturnType<typeof transferSchema>>;

const percent = z
  .string()
  .trim()
  .min(1, "Укажите ставку")
  .transform((value) => value.replace(",", "."))
  .refine((value) => /^\d+(\.\d+)?$/.test(value), "Число")
  .refine((value) => Number(value) <= 100, "Не больше 100");

export const assignLeadsSchema = z.object({
  leads: z
    .array(
      z.object({
        lead: pickedUser,
        currency: z.enum(rateCurrencies),
        payIn: percent,
        payOut: percent,
      }),
    )
    .min(1)
    .superRefine((leads, ctx) => {
      const seen = new Set<string>();
      leads.forEach(({ lead }, index) => {
        if (!lead) return;
        if (seen.has(lead.id)) {
          ctx.addIssue({
            code: "custom",
            path: [index, "lead"],
            message: "Этот тим-лид уже выбран",
          });
        }
        seen.add(lead.id);
      });
    }),
});

export type AssignLeadsForm = z.input<typeof assignLeadsSchema>;
export type AssignLeads = z.output<typeof assignLeadsSchema>;

export const concurrentSchema = z.object({
  concurrent: z
    .string()
    .trim()
    .regex(/^\d+$/, "Целое число")
    .transform(Number)
    .refine((n) => n >= 1 && n <= 20, "От 1 до 20"),
  reason: z.string().trim().max(200, "Не длиннее 200 символов"),
});
export type ConcurrentForm = z.input<typeof concurrentSchema>;
export type Concurrent = z.output<typeof concurrentSchema>;

export const minInsuranceSchema = z.object({
  payIn: amount("Введите сумму"),
  payOut: amount("Введите сумму"),
});
export type MinInsuranceForm = z.input<typeof minInsuranceSchema>;
export type MinInsurance = z.output<typeof minInsuranceSchema>;

export const debtSchema = z.object({
  amount: amount("Введите сумму").refine(
    (value) => Number(value) > 0,
    "Сумма должна быть больше 0",
  ),
});
export type DebtForm = z.input<typeof debtSchema>;
export type Debt = z.output<typeof debtSchema>;

const telegramLogin = /^@?[A-Za-z0-9_]{5,32}$/;

export const telegramSchemas = {
  login: z.object({
    value: z
      .string()
      .trim()
      .regex(telegramLogin, "Telegram в формате @username")
      .transform((v) => (v.startsWith("@") ? v : `@${v}`)),
  }),
  id: z.object({
    value: z
      .string()
      .trim()
      .regex(/^\d{5,15}$/, "Только цифры, 5–15 знаков"),
  }),
  groups: z.object({
    value: z
      .string()
      .transform((v) =>
        v
          .split(/[,/\s]+/)
          .map((g) => g.trim().replace(/^@/, ""))
          .filter(Boolean),
      )
      .refine((groups) => groups.length > 0, "Укажите хотя бы одну группу")
      .refine(
        (groups) => groups.every((g) => /^[A-Za-z0-9_]{3,32}$/.test(g)),
        "Только латиница, цифры и _",
      ),
  }),
};
export type TelegramField = keyof typeof telegramSchemas;

export const ratePercentSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(",", "."))
  .refine((value) => /^\d+(\.\d+)?$/.test(value) && Number(value) <= 100);

export const rateAmountSchema = z
  .string()
  .transform((value) => value.replace(/\s/g, ""))
  .refine((value) => /^\d+$/.test(value) && Number(value) >= 1);

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
const order = z.enum(["asc", "desc"]).optional().catch(undefined);

export const balanceReasons = ["escrow", "deposit", "withdrawal"] as const;

export const balanceSearchSchema = z.object({
  from: day,
  to: day,
  reason: z.enum(balanceReasons).optional().catch(undefined),
});
export type BalanceSearch = z.infer<typeof balanceSearchSchema>;

export const dealSortFields = ["createdAt", "amount", "merchant"] as const;
export type DealSortField = (typeof dealSortFields)[number];

export const dealsSearchSchema = z.object({
  from: day,
  to: day,
  direction: z.enum(["in", "out"]).optional().catch(undefined),
  method: z.string().optional().catch(undefined),
  bank: z.string().optional().catch(undefined),
  merchant: z.string().optional().catch(undefined),
  amountFrom: wholeAmount,
  amountTo: wholeAmount,
  sort: z.enum(dealSortFields).optional().catch(undefined),
  order,
});
export type DealsSearch = z.infer<typeof dealsSearchSchema>;

export const requisiteSortFields = ["total", "amount", "limits"] as const;
export type RequisiteSortField = (typeof requisiteSortFields)[number];

export const requisitesSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  status: z.enum(["enabled", "disabled"]).optional().catch(undefined),
  bank: z.string().optional().catch(undefined),
  sort: z.enum(requisiteSortFields).optional().catch(undefined),
  order,
});
export type RequisitesSearch = z.infer<typeof requisitesSearchSchema>;

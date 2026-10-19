import { z } from "zod";
import { amountSchema, futureDateSchema } from "@/lib/schemas";

export const debtSortFields = ["user", "amount"] as const;
export type DebtSortField = (typeof debtSortFields)[number];

export const debtorsSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  sort: z.enum(debtSortFields).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
});
export type DebtorsSearch = z.infer<typeof debtorsSearchSchema>;

export const debtCommentSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(1, "Напишите комментарий")
    .max(500, "Не длиннее 500 символов"),
});
export type DebtCommentForm = z.infer<typeof debtCommentSchema>;

export const autoDebitSchema = z.object({ date: futureDateSchema });
export type AutoDebitForm = z.input<typeof autoDebitSchema>;
export type AutoDebit = z.output<typeof autoDebitSchema>;

export const writeOffSchema = (debt: string) =>
  z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("all"), amount: z.string() }),
    z.object({
      mode: z.literal("part"),
      amount: amountSchema("Введите сумму")
        .refine((value) => Number(value) > 0, "Сумма должна быть больше 0")
        .refine(
          (value) => Number(value) < Number(debt),
          "Меньше долга: всю сумму списывает «Списать весь долг»",
        ),
    }),
  ]);
export type WriteOffForm = z.input<ReturnType<typeof writeOffSchema>>;
export type WriteOff = z.output<ReturnType<typeof writeOffSchema>>;

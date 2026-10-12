import { format, isAfter, isValid, parse, startOfToday } from "date-fns";
import { z } from "zod";

export const txHashSchema = z.object({
  txHash: z
    .string()
    .trim()
    .min(1, "Вставьте хеш транзакции")
    .regex(/^[0-9a-fA-F]{64}$/, "Хеш — 64 символа: цифры и буквы a–f"),
});
export type TxHashForm = z.infer<typeof txHashSchema>;

export const amountSchema = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .transform((value) => value.replace(/\s/g, "").replace(",", "."))
    .refine(
      (value) => /^\d+(\.\d{1,2})?$/.test(value),
      "Число, до 2 знаков после запятой",
    );

export const futureDateSchema = z
  .string()
  .min(1, "Укажите дату")
  .transform((value, ctx) => {
    const date = parse(value, "dd.MM.yyyy", new Date());
    if (value.length !== 10 || !isValid(date)) {
      ctx.addIssue({ code: "custom", message: "Дата в формате дд.мм.гггг" });
      return z.NEVER;
    }
    if (!isAfter(date, startOfToday())) {
      ctx.addIssue({ code: "custom", message: "Выберите дату в будущем" });
      return z.NEVER;
    }
    return format(date, "yyyy-MM-dd");
  });

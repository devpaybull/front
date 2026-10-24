import { z } from "zod";

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Введите текущий пароль"),
    next: z
      .string()
      .min(8, "Не короче 8 символов")
      .regex(/[A-Za-z]/, "Нужна хотя бы одна буква")
      .regex(/\d/, "Нужна хотя бы одна цифра"),
    repeat: z.string(),
  })
  .refine((form) => form.next === form.repeat, {
    path: ["repeat"],
    message: "Пароли не совпадают",
  })
  .refine((form) => form.next !== form.current, {
    path: ["next"],
    message: "Новый пароль совпадает с текущим",
  });
export type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

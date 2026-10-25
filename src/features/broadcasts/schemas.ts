import { z } from "zod";

export const broadcastMaxLength = 4000;

export const broadcastSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Введите текст уведомления")
    .max(broadcastMaxLength, `Не длиннее ${broadcastMaxLength} символов`),
});
export type BroadcastForm = z.infer<typeof broadcastSchema>;

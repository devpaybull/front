import { z } from "zod";

export const credentialsSchema = z.object({
  login: z.string().trim().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
});

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Введите 6-значный код"),
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type Otp = z.infer<typeof otpSchema>;

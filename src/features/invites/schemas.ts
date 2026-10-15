import { z } from "zod";
import { futureDateSchema as futureDate } from "@/lib/schemas";

export const inviteSortFields = [
  "code",
  "rate",
  "deposit",
  "validUntil",
] as const;
export type InviteSortField = (typeof inviteSortFields)[number];

export const invitesSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  status: z.enum(["active", "used", "expired"]).optional().catch(undefined),
  sort: z.enum(inviteSortFields).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
});

export type InvitesSearch = z.infer<typeof invitesSearchSchema>;

export const newInviteSchema = z.object({
  role: z.enum(["trader", "lead"]),
  telegram: z
    .string()
    .trim()
    .regex(/^@?[A-Za-z0-9_]{5,32}$/, "Введите Telegram в формате @username")
    .transform((value) => (value.startsWith("@") ? value : `@${value}`)),
  validUntil: futureDate,
});

export type NewInviteForm = z.input<typeof newInviteSchema>;
export type NewInvite = z.output<typeof newInviteSchema>;

export const extendInviteSchema = (currentValidUntil: string) =>
  z.object({
    validUntil: futureDate.refine((iso) => iso > currentValidUntil, {
      message: "Новая дата должна быть позже текущей",
    }),
  });

export type ExtendInviteForm = { validUntil: string };

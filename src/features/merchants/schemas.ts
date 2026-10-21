import { z } from "zod";

export const merchantPeriods = [
  "today",
  "yesterday",
  "week",
  "month",
  "all",
] as const;
export type MerchantPeriod = (typeof merchantPeriods)[number];

export const merchantSortFields = ["id", "balance"] as const;
export type MerchantSortField = (typeof merchantSortFields)[number];

const onOff = z.enum(["on", "off"]);

export const merchantsSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  period: z.enum(merchantPeriods).optional().catch(undefined),
  status: onOff.optional().catch(undefined),
  exclusive: onOff.optional().catch(undefined),
  sort: z.enum(merchantSortFields).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
});
export type MerchantsSearch = z.infer<typeof merchantsSearchSchema>;

const groupName = z
  .string()
  .trim()
  .min(1, "Введите название группы")
  .max(64, "Не длиннее 64 символов");

export const renameGroupSchema = z.object({ name: groupName });
export type RenameGroupForm = z.infer<typeof renameGroupSchema>;

const option = z.object({ id: z.string(), name: z.string() });

export const joinGroupSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("new"), name: groupName }),
  z.object({
    mode: z.literal("existing"),
    group: option.nullable().refine((g) => g !== null, "Выберите группу"),
  }),
]);
export type JoinGroupForm = z.input<typeof joinGroupSchema>;
export type JoinGroupValues = z.output<typeof joinGroupSchema>;

export const addMerchantsSchema = z.object({
  merchants: z
    .array(z.object({ merchant: option.nullable() }))
    .refine(
      (rows) => rows.some((row) => row.merchant),
      "Выберите хотя бы одного мерчанта",
    ),
});
export type AddMerchantsForm = z.infer<typeof addMerchantsSchema>;

const flags = z.object({
  trade: z.boolean(),
  cards: z.boolean(),
  sbp: z.boolean(),
  tgCards: z.boolean(),
  tgSbp: z.boolean(),
});
const attachmentRow = z.object({
  user: z.object({ id: z.string(), login: z.string() }).nullable(),
  flags,
});

export const attachSchema = z
  .object({ traders: z.array(attachmentRow), cascades: z.array(attachmentRow) })
  .superRefine((form, ctx) => {
    for (const kind of ["traders", "cascades"] as const) {
      const seen = new Set<string>();
      form[kind].forEach((row, index) => {
        if (!row.user) return;
        if (seen.has(row.user.id))
          ctx.addIssue({
            code: "custom",
            path: [kind, index, "user"],
            message: "Уже в списке",
          });
        seen.add(row.user.id);
      });
    }
  });
export type AttachForm = z.infer<typeof attachSchema>;

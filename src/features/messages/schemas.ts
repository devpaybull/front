import { z } from "zod";

export const messageTypes = ["push", "sms", "deposit", "statement"] as const;

export const messageSortFields = ["number", "createdAt", "sender"] as const;
export type MessageSortField = (typeof messageSortFields)[number];

const text = z.string().optional().catch(undefined);
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

export const messagesSearchSchema = z.object({
  q: text,
  type: z.enum(messageTypes).optional().catch(undefined),
  sort: z.enum(messageSortFields).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
  from: day,
  to: day,
  trader: text,
  device: text,
  sender: text,
  hideUnknown: z.boolean().optional().catch(undefined),
  deal: text,
});
export type MessagesSearch = z.infer<typeof messagesSearchSchema>;

export type MessageFilters = Pick<
  MessagesSearch,
  "from" | "to" | "trader" | "device" | "sender" | "hideUnknown" | "deal"
>;

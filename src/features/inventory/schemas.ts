import { z } from "zod";

export const inventorySearchSchema = z.object({
  method: z.string().optional().catch(undefined),
  type: z.string().optional().catch(undefined),
  bank: z.string().optional().catch(undefined),
  merchant: z.string().optional().catch(undefined),
  kind: z
    .enum(["card", "sbp", "mobile", "counterparty"])
    .optional()
    .catch(undefined),
});

export type InventorySearch = z.infer<typeof inventorySearchSchema>;

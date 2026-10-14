import { authHandlers } from "./auth-handlers";
import { inventoryHandlers } from "./inventory-handlers";

export const handlers = [
  ...authHandlers,
  ...inventoryHandlers,
];

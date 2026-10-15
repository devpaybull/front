import { authHandlers } from "./auth-handlers";
import { inventoryHandlers } from "./inventory-handlers";
import { invitesHandlers } from "./invites-handlers";

export const handlers = [
  ...authHandlers,
  ...inventoryHandlers,
  ...invitesHandlers,
];

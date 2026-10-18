import { authHandlers } from "./auth-handlers";
import { depositsHandlers } from "./deposits-handlers";
import { inventoryHandlers } from "./inventory-handlers";
import { invitesHandlers } from "./invites-handlers";
import { userTabsHandlers } from "./user-tabs-handlers";
import { usersHandlers } from "./users-handlers";

export const handlers = [
  ...authHandlers,
  ...inventoryHandlers,
  ...invitesHandlers,
  ...usersHandlers,
  ...userTabsHandlers,
  ...depositsHandlers,
];

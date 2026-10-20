import { authHandlers } from "./auth-handlers";
import { debtsHandlers } from "./debts-handlers";
import { depositsHandlers } from "./deposits-handlers";
import { inventoryHandlers } from "./inventory-handlers";
import { invitesHandlers } from "./invites-handlers";
import { messagesHandlers } from "./messages-handlers";
import { userTabsHandlers } from "./user-tabs-handlers";
import { usersHandlers } from "./users-handlers";
import { withdrawalsHandlers } from "./withdrawals-handlers";

export const handlers = [
  ...authHandlers,
  ...inventoryHandlers,
  ...invitesHandlers,
  ...usersHandlers,
  ...userTabsHandlers,
  ...depositsHandlers,
  ...withdrawalsHandlers,
  ...debtsHandlers,
  ...messagesHandlers,
];

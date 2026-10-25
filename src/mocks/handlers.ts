import { accountHandlers } from "./account-handlers";
import { authHandlers } from "./auth-handlers";
import { banksHandlers } from "./banks-handlers";
import { broadcastsHandlers } from "./broadcasts-handlers";
import { cascadesHandlers } from "./cascades-handlers";
import { counterpartiesHandlers } from "./counterparties-handlers";
import { dealsHandlers } from "./deals-handlers";
import { debtsHandlers } from "./debts-handlers";
import { depositsHandlers } from "./deposits-handlers";
import { inventoryHandlers } from "./inventory-handlers";
import { invitesHandlers } from "./invites-handlers";
import { merchantRequestsHandlers } from "./merchant-requests-handlers";
import { merchantsHandlers } from "./merchants-handlers";
import { messagesHandlers } from "./messages-handlers";
import { settingsHandlers } from "./settings-handlers";
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
  ...dealsHandlers,
  ...merchantsHandlers,
  ...counterpartiesHandlers,
  ...merchantRequestsHandlers,
  ...cascadesHandlers,
  ...banksHandlers,
  ...settingsHandlers,
  ...accountHandlers,
  ...broadcastsHandlers,
];

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import BookmarkIcon from "@/assets/icons/bookmark.svg?react";
import ExchangeIcon from "@/assets/icons/exchange.svg?react";
import KeyIcon from "@/assets/icons/key.svg?react";
import LoanIcon from "@/assets/icons/loan.svg?react";
import LockIcon from "@/assets/icons/lock.svg?react";
import LoginIcon from "@/assets/icons/login.svg?react";
import LogoutIcon from "@/assets/icons/logout.svg?react";
import MinusCircleIcon from "@/assets/icons/minus-circle.svg?react";
import SettingIcon from "@/assets/icons/setting.svg?react";
import ShieldIcon from "@/assets/icons/shield.svg?react";
import ToggleIcon from "@/assets/icons/toggle.svg?react";
import UserIcon from "@/assets/icons/user.svg?react";
import WalletIcon from "@/assets/icons/wallet.svg?react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUserQuery } from "@/features/auth/api";
import { updateUserSettings } from "../api";
import type { UserProfile, UserSettings } from "../types";
import { AssignLeadDialog } from "./assign-lead-dialog";
import {
  ConfirmActionDialog,
  type ConfirmActionKey,
} from "./confirm-action-dialog";
import { DebtDialog } from "./debt-dialog";
import { MinInsuranceDialog } from "./min-insurance-dialog";
import { NoteDialog } from "./note-dialog";
import { PasswordResetDialog } from "./password-reset-dialog";
import { TransferDialog } from "./transfer-dialog";
import { useProfileMutation } from "./use-profile-mutation";

type Action =
  | "transfer"
  | "note"
  | "assignLead"
  | "debt"
  | "minInsurance"
  | ConfirmActionKey;

const confirmKeys: ConfirmActionKey[] = [
  "payouts",
  "trading",
  "blockTrading",
  "endSessions",
  "resetPassword",
  "resetTwoFactor",
];
const isConfirm = (action: Action | null): action is ConfirmActionKey =>
  confirmKeys.includes(action as ConfirmActionKey);

const itemClass =
  "h-[38px] gap-2 rounded-[10px] px-2 text-[15px] leading-none font-semibold tracking-[-0.02em] [&_svg:not([class*='size-'])]:size-5";

export function UserActionsMenu({ user }: { user: UserProfile }) {
  const { settings } = user;
  const { data: me } = useQuery(currentUserQuery());
  const isSuperAdmin = me?.role === "super_admin";

  const [action, setAction] = useState<Action | null>(null);
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(0);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const show = (next: Action) => {
    setAction(next);
    setOpening((n) => n + 1);
    setOpen(true);
  };

  const turnOn = useProfileMutation(user.id, (patch: Partial<UserSettings>) =>
    updateUserSettings(user.id, patch),
  );

  const dialog = { user, open, onOpenChange: setOpen };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="secondary"
              className="gap-[7px] rounded-[14px] border-border px-6 data-popup-open:text-muted-foreground"
            />
          }
        >
          <SettingIcon className="size-5" />
          Настройки пользователя
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={12}
          className="flex w-auto min-w-0 flex-col gap-1 rounded-[17px] bg-[#15191d] p-2.5 shadow-[0_4px_16px_rgb(0_0_0/0.25)] ring-0"
        >
          <DropdownMenuItem
            className={itemClass}
            onClick={() => show("transfer")}
          >
            <ExchangeIcon />
            Перевести баланс пользователю
          </DropdownMenuItem>
          <DropdownMenuItem className={itemClass} onClick={() => show("note")}>
            <BookmarkIcon />
            Пометка трейдера
          </DropdownMenuItem>
          {user.role === "trader" && (
            <DropdownMenuItem
              className={itemClass}
              onClick={() => show("assignLead")}
            >
              <UserIcon />
              Назначить лид-трейдера
            </DropdownMenuItem>
          )}
          {isSuperAdmin && (
            <DropdownMenuItem
              className={itemClass}
              onClick={() => show("debt")}
            >
              <LoanIcon />
              Дать деньги в долг
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className={itemClass}
            onClick={() =>
              settings.payOutTrading
                ? show("payouts")
                : turnOn.mutate({ payOutTrading: true })
            }
          >
            <WalletIcon />
            {settings.payOutTrading ? "Выключить выплаты" : "Включить выплаты"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={itemClass}
            onClick={() =>
              settings.trading
                ? show("trading")
                : turnOn.mutate({ trading: true })
            }
          >
            <ToggleIcon />
            {settings.trading ? "Выключить торговлю" : "Включить торговлю"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={itemClass}
            onClick={() => show("minInsurance")}
          >
            <ShieldIcon />
            Изменить минимальный страховой баланс
          </DropdownMenuItem>
          {isSuperAdmin && (
            <>
              <DropdownMenuItem
                className={itemClass}
                onClick={() => show("resetPassword")}
              >
                <LockIcon />
                Сбросить пароль
              </DropdownMenuItem>
              <DropdownMenuItem
                className={itemClass}
                onClick={() => show("resetTwoFactor")}
              >
                <KeyIcon />
                Сбросить двойную аутентификацию
              </DropdownMenuItem>
              <DropdownMenuItem className={itemClass} disabled>
                <LoginIcon />
                Войти в кабинет трейдера
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator className="mx-2 my-2 bg-border/80" />

          <DropdownMenuItem
            variant="destructive"
            className={itemClass}
            onClick={() =>
              settings.tradingBlocked
                ? turnOn.mutate({ tradingBlocked: false })
                : show("blockTrading")
            }
          >
            <MinusCircleIcon />
            {settings.tradingBlocked
              ? "Разблокировать торговлю"
              : "Заблокировать торговлю"}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className={itemClass}
            onClick={() => show("endSessions")}
          >
            <LogoutIcon />
            Завершить все сессии
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {action === "transfer" && <TransferDialog key={opening} {...dialog} />}
      {action === "note" && <NoteDialog key={opening} {...dialog} />}
      {action === "assignLead" && (
        <AssignLeadDialog key={opening} {...dialog} />
      )}
      {action === "debt" && <DebtDialog key={opening} {...dialog} />}
      {action === "minInsurance" && (
        <MinInsuranceDialog key={opening} {...dialog} />
      )}
      {isConfirm(action) && (
        <ConfirmActionDialog
          key={opening}
          action={action}
          {...dialog}
          onDone={(result) => {
            if (action === "resetPassword") {
              setNewPassword((result as { password: string }).password);
            }
          }}
        />
      )}
      {newPassword && (
        <PasswordResetDialog
          password={newPassword}
          open
          onOpenChange={(next) => !next && setNewPassword(null)}
        />
      )}
    </>
  );
}

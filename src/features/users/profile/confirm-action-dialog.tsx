import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ComponentType, ReactNode, SVGProps } from "react";
import KeyIcon from "@/assets/icons/key.svg?react";
import LockIcon from "@/assets/icons/lock.svg?react";
import MinusCircleIcon from "@/assets/icons/minus-circle.svg?react";
import ToggleIcon from "@/assets/icons/toggle.svg?react";
import WalletIcon from "@/assets/icons/wallet.svg?react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { errorMessage } from "@/lib/api";
import {
  endUserSessions,
  resetUserPassword,
  resetUserTwoFactor,
  updateUserSettings,
} from "../api";
import type { UserProfile } from "../types";

type ConfirmAction = {
  title: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  question: (login: ReactNode) => ReactNode;
  confirm: string;
  run: (user: UserProfile) => Promise<unknown>;
};

export const confirmActions = {
  payouts: {
    title: "Выключить выплаты",
    Icon: WalletIcon,
    question: (login) => (
      <>
        Вы уверены, что хотите выключить выплаты у трейдера {login}? Вы сможете
        включить их обратно в любой момент.
      </>
    ),
    confirm: "Да, выключить",
    run: (user) => updateUserSettings(user.id, { payOutTrading: false }),
  },
  trading: {
    title: "Выключить торговлю",
    Icon: ToggleIcon,
    question: (login) => (
      <>
        Вы уверены, что хотите выключить торговлю у трейдера {login}? В этот
        период трейдер не сможет участвовать в сделках. Вы сможете включить
        торговлю обратно в любой момент.
      </>
    ),
    confirm: "Да, выключить",
    run: (user) => updateUserSettings(user.id, { trading: false }),
  },
  blockTrading: {
    title: "Заблокировать торговлю",
    Icon: MinusCircleIcon,
    question: (login) => (
      <>
        Вы уверены, что хотите заблокировать торговлю у трейдера {login}? В этот
        период трейдер не сможет пользоваться личным кабинетом. Вы сможете
        включить торговлю обратно в любой момент.
      </>
    ),
    confirm: "Да, заблокировать",
    run: (user) => updateUserSettings(user.id, { tradingBlocked: true }),
  },
  endSessions: {
    title: "Завершить все сессии",
    Icon: MinusCircleIcon,
    question: (login) => (
      <>Вы уверены, что хотите завершить все сессии у трейдера {login}?</>
    ),
    confirm: "Да, завершить",
    run: (user) => endUserSessions(user.id),
  },
  resetPassword: {
    title: "Сбросить пароль",
    Icon: LockIcon,
    question: (login) => (
      <>
        Вы уверены, что хотите сбросить пароль у трейдера {login}? После сброса
        вам будет выдан новый пароль, его можно будет переслать трейдеру.
      </>
    ),
    confirm: "Да, сбросить",
    run: (user) => resetUserPassword(user.id),
  },
  resetTwoFactor: {
    title: "Сбросить двойную аутентификацию",
    Icon: KeyIcon,
    question: (login) => (
      <>
        Вы уверены, что хотите сбросить двойную аутентификацию у трейдера{" "}
        {login}?
      </>
    ),
    confirm: "Да, сбросить",
    run: (user) => resetUserTwoFactor(user.id),
  },
} satisfies Record<string, ConfirmAction>;

export type ConfirmActionKey = keyof typeof confirmActions;

type ConfirmActionDialogProps = {
  action: ConfirmActionKey;
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone?: (result: unknown) => void;
};

export function ConfirmActionDialog({
  action,
  user,
  open,
  onOpenChange,
  onDone,
}: ConfirmActionDialogProps) {
  const { title, Icon, question, confirm, run }: ConfirmAction =
    confirmActions[action];
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => run(user),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
      onDone?.(result);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) mutation.reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Icon />
            {title}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-3.5">
          <DialogDescription>
            {question(<span className="text-foreground">“{user.login}”</span>)}
          </DialogDescription>
          {mutation.isError && (
            <p
              role="alert"
              className="text-[13px] leading-none tracking-[-0.03em] text-destructive"
            >
              {errorMessage(mutation.error)}
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Отменить
          </DialogClose>
          <Button
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

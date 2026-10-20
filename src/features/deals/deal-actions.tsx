import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import { type ReactNode, useId, useState } from "react";
import { useForm } from "react-hook-form";
import ChevronIcon from "@/assets/icons/chevron-down-20.svg?react";
import CloseIcon from "@/assets/icons/close.svg?react";
import GavelIcon from "@/assets/icons/gavel.svg?react";
import telegramUrl from "@/assets/icons/telegram-blue.svg";
import UserIcon from "@/assets/icons/user.svg?react";
import WalletIcon from "@/assets/icons/wallet.svg?react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { useDialog } from "@/hooks/use-dialog";
import { errorMessage } from "@/lib/api";
import { shortId } from "@/lib/format";
import { changeDealAmount, runDealAction } from "./api";
import { AssignTraderDialog } from "./assign-trader-dialog";
import { DealPanel } from "./deal-panel";
import { DisputeDialog } from "./dispute-dialog";
import {
  type DealAmount,
  type DealAmountForm,
  dealAmountSchema,
} from "./schemas";
import { CheckCircle } from "./status-circle";
import type { DealAction, DealDetails } from "./types";

const tones = {
  green: "bg-green/15 text-green",
  red: "bg-destructive/15 text-destructive",
  blue: "bg-blue/15 text-blue",
  orange: "bg-orange/15 text-orange",
  plain: "bg-muted text-foreground",
};

type Item = {
  key: DealAction | "amount" | "cancelBuyout" | "assign";
  label: string;
  tone: keyof typeof tones;
  icon: ReactNode;
};

const items: Record<Item["key"], Item> = {
  complete: {
    key: "complete",
    label: "Закрыть активную сделку",
    tone: "green",
    icon: <CheckCircle />,
  },
  dispute: {
    key: "dispute",
    label: "Открыть спор",
    tone: "red",
    icon: <GavelIcon className="size-5" />,
  },
  amount: {
    key: "amount",
    label: "Изменить сумму сделки",
    tone: "orange",
    icon: <WalletIcon className="size-5" />,
  },
  cancel: {
    key: "cancel",
    label: "Отменить завершенную сделку",
    tone: "red",
    icon: <CloseIcon className="size-5" />,
  },
  callback: {
    key: "callback",
    label: "Отправить callback",
    tone: "blue",
    icon: <img src={telegramUrl} alt="" className="size-5" />,
  },
  cancelBuyout: {
    key: "cancelBuyout",
    label: "Отменить откуп",
    tone: "red",
    icon: <CloseIcon className="size-5" />,
  },
  assign: {
    key: "assign",
    label: "Назначить трейдера",
    tone: "plain",
    icon: <UserIcon className="size-5" />,
  },
};

function actionsFor(deal: DealDetails): Item["key"][] {
  const { status } = deal;
  if (status === "completed") return ["amount", "cancel", "callback"];
  if (deal.kind === "buyout") {
    if (status === "cancelled") return ["dispute", "callback", "assign"];
    if (!deal.processor) return ["cancelBuyout", "callback", "assign"];
  }
  if (status === "cancelled") return ["callback"];
  if (status === "appeal") return ["complete", "callback"];
  return ["complete", "dispute", "callback"];
}

const confirms: Record<
  "complete" | "cancel" | "cancelBuyout",
  {
    title: string;
    question: (id: ReactNode) => ReactNode;
    confirm: string;
    destructive: boolean;
    action: DealAction;
  }
> = {
  complete: {
    title: "Закрыть сделку",
    question: () =>
      "Вы уверены, что хотите закрыть сделку? Трейдеру и мерчанту будут начислены суммы по сделке.",
    confirm: "Да, закрыть",
    destructive: false,
    action: "complete",
  },
  cancel: {
    title: "Отменить сделку",
    question: () =>
      "Вы уверены, что хотите отменить завершённую сделку? Начисления по ней будут списаны.",
    confirm: "Да, отменить",
    destructive: true,
    action: "cancel",
  },
  cancelBuyout: {
    title: "Отменить откуп",
    question: (id) => (
      <>
        Вы уверены, что хотите отменить сделку{" "}
        <span className="text-foreground">{id}</span>? После этого действия
        сделка будет полностью отменена и получит соответствующий статус
      </>
    ),
    confirm: "Да, отменить откуп",
    destructive: true,
    action: "cancel",
  },
};

export function DealQuickActions({ deal }: { deal: DealDetails }) {
  const queryClient = useQueryClient();
  const dialog = useDialog();
  const [opened, setOpened] = useState<Item["key"] | null>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["deals"] });
  const callback = useMutation({
    mutationFn: () => runDealAction(deal.id, "callback"),
    onSuccess: refresh,
  });

  const dialogProps = {
    deal,
    open: dialog.open,
    onOpenChange: dialog.onOpenChange,
    onDone: refresh,
  };
  const open = (key: Item["key"]) => {
    if (key === "callback") return callback.mutate();
    setOpened(key);
    dialog.show();
  };

  return (
    <DealPanel
      title="Быстрые действия"
      subtitle="Основные операции по текущей сделке"
    >
      <div className="flex flex-col gap-2.5">
        {actionsFor(deal).map((key) => {
          const item = items[key];
          const busy = key === "callback" && callback.isPending;
          return (
            <button
              key={key}
              type="button"
              disabled={busy}
              onClick={() => open(key)}
              className={cn(
                "flex h-11 items-center justify-between gap-2.5 rounded-[14px] px-5 text-[15px] font-medium outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                tones[item.tone],
              )}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                {busy ? "Отправляем…" : item.label}
              </span>
              <ChevronIcon className="size-4 -rotate-90" />
            </button>
          );
        })}
        {callback.isSuccess && (
          <p className="text-[13px] text-green">Callback отправлен мерчанту</p>
        )}
        {callback.isError && (
          <p role="alert" className="text-[13px] text-destructive">
            {errorMessage(callback.error)}
          </p>
        )}
      </div>

      {dialog.mounted && opened === "amount" && (
        <AmountDialog key={dialog.key} {...dialogProps} />
      )}
      {dialog.mounted && opened === "dispute" && (
        <DisputeDialog key={dialog.key} {...dialogProps} />
      )}
      {dialog.mounted && opened === "assign" && (
        <AssignTraderDialog key={dialog.key} {...dialogProps} />
      )}
      {dialog.mounted && opened && opened in confirms && (
        <ConfirmDialog
          key={dialog.key}
          title={confirms[opened as keyof typeof confirms].title}
          icon={items[opened].icon}
          confirmLabel={confirms[opened as keyof typeof confirms].confirm}
          destructive={confirms[opened as keyof typeof confirms].destructive}
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          onConfirm={async () => {
            await runDealAction(
              deal.id,
              confirms[opened as keyof typeof confirms].action,
            );
            await refresh();
          }}
        >
          {confirms[opened as keyof typeof confirms].question(
            shortId(deal.id, 5, 7),
          )}
        </ConfirmDialog>
      )}
    </DealPanel>
  );
}

function AmountDialog({
  deal,
  open,
  onOpenChange,
  onDone,
}: {
  deal: DealDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => Promise<unknown>;
}) {
  const id = useId();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DealAmountForm, unknown, DealAmount>({
    resolver: zodResolver(dealAmountSchema),
    defaultValues: { amount: deal.amount },
  });

  const submit = handleSubmit(async ({ amount }) => {
    try {
      await changeDealAmount(deal.id, amount);
      await onDone();
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title="Изменить сумму сделки"
      icon={<WalletIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      error={errors.root?.message}
    >
      <FormField
        htmlFor={id}
        label="Сумма к получению (RUB)"
        required
        error={errors.amount?.message}
      >
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={!!errors.amount}
          {...register("amount")}
        />
      </FormField>
    </FormDialog>
  );
}

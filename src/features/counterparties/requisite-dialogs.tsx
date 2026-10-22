import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import BankIcon from "@/assets/icons/bank.svg?react";
import CardIcon from "@/assets/icons/card.svg?react";
import DangerIcon from "@/assets/icons/danger-circle.svg?react";
import ExchangeIcon from "@/assets/icons/exchange.svg?react";
import PhoneIcon from "@/assets/icons/phone.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { errorMessage } from "@/lib/api";
import { bindRequisite, replaceRequisite } from "./api";
import { bindChannelLabels, bindTypeLabels } from "./labels";
import { RequisitePicker } from "./requisite-picker";
import {
  type BindRequisiteForm,
  bindRequisiteSchema,
  type ReplaceRequisiteForm,
  replaceRequisiteSchema,
} from "./schemas";
import type { BindChannel, BindType, BoundRequisite } from "./types";

type DialogProps = {
  counterpartyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const typeItems = Object.entries(bindTypeLabels).map(([value, label]) => ({
  value: value as BindType,
  label,
}));
const channelItems = Object.entries(bindChannelLabels).map(
  ([value, label]) => ({ value: value as BindChannel, label }),
);

function KaOnlyNote() {
  return (
    <p className="flex h-11 items-center gap-1.5 rounded-[12px] border border-orange/60 px-4 text-[13px] leading-none font-semibold tracking-[-0.02em] text-orange">
      <DangerIcon className="size-[19px] shrink-0" />
      Поиск показывает только КА реквизиты
    </p>
  );
}

function useRefresh() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["counterparties"] });
}

export function BindRequisiteDialog({
  counterpartyId,
  boundIds = [],
  open,
  onOpenChange,
}: DialogProps & {
  boundIds?: string[];
}) {
  const id = useId();
  const refresh = useRefresh();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BindRequisiteForm>({
    resolver: zodResolver(bindRequisiteSchema),
    defaultValues: { bindType: null, channel: "sbp", requisite: null },
  });

  const submit = handleSubmit(async ({ bindType, channel, requisite }) => {
    if (!bindType || !requisite) return;
    try {
      await bindRequisite(counterpartyId, {
        requisiteId: requisite.id,
        bindType,
        channel,
      });
      await refresh();
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title="Добавить реквизит"
      icon={<PlusIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      submitLabel="Добавить"
      error={errors.root?.message}
    >
      <FormField
        htmlFor={`${id}-type`}
        label="Тип привязки"
        error={errors.bindType?.message}
      >
        <Controller
          control={control}
          name="bindType"
          render={({ field }) => (
            <Select
              items={typeItems}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                id={`${id}-type`}
                className="w-full"
                aria-invalid={!!errors.bindType}
              >
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {typeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <hr className="border-border/80" />
      <FormField htmlFor={`${id}-channel`} label="Канал привязки">
        <Controller
          control={control}
          name="channel"
          render={({ field }) => (
            <Select
              items={channelItems}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger id={`${id}-channel`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channelItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <hr className="border-border/80" />
      <FormField
        htmlFor={`${id}-requisite`}
        label="КА реквизит"
        error={errors.requisite?.message}
      >
        <Controller
          control={control}
          name="requisite"
          render={({ field }) => (
            <RequisitePicker
              id={`${id}-requisite`}
              value={field.value ?? null}
              onChange={field.onChange}
              excludeIds={boundIds}
              invalid={!!errors.requisite}
              describedBy={
                errors.requisite ? `${id}-requisite-error` : undefined
              }
            />
          )}
        />
      </FormField>
      <KaOnlyNote />
    </FormDialog>
  );
}

export function ReplaceRequisiteDialog({
  counterpartyId,
  binding,
  open,
  onOpenChange,
}: DialogProps & { binding: BoundRequisite }) {
  const id = useId();
  const refresh = useRefresh();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReplaceRequisiteForm>({
    resolver: zodResolver(replaceRequisiteSchema),
    defaultValues: { requisite: null },
  });

  const submit = handleSubmit(async ({ requisite }) => {
    if (!requisite) return;
    try {
      await replaceRequisite(counterpartyId, binding.bindingId, requisite.id);
      await refresh();
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title="Заменить привязаный реквизит"
      icon={<ExchangeIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      submitLabel="Заменить"
      error={errors.root?.message}
    >
      <div className="flex flex-col gap-1.5">
        <span className="pl-4 text-[13px] leading-none font-semibold tracking-[-0.03em]">
          Текущая привязка
        </span>
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/80 bg-panel p-4 leading-none font-semibold tracking-[-0.02em]">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-[15px]">{binding.holder}</span>
            <span className="flex items-center gap-3 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {binding.kind === "card" ? (
                  <CardIcon className="size-[18px] text-foreground" />
                ) : (
                  <PhoneIcon className="size-[18px] text-foreground" />
                )}
                {binding.value}
              </span>
              <span aria-hidden className="h-3.5 w-px bg-border" />
              <span className="flex items-center gap-1.5">
                <BankIcon className="size-[18px] text-foreground" />
                {binding.bank}
              </span>
            </span>
          </div>
          <span className="shrink-0 pt-0.5 text-[13px] text-muted-foreground">
            {bindTypeLabels[binding.bindType]}
          </span>
        </div>
      </div>
      <hr className="border-border/80" />
      <FormField
        htmlFor={`${id}-requisite`}
        label="КА реквизит"
        error={errors.requisite?.message}
      >
        <Controller
          control={control}
          name="requisite"
          render={({ field }) => (
            <RequisitePicker
              id={`${id}-requisite`}
              value={field.value ?? null}
              onChange={field.onChange}
              excludeIds={[binding.id]}
              invalid={!!errors.requisite}
              describedBy={
                errors.requisite ? `${id}-requisite-error` : undefined
              }
            />
          )}
        />
      </FormField>
      <KaOnlyNote />
    </FormDialog>
  );
}

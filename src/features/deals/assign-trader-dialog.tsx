import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import UserIcon from "@/assets/icons/user.svg?react";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { UserPicker } from "@/features/users/user-picker";
import { errorMessage } from "@/lib/api";
import { assignDealTrader } from "./api";
import { type AssignTraderForm, assignTraderSchema } from "./schemas";
import type { DealDetails } from "./types";

type DialogProps = {
  deal: DealDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => Promise<unknown>;
};

export function AssignTraderDialog({
  deal,
  open,
  onOpenChange,
  onDone,
}: DialogProps) {
  const id = useId();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AssignTraderForm>({
    resolver: zodResolver(assignTraderSchema),
    defaultValues: { trader: deal.processor },
  });

  const submit = handleSubmit(async ({ trader }) => {
    if (!trader) return;
    try {
      await assignDealTrader(deal.id, trader.id);
      await onDone();
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title="Назначить трейдера"
      icon={<UserIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      submitLabel="Назначить"
      error={errors.root?.message}
    >
      <FormField htmlFor={id} label="Трейдер" error={errors.trader?.message}>
        <Controller
          control={control}
          name="trader"
          render={({ field }) => (
            <UserPicker
              id={id}
              value={field.value}
              onChange={field.onChange}
              roles={["trader", "lead_trader"]}
              placeholder="Введите ник трейдера или выберите из списка"
              withChevron
              invalid={!!errors.trader}
              describedBy={errors.trader ? `${id}-error` : undefined}
            />
          )}
        />
      </FormField>
    </FormDialog>
  );
}

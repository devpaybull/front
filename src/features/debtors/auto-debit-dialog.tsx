import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import CalendarIcon from "@/assets/icons/calendar.svg?react";
import { DateInput } from "@/components/date-input";
import { DialogTextButton, FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { errorMessage } from "@/lib/api";
import { updateDebt } from "./api";
import { type AutoDebit, type AutoDebitForm, autoDebitSchema } from "./schemas";
import type { Debt } from "./types";
import { useDebtMutation } from "./use-debt-mutation";

type DialogProps = {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AutoDebitDialog({ debt, open, onOpenChange }: DialogProps) {
  const id = useId();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AutoDebitForm, unknown, AutoDebit>({
    resolver: zodResolver(autoDebitSchema),
    defaultValues: {
      date: debt.autoDebitOn
        ? format(parseISO(debt.autoDebitOn), "dd.MM.yyyy")
        : "",
    },
  });
  const save = useDebtMutation((autoDebitOn: string | null) =>
    updateDebt(debt.id, { autoDebitOn }),
  );

  const run = async (autoDebitOn: string | null) => {
    try {
      await save.mutateAsync(autoDebitOn);
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  };

  return (
    <FormDialog
      title="Автосписание"
      icon={<CalendarIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(({ date }) => run(date))}
      submitting={isSubmitting || save.isPending}
      error={errors.root?.message}
      footerStart={
        debt.autoDebitOn && (
          <DialogTextButton disabled={save.isPending} onClick={() => run(null)}>
            Убрать автосписание
          </DialogTextButton>
        )
      }
    >
      <FormField htmlFor={id} label="Дата" error={errors.date?.message}>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DateInput
              id={id}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? `${id}-error` : undefined}
            />
          )}
        />
      </FormField>
    </FormDialog>
  );
}

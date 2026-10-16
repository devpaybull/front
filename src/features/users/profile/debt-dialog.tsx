import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import LoanIcon from "@/assets/icons/loan.svg?react";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import { lendToUser } from "../api";
import { type Debt, type DebtForm, debtSchema } from "../schemas";
import type { UserProfile } from "../types";
import { useProfileMutation } from "./use-profile-mutation";

type DialogProps = {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DebtDialog({ user, open, onOpenChange }: DialogProps) {
  const id = useId();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DebtForm, unknown, Debt>({
    resolver: zodResolver(debtSchema),
    defaultValues: { amount: "" },
  });
  const lend = useProfileMutation(user.id, (values: Debt) =>
    lendToUser(user.id, values),
  );

  const submit = handleSubmit(async (values) => {
    try {
      await lend.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title="Дать деньги в долг"
      icon={<LoanIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      error={errors.root?.message}
    >
      <FormField
        htmlFor={`${id}-amount`}
        label="Сумма долга (USDT)"
        required
        error={errors.amount?.message}
      >
        <Input
          id={`${id}-amount`}
          inputMode="decimal"
          autoComplete="off"
          placeholder="Введите сумму"
          aria-invalid={!!errors.amount}
          {...register("amount")}
        />
      </FormField>
    </FormDialog>
  );
}

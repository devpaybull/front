import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import ShieldIcon from "@/assets/icons/shield.svg?react";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import { updateMinInsurance } from "../api";
import {
  type MinInsurance,
  type MinInsuranceForm,
  minInsuranceSchema,
} from "../schemas";
import type { UserProfile } from "../types";
import { useProfileMutation } from "./use-profile-mutation";

type DialogProps = {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MinInsuranceDialog({ user, open, onOpenChange }: DialogProps) {
  const id = useId();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MinInsuranceForm, unknown, MinInsurance>({
    resolver: zodResolver(minInsuranceSchema),
    defaultValues: user.minInsuranceDeposit,
  });
  const save = useProfileMutation(user.id, (values: MinInsurance) =>
    updateMinInsurance(user.id, values),
  );

  const submit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title="Изменить минимальный страховой баланс"
      icon={<ShieldIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      error={errors.root?.message}
    >
      {(["payIn", "payOut"] as const).map((field) => (
        <FormField
          key={field}
          htmlFor={`${id}-${field}`}
          label={`Мин. страховой депозит (${field === "payIn" ? "Pay-in" : "Pay-out"})`}
          required
          error={errors[field]?.message}
        >
          <Input
            id={`${id}-${field}`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="Введите сумму в USDT"
            aria-invalid={!!errors[field]}
            {...register(field)}
          />
        </FormField>
      ))}
    </FormDialog>
  );
}

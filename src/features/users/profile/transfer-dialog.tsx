import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import ExchangeIcon from "@/assets/icons/exchange.svg?react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api";
import { formatAmount } from "@/lib/format";
import { transferBalance } from "../api";
import { type Transfer, type TransferForm, transferSchema } from "../schemas";
import type { UserProfile } from "../types";
import { UserPicker } from "../user-picker";
import { useProfileMutation } from "./use-profile-mutation";

const defaultValues: TransferForm = {
  recipient: null,
  amount: "",
  comment: "",
};

type TransferDialogProps = {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TransferDialog({
  user,
  open,
  onOpenChange,
}: TransferDialogProps) {
  const formId = useId();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TransferForm, unknown, Transfer>({
    resolver: zodResolver(transferSchema(user.balance)),
    defaultValues,
  });

  const transfer = useProfileMutation(user.id, (values: Transfer) =>
    transferBalance(user.id, values),
  );

  const submit = handleSubmit(async (values) => {
    try {
      await transfer.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  const describedBy = (field: keyof TransferForm) =>
    errors[field] ? `${formId}-${field}-error` : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <ExchangeIcon />
            Перевод баланса пользователю
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 border-b border-border/80 pb-6 leading-none font-semibold tracking-[-0.02em]">
            <div className="flex flex-col gap-2">
              <h3 className="text-[15px]">Перевод между пользователями</h3>
              <p className="text-[13px] leading-[17px] text-muted-foreground">
                Средства будут списаны с основного баланса пользователя{" "}
                <span className="text-foreground">“{user.login}”</span> и
                зачислены на основной баланс получателя
              </p>
            </div>
            <p className="flex items-center gap-3 text-[15px]">
              Баланс трейдера
              <span className="rounded-lg bg-[#1b2127] px-3.5 py-2">
                {formatAmount(user.balance, "USDT")} USDT
              </span>
            </p>
          </div>

          <form
            id={formId}
            onSubmit={submit}
            noValidate
            className="flex flex-col gap-[22px]"
          >
            <FormField
              htmlFor={`${formId}-recipient`}
              label="Получатель"
              required
              error={errors.recipient?.message}
            >
              <Controller
                control={control}
                name="recipient"
                render={({ field }) => (
                  <UserPicker
                    id={`${formId}-recipient`}
                    value={field.value}
                    onChange={field.onChange}
                    roles={["trader", "lead_trader"]}
                    excludeId={user.id}
                    placeholder="Введите логин трейдера или лида"
                    withChevron
                    invalid={!!errors.recipient}
                    describedBy={describedBy("recipient")}
                  />
                )}
              />
            </FormField>

            <FormField
              htmlFor={`${formId}-amount`}
              label="Сумма (USDT)"
              required
              error={errors.amount?.message}
            >
              <Input
                id={`${formId}-amount`}
                inputMode="decimal"
                autoComplete="off"
                placeholder="Введите сумму"
                aria-invalid={!!errors.amount}
                aria-describedby={describedBy("amount")}
                {...register("amount")}
              />
            </FormField>

            <FormField
              htmlFor={`${formId}-comment`}
              label="Комментарий"
              error={errors.comment?.message}
            >
              <Textarea
                id={`${formId}-comment`}
                placeholder="Введите комментарий"
                aria-invalid={!!errors.comment}
                aria-describedby={describedBy("comment")}
                {...register("comment")}
              />
            </FormField>

            {errors.root && (
              <p
                role="alert"
                className="text-[13px] leading-none tracking-[-0.03em] text-destructive"
              >
                {errors.root.message}
              </p>
            )}
          </form>
        </DialogBody>

        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Отменить
          </DialogClose>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            Перевести средства
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

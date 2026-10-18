import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import WalletIcon from "@/assets/icons/wallet.svg?react";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import { type TxHashForm, txHashSchema } from "@/lib/schemas";

type TxHashDialogProps = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (txHash: string) => Promise<unknown>;
};

export function TxHashDialog({
  title,
  open,
  onOpenChange,
  onConfirm,
}: TxHashDialogProps) {
  const id = useId();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TxHashForm>({
    resolver: zodResolver(txHashSchema),
    defaultValues: { txHash: "" },
  });

  const submit = handleSubmit(async ({ txHash }) => {
    try {
      await onConfirm(txHash);
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title={title}
      icon={<WalletIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      submitLabel="Проверить"
      error={errors.root?.message}
    >
      <FormField
        htmlFor={id}
        label="Хеш транзакции"
        error={errors.txHash?.message}
      >
        <Input
          id={id}
          autoComplete="off"
          spellCheck={false}
          placeholder="Вставьте хеш транзакции"
          aria-invalid={!!errors.txHash}
          aria-describedby={errors.txHash ? `${id}-error` : undefined}
          {...register("txHash")}
        />
      </FormField>
    </FormDialog>
  );
}

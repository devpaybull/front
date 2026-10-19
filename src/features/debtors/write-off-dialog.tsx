import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { useId } from "react";
import { useForm } from "react-hook-form";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg?react";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import { formatAmount } from "@/lib/format";
import { writeOffDebt } from "./api";
import { type WriteOff, type WriteOffForm, writeOffSchema } from "./schemas";
import type { Debt } from "./types";
import { useDebtMutation } from "./use-debt-mutation";

type DialogProps = {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const modes = [
  { value: "all", label: "Списать весь долг" },
  { value: "part", label: "Списать часть долга" },
] as const;

export function WriteOffDialog({ debt, open, onOpenChange }: DialogProps) {
  const id = useId();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<WriteOffForm, unknown, WriteOff>({
    resolver: zodResolver(writeOffSchema(debt.amount)),
    defaultValues: { mode: "all", amount: "" },
  });
  const mode = watch("mode");
  const writeOff = useDebtMutation((amount: string) =>
    writeOffDebt(debt.id, amount),
  );

  const submit = handleSubmit(async (values) => {
    try {
      await writeOff.mutateAsync(
        values.mode === "all" ? debt.amount : values.amount,
      );
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title="Списать долг"
      icon={<ArrowDownIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      submitLabel={modes.find((m) => m.value === mode)?.label}
      error={errors.root?.message}
    >
      <div className="flex flex-col gap-6 leading-none tracking-[-0.02em]">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-2">
            <p className="text-[15px] font-semibold">
              Вы уверены что хотите списать долг?
            </p>
            <p className="text-[13px] font-medium text-muted-foreground">
              Вы можете списать долг частями или сразу всей суммой
            </p>
          </div>
          <p className="flex items-center gap-[11px] text-[15px] font-semibold">
            Долг пользователя
            <span className="rounded-[10px] bg-[#1b2127]/80 px-3.5 py-2">
              {formatAmount(debt.amount, "USDT")} USDT
            </span>
          </p>
        </div>
        <hr className="border-border/80" />
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="sr-only">Сколько списать</legend>
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={mode === m.value}
              onClick={() => {
                setValue("mode", m.value);
                clearErrors();
              }}
              className={cn(
                "h-[37px] rounded-[12px] text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                mode === m.value
                  ? "bg-primary/10 text-primary"
                  : "bg-[#1b2127]/60 text-foreground hover:bg-[#1b2127]",
              )}
            >
              {m.label}
            </button>
          ))}
        </fieldset>
        <FormField
          htmlFor={id}
          label="Сумма к списанию"
          error={errors.amount?.message}
        >
          {mode === "all" ? (
            <Input
              key="all"
              id={id}
              readOnly
              value={formatAmount(debt.amount, "USDT")}
              className="text-foreground/40"
            />
          ) : (
            <Input
              key="part"
              id={id}
              inputMode="decimal"
              autoComplete="off"
              autoFocus
              placeholder="Введите сумму"
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? `${id}-error` : undefined}
              {...register("amount")}
            />
          )}
        </FormField>
      </div>
    </FormDialog>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { useId, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import FileArrowUpIcon from "@/assets/icons/file-arrow-up.svg?react";
import FolderOpenIcon from "@/assets/icons/folder-open.svg?react";
import GavelIcon from "@/assets/icons/gavel.svg?react";
import InfoCircleIcon from "@/assets/icons/info-circle.svg?react";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { IconTile } from "@/components/icon-tile";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import { openDealDispute } from "./api";
import { type Dispute, type DisputeForm, disputeSchema } from "./schemas";
import type { DealDetails } from "./types";

type DialogProps = {
  deal: DealDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => Promise<unknown>;
};

export function DisputeDialog({
  deal,
  open,
  onOpenChange,
  onDone,
}: DialogProps) {
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DisputeForm, unknown, Dispute>({
    resolver: zodResolver(disputeSchema),
    defaultValues: { receipt: null, amount: "" },
  });

  const submit = handleSubmit(async ({ receipt, amount }) => {
    try {
      await openDealDispute(deal.id, receipt, amount);
      await onDone();
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title="Открыть спор"
      icon={<GavelIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      submitLabel="Открыть спор"
      error={errors.root?.message}
    >
      <div className="flex flex-col gap-6 leading-none tracking-[-0.02em]">
        <div className="flex flex-col gap-2">
          <p className="text-[15px] font-semibold">Вы желаете открыть спор?</p>
          <p className="text-[13px] leading-[1.2] font-medium text-muted-foreground">
            Вы откроете спор по этой сделке, для этого нужно загрузить чек и
            указать сумму платежа
          </p>
          <p className="mt-1.5 flex items-center gap-[11px] text-[15px] font-semibold">
            Номер сделки
            <span className="min-w-0 truncate rounded-[10px] bg-[#1b2127]/80 px-3.5 py-2">
              {deal.id}
            </span>
          </p>
        </div>
        <hr className="border-border/80" />
        <Controller
          control={control}
          name="receipt"
          render={({ field }) => (
            <div className="flex flex-col gap-3.5">
              {/* biome-ignore lint/a11y/noStaticElementInteractions: the button below does the same with the keyboard */}
              <div
                tabIndex={-1}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  field.onChange(event.dataTransfer.files[0] ?? null);
                }}
                onPaste={(event) => {
                  const file = event.clipboardData.files[0];
                  if (file) field.onChange(file);
                }}
                className={cn(
                  "flex flex-col gap-4 rounded-2xl border bg-panel p-4 outline-none transition-colors",
                  dragging ? "border-primary" : "border-border/80",
                  errors.receipt && "border-destructive",
                )}
              >
                <div className="flex gap-2">
                  <IconTile tone="blue" className="size-[35px]">
                    <FileArrowUpIcon className="size-6" />
                  </IconTile>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-[15px] font-semibold text-blue">
                      {field.value ? "Чек загружен" : "Загрузите чек"}
                    </span>
                    <span className="line-clamp-2 text-[13px] leading-[1.2] font-semibold break-words">
                      {field.value
                        ? field.value.name
                        : "Перетащите чек, нажмите кнопку «Выбрать файл» или вставьте его в это поле"}
                    </span>
                  </div>
                </div>
                <p className="flex items-center gap-1.5 rounded-[12px] border border-orange/60 px-4 py-3 text-[13px] font-semibold text-orange">
                  <InfoCircleIcon className="size-[19px]" />
                  {errors.receipt?.message ??
                    "Поддерживаются PDF и изображения до 5 мб."}
                </p>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="application/pdf,image/*"
                hidden
                onChange={(event) =>
                  field.onChange(event.target.files?.[0] ?? null)
                }
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex h-11 w-fit items-center gap-[7px] rounded-[12px] border border-border bg-[#1b2127]/60 px-3 text-[15px] font-semibold outline-none transition-colors hover:bg-[#1b2127] focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FolderOpenIcon className="size-5" />
                Выбрать файл
              </button>
            </div>
          )}
        />
        <hr className="border-border/80" />
        <FormField
          htmlFor={id}
          label="Сумма платежа"
          error={errors.amount?.message}
        >
          <Input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            placeholder="Укажите сумму"
            aria-invalid={!!errors.amount}
            {...register("amount")}
          />
        </FormField>
      </div>
    </FormDialog>
  );
}

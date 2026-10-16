import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import CloseIcon from "@/assets/icons/close.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import UserIcon from "@/assets/icons/user.svg?react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { errorMessage } from "@/lib/api";
import { assignLeads } from "../api";
import { rateCurrencies } from "../currencies";
import {
  type AssignLeads,
  type AssignLeadsForm,
  assignLeadsSchema,
} from "../schemas";
import type { UserProfile } from "../types";
import { UserPicker } from "../user-picker";
import { useProfileMutation } from "./use-profile-mutation";

const currencyItems = rateCurrencies.map((c) => ({ value: c, label: c }));

const row =
  "grid grid-cols-[minmax(0,1fr)_160px_160px_160px_20px] items-end gap-x-[15px] border-b border-border/80 py-6";

type AssignLeadDialogProps = {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssignLeadDialog({
  user,
  open,
  onOpenChange,
}: AssignLeadDialogProps) {
  const formId = useId();
  const newLead: AssignLeadsForm["leads"][number] = {
    lead: null,
    currency: "RUB",
    payIn: user.rate.payIn.max,
    payOut: user.rate.payOut.max,
  };

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AssignLeadsForm, unknown, AssignLeads>({
    resolver: zodResolver(assignLeadsSchema),
    defaultValues: { leads: [newLead] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "leads" });

  const save = useProfileMutation(user.id, (values: AssignLeads) =>
    assignLeads(user.id, values),
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[913px]">
        <DialogHeader>
          <DialogTitle>
            <UserIcon />
            Назначить лид-трейдера
          </DialogTitle>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={submit}
          noValidate
          className="max-h-[60svh] overflow-y-auto px-[37px] pb-6"
        >
          {fields.map((field, index) => {
            const id = (name: string) => `${formId}-${index}-${name}`;
            const rowErrors = errors.leads?.[index];
            return (
              <div key={field.id} className={row}>
                <FormField
                  htmlFor={id("lead")}
                  label={`Лид-трейдер #${index + 1}`}
                  required
                  error={rowErrors?.lead?.message}
                >
                  <Controller
                    control={control}
                    name={`leads.${index}.lead`}
                    render={({ field: lead }) => (
                      <UserPicker
                        id={id("lead")}
                        value={lead.value}
                        onChange={lead.onChange}
                        roles={["lead_trader"]}
                        placeholder="Введите логин тим-лида"
                        invalid={!!rowErrors?.lead}
                        describedBy={
                          rowErrors?.lead ? `${id("lead")}-error` : undefined
                        }
                      />
                    )}
                  />
                </FormField>

                <FormField htmlFor={id("currency")} label="Валюта" required>
                  <Controller
                    control={control}
                    name={`leads.${index}.currency`}
                    render={({ field: currency }) => (
                      <Select
                        items={currencyItems}
                        value={currency.value}
                        onValueChange={(value) => currency.onChange(value)}
                      >
                        <SelectTrigger id={id("currency")} className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencyItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                <FormField
                  htmlFor={id("payIn")}
                  label="Ставка Pay-in"
                  required
                  error={rowErrors?.payIn?.message}
                >
                  <Input
                    id={id("payIn")}
                    inputMode="decimal"
                    autoComplete="off"
                    aria-invalid={!!rowErrors?.payIn}
                    {...register(`leads.${index}.payIn`)}
                  />
                </FormField>

                <FormField
                  htmlFor={id("payOut")}
                  label="Ставка Pay-out"
                  required
                  error={rowErrors?.payOut?.message}
                >
                  <Input
                    id={id("payOut")}
                    inputMode="decimal"
                    autoComplete="off"
                    aria-invalid={!!rowErrors?.payOut}
                    {...register(`leads.${index}.payOut`)}
                  />
                </FormField>

                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Убрать лид-трейдера #${index + 1}`}
                    className="mb-3 grid size-5 place-items-center rounded text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <CloseIcon className="size-5" />
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })}

          <Button
            type="button"
            variant="secondary"
            className="mt-6"
            onClick={() => append(newLead)}
          >
            <PlusIcon className="size-5" />
            Добавить лид-трейдера
          </Button>

          {errors.root && (
            <p
              role="alert"
              className="mt-4 text-[13px] leading-none tracking-[-0.03em] text-destructive"
            >
              {errors.root.message}
            </p>
          )}
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Отменить
          </DialogClose>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

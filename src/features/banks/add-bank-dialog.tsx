import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import PlusIcon from "@/assets/icons/plus.svg?react";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { SuggestInput } from "@/components/suggest-input";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { errorMessage } from "@/lib/api";
import { bankOptionsQuery, createBank } from "./api";
import { requisiteTypeLabels } from "./labels";
import { bankRequisiteTypes, type NewBankForm, newBankSchema } from "./schemas";

type Item = { value: string; label: string };

function MultiSelect({
  id,
  items,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  items: Item[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}) {
  return (
    <Select multiple items={items} value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue>
          {(selected: string[]) =>
            selected.length > 0 ? (
              items
                .filter((item) => selected.includes(item.value))
                .map((item) => item.label)
                .join(", ")
            ) : (
              <span className="text-foreground">{placeholder}</span>
            )
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const typeItems = bankRequisiteTypes.map((value) => ({
  value,
  label: requisiteTypeLabels[value],
}));

type DialogProps = {
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddBankDialog({ currency, open, onOpenChange }: DialogProps) {
  const id = useId();
  const client = useQueryClient();
  const { data: options } = useQuery(bankOptionsQuery());
  const currencies = (options?.currencies ?? [currency]).map((c) => ({
    value: c,
    label: c,
  }));
  const {
    control,
    register,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewBankForm>({
    resolver: zodResolver(newBankSchema),
    defaultValues: {
      id: "",
      name: "",
      country: "",
      currency,
      crossBorderCurrencies: [],
      requisiteTypes: [],
      askHolderName: false,
    },
  });
  const main = watch("currency");

  const submit = handleSubmit(async (form) => {
    try {
      await createBank(form);
      await client.invalidateQueries({ queryKey: ["banks"] });
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  const field = (name: keyof NewBankForm) => ({
    "aria-invalid": !!errors[name] || undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });

  return (
    <FormDialog
      title="Добавить новый банк"
      icon={<PlusIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      submitLabel="Добавить"
      error={errors.root?.message}
    >
      <FormField
        htmlFor={`${id}-id`}
        label="Идентификатор"
        required
        error={errors.id?.message}
      >
        <Input
          id={`${id}-id`}
          autoComplete="off"
          placeholder="Например, sberbank"
          {...field("id")}
          {...register("id")}
        />
      </FormField>
      <hr className="border-border/80" />
      <FormField
        htmlFor={`${id}-name`}
        label="Название"
        required
        error={errors.name?.message}
      >
        <Input
          id={`${id}-name`}
          autoComplete="off"
          placeholder="Введите название банка"
          {...field("name")}
          {...register("name")}
        />
      </FormField>
      <hr className="border-border/80" />
      <FormField htmlFor={`${id}-country`} label="Страна">
        <Controller
          control={control}
          name="country"
          render={({ field: country }) => (
            <SuggestInput
              id={`${id}-country`}
              value={country.value}
              onChange={country.onChange}
              suggestions={options?.countries ?? []}
              placeholder="Введите или выбирите страну"
            />
          )}
        />
      </FormField>
      <hr className="border-border/80" />
      <FormField
        htmlFor={`${id}-currency`}
        label="Основная валюта"
        required
        error={errors.currency?.message}
      >
        <Controller
          control={control}
          name="currency"
          render={({ field: value }) => (
            <Select
              items={currencies}
              value={value.value}
              onValueChange={(next) => next && value.onChange(next)}
            >
              <SelectTrigger id={`${id}-currency`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((item) => (
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
      <FormField htmlFor={`${id}-cross`} label="Трансгран валюты">
        <Controller
          control={control}
          name="crossBorderCurrencies"
          render={({ field: value }) => (
            <MultiSelect
              id={`${id}-cross`}
              items={currencies.filter((c) => c.value !== main)}
              value={value.value}
              onChange={value.onChange}
              placeholder="Выбирите вариант"
            />
          )}
        />
      </FormField>
      <hr className="border-border/80" />
      <FormField htmlFor={`${id}-types`} label="Типы реквизитов">
        <Controller
          control={control}
          name="requisiteTypes"
          render={({ field: value }) => (
            <MultiSelect
              id={`${id}-types`}
              items={typeItems}
              value={value.value}
              onChange={(next) =>
                value.onChange(next as NewBankForm["requisiteTypes"])
              }
              placeholder="Выбрать тип"
            />
          )}
        />
      </FormField>
      <hr className="border-border/80" />
      <Controller
        control={control}
        name="askHolderName"
        render={({ field: value }) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: the Switch inside is the control
          <label className="flex items-center gap-3.5 text-[15px] leading-none font-semibold tracking-[-0.02em]">
            <Switch
              size="sm"
              checked={value.value}
              onCheckedChange={value.onChange}
            />
            Запрашивать фамилию и имя владельца
          </label>
        )}
      />
    </FormDialog>
  );
}

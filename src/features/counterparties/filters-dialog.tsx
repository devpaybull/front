import { useQuery } from "@tanstack/react-query";
import { Fragment, useId, useState } from "react";
import FiltersIcon from "@/assets/icons/filters.svg?react";
import { FilterSelect } from "@/components/filter-select";
import { FiltersTriggerBox } from "@/components/filters/filters-trigger";
import { DialogTextButton } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { SuggestInput } from "@/components/suggest-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { counterpartyFilterOptionsQuery } from "./api";
import type { CounterpartyFilters } from "./schemas";

type RangeKey = keyof Pick<
  CounterpartyFilters,
  | "vol30From"
  | "vol30To"
  | "vol60From"
  | "vol60To"
  | "vol90From"
  | "vol90To"
  | "allFrom"
  | "allTo"
  | "paid30From"
  | "paid30To"
  | "requests30From"
  | "requests30To"
>;

const ranges: [string, RangeKey, RangeKey][] = [
  ["Volume 30", "vol30From", "vol30To"],
  ["Volume 60", "vol60From", "vol60To"],
  ["Volume 90", "vol90From", "vol90To"],
  ["All time", "allFrom", "allTo"],
  ["Оплат 30 д.", "paid30From", "paid30To"],
  ["Запросов 30 д.", "requests30From", "requests30To"],
];

const selects: {
  key: "status" | "blacklisted" | "autoEnableBlocked" | "bound";
  label: string;
  allLabel: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "status",
    label: "Статус",
    allLabel: "Все статусы",
    options: [
      { value: "active", label: "Включен" },
      { value: "disabled", label: "Выключен" },
    ],
  },
  {
    key: "blacklisted",
    label: "Блеклист",
    allLabel: "Все",
    options: [
      { value: "yes", label: "В блеклисте" },
      { value: "no", label: "Не в блеклисте" },
    ],
  },
  {
    key: "autoEnableBlocked",
    label: "Запрет авто-включения",
    allLabel: "Все",
    options: [
      { value: "yes", label: "Запрещено" },
      { value: "no", label: "Разрешено" },
    ],
  },
  {
    key: "bound",
    label: "Привязка к реквизиту",
    allLabel: "Все",
    options: [
      { value: "yes", label: "Привязан" },
      { value: "no", label: "Не привязан" },
    ],
  },
];

const cleared = (filters: CounterpartyFilters) =>
  Object.fromEntries(
    Object.keys(filters).map((key) => [key, undefined]),
  ) as CounterpartyFilters;

export const countFilters = (filters: CounterpartyFilters) =>
  Object.values(filters).filter((v) => v !== undefined).length;

type FiltersDialogProps = {
  value: CounterpartyFilters;
  onApply: (next: CounterpartyFilters) => void;
};

export function CounterpartyFiltersDialog({
  value,
  onApply,
}: FiltersDialogProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const change = (patch: Partial<CounterpartyFilters>) =>
    setDraft((current) => ({ ...current, ...patch }));
  const options = useQuery({
    ...counterpartyFilterOptionsQuery(),
    enabled: open,
  });
  const text = (v: string) => (v.trim() ? v : undefined);
  const active = countFilters(value);
  const clearAll = cleared(value);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(value);
        setOpen(next);
      }}
    >
      <FiltersTriggerBox
        label="Фильтры"
        icon={<FiltersIcon className="size-5" />}
        activeCount={active}
        onClear={() => onApply(clearAll)}
        trigger={(props) => <DialogTrigger {...props} />}
      />
      <DialogContent className="flex max-h-[calc(100svh-4rem)] flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            <FiltersIcon />
            {countFilters(draft) > 0
              ? `Фильтр (${countFilters(draft)})`
              : "Фильтр"}
          </DialogTitle>
        </DialogHeader>

        <form
          id={id}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onApply({ ...clearAll, ...draft });
            setOpen(false);
          }}
          className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-[37px] pt-6 pb-[23px]"
        >
          <FormField htmlFor={`${id}-trader`} label="Поиск по трейдеру">
            <SuggestInput
              id={`${id}-trader`}
              value={draft.trader ?? ""}
              onChange={(v) => change({ trader: text(v) })}
              suggestions={options.data?.traders ?? []}
              placeholder="Введите логин трейдера"
            />
          </FormField>
          <hr className="border-border/80" />
          <FormField htmlFor={`${id}-merchant`} label="Поиск по мерчантам">
            <SuggestInput
              id={`${id}-merchant`}
              value={draft.merchant ?? ""}
              onChange={(v) => change({ merchant: text(v) })}
              suggestions={options.data?.merchants ?? []}
              placeholder="Введите логин мерчанта"
            />
          </FormField>
          <hr className="border-border/80" />
          <FormField htmlFor={`${id}-requisite`} label="Поиск по реквизитам">
            <Input
              id={`${id}-requisite`}
              autoComplete="off"
              value={draft.requisite ?? ""}
              onChange={(e) => change({ requisite: text(e.target.value) })}
              placeholder="Введите реквизит"
            />
          </FormField>
          {selects.map((select) => (
            <Fragment key={select.key}>
              <hr className="border-border/80" />
              <FormField htmlFor={`${id}-${select.key}`} label={select.label}>
                <FilterSelect
                  id={`${id}-${select.key}`}
                  allLabel={select.allLabel}
                  options={select.options}
                  value={draft[select.key]}
                  onChange={(v) =>
                    change({ [select.key]: v } as Partial<CounterpartyFilters>)
                  }
                />
              </FormField>
            </Fragment>
          ))}
          {ranges.map(([label, from, to]) => (
            <Fragment key={label}>
              <hr className="border-border/80" />
              <div className="grid grid-cols-2 gap-[18px]">
                {(
                  [
                    [from, "от"],
                    [to, "до"],
                  ] as const
                ).map(([key, side]) => (
                  <FormField
                    key={key}
                    htmlFor={`${id}-${key}`}
                    label={`${label} ${side}`}
                  >
                    <Input
                      id={`${id}-${key}`}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="Укажите значение"
                      value={draft[key] ?? ""}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        change({ [key]: digits ? Number(digits) : undefined });
                      }}
                    />
                  </FormField>
                ))}
              </div>
            </Fragment>
          ))}
        </form>

        <DialogFooter className="shrink-0 items-center">
          <div className="mr-auto">
            <DialogTextButton onClick={() => setDraft(cleared(draft))}>
              Сбросить все фильтры
            </DialogTextButton>
          </div>
          <DialogClose render={<Button variant="secondary" />}>
            Отменить
          </DialogClose>
          <Button type="submit" form={id}>
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

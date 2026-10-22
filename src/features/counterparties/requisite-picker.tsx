import { Combobox } from "@base-ui/react/combobox";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg?react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { counterpartyRequisitesQuery } from "./api";
import type { CounterpartyRequisite } from "./types";

type RequisitePickerProps = {
  id?: string;
  value: CounterpartyRequisite | null;
  onChange: (requisite: CounterpartyRequisite | null) => void;
  excludeIds?: string[];
  invalid?: boolean;
  describedBy?: string;
};

const labelOf = (r: CounterpartyRequisite) => `${r.value} · ${r.holder}`;

export function RequisitePicker({
  id,
  value,
  onChange,
  excludeIds = [],
  invalid,
  describedBy,
}: RequisitePickerProps) {
  const [text, setText] = useState("");
  const q = useDebouncedValue(text.trim(), 200);
  const { data, isFetching } = useQuery(counterpartyRequisitesQuery(q));
  const found = (data ?? []).filter((r) => !excludeIds.includes(r.id));

  return (
    <Combobox.Root
      items={found}
      value={value}
      onValueChange={onChange}
      onInputValueChange={setText}
      itemToStringLabel={labelOf}
      isItemEqualToValue={(a, b) => a.id === b.id}
      filter={null}
    >
      <div className="relative">
        <Combobox.Input
          id={id}
          placeholder="Введите номер карты, СБП или ФИО"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="h-11 w-full min-w-0 rounded-xl border border-input bg-card pr-10 pl-3 text-[15px] font-semibold tracking-[-0.03em] transition-colors outline-none placeholder:text-foreground/40 focus-visible:border-ring aria-invalid:border-destructive data-popup-open:border-ring"
        />
        <Combobox.Trigger
          aria-label="Показать список"
          className="group absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground outline-none"
        >
          <ChevronDownIcon className="size-5 transition-transform group-data-popup-open:rotate-180" />
        </Combobox.Trigger>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} className="isolate z-50">
          <Combobox.Popup className="max-h-[min(var(--available-height),280px)] w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-xl bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0">
            <Combobox.Empty className="px-3 py-2.5 text-[15px] leading-none font-medium tracking-[-0.02em] text-muted-foreground empty:hidden">
              {isFetching ? "Ищем…" : "Ничего не нашлось"}
            </Combobox.Empty>
            <Combobox.List>
              {(r: CounterpartyRequisite) => (
                <Combobox.Item
                  key={r.id}
                  value={r}
                  className="flex cursor-default flex-col gap-1.5 rounded-lg px-3 py-2.5 leading-none tracking-[-0.02em] outline-none select-none data-highlighted:bg-accent"
                >
                  <span className="text-[15px] font-medium">
                    {r.value} · {r.bank}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {r.holder} · {r.trader.login}
                  </span>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

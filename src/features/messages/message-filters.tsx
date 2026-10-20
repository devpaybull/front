import { useQuery } from "@tanstack/react-query";
import {
  AutocompleteFilterField,
  PeriodFilterField,
  SelectFilterField,
  TextFilterField,
} from "@/components/filters/filter-fields";
import { FiltersPopover } from "@/components/filters/filters-popover";
import { messageFilterOptionsQuery } from "./api";
import type { MessageFilters } from "./schemas";

export function MessageFiltersPopover({
  value,
  onApply,
}: {
  value: MessageFilters;
  onApply: (next: MessageFilters) => void;
}) {
  const { data: options } = useQuery(messageFilterOptionsQuery());

  return (
    <FiltersPopover value={value} empty={{}} onApply={onApply} width={445}>
      {(draft, change) => (
        <>
          <PeriodFilterField
            value={draft}
            onChange={({ from, to }) => change({ from, to })}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <AutocompleteFilterField
              label="Трейдер"
              placeholder="Логин трейдера"
              suggestions={options?.traders ?? []}
              value={draft.trader}
              onChange={(trader) => change({ trader })}
            />
            <TextFilterField
              label="Устройство"
              placeholder="Название устройства"
              value={draft.device}
              onChange={(device) => change({ device })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <AutocompleteFilterField
              label="Отправитель"
              placeholder="Например, SBER"
              suggestions={options?.senders ?? []}
              value={draft.sender}
              onChange={(sender) => change({ sender })}
            />
            <SelectFilterField
              label="Неизвестные отправители"
              allLabel="Показывать"
              options={[{ value: "hide", label: "Скрывать" }]}
              value={draft.hideUnknown ? "hide" : undefined}
              onChange={(hide) =>
                change({ hideUnknown: hide ? true : undefined })
              }
            />
          </div>
          <TextFilterField
            label="ID сделки"
            placeholder="UUID сделки"
            value={draft.deal}
            onChange={(deal) => change({ deal })}
          />
        </>
      )}
    </FiltersPopover>
  );
}

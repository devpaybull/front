import { useQuery } from "@tanstack/react-query";
import {
  AutocompleteFilterField,
  PeriodFilterField,
  SelectFilterField,
  TextFilterField,
} from "@/components/filters/filter-fields";
import { dealFilterOptionsQuery } from "./api";
import { dealStatuses } from "./deal-cells";
import { type DealFilters, dealStatusValues } from "./schemas";

const statusOptions = dealStatusValues.map((status) => ({
  value: status,
  label: dealStatuses[status].label,
}));

export function DealFilterFields({
  draft,
  change,
}: {
  draft: DealFilters;
  change: (patch: Partial<DealFilters>) => void;
}) {
  const { data: options } = useQuery(dealFilterOptionsQuery());
  const amount = (value: number | undefined) => value?.toString();
  const toNumber = (value: string | undefined) =>
    value ? Number(value) : undefined;

  return (
    <>
      <PeriodFilterField
        value={draft}
        onChange={({ from, to }) => change({ from, to })}
      />
      <div className="grid grid-cols-2 gap-2.5">
        <TextFilterField
          numeric
          label="Сумма от"
          placeholder="От"
          value={amount(draft.amountFrom)}
          onChange={(value) => change({ amountFrom: toNumber(value) })}
        />
        <TextFilterField
          numeric
          label="Сумма до"
          placeholder="До"
          value={amount(draft.amountTo)}
          onChange={(value) => change({ amountTo: toNumber(value) })}
        />
      </div>
      <SelectFilterField
        label="Статус"
        allLabel="Все статусы"
        options={statusOptions}
        value={draft.status}
        onChange={(status) =>
          change({ status: status as DealFilters["status"] })
        }
      />
      <div className="grid grid-cols-2 gap-2.5">
        <AutocompleteFilterField
          label="Трейдер"
          placeholder="Логин трейдера"
          suggestions={options?.traders ?? []}
          value={draft.trader}
          onChange={(trader) => change({ trader })}
        />
        <AutocompleteFilterField
          label="Каскад"
          placeholder="Имя или ID"
          suggestions={options?.cascades ?? []}
          value={draft.cascade}
          onChange={(cascade) => change({ cascade })}
        />
      </div>
      <AutocompleteFilterField
        label="Группа мерчантов"
        placeholder="Введите или выберите группу"
        suggestions={options?.merchantGroups ?? []}
        value={draft.merchantGroup}
        onChange={(merchantGroup) => change({ merchantGroup })}
      />
      <TextFilterField
        label="Контрагент"
        placeholder="ID контрагента или ID платильщика"
        value={draft.counterparty}
        onChange={(counterparty) => change({ counterparty })}
      />
      <TextFilterField
        label="Реквизит"
        placeholder="Введите реквизиты"
        value={draft.requisite}
        onChange={(requisite) => change({ requisite })}
      />
    </>
  );
}

import { useQuery } from "@tanstack/react-query";
import {
  PeriodFilterField,
  RangeFilterField,
  SelectFilterField,
} from "@/components/filters/filter-fields";
import { FiltersPopover } from "@/components/filters/filters-popover";
import { SortHeader } from "@/components/table/sort-header";
import { DealCells, dealColumns } from "@/features/deals/deal-cells";
import type { Deal } from "@/features/deals/types";
import { userDealsQuery, usersQuery } from "../../api";
import { paymentMethodLabels } from "../../payment-methods";
import type { DealSortField, DealsSearch } from "../../schemas";
import { rateBanks } from "../rates/banks";
import { TabRow, TabTable, tableState } from "./tab-table";
import { TabToolbar } from "./tab-toolbar";

const columns = dealColumns;

const methodOptions = Object.entries(paymentMethodLabels).map(
  ([value, label]) => ({ value, label }),
);
const directionOptions = [
  { value: "in", label: "Вход (pay-in)" },
  { value: "out", label: "Выход (pay-out)" },
];
const bankOptions = rateBanks.map((bank) => ({ value: bank, label: bank }));

export function DealsTab({
  userId,
  search,
  onSearch,
}: {
  userId: string;
  search: DealsSearch;
  onSearch: (next: DealsSearch) => void;
}) {
  const query = useQuery(userDealsQuery(userId, search));
  const { sort, order, ...filters } = search;
  const filtered = Object.values(filters).some((v) => v !== undefined);

  const sortHeader = (field: DealSortField, label: string) => (
    <SortHeader
      label={label}
      active={sort === field}
      ascending={order === "asc"}
      onClick={() =>
        onSearch({
          ...search,
          ...(sort === field
            ? { order: order === "asc" ? "desc" : "asc" }
            : { sort: field, order: "asc" }),
        })
      }
    />
  );

  return (
    <>
      <TabToolbar>
        <DealFilters search={search} onSearch={onSearch} />
      </TabToolbar>
      <TabTable
        columns={columns}
        minWidth={1617}
        state={tableState(query)}
        emptyText={filtered ? "Ничего не нашлось" : "Сделок пока не было"}
        header={
          <>
            {sortHeader("createdAt", "Дата / №")}
            <span>Срок / Статус</span>
            {sortHeader("amount", "Сумма")}
            <span>Обработчик</span>
            <span>Telegram</span>
            {sortHeader("merchant", "Мерчант")}
            <span>Реквизит / Контрагент</span>
          </>
        }
      >
        {query.data?.map((deal) => (
          <DealRow key={deal.id} deal={deal} />
        ))}
      </TabTable>
    </>
  );
}

function DealRow({ deal }: { deal: Deal }) {
  return (
    <TabRow columns={columns}>
      <DealCells deal={deal} />
    </TabRow>
  );
}

function DealFilters({
  search,
  onSearch,
}: {
  search: DealsSearch;
  onSearch: (next: DealsSearch) => void;
}) {
  const merchantUsers = useQuery(usersQuery({ role: "merchant" }));
  const merchantOptions =
    merchantUsers.data?.items.flatMap((user) =>
      user.merchant
        ? [{ value: user.merchant.id, label: user.merchant.name }]
        : [],
    ) ?? [];

  return (
    <FiltersPopover
      value={search}
      empty={{ sort: search.sort, order: search.order }}
      onApply={onSearch}
    >
      {(draft, change) => (
        <>
          <PeriodFilterField
            value={draft}
            onChange={({ from, to }) => change({ from, to })}
          />
          <SelectFilterField
            label="Направление (вход/выход)"
            allLabel="Все направления"
            options={directionOptions}
            value={draft.direction}
            onChange={(direction) =>
              change({ direction: direction as DealsSearch["direction"] })
            }
          />
          <SelectFilterField
            label="Метод"
            allLabel="Все методы"
            options={methodOptions}
            value={draft.method}
            onChange={(method) => change({ method })}
          />
          <SelectFilterField
            label="Банк"
            allLabel="Все банки"
            options={bankOptions}
            value={draft.bank}
            onChange={(bank) => change({ bank })}
          />
          <SelectFilterField
            label="Мерчант"
            allLabel="Все мерчанты"
            options={merchantOptions}
            value={draft.merchant}
            onChange={(merchant) => change({ merchant })}
          />
          <RangeFilterField
            label="Размер чека (от - до)"
            value={{
              from: draft.amountFrom?.toString(),
              to: draft.amountTo?.toString(),
            }}
            onChange={({ from, to }) =>
              change({
                amountFrom: from ? Number(from) : undefined,
                amountTo: to ? Number(to) : undefined,
              })
            }
          />
        </>
      )}
    </FiltersPopover>
  );
}

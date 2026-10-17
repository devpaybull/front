import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg?react";
import EditIcon from "@/assets/icons/edit.svg?react";
import { LetterAvatar } from "@/components/letter-avatar";
import { TwoLines } from "@/components/table/two-lines";
import { formatRate } from "@/lib/format";
import { userReferralsQuery } from "../../api";
import { TabRow, TabTable, tableState } from "./tab-table";

const columns = "grid grid-cols-[502px_543px_minmax(0,1fr)]";

export function ReferralTab({ userId }: { userId: string }) {
  const query = useQuery(userReferralsQuery(userId));

  return (
    <TabTable
      columns={columns}
      state={tableState(query)}
      emptyText="Рефералов нет"
      header={
        <>
          <span>ID</span>
          <span>Логин</span>
          <span>Ставка лида с трейдера</span>
        </>
      }
    >
      {query.data?.map((row) => (
        <TabRow key={row.id} columns={columns}>
          <span className="truncate pr-6">{row.id}</span>
          <Link
            to="/admin/users/$userId"
            params={{ userId: row.id }}
            className="flex w-fit items-center gap-2.5 outline-none transition-colors hover:text-primary focus-visible:text-primary"
          >
            <LetterAvatar name={row.login} className="rounded-[8px]" />
            {row.login}
          </Link>
          <div className="flex items-center gap-3">
            <TwoLines main={formatRate(row.rate)} sub={row.currency} />
            <ChevronDownIcon className="size-4 text-foreground/60" />
            <button
              type="button"
              aria-label={`Изменить ставку лида с ${row.login}`}
              className="grid size-[31px] place-items-center rounded-[8px] bg-[#1b2127]/60 text-foreground/60 outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              <EditIcon className="size-[15px]" />
            </button>
          </div>
        </TabRow>
      ))}
    </TabTable>
  );
}

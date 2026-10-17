import { useQuery } from "@tanstack/react-query";
import { TwoLines } from "@/components/table/two-lines";
import { formatDate, formatTime } from "@/lib/dates";
import { userFingerprintsQuery } from "../../api";
import { TabRow, TabTable, tableState } from "./tab-table";

const columns =
  "grid grid-cols-[157px_144px_257px_440px_190px_210px_minmax(0,1fr)] gap-x-0";

const middle = (value: string) =>
  value.length > 24 ? `${value.slice(0, 14)}....${value.slice(-7)}` : value;

const DateTime = ({ iso }: { iso: string }) => (
  <TwoLines main={formatDate(iso)} sub={formatTime(iso)} />
);

export function VerificationTab({ userId }: { userId: string }) {
  const query = useQuery(userFingerprintsQuery(userId));

  return (
    <TabTable
      columns={columns}
      state={tableState(query)}
      emptyText="Входов пока не было"
      header={
        <>
          <span>IP</span>
          <span>Страна</span>
          <span>Fingerprint</span>
          <span>User agent</span>
          <span>Первый вход</span>
          <span>Последний вход</span>
          <span>Встречалось</span>
        </>
      }
    >
      {query.data?.map((row) => (
        <TabRow key={row.id} columns={columns}>
          <span>{row.ip}</span>
          <span>{row.country}</span>
          <span title={row.fingerprint}>{middle(row.fingerprint)}</span>
          <span className="truncate pr-6" title={row.userAgent}>
            {row.userAgent}
          </span>
          <DateTime iso={row.firstSeen} />
          <DateTime iso={row.lastSeen} />
          <span className="flex h-[31px] w-fit items-center gap-1.5 rounded-[10px] bg-blue/10 px-3.5 text-blue">
            <span aria-hidden className="size-[7px] rounded-[2px] bg-blue" />
            {row.seen}
          </span>
        </TabRow>
      ))}
    </TabTable>
  );
}

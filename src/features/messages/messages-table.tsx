import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import PhoneIcon from "@/assets/icons/phone.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import telegramUrl from "@/assets/icons/telegram.svg";
import { type CountTab, CountTabs } from "@/components/count-tabs";
import { LetterAvatar } from "@/components/letter-avatar";
import { StatusBadge } from "@/components/status-badge";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { TwoLines } from "@/components/table/two-lines";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/dates";
import { formatNumber, shortId } from "@/lib/format";
import { messagesQuery } from "./api";
import { messageTypeMeta } from "./message-type";
import {
  type MessageSortField,
  type MessagesSearch,
  messageTypes,
} from "./schemas";
import type { Message, MessageList, MessageType } from "./types";

const columns =
  "grid grid-cols-[115px_142px_180px_160px_169px_429px_196px_minmax(0,1fr)] items-center";

const typeTabs = (
  counts: MessageList["counts"] | undefined,
): CountTab<MessageType>[] => [
  { value: undefined, label: "Все", count: counts?.all },
  ...messageTypes.map((type) => ({
    value: type,
    label: messageTypeMeta[type].label,
    count: counts?.[type],
  })),
];

type MessagesTableProps = {
  search: MessagesSearch;
  onChange: (patch: Partial<MessagesSearch>) => void;
};

export function MessagesTable({ search, onChange }: MessagesTableProps) {
  const { data, isPending, isError, refetch } = useQuery(messagesQuery(search));
  const { q, type, sort, order, ...filters } = search;
  const filtered = Boolean(q) || Object.values(filters).some(Boolean);

  const sortHeader = (field: MessageSortField, label: string) => (
    <SortHeader
      label={label}
      active={sort === field}
      ascending={order === "asc"}
      onClick={() =>
        onChange(
          sort === field
            ? { order: order === "asc" ? "desc" : "asc" }
            : { sort: field, order: "asc" },
        )
      }
    />
  );

  return (
    <section className="rounded-2xl border border-border/80 bg-panel">
      <div className="px-4 pt-4">
        <CountTabs
          label="Тип сообщения"
          tabs={typeTabs(data?.counts)}
          value={type}
          onChange={(next) => onChange({ type: next })}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1615px] text-[15px] leading-none font-semibold tracking-[-0.02em]">
          <div
            className={cn(
              columns,
              "border-b border-border/80 px-7 pt-[30px] pb-4",
            )}
          >
            {sortHeader("number", "ID")}
            {sortHeader("createdAt", "Дата")}
            <span>Трейдер</span>
            {sortHeader("sender", "Отправитель")}
            <span>Тип</span>
            <span>Сообщение</span>
            <span>Сделка</span>
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить сообщения
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : data.items.length === 0 ? (
            <TableMessage>
              {filtered || type ? "Ничего не найдено" : "Сообщений пока нет"}
            </TableMessage>
          ) : (
            <ul>
              {data.items.map((message) => (
                <MessageRow key={message.id} message={message} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function MessageRow({ message: m }: { message: Message }) {
  const type = messageTypeMeta[m.type];

  return (
    <li
      className={cn(
        columns,
        "border-b border-border/80 px-7 py-4 last:border-b-0",
      )}
    >
      <span>№{m.number}</span>
      <TwoLines
        main={formatDate(m.createdAt)}
        sub={`(${formatTime(m.createdAt)})`}
      />
      <div className="flex min-w-0 items-center gap-2">
        <LetterAvatar name={m.trader.login} className="rounded-[8px]" />
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            to="/admin/users/$userId"
            params={{ userId: m.trader.id }}
            className="w-fit truncate outline-none transition-colors hover:text-primary focus-visible:text-primary"
          >
            {m.trader.login}
          </Link>
          {m.trader.telegram && (
            <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <img src={telegramUrl} alt="" className="size-3.5" />
              {m.trader.telegram}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span>{m.sender.name}</span>
        <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <PhoneIcon className="size-[18px]" />
          {m.sender.address}
        </span>
      </div>
      <StatusBadge tone={type.tone}>{type.label}</StatusBadge>
      <p
        title={m.text}
        className="line-clamp-2 max-w-[284px] leading-[1.2] text-muted-foreground"
      >
        {m.text}
      </p>
      {m.deal ? (
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "flex items-center gap-[5px]",
              m.deal.confirmed ? "text-green" : "text-destructive",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-2.5 rounded-[2px]",
                m.deal.confirmed ? "bg-green" : "bg-destructive",
              )}
            />
            {m.deal.confirmed ? "Подтверждена" : "Не подтверждена"}
          </span>
          <span title={m.deal.id} className="text-[13px]">
            {shortId(m.deal.id, 6, 7)}
          </span>
          <span className="text-[13px] text-muted-foreground">
            {formatNumber(m.deal.amount, "auto")} RUB
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground">Нет сделки</span>
      )}
      <Button
        variant="secondary"
        disabled
        title="Пока не готово: нет макета"
        className="h-[35px] gap-[7px] justify-self-end rounded-[12px] border-border px-3"
      >
        <PlusIcon className="size-5" />
        Создать паттерн
      </Button>
    </li>
  );
}

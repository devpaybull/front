import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import BuyoutsIcon from "@/assets/icons/buyouts.svg?react";
import ExchangeIcon from "@/assets/icons/exchange.svg?react";
import InventoryIcon from "@/assets/icons/inventory.svg?react";
import LayerGroupIcon from "@/assets/icons/layer-group.svg?react";
import LinkIcon from "@/assets/icons/link.svg?react";
import LinkSlashIcon from "@/assets/icons/link-slash.svg?react";
import UserIcon from "@/assets/icons/user.svg?react";
import WalletIcon from "@/assets/icons/wallet.svg?react";
import { CountTabs } from "@/components/count-tabs";
import { IconTile, type IconTileTone } from "@/components/icon-tile";
import { Panel } from "@/components/panel";
import { TableMessage } from "@/components/table/table-message";
import { formatDate, formatTime } from "@/lib/dates";
import { formatAmount } from "@/lib/format";
import { counterpartyEventsQuery } from "./api";
import { maskedValue } from "./labels";
import type {
  CounterpartyEvent,
  CounterpartyEventKind,
  CounterpartyEventTab,
} from "./types";

const kinds: Record<
  CounterpartyEventKind,
  { label: string; tone: IconTileTone; icon: ReactNode }
> = {
  dealByRequisite: {
    label: "Сделка по привязанным реквизитам",
    tone: "blue",
    icon: <LayerGroupIcon />,
  },
  dealRequest: {
    label: "Запрос на создание сделки",
    tone: "orange",
    icon: <BuyoutsIcon />,
  },
  dealPaid: { label: "Сделка оплачена", tone: "green", icon: <WalletIcon /> },
  requisiteBound: {
    label: "Реквизит привязан вручную",
    tone: "blue",
    icon: <LinkIcon />,
  },
  requisiteUnbound: {
    label: "Реквизит отвязан",
    tone: "orange",
    icon: <LinkSlashIcon />,
  },
};

const chip =
  "flex h-[34px] items-center gap-1.5 rounded-[10px] bg-[#1b2127]/60 px-3.5 text-foreground/60 [&_svg]:size-[18px] [&_svg]:text-foreground";

function EventRow({ event: e }: { event: CounterpartyEvent }) {
  const kind = kinds[e.kind];
  return (
    <li className="flex min-h-[66px] items-center justify-between gap-6 border-b border-border/80 px-7 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-5">
        <IconTile tone={kind.tone}>{kind.icon}</IconTile>
        <span className="w-[111px] shrink-0 text-[13px] text-muted-foreground">
          {formatDate(e.at)} ({formatTime(e.at)})
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span>{kind.label}</span>
          {e.kind === "dealRequest" && e.method && (
            <span className="text-[13px] text-muted-foreground">
              метод {e.method}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-[60px]">
        <div className="flex gap-3">
          {e.trader && (
            <Link
              to="/admin/users/$userId"
              params={{ userId: e.trader.id }}
              className={`${chip} outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring`}
            >
              <UserIcon />
              {e.trader.login}
            </Link>
          )}
          {e.requisite && (
            <span className={chip}>
              <InventoryIcon />
              {e.requisite.bank}: {maskedValue(e.requisite.value)}
            </span>
          )}
          {e.dealId && (
            <Link
              to="/admin/deals/$dealId"
              params={{ dealId: e.dealId }}
              title={e.dealId}
              className={`${chip} outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring`}
            >
              <ExchangeIcon />
              {e.dealId.slice(0, 10)}...
            </Link>
          )}
        </div>
        {e.amount && (
          <span className="min-w-[87px] text-right text-[19px]">
            {formatAmount(e.amount, "RUB").replace(/,00$/, "")} ₽
          </span>
        )}
      </div>
    </li>
  );
}

export function CounterpartyEvents({ id }: { id: string }) {
  const [tab, setTab] = useState<CounterpartyEventTab>("deals");
  const { data, isPending, isError } = useQuery(
    counterpartyEventsQuery(id, tab),
  );

  return (
    <Panel className="text-[15px] leading-none font-semibold tracking-[-0.02em]">
      <div className="border-b border-border/80 p-4 pb-[30px]">
        <CountTabs
          label="События"
          tabs={[
            {
              value: "deals",
              label: "События по сделкам",
              count: data?.counts.deals,
            },
            {
              value: "requisites",
              label: "События по реквизитам",
              count: data?.counts.requisites,
            },
          ]}
          value={tab}
          onChange={(next) => next && setTab(next)}
        />
      </div>
      {isPending ? (
        <TableMessage>Загрузка…</TableMessage>
      ) : isError ? (
        <TableMessage>Не удалось загрузить события</TableMessage>
      ) : data.items.length === 0 ? (
        <TableMessage>Событий пока нет</TableMessage>
      ) : (
        <ul>
          {data.items.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

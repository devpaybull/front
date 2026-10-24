import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { differenceInMinutes, format, isToday, parseISO } from "date-fns";
import type { ReactNode } from "react";
import ActivityFeedIcon from "@/assets/icons/activity-feed.svg?react";
import TimeCircleIcon from "@/assets/icons/time-circle.svg?react";
import { Panel } from "@/components/panel";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { shortId } from "@/lib/format";
import { accountActivityQuery } from "./api";
import type { AccountActivity } from "./types";

function when(iso: string) {
  const at = parseISO(iso);
  const minutes = differenceInMinutes(new Date(), at);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  if (isToday(at)) return `Сегодня в ${format(at, "HH:mm")}`;
  return format(at, "dd.MM.yyyy (HH:mm)");
}

const link =
  "text-blue outline-none transition-colors hover:text-primary focus-visible:text-primary";

function InviteCode({ code }: { code: string }) {
  const [copied, copy] = useCopyToClipboard();
  return (
    <button type="button" onClick={() => copy(code)} className={link}>
      {copied ? "скопировано" : code}
    </button>
  );
}

function describe(a: AccountActivity): ReactNode {
  switch (a.kind) {
    case "login":
      return "Вы вошли в аккаунт";
    case "logout":
      return "Вы вышли из аккаунта";
    case "disputeOpened":
      return (
        <>
          Вы открыли спор в сделке{" "}
          <Link
            to="/admin/deals/$dealId"
            params={{ dealId: a.dealId }}
            className={link}
          >
            {shortId(a.dealId, 5, 7)}
          </Link>
        </>
      );
    case "tradingBlocked":
      return (
        <>
          Вы <span className="text-destructive">заблокировали</span> торговлю
          трейдера{" "}
          <Link
            to="/admin/users/$userId"
            params={{ userId: a.user.id }}
            className={link}
          >
            {a.user.login}
          </Link>
        </>
      );
    case "inviteCreated":
      return (
        <>
          Вы создали новый инвайт код <InviteCode code={a.code} />, нажмите на
          него что бы скопировать
        </>
      );
  }
}

export function ActivityBlock() {
  const { data } = useQuery(accountActivityQuery());

  return (
    <Panel className="flex max-h-[calc(100svh-134px)] min-h-[374px] flex-col overflow-hidden leading-none tracking-[-0.02em]">
      <div className="shrink-0 bg-[#0a0d11]/60 px-5 pt-5 pb-5">
        <h2 className="text-[17px] font-bold">Активность</h2>
        <p className="mt-1.5 text-[13px] font-medium text-muted-foreground">
          Последние действия
        </p>
      </div>
      {data && data.length === 0 ? (
        <div className="m-auto flex max-w-[226px] flex-col items-center gap-1.5 pb-10 text-center">
          <ActivityFeedIcon className="mb-1 size-[38px] text-foreground/60" />
          <span className="text-[17px] font-bold">Активностей пока нет</span>
          <span className="text-[13px] leading-[1.0] font-medium text-muted-foreground">
            Здесь будут отображаться все ваши действия в админ панели
          </span>
        </div>
      ) : (
        <ul className="flex flex-col overflow-y-auto px-5 pb-5">
          {(data ?? []).map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 border-b border-border/80 py-3.5 first:pt-0 last:border-b-0 last:pb-0"
            >
              <span className="grid size-[31px] shrink-0 place-items-center rounded-[8px] bg-blue/10 text-blue">
                <TimeCircleIcon className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-[13px] font-semibold text-muted-foreground">
                  {when(a.at)}
                </span>
                <span className="text-[13px] leading-[1.25] font-medium">
                  {describe(a)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

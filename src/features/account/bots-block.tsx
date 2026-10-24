import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import LinkIcon from "@/assets/icons/link.svg?react";
import LinkSlashIcon from "@/assets/icons/link-slash.svg?react";
import RobotIcon from "@/assets/icons/robot.svg?react";
import { Panel } from "@/components/panel";
import { errorMessage } from "@/lib/api";
import { accountBotsQuery, bindBot, unbindBot } from "./api";
import { BlockHeader } from "./profile-blocks";
import type { TelegramBot } from "./types";

const columns = "grid grid-cols-[250px_617px_minmax(0,1fr)]";

const kindLabels: Record<TelegramBot["kind"], string> = {
  admin: "Админский",
  operator: "Операторский",
};

function Chips({ items, tone }: { items: string[]; tone: string }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={cn("rounded-[7px] px-2 py-[5px] text-[13px]", tone)}
        >
          {item}
        </span>
      ))}
    </span>
  );
}

function BotRow({ bot: b }: { bot: TelegramBot }) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["me", "bots"] });
  const bind = useMutation({
    mutationFn: () => bindBot(b.id),
    onSuccess: ({ url }) => {
      window.open(url, "_blank", "noopener");
      return refresh();
    },
  });
  const unbind = useMutation({
    mutationFn: () => unbindBot(b.id),
    onSuccess: refresh,
  });
  const failed = bind.error ?? unbind.error;

  return (
    <li
      className={cn(
        columns,
        "border-b border-border/80 px-5 py-4 last:border-b-0",
      )}
    >
      <div className="flex items-start gap-2">
        <span className="grid size-[31px] shrink-0 place-items-center rounded-[8px] bg-orange/10 text-orange">
          <RobotIcon className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium">{b.name}</span>
          <span className="flex items-center gap-[5px] text-[13px] text-orange">
            <span aria-hidden className="size-1.5 rounded-[1px] bg-current" />
            {kindLabels[b.kind]}
          </span>
        </div>
      </div>
      <div className="flex max-w-[538px] flex-col gap-2.5">
        <p className="text-[13px] leading-[1.25] font-medium">
          {b.description}
        </p>
        <hr className="border-border/80" />
        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-muted-foreground">Команды:</span>
          <Chips items={b.commands} tone="bg-blue/10 text-blue" />
        </div>
        <hr className="border-border/80" />
        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-muted-foreground">
            Уведомления:
          </span>
          <Chips items={b.notifications} tone="bg-foreground/10" />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {b.binding ? (
          <div className="flex flex-col gap-1.5">
            <span className="flex w-fit items-center gap-1.5 rounded-[7px] bg-green/10 px-2 py-[5px] text-[13px] text-green">
              <span
                aria-hidden
                className="size-[7px] rounded-[2px] bg-current"
              />
              {b.binding.command}
            </span>
            <span className="text-[13px] text-muted-foreground">
              Telegram ID: {b.binding.telegramId}
            </span>
          </div>
        ) : (
          <span className="flex w-fit items-center gap-1.5 rounded-[7px] bg-foreground/10 px-2 py-[5px] text-[13px] text-foreground/60">
            <span aria-hidden className="size-[7px] rounded-[2px] bg-current" />
            Не привязан
          </span>
        )}
        <div className="flex gap-3 text-[15px]">
          <button
            type="button"
            disabled={bind.isPending}
            onClick={() => bind.mutate()}
            className="flex h-[31px] items-center gap-1.5 rounded-[8px] border border-border bg-[#1b2127]/60 px-2 outline-none transition-colors hover:bg-[#1b2127] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <LinkIcon className="size-5" />
            {b.binding ? "Перепривязать" : "Привязать"}
          </button>
          {b.binding && (
            <button
              type="button"
              disabled={unbind.isPending}
              onClick={() => unbind.mutate()}
              className="flex h-[31px] items-center gap-[7px] rounded-[8px] border border-destructive/25 bg-destructive/10 px-2 text-destructive outline-none transition-colors hover:bg-destructive/20 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <LinkSlashIcon className="size-5" />
              Отвязать
            </button>
          )}
        </div>
        {failed && (
          <p role="alert" className="text-[13px] text-destructive">
            {errorMessage(failed)}
          </p>
        )}
      </div>
    </li>
  );
}

export function BotsBlock() {
  const { data, isPending, isError } = useQuery(accountBotsQuery());

  return (
    <Panel className="leading-none font-semibold tracking-[-0.02em]">
      <div className="px-5 pt-[17px] pb-[30px]">
        <BlockHeader
          title="Telegram-боты"
          sub="Операционные и другие боты платформы"
        />
      </div>
      <div
        className={cn(
          columns,
          "border-b border-border/80 px-5 pb-4 text-[13px] text-muted-foreground",
        )}
      >
        <span>Название бота</span>
        <span>Описание, команды, уведомления</span>
        <span>Привязка</span>
      </div>
      {isPending ? (
        <p className="p-5 text-[15px] text-muted-foreground">Загрузка…</p>
      ) : isError ? (
        <p className="p-5 text-[15px] text-destructive">
          Не удалось загрузить ботов
        </p>
      ) : (
        <ul>
          {data.map((bot) => (
            <BotRow key={bot.id} bot={bot} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

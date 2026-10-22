import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import type { ReactNode } from "react";
import DangerIcon from "@/assets/icons/danger-circle.svg?react";
import MinusCircleIcon from "@/assets/icons/minus-circle.svg?react";
import PauseCircleIcon from "@/assets/icons/pause-circle.svg?react";
import PlayCircleIcon from "@/assets/icons/play-circle.svg?react";
import ShieldIcon from "@/assets/icons/shield.svg?react";
import statusDoneUrl from "@/assets/icons/status-done.svg";
import Users3Icon from "@/assets/icons/users-3.svg?react";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api";
import { formatAgo } from "@/lib/dates";
import { tailId } from "@/lib/format";
import { type CounterpartySwitches, updateCounterparty } from "./api";
import type { CounterpartyDetails } from "./types";

function Chip({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex h-[25px] items-center rounded-[8px] px-2 text-[13px] leading-none font-semibold tracking-[-0.02em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function CounterpartyHeader({
  counterparty: c,
}: {
  counterparty: CounterpartyDetails;
}) {
  const client = useQueryClient();
  const update = useMutation({
    mutationFn: (patch: CounterpartySwitches) =>
      updateCounterparty(c.id, patch),
    onSettled: () => client.invalidateQueries({ queryKey: ["counterparties"] }),
  });
  const set = (patch: CounterpartySwitches) => update.mutate(patch);
  const warned = c.blacklisted || c.autoEnableBlocked;

  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-[59px] shrink-0 place-items-center rounded-[13px] bg-primary/10 text-primary">
          <Users3Icon className="size-[27px]" />
        </span>
        <div className="flex min-w-0 flex-col gap-2 pt-1">
          <h2 className="text-[19px] leading-none font-bold tracking-[-0.02em]">
            {c.id}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {c.enabled ? (
              <Chip className="bg-[#81e24d]/10 text-green">Включен</Chip>
            ) : (
              <Chip className="bg-[#1b2127]/60 text-foreground/60">
                Выключен
              </Chip>
            )}
            <Link
              to="/admin/merchants/counterparties"
              search={{ merchant: c.merchant.name }}
              className="rounded-[8px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Chip className="bg-blue/15 text-blue transition-colors hover:bg-blue/25">
                {c.merchant.name}
              </Chip>
            </Link>
            {c.blacklisted && (
              <Chip className="bg-destructive/10 text-destructive">
                В блеклисте
              </Chip>
            )}
            {c.autoEnableBlocked && (
              <Chip className="bg-orange/10 text-orange">
                Авто-вкл запрещено
              </Chip>
            )}
            {!warned && (
              <Chip className="bg-[#1b2127]/60 text-foreground/60">
                Регистрация:{" "}
                {format(parseISO(c.createdAt), "dd.MM.yyyy (HH:mm)")}
              </Chip>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex gap-4 [&_button]:gap-[7px] [&_button]:rounded-[14px] [&_button]:px-6">
          {c.autoEnableBlocked ? (
            <Button
              variant="secondary"
              disabled={update.isPending}
              onClick={() => set({ autoEnableBlocked: false })}
            >
              <ShieldIcon className="size-6" />
              Разрешить авто-вкл.
            </Button>
          ) : (
            <Button
              variant="secondary"
              disabled={update.isPending}
              className="border-orange/25 bg-orange/10 text-orange hover:bg-orange/20"
              onClick={() => set({ autoEnableBlocked: true })}
            >
              <ShieldIcon className="size-6" />
              Запретить авто-вкл.
            </Button>
          )}
          {c.blacklisted ? (
            <Button
              variant="secondary"
              disabled={update.isPending}
              onClick={() => set({ blacklisted: false })}
            >
              <MinusCircleIcon className="size-5" />
              Убрать из блеклиста
            </Button>
          ) : (
            <Button
              variant="secondary"
              disabled={update.isPending}
              className="border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={() => set({ blacklisted: true })}
            >
              <MinusCircleIcon className="size-5" />В блеклист
            </Button>
          )}
          {c.enabled ? (
            <Button
              variant="secondary"
              disabled={update.isPending}
              onClick={() => set({ enabled: false })}
            >
              <PauseCircleIcon className="size-5" />
              Выключить
            </Button>
          ) : (
            <Button
              disabled={update.isPending}
              onClick={() => set({ enabled: true })}
            >
              <PlayCircleIcon className="size-5" />
              Включить
            </Button>
          )}
        </div>
        {update.isError && (
          <p role="alert" className="text-[13px] text-destructive">
            {errorMessage(update.error)}
          </p>
        )}
      </div>
    </div>
  );
}

const tones = {
  green: { border: "border-green/80", text: "text-green", tile: "bg-green/10" },
  red: {
    border: "border-destructive/80",
    text: "text-destructive",
    tile: "bg-destructive/10 text-destructive",
  },
  orange: {
    border: "border-orange/80",
    text: "text-orange",
    tile: "bg-orange/10 text-orange",
  },
};

function healthOf(c: CounterpartyDetails) {
  if (c.blacklisted)
    return {
      tone: tones.red,
      label: "Заблокирован",
      title: "Контрагент в блеклисте",
      text: "Приём платежей остановлен. Новые сделки по контрагенту не создаются, привязанные реквизиты не предлагаются.",
    };
  if (!c.enabled)
    return {
      tone: tones.orange,
      label: "Выключен",
      title: "Контрагент выключен",
      text: "Новые сделки по контрагенту не создаются, пока его не включат.",
    };
  if (c.conversion < 70)
    return {
      tone: tones.orange,
      label: "Низкая конверсия",
      title: `Конверсия ${c.conversion}% (активен)`,
      text: "Контрагент активен, но оплачивает мало сделок. Стоит проверить его реквизиты и споры.",
    };
  return {
    tone: tones.green,
    label: "Здоровый контрагент",
    title: `Конверсия ${c.conversion}% (активен)`,
    text: "Контрагент активен, стабильно оплачивает сделки и не имеет ограничений. Вмешательство не требуется.",
  };
}

export function CounterpartyBanner({
  counterparty: c,
}: {
  counterparty: CounterpartyDetails;
}) {
  const health = healthOf(c);
  return (
    <section
      className={cn(
        "flex min-h-[111px] justify-between gap-6 rounded-2xl border bg-panel p-5 leading-none tracking-[-0.02em]",
        health.tone.border,
      )}
    >
      <div className="flex min-w-0 gap-3.5">
        <span
          className={cn(
            "grid size-[43px] shrink-0 place-items-center rounded-[8px]",
            health.tone.tile,
          )}
        >
          {health.tone === tones.red ? (
            <MinusCircleIcon className="size-[31px]" />
          ) : health.tone === tones.orange ? (
            <DangerIcon className="size-[26px]" />
          ) : (
            <img src={statusDoneUrl} alt="" className="size-[26px]" />
          )}
        </span>
        <div className="flex min-w-0 flex-col gap-3 pt-0.5">
          <div className="flex flex-col gap-2">
            <span className={cn("text-[15px] font-medium", health.tone.text)}>
              {health.label}
            </span>
            <span className="text-[21px] font-bold">{health.title}</span>
          </div>
          <p className="text-[13px] font-medium text-muted-foreground">
            {health.text}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between gap-3">
        <span className="flex h-9 items-center gap-2.5 rounded-[10px] bg-[#1b2127]/60 pr-3.5 pl-3.5 text-[15px] font-semibold">
          <span title={c.id}>{tailId(c.id)}</span>
          <CopyButton text={c.id} label="Скопировать ID" />
        </span>
        <p className="text-[13px] font-medium whitespace-pre text-muted-foreground">
          Создан{" "}
          {format(parseISO(c.createdAt), "dd MMM yyyy 'г.'", { locale: ru })}
          {c.lastDepositAt &&
            `   Последний депозит ${formatAgo(c.lastDepositAt)}`}
        </p>
      </div>
    </section>
  );
}

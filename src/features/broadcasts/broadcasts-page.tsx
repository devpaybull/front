import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import type { ReactNode } from "react";
import { useId } from "react";
import { useForm } from "react-hook-form";
import DangerIcon from "@/assets/icons/danger-circle.svg?react";
import DeleteLeftIcon from "@/assets/icons/delete-left.svg?react";
import GroupIcon from "@/assets/icons/group.svg?react";
import MegaphoneIcon from "@/assets/icons/megaphone.svg?react";
import SendIcon from "@/assets/icons/send.svg?react";
import statusDoneUrl from "@/assets/icons/status-done.svg";
import TimeCircleIcon from "@/assets/icons/time-circle.svg?react";
import { Panel } from "@/components/panel";
import { TableMessage } from "@/components/table/table-message";
import { TwoLines } from "@/components/table/two-lines";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { broadcastsQuery, sendBroadcast } from "./api";
import { broadcastStatusMeta } from "./labels";
import {
  type BroadcastForm,
  broadcastMaxLength,
  broadcastSchema,
} from "./schemas";
import type { Broadcast } from "./types";

const at = (iso: string) => `${formatDate(iso)} (${formatTime(iso)})`;
const count = (n: number) => formatNumber(String(n), "auto");

function StatTile({
  tone,
  icon,
  label,
  value,
}: {
  tone: string;
  icon: ReactNode;
  label: string;
  value: number | undefined;
}) {
  return (
    <Panel className="flex h-[75px] items-center gap-2 px-5 leading-none font-semibold tracking-[-0.02em]">
      <span
        className={cn(
          "grid size-[35px] shrink-0 place-items-center rounded-[8px] [&_svg]:size-6",
          tone,
        )}
      >
        {icon}
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-[13px] text-muted-foreground">{label}</span>
        <span className="text-[15px]">
          {value === undefined ? "—" : count(value)}
        </span>
      </span>
    </Panel>
  );
}

function BlockHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1.5 leading-none tracking-[-0.02em]">
      <h2 className="text-[17px] font-bold">{title}</h2>
      <p className="text-[13px] font-medium text-muted-foreground">{sub}</p>
    </div>
  );
}

function NewBroadcast() {
  const id = useId();
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BroadcastForm>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { text: "" },
  });
  const length = watch("text").length;

  const submit = handleSubmit(async ({ text }) => {
    try {
      await sendBroadcast(text);
      reset();
      await client.invalidateQueries({ queryKey: ["broadcasts"] });
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });
  const error = errors.text?.message ?? errors.root?.message;

  return (
    <Panel className="flex flex-col gap-5 p-5">
      <BlockHeader
        title="Новое оповещение"
        sub="Сообщение будет отправлено всем трейдерам у которых подключен Telegram"
      />
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <textarea
          id={id}
          aria-label="Текст оповещения"
          aria-invalid={!!errors.text}
          aria-describedby={error ? `${id}-error` : undefined}
          maxLength={broadcastMaxLength}
          placeholder="Введите текст уведомления для трейдеров"
          className="h-[188px] resize-y rounded-none bg-[#101419] p-5 text-[13px] leading-[1.25] font-medium tracking-[-0.02em] outline-none placeholder:text-foreground/60 focus-visible:ring-1 focus-visible:ring-ring aria-invalid:ring-1 aria-invalid:ring-destructive"
          {...register("text")}
        />
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-4 text-[13px] font-medium">
            <span className="text-foreground/60">
              {count(length)} / {count(broadcastMaxLength)} символов
            </span>
            {error && (
              <span
                id={`${id}-error`}
                role="alert"
                className="text-destructive"
              >
                {error}
              </span>
            )}
          </span>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              disabled={length === 0}
              onClick={() => reset()}
              className="gap-[7px] rounded-[14px] border-border px-6"
            >
              <DeleteLeftIcon className="size-5" />
              Очистить
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2.5 rounded-[14px] px-5"
            >
              <SendIcon className="size-5" />
              Отправить оповещение
            </Button>
          </div>
        </div>
      </form>
    </Panel>
  );
}

const columns =
  "grid grid-cols-[250px_617px_284px_275px_minmax(0,1fr)] items-center";

function Delivery({ delivery: d }: { delivery: Broadcast["delivery"] }) {
  const chip = (n: number, tone: string, title: string) => (
    <span
      title={title}
      className={cn(
        "flex items-center gap-1.5 rounded-[7px] px-2 py-[5px] text-[13px]",
        tone,
      )}
    >
      <span aria-hidden className="size-[7px] rounded-[2px] bg-current" />
      {count(n)}
    </span>
  );
  return (
    <div className="flex flex-col gap-1">
      <span>
        {count(d.delivered)} / {count(d.total)}
      </span>
      <span className="flex gap-1.5">
        {chip(d.delivered, "bg-green/10 text-green", "Доставлено")}
        {chip(d.failed, "bg-destructive/10 text-destructive", "Не доставлено")}
        {chip(d.pending, "bg-foreground/10", "Ждут отправки")}
      </span>
    </div>
  );
}

function History({ items }: { items: Broadcast[] | undefined }) {
  const last = items?.[0];
  const sent = items?.reduce((sum, b) => sum + b.delivery.delivered, 0);

  return (
    <Panel className="leading-none font-semibold tracking-[-0.02em]">
      <div className="flex items-start justify-between gap-6 px-5 pt-[17px] pb-[30px]">
        <BlockHeader
          title="История рассылок"
          sub="Отслеживание статусов всех отправок"
        />
        {last && (
          <p className="flex items-center gap-3 pt-3 text-[13px] font-medium text-foreground/60">
            <span>
              Всего отправлено:{" "}
              <span className="text-foreground">{count(sent ?? 0)}</span>
            </span>
            <span aria-hidden className="h-2.5 w-px bg-border/80" />
            <span>
              Последний статус:{" "}
              <span className={broadcastStatusMeta[last.status].tone}>
                {broadcastStatusMeta[last.status].label}
              </span>
            </span>
            <span aria-hidden className="h-2.5 w-px bg-border/80" />
            <span>
              Последняя отправка:{" "}
              <span className="text-foreground">{at(last.createdAt)}</span>
            </span>
          </p>
        )}
      </div>
      <div
        className={cn(
          columns,
          "border-b border-border/80 px-5 pb-4 text-[13px] text-muted-foreground",
        )}
      >
        <span>Дата</span>
        <span>Сообщение</span>
        <span>Статус</span>
        <span>Доставка</span>
        <span>Автор</span>
      </div>
      {!items ? (
        <TableMessage>Загрузка…</TableMessage>
      ) : items.length === 0 ? (
        <TableMessage>Рассылок пока не было</TableMessage>
      ) : (
        <ul>
          {items.map((b) => {
            const status = broadcastStatusMeta[b.status];
            return (
              <li
                key={b.id}
                className={cn(
                  columns,
                  "border-b border-border/80 px-5 py-4 last:border-b-0",
                )}
              >
                <TwoLines
                  main={at(b.createdAt)}
                  sub={
                    b.finishedAt ? `Завершено ${at(b.finishedAt)}` : "Ещё идёт"
                  }
                />
                <p
                  title={b.text}
                  className="line-clamp-2 max-w-[511px] text-[13px] leading-[1.25] font-medium"
                >
                  {b.text}
                </p>
                <div className="flex flex-col gap-1">
                  <span
                    className={cn("flex items-center gap-[5px]", status.tone)}
                  >
                    <span
                      aria-hidden
                      className="size-2.5 rounded-[2px] bg-current"
                    />
                    {status.label}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {status.note}
                  </span>
                </div>
                <Delivery delivery={b.delivery} />
                <span>{b.author}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export function BroadcastsPage() {
  const { data } = useQuery(broadcastsQuery());
  const stats = data?.stats;

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-6 gap-5">
        <StatTile
          tone="bg-primary/10 text-primary"
          icon={<MegaphoneIcon />}
          label="Всего рассылок"
          value={stats?.total}
        />
        <StatTile
          tone="bg-orange/10 text-orange"
          icon={<TimeCircleIcon />}
          label="В очереди"
          value={stats?.queued}
        />
        <StatTile
          tone="bg-green/10 text-green"
          icon={<SendIcon />}
          label="Отправлено"
          value={stats?.sent}
        />
        <StatTile
          tone="bg-destructive/10 text-destructive"
          icon={<DangerIcon />}
          label="С ошибками"
          value={stats?.failed}
        />
        <StatTile
          tone="bg-blue/10 text-blue"
          icon={<GroupIcon />}
          label="Трейдеров в охвате"
          value={stats?.reach}
        />
        <StatTile
          tone="bg-green/10"
          icon={<img src={statusDoneUrl} alt="" className="size-[21px]" />}
          label="Доставлено сообщений"
          value={stats?.delivered}
        />
      </div>
      <div className="mt-5">
        <NewBroadcast />
      </div>
      <hr className="my-[30px] border-border/80" />
      <History items={data?.items} />
    </div>
  );
}

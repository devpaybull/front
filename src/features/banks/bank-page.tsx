import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import type { ReactNode } from "react";
import { Panel } from "@/components/panel";
import { StatusBadge, type StatusTone } from "@/components/status-badge";
import { errorMessage } from "@/lib/api";
import { updateBank } from "./api";
import { requisiteTypeLabels } from "./labels";
import type { Bank } from "./types";

function Block({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <Panel className="flex flex-col gap-5 p-5 leading-none tracking-[-0.02em]">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[17px] font-bold">{title}</h2>
        <p className="text-[13px] font-medium text-muted-foreground">{sub}</p>
      </div>
      {children}
    </Panel>
  );
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-[10px] bg-[#101419] p-5">
      <span className="text-[13px] font-medium text-foreground/60">
        {label}
      </span>
      <span className="text-[15px] font-semibold">{children}</span>
    </div>
  );
}

type Switchable = "active" | "automation" | "multiRequisites";

const states: Record<
  Switchable,
  { label: string; on: string; off: string; offTone: StatusTone }
> = {
  active: {
    label: "Статус",
    on: "Активен",
    off: "Выключен",
    offTone: "neutral",
  },
  automation: {
    label: "Автоматика",
    on: "Включена",
    off: "Выключена",
    offTone: "orange",
  },
  multiRequisites: {
    label: "Мультиреквизиты на устройство",
    on: "Включены",
    off: "Отключены",
    offTone: "neutral",
  },
};

export function BankPage({ bank: b }: { bank: Bank }) {
  const client = useQueryClient();
  const update = useMutation({
    mutationFn: (patch: Partial<Pick<Bank, Switchable>>) =>
      updateBank(b.id, patch),
    onSettled: () => client.invalidateQueries({ queryKey: ["banks"] }),
  });

  return (
    <div className="flex flex-col gap-5">
      <Block
        title="Основные параметры"
        sub="Базовые поля банка и его идентификаторы"
      >
        <div className="grid grid-cols-6 gap-2.5">
          <Tile label="Идентификатор">{b.id}</Tile>
          <Tile label="Код банка">{b.code ?? "Не задан"}</Tile>
          <Tile label="Страна">{b.country ?? "Не задана"}</Tile>
          <Tile label="Валюта">{b.currency}</Tile>
          <Tile label="Тип реквизита">
            <span className="text-green">
              {b.requisiteTypes.map((t) => requisiteTypeLabels[t]).join(", ") ||
                "—"}
            </span>
          </Tile>
          <Tile label="Трансгран валюты">
            {b.crossBorderCurrencies.join(", ") || "Нет"}
          </Tile>
        </div>
      </Block>

      <Block
        title="Состояние"
        sub="Быстрое управление доступностью банка и автоматики"
      >
        <div className="grid grid-cols-4 gap-2.5">
          {(Object.keys(states) as Switchable[]).map((key) => {
            const state = states[key];
            const on = b[key];
            return (
              <Tile key={key} label={state.label}>
                <button
                  type="button"
                  disabled={update.isPending}
                  aria-pressed={on}
                  title={
                    on ? "Нажмите, чтобы выключить" : "Нажмите, чтобы включить"
                  }
                  onClick={() => update.mutate({ [key]: !on })}
                  className={cn(
                    "rounded-[10px] outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                  )}
                >
                  <StatusBadge tone={on ? "green" : state.offTone}>
                    {on ? state.on : state.off}
                  </StatusBadge>
                </button>
              </Tile>
            );
          })}
          <Tile label="Количество каналов">
            <span className="flex h-[31px] w-fit items-center rounded-[10px] bg-card px-3.5">
              {b.channels}
            </span>
          </Tile>
        </div>
        {update.isError && (
          <p role="alert" className="text-[13px] text-destructive">
            {errorMessage(update.error)}
          </p>
        )}
      </Block>
    </div>
  );
}

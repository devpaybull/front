import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import { type ReactNode, useId, useState } from "react";
import { useForm } from "react-hook-form";
import BoxArchiveIcon from "@/assets/icons/box-archive.svg?react";
import CategoryIcon from "@/assets/icons/category.svg?react";
import EditIcon from "@/assets/icons/edit.svg?react";
import FiltersIcon from "@/assets/icons/filters.svg?react";
import { type CountTab, CountTabs } from "@/components/count-tabs";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { Panel } from "@/components/panel";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { TwoLines } from "@/components/table/two-lines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDialog } from "@/hooks/use-dialog";
import { errorMessage } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/dates";
import { settingsQuery, updateSetting } from "./api";
import { settingCategoryLabels } from "./labels";
import {
  type SettingsSearch,
  type SettingTab,
  type SettingValueForm,
  settingValueSchema,
} from "./schemas";
import type {
  PlatformSetting,
  PlatformSettingList,
  SettingCategory,
} from "./types";

const columns = "grid grid-cols-[574px_446px_minmax(0,1fr)_31px] items-center";

const tabsOf = (
  counts: PlatformSettingList["counts"] | undefined,
): CountTab<SettingTab>[] => [
  { value: undefined, label: "Все", count: counts?.all },
  ...(Object.keys(settingCategoryLabels) as SettingCategory[]).map((c) => ({
    value: c,
    label: settingCategoryLabels[c],
    count: counts?.[c],
  })),
  { value: "deprecated", label: "Устаревшее", count: counts?.deprecated },
];

function StatTile({
  tone,
  icon,
  label,
  value,
}: {
  tone: string;
  icon: ReactNode;
  label: string;
  value?: number;
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
        <span className="text-[15px]">{value ?? "—"}</span>
      </span>
    </Panel>
  );
}

export function SettingsStats({ search }: { search: SettingsSearch }) {
  const { data } = useQuery(settingsQuery(search));
  return (
    <div className="grid grid-cols-3 gap-5">
      <StatTile
        tone="bg-blue/10 text-blue"
        icon={<FiltersIcon />}
        label="Всего настроек"
        value={data?.stats.total}
      />
      <StatTile
        tone="bg-green/10 text-green"
        icon={<CategoryIcon />}
        label="В таблице"
        value={data?.stats.inTable}
      />
      <StatTile
        tone="bg-orange/10 text-orange"
        icon={<BoxArchiveIcon />}
        label="Устаревшие"
        value={data?.stats.deprecated}
      />
    </div>
  );
}

type SettingsTableProps = {
  search: SettingsSearch;
  onChange: (patch: Partial<SettingsSearch>) => void;
};

export function SettingsTable({ search, onChange }: SettingsTableProps) {
  const { data, isPending, isError, refetch } = useQuery(settingsQuery(search));
  const dialog = useDialog();
  const [editing, setEditing] = useState<PlatformSetting | null>(null);

  return (
    <section className="rounded-2xl border border-border/80 bg-panel">
      <div className="px-4 pt-4">
        <CountTabs
          label="Группа настроек"
          tabs={tabsOf(data?.counts)}
          value={search.tab}
          onChange={(tab) => onChange({ tab })}
        />
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[1615px] text-[15px] leading-none font-semibold tracking-[-0.02em]">
          <div
            className={cn(
              columns,
              "border-b border-border/80 px-7 pt-[34px] pb-4 whitespace-nowrap",
            )}
          >
            <span>Настройки</span>
            <span>Значение</span>
            <SortHeader
              label="Последнее обновление"
              active={search.sort === "updatedAt"}
              ascending={search.order === "asc"}
              onClick={() =>
                onChange({
                  sort: "updatedAt",
                  order:
                    search.sort === "updatedAt" && search.order !== "asc"
                      ? "asc"
                      : "desc",
                })
              }
            />
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить настройки
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : data.items.length === 0 ? (
            <TableMessage>Ничего не найдено</TableMessage>
          ) : (
            <ul>
              {data.items.map((s) => (
                <li
                  key={s.key}
                  className={cn(
                    columns,
                    "border-b border-border/80 px-7 py-4 last:border-b-0",
                  )}
                >
                  <TwoLines main={s.name} sub={s.key} />
                  <span className="truncate pr-6" title={s.value}>
                    {s.value}
                  </span>
                  <TwoLines
                    main={formatDate(s.updatedAt)}
                    sub={formatTime(s.updatedAt)}
                  />
                  <button
                    type="button"
                    aria-label={`Изменить: ${s.name}`}
                    onClick={() => {
                      setEditing(s);
                      dialog.show();
                    }}
                    className="grid size-[31px] place-items-center rounded-[8px] bg-[#1b2127]/60 outline-none transition-colors hover:bg-[#1b2127] focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <EditIcon className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {dialog.mounted && editing && (
        <SettingDialog
          key={dialog.key}
          setting={editing}
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
        />
      )}
    </section>
  );
}

function SettingDialog({
  setting,
  open,
  onOpenChange,
}: {
  setting: PlatformSetting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const id = useId();
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SettingValueForm>({
    resolver: zodResolver(settingValueSchema),
    defaultValues: { value: setting.value },
  });

  const submit = handleSubmit(async ({ value }) => {
    try {
      await updateSetting(setting.key, value);
      await client.invalidateQueries({ queryKey: ["platform-settings"] });
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title="Изменить настройку"
      icon={<EditIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      error={errors.root?.message}
    >
      <TwoLines main={setting.name} sub={setting.key} />
      <FormField htmlFor={id} label="Значение" error={errors.value?.message}>
        <Input
          id={id}
          autoComplete="off"
          aria-invalid={!!errors.value}
          aria-describedby={errors.value ? `${id}-error` : undefined}
          {...register("value")}
        />
      </FormField>
    </FormDialog>
  );
}

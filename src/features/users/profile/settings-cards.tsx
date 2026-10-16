import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { Children, type ReactNode, useId, useState } from "react";
import { useForm } from "react-hook-form";
import CloseIcon from "@/assets/icons/close.svg?react";
import EditIcon from "@/assets/icons/edit.svg?react";
import { FormField } from "@/components/form-field";
import { IconButton } from "@/components/icon-button";
import { Panel } from "@/components/panel";
import { Tag } from "@/components/tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDialog } from "@/hooks/use-dialog";
import { errorMessage } from "@/lib/api";
import { formatRate, plural } from "@/lib/format";
import { updateUserSettings } from "../api";
import {
  type Concurrent,
  type ConcurrentForm,
  concurrentSchema,
} from "../schemas";
import type { SettingSwitch, UserProfile } from "../types";
import { RatesDialog } from "./rates/rates-dialog";
import { RatesPopover } from "./rates-popover";
import { useProfileMutation } from "./use-profile-mutation";
import { useUpdateSettings } from "./use-update-settings";

export function SettingsCards({ user }: { user: UserProfile }) {
  const update = useUpdateSettings(user.id);
  const { settings } = user;
  const [editingConcurrent, setEditingConcurrent] = useState(false);
  const rates = useDialog();

  const toggle = (key: SettingSwitch, label: string) => (
    <Switch
      aria-label={label}
      checked={settings[key]}
      onCheckedChange={(checked) => update.mutate({ [key]: checked })}
    />
  );

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <Panel className="p-7">
        <Rows className="gap-2.5">
          <Row label="Торговля">
            <Tag tone={settings.trading ? "green" : "neutral"}>
              {settings.trading ? "Торговля включена" : "Торговля отключена"}
            </Tag>
          </Row>
          <Row label="Pay out торговля">
            <Tag tone={settings.payOutTrading ? "green" : "neutral"}>
              {settings.payOutTrading ? "Доступно" : "Недоступно"}
            </Tag>
          </Row>
          <Row label="Индивидуальные настройки ставок">
            {toggle("individualRates", "Индивидуальные настройки ставок")}
          </Row>
          <Row label="Ставка">
            <Value>{formatRate(user.rate)} RUB</Value>
            <RatesPopover userId={user.id} />
            <IconButton label="Изменить ставку" onClick={rates.show}>
              <EditIcon className="size-[15px]" />
            </IconButton>
            {rates.mounted && (
              <RatesDialog
                key={rates.key}
                userId={user.id}
                open={rates.open}
                onOpenChange={rates.onOpenChange}
              />
            )}
          </Row>
          <div className="flex flex-col gap-4">
            <Row
              label="Автоподбор откупов"
              hint={
                <>
                  Одновременно: {settings.autoBuyoutConcurrent}
                  <button
                    type="button"
                    aria-label="Изменить, сколько откупов одновременно"
                    aria-expanded={editingConcurrent}
                    onClick={() => setEditingConcurrent(!editingConcurrent)}
                    className={cn(
                      "grid size-5 place-items-center rounded outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
                      editingConcurrent && "text-primary",
                    )}
                  >
                    <EditIcon className="size-[15px]" />
                  </button>
                </>
              }
            >
              {toggle("autoBuyout", "Автоподбор откупов")}
            </Row>
            {editingConcurrent && (
              <ConcurrentEditor
                user={user}
                onClose={() => setEditingConcurrent(false)}
              />
            )}
          </div>
          <NightStopRow user={user} />
        </Rows>
      </Panel>

      <Panel className="flex flex-col p-7 lg:min-h-[349px]">
        <Rows className="flex-1 justify-between gap-3.5">
          <Row label="Pay-in антифрод">
            {toggle("payInAntifraud", "Pay-in антифрод")}
          </Row>
          <Row label="Доступ к QR откупу">
            {toggle("qrBuyoutAccess", "Доступ к QR откупу")}
          </Row>
          <Row label="Доступ перевода пользователю">
            {toggle("transferAccess", "Доступ перевода пользователю")}
          </Row>
          <Row
            label="Исключительный залив"
            hint={
              settings.exclusiveDepositAttached === 0
                ? "Прикрепленных 0 - прием от всех"
                : `Прикрепленных ${settings.exclusiveDepositAttached}`
            }
          >
            {toggle("exclusiveDeposit", "Исключительный залив")}
          </Row>
          <Row label="Доверенный пользователь">
            {toggle("trusted", "Доверенный пользователь")}
          </Row>
        </Rows>
      </Panel>
    </div>
  );
}

function Rows({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {Children.toArray(children).flatMap((child, index) =>
        index === 0
          ? [child]
          : [
              <hr
                // biome-ignore lint/suspicious/noArrayIndexKey: the lines follow the rows' order
                key={`line-${index}`}
                className="border-border/80"
              />,
              child,
            ],
      )}
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[15px] leading-none font-medium tracking-[-0.02em]">
      <div className="flex flex-col gap-2">
        <span>{label}</span>
        {hint && (
          <span className="flex items-center gap-1 text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2.5">{children}</div>
    </div>
  );
}

const Value = ({ children }: { children: ReactNode }) => (
  <span className="mr-1 text-[17px]">{children}</span>
);

function EditorButtons({
  formId,
  saving,
  onSave,
  onClose,
}: {
  formId?: string;
  saving: boolean;
  onSave?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex shrink-0 gap-2">
      <Button
        type={formId ? "submit" : "button"}
        form={formId}
        onClick={onSave}
        disabled={saving}
        className="rounded-[14px]"
      >
        Сохранить
      </Button>
      <Button
        type="button"
        variant="secondary"
        aria-label="Отменить"
        onClick={onClose}
        className="size-11 rounded-[14px] p-0 text-foreground/60 hover:text-foreground"
      >
        <CloseIcon className="size-5" />
      </Button>
    </div>
  );
}

function ConcurrentEditor({
  user,
  onClose,
}: {
  user: UserProfile;
  onClose: () => void;
}) {
  const formId = useId();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ConcurrentForm, unknown, Concurrent>({
    resolver: zodResolver(concurrentSchema),
    defaultValues: {
      concurrent: String(user.settings.autoBuyoutConcurrent),
      reason: "",
    },
  });
  const save = useProfileMutation(
    user.id,
    ({ concurrent, reason }: Concurrent) =>
      updateUserSettings(user.id, { autoBuyoutConcurrent: concurrent }, reason),
  );

  const submit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(values);
      onClose();
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <form
      id={formId}
      onSubmit={submit}
      noValidate
      className="flex flex-wrap items-end justify-between gap-x-3.5 gap-y-6 rounded-[10px] bg-[#101419] p-5"
    >
      <div className="flex flex-wrap gap-3.5">
        <FormField
          htmlFor={`${formId}-concurrent`}
          label="Одновременно доступно"
          error={errors.concurrent?.message ?? errors.root?.message}
        >
          <Input
            id={`${formId}-concurrent`}
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            className="w-60 rounded-[14px]"
            aria-invalid={!!errors.concurrent}
            {...register("concurrent")}
          />
        </FormField>
        <FormField
          htmlFor={`${formId}-reason`}
          label="Причина изменения"
          error={errors.reason?.message}
        >
          <Input
            id={`${formId}-reason`}
            autoComplete="off"
            placeholder="Укажите причину"
            className="w-60 rounded-[14px]"
            aria-invalid={!!errors.reason}
            {...register("reason")}
          />
        </FormField>
      </div>
      <EditorButtons formId={formId} saving={isSubmitting} onClose={onClose} />
    </form>
  );
}

const nightStopOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

function NightStopRow({ user }: { user: UserProfile }) {
  const current = user.settings.nightStopThreshold;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(current);
  const save = useProfileMutation(user.id, (threshold: number) =>
    updateUserSettings(user.id, { nightStopThreshold: threshold }),
  );

  const open = () => {
    setValue(current);
    save.reset();
    setEditing(true);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Row label="Порог ночного стопа">
        {editing ? (
          <div className="flex items-center gap-3">
            <Select
              items={nightStopOptions}
              value={String(value)}
              onValueChange={(next) => setValue(Number(next))}
            >
              <SelectTrigger
                aria-label="Порог ночного стопа"
                className="w-[78px] rounded-[14px] font-semibold"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nightStopOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <EditorButtons
              saving={save.isPending}
              onSave={() =>
                save.mutate(value, { onSuccess: () => setEditing(false) })
              }
              onClose={() => setEditing(false)}
            />
          </div>
        ) : (
          <>
            <Value>
              {current} {plural(current, ["проверка", "проверки", "проверок"])}
            </Value>
            <IconButton label="Изменить порог ночного стопа" onClick={open}>
              <EditIcon className="size-[15px]" />
            </IconButton>
          </>
        )}
      </Row>
      {editing && (
        <p className="rounded-[10px] bg-[#101419] p-3.5 pr-[105px] text-[15px] leading-[18px] font-medium tracking-[-0.02em] text-muted-foreground">
          С 00:00 до 10:00 МСК выдача новых pay-in заявок приостанавливается при{" "}
          {value} и более активных проверках. Возобновляется, когда проверок
          меньше {value}, или в 10:00 МСК. Порог меняет администратор.
          {save.isError && (
            <span role="alert" className="mt-2 block text-destructive">
              {errorMessage(save.error)}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, type ReactNode, useId } from "react";
import {
  type Control,
  Controller,
  type FieldErrors,
  useFieldArray,
  useForm,
} from "react-hook-form";
import GroupIcon from "@/assets/icons/group.svg?react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { usersQuery } from "@/features/users/api";
import type { UserRole } from "@/features/users/types";
import { UserPicker } from "@/features/users/user-picker";
import { errorMessage } from "@/lib/api";
import { saveMerchantAttachments } from "./api";
import { AddRowButton, RemoveRowButton } from "./group-dialogs";
import { type AttachForm, attachSchema } from "./schemas";
import type { AttachmentFlags, Merchant, MerchantAttachments } from "./types";

type Kind = keyof MerchantAttachments;

const flagColumns: { key: keyof AttachmentFlags; label: string }[] = [
  { key: "trade", label: "Торговля" },
  { key: "cards", label: "Карты" },
  { key: "sbp", label: "СБП" },
  { key: "tgCards", label: "ТГ карты" },
  { key: "tgSbp", label: "ТГ СБП" },
];

const allOn: AttachmentFlags = {
  trade: true,
  cards: true,
  sbp: true,
  tgCards: true,
  tgSbp: true,
};
const emptyRow = () => ({ user: null, flags: { ...allOn } });

const row =
  "grid grid-cols-[324px_103px_102px_103px_103px_minmax(0,1fr)_20px] grid-rows-[13px_44px] items-center gap-y-1.5";
const labelClass = "text-[13px] leading-none font-semibold text-foreground/60";

type DialogProps = {
  merchant: Merchant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AttachDialog({ merchant, open, onOpenChange }: DialogProps) {
  const formId = useId();
  const client = useQueryClient();
  const toRows = (kind: Kind) =>
    merchant[kind].length > 0
      ? merchant[kind].map(({ id, login, flags }) => ({
          user: { id, login },
          flags: { ...flags },
        }))
      : [emptyRow()];
  const {
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<AttachForm>({
    resolver: zodResolver(attachSchema),
    defaultValues: { traders: toRows("traders"), cascades: toRows("cascades") },
  });
  const traders = useFieldArray({ control, name: "traders" });
  const cascades = useFieldArray({ control, name: "cascades" });
  const allCascades = useQuery(usersQuery({ role: "cascade" }));

  const submit = handleSubmit(async (form) => {
    const rows = (kind: Kind) =>
      form[kind].flatMap(({ user, flags }) =>
        user ? [{ userId: user.id, flags }] : [],
      );
    try {
      await saveMerchantAttachments(merchant.id, {
        traders: rows("traders"),
        cascades: rows("cascades"),
      });
      await client.invalidateQueries({ queryKey: ["merchants"] });
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  const attachAllCascades = () => {
    const rows = getValues("cascades");
    const present = new Set(rows.flatMap((r) => (r.user ? [r.user.id] : [])));
    const missing = (allCascades.data?.items ?? []).filter(
      (u) => !present.has(u.id),
    );
    const kept = rows.filter((r) => r.user);
    cascades.replace([
      ...kept,
      ...missing.map((u) => ({
        user: { id: u.id, login: u.login },
        flags: { ...allOn },
      })),
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-4rem)] w-[916px] flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            <GroupIcon />
            Прикрепить трейдеров / каскады
          </DialogTitle>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={submit}
          noValidate
          className="min-h-0 flex-1 overflow-y-auto text-[15px] leading-none font-semibold tracking-[-0.02em]"
        >
          <AttachSection
            title="Прикрепление трейдеров"
            kind="traders"
            label="Трейдер"
            placeholder="Укажите трейдера"
            roles={["trader", "lead_trader"]}
            control={control}
            errors={errors}
            fields={traders.fields}
            onRemove={traders.remove}
            footer={
              <AddRowButton onClick={() => traders.append(emptyRow())}>
                Добавить трейдера
              </AddRowButton>
            }
          />
          <AttachSection
            title="Прикрепление каскадов"
            kind="cascades"
            label="Каскад"
            placeholder="Укажите каскад"
            roles={["cascade"]}
            control={control}
            errors={errors}
            fields={cascades.fields}
            onRemove={cascades.remove}
            footer={
              <div className="flex gap-3">
                <AddRowButton onClick={() => cascades.append(emptyRow())}>
                  Добавить каскад
                </AddRowButton>
                <AddRowButton
                  disabled={!allCascades.data}
                  onClick={attachAllCascades}
                >
                  Прикрепить все каскады
                </AddRowButton>
              </div>
            }
          />
          {errors.root && (
            <p
              role="alert"
              className="px-[37px] pb-6 text-[13px] font-normal tracking-[-0.03em] text-destructive"
            >
              {errors.root.message}
            </p>
          )}
        </form>

        <DialogFooter className="shrink-0">
          <DialogClose render={<Button variant="secondary" />}>
            Отменить
          </DialogClose>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AttachSection({
  title,
  kind,
  label,
  placeholder,
  roles,
  control,
  errors,
  fields,
  onRemove,
  footer,
}: {
  title: string;
  kind: Kind;
  label: string;
  placeholder: string;
  roles: UserRole[];
  control: Control<AttachForm>;
  errors: FieldErrors<AttachForm>;
  fields: { id: string }[];
  onRemove: (index: number) => void;
  footer: ReactNode;
}) {
  const id = useId();
  return (
    <section className="flex flex-col gap-6 border-b border-border/80 px-[37px] py-6 last-of-type:border-b-0">
      <h3>{title}</h3>
      {fields.map((field, index) => {
        const fieldId = `${id}-${index}`;
        const error = errors[kind]?.[index]?.user?.message;
        return (
          <Fragment key={field.id}>
            <div className={row}>
              <label htmlFor={fieldId} className={`${labelClass} pl-3`}>
                {label}
              </label>
              {flagColumns.map((flag) => (
                <span key={flag.key} className={labelClass}>
                  {flag.label}
                </span>
              ))}
              <span />
              <div className="relative w-[272px]">
                <Controller
                  control={control}
                  name={`${kind}.${index}.user`}
                  render={({ field: user }) => (
                    <UserPicker
                      id={fieldId}
                      value={user.value}
                      onChange={user.onChange}
                      roles={roles}
                      placeholder={placeholder}
                      withChevron
                      invalid={!!error}
                      describedBy={error ? `${fieldId}-error` : undefined}
                    />
                  )}
                />
                {error && (
                  <p
                    id={`${fieldId}-error`}
                    role="alert"
                    className="absolute top-full mt-1.5 pl-3 text-[13px] font-normal tracking-[-0.03em] text-destructive"
                  >
                    {error}
                  </p>
                )}
              </div>
              {flagColumns.map((flag) => (
                <Controller
                  key={flag.key}
                  control={control}
                  name={`${kind}.${index}.flags.${flag.key}`}
                  render={({ field: on }) => (
                    <Switch
                      size="sm"
                      aria-label={flag.label}
                      checked={on.value}
                      onCheckedChange={on.onChange}
                    />
                  )}
                />
              ))}
              <RemoveRowButton
                aria-label={`Убрать: ${label} #${index + 1}`}
                onClick={() => onRemove(index)}
              />
            </div>
            <hr className="border-border/80" />
          </Fragment>
        );
      })}
      {footer}
    </section>
  );
}

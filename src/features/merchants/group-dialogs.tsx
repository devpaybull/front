import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import type { ComponentProps } from "react";
import { useId } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import CloseIcon from "@/assets/icons/close.svg?react";
import EditIcon from "@/assets/icons/edit.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { OptionPicker } from "@/components/option-picker";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import {
  addToMerchantGroup,
  createMerchantGroup,
  merchantGroupsQuery,
  soloMerchantsQuery,
  updateMerchantGroup,
} from "./api";
import {
  type AddMerchantsForm,
  addMerchantsSchema,
  type JoinGroupForm,
  type JoinGroupValues,
  joinGroupSchema,
  type RenameGroupForm,
  renameGroupSchema,
} from "./schemas";
import type { MerchantOption } from "./types";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function useRefresh() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["merchants"] });
}

export function AddRowButton({
  className,
  children,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-11 w-fit items-center gap-[7px] rounded-[12px] border border-border bg-[#1b2127]/60 px-3 text-[15px] leading-none font-semibold tracking-[-0.02em] outline-none transition-colors hover:bg-[#1b2127] focus-visible:border-ring disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <PlusIcon className="size-6" />
      {children}
    </button>
  );
}

export function RemoveRowButton(props: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="grid size-5 shrink-0 place-items-center rounded text-foreground outline-none transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
      {...props}
    >
      <CloseIcon className="size-5" />
    </button>
  );
}

export function RenameGroupDialog({
  group,
  open,
  onOpenChange,
}: DialogProps & { group: MerchantOption }) {
  const id = useId();
  const refresh = useRefresh();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RenameGroupForm>({
    resolver: zodResolver(renameGroupSchema),
    defaultValues: { name: group.name },
  });

  const submit = handleSubmit(async ({ name }) => {
    try {
      await updateMerchantGroup(group.id, { name });
      await refresh();
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title="Изменить название"
      icon={<EditIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      error={errors.root?.message}
    >
      <FormField
        htmlFor={id}
        label="Название группы"
        error={errors.name?.message}
      >
        <Input
          id={id}
          autoComplete="off"
          placeholder="Введите название группы"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${id}-error` : undefined}
          {...register("name")}
        />
      </FormField>
    </FormDialog>
  );
}

export function JoinGroupDialog({
  merchant,
  open,
  onOpenChange,
}: DialogProps & { merchant: MerchantOption }) {
  const id = useId();
  const refresh = useRefresh();
  const groups = useQuery(merchantGroupsQuery());
  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<JoinGroupForm, unknown, JoinGroupValues>({
    resolver: zodResolver(joinGroupSchema),
    defaultValues: { mode: "new", name: "" },
  });
  const mode = watch("mode");
  const fieldErrors = errors as {
    name?: { message?: string };
    group?: { message?: string };
  };

  const submit = handleSubmit(async (values) => {
    try {
      if (values.mode === "new")
        await createMerchantGroup(values.name, [merchant.id]);
      else if (values.group)
        await addToMerchantGroup(values.group.id, [merchant.id]);
      await refresh();
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  const modeButton = (value: JoinGroupForm["mode"], label: string) => (
    <button
      type="button"
      aria-pressed={mode === value}
      onClick={() => {
        setValue("mode", value);
        clearErrors();
      }}
      className={cn(
        "h-[37px] rounded-[12px] text-[13px] leading-none font-semibold tracking-[-0.02em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        mode === value
          ? "bg-primary/10 text-primary"
          : "bg-[#1b2127]/60 hover:bg-[#1b2127]",
      )}
    >
      {label}
    </button>
  );

  return (
    <FormDialog
      title="Добавить в группу"
      icon={<PlusIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      error={errors.root?.message}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          {modeButton("new", "Создать новую группу")}
          {modeButton("existing", "Добавить в группу")}
        </div>
        <hr className="border-border/80" />
      </div>
      {mode === "new" ? (
        <FormField
          htmlFor={`${id}-name`}
          label="Название группы"
          error={fieldErrors.name?.message}
        >
          <Input
            id={`${id}-name`}
            autoComplete="off"
            placeholder="Введите название группы"
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? `${id}-name-error` : undefined}
            {...register("name")}
          />
        </FormField>
      ) : (
        <FormField
          htmlFor={`${id}-group`}
          label="Группа"
          error={fieldErrors.group?.message}
        >
          <Controller
            control={control}
            name="group"
            defaultValue={null}
            render={({ field }) => (
              <OptionPicker
                id={`${id}-group`}
                options={groups.data ?? []}
                loading={groups.isPending}
                value={field.value ?? null}
                onChange={field.onChange}
                placeholder="Введите название или выбирите группу"
                invalid={!!fieldErrors.group}
                describedBy={
                  fieldErrors.group ? `${id}-group-error` : undefined
                }
              />
            )}
          />
        </FormField>
      )}
    </FormDialog>
  );
}

export function AddMerchantsDialog({
  group,
  open,
  onOpenChange,
}: DialogProps & { group: MerchantOption }) {
  const id = useId();
  const refresh = useRefresh();
  const solo = useQuery(soloMerchantsQuery());
  const {
    control,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddMerchantsForm>({
    resolver: zodResolver(addMerchantsSchema),
    defaultValues: { merchants: [{ merchant: null }] },
  });
  const rows = useFieldArray({ control, name: "merchants" });
  const picked = watch("merchants");

  const submit = handleSubmit(async ({ merchants }) => {
    try {
      await addToMerchantGroup(
        group.id,
        merchants.flatMap((row) => (row.merchant ? [row.merchant.id] : [])),
      );
      await refresh();
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title="Добавить в группу"
      icon={<PlusIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      error={errors.root?.message ?? errors.merchants?.root?.message}
    >
      <div className="flex flex-col gap-6">
        <p className="max-w-[371px] text-[13px] leading-[1.25] font-medium tracking-[-0.03em] text-muted-foreground">
          Выберите одного или несколько мерчантов из списка что бы добавить в
          группу{" "}
          <span className="font-semibold text-foreground">“{group.name}”</span>
        </p>
        <hr className="border-border/80" />
        {rows.fields.map((row, index) => {
          const taken = new Set(
            picked.flatMap((p, n) =>
              n !== index && p.merchant ? [p.merchant.id] : [],
            ),
          );
          return (
            <div key={row.id} className="flex flex-col gap-6">
              <div className="flex items-end gap-5">
                <div className="flex-1">
                  <FormField htmlFor={`${id}-${index}`} label="Мерчант">
                    <Controller
                      control={control}
                      name={`merchants.${index}.merchant`}
                      render={({ field }) => (
                        <OptionPicker
                          id={`${id}-${index}`}
                          options={(solo.data ?? []).filter(
                            (m) => !taken.has(m.id),
                          )}
                          loading={solo.isPending}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Выберите мерчанта из списка"
                        />
                      )}
                    />
                  </FormField>
                </div>
                <div className="flex h-11 items-center">
                  <RemoveRowButton
                    aria-label={`Убрать мерчанта #${index + 1}`}
                    disabled={rows.fields.length === 1}
                    onClick={() => rows.remove(index)}
                  />
                </div>
              </div>
              <hr className="border-border/80" />
            </div>
          );
        })}
        <AddRowButton onClick={() => rows.append({ merchant: null })}>
          Добавить мерчанта
        </AddRowButton>
      </div>
    </FormDialog>
  );
}

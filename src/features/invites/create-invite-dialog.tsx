import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PlusIcon from "@/assets/icons/plus.svg?react";
import { DateInput } from "@/components/date-input";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { errorMessage } from "@/lib/api";
import { createInvite } from "./api";
import { InviteCreatedDialog } from "./invite-created-dialog";
import { inviteRoleLabels } from "./invite-status";
import { type NewInvite, type NewInviteForm, newInviteSchema } from "./schemas";
import type { Invite } from "./types";

const roleItems = Object.entries(inviteRoleLabels).map(([value, label]) => ({
  value,
  label,
}));

const defaultValues: NewInviteForm = {
  role: "trader",
  telegram: "",
  validUntil: "",
};

export function CreateInviteDialog() {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<Invite | null>(null);
  const [createdOpen, setCreatedOpen] = useState(false);
  const formId = useId();
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewInviteForm, unknown, NewInvite>({
    resolver: zodResolver(newInviteSchema),
    defaultValues,
  });

  const create = useMutation({
    mutationFn: createInvite,
    onSuccess: (invite) => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      setOpen(false);
      reset(defaultValues);
      setCreated(invite);
      setCreatedOpen(true);
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset(defaultValues);
        }}
      >
        <DialogTrigger render={<Button />}>
          <PlusIcon className="size-5" />
          Создать новый код
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <PlusIcon />
              Создать новый код
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <form
              id={formId}
              onSubmit={submit}
              noValidate
              className="flex flex-col gap-[22px]"
            >
              <FormField
                htmlFor={`${formId}-role`}
                label="Роль"
                required
                error={errors.role?.message}
              >
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      items={roleItems}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger id={`${formId}-role`} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField
                htmlFor={`${formId}-telegram`}
                label="Telegram"
                required
                error={errors.telegram?.message}
              >
                <Input
                  id={`${formId}-telegram`}
                  autoComplete="off"
                  placeholder="Telegram @username"
                  aria-invalid={!!errors.telegram}
                  aria-describedby={
                    errors.telegram ? `${formId}-telegram-error` : undefined
                  }
                  {...register("telegram")}
                />
              </FormField>

              <FormField
                htmlFor={`${formId}-valid-until`}
                label="Действует до"
                required
                error={errors.validUntil?.message}
              >
                <Controller
                  control={control}
                  name="validUntil"
                  render={({ field }) => (
                    <DateInput
                      id={`${formId}-valid-until`}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!errors.validUntil}
                      aria-describedby={
                        errors.validUntil
                          ? `${formId}-valid-until-error`
                          : undefined
                      }
                    />
                  )}
                />
              </FormField>

              {errors.root && (
                <p
                  role="alert"
                  className="text-[13px] leading-none tracking-[-0.03em] text-destructive"
                >
                  {errors.root.message}
                </p>
              )}
            </form>
          </DialogBody>

          <DialogFooter>
            <DialogClose render={<Button variant="secondary" />}>
              Отменить
            </DialogClose>
            <Button type="submit" form={formId} disabled={isSubmitting}>
              Создать код
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InviteCreatedDialog
        invite={created}
        open={createdOpen}
        onOpenChange={setCreatedOpen}
      />
    </>
  );
}

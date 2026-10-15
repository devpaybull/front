import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, max, parseISO, startOfToday } from "date-fns";
import { useId, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import ExtendIcon from "@/assets/icons/extend.svg?react";
import { DateInput } from "@/components/date-input";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/dates";
import { extendInvite } from "./api";
import { Chip } from "./chip";
import { type ExtendInviteForm, extendInviteSchema } from "./schemas";
import type { Invite } from "./types";

type ExtendInviteDialogProps = {
  invite: Invite;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExtendInviteDialog({
  invite,
  open,
  onOpenChange,
}: ExtendInviteDialogProps) {
  const formId = useId();
  const queryClient = useQueryClient();
  const schema = useMemo(
    () => extendInviteSchema(invite.validUntil),
    [invite.validUntil],
  );

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ExtendInviteForm, unknown, ExtendInviteForm>({
    resolver: zodResolver(schema),
    defaultValues: { validUntil: "" },
  });

  const extend = useMutation({
    mutationFn: (validUntil: string) => extendInvite(invite.id, validUntil),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      onOpenChange(false);
      reset();
    },
  });

  const submit = handleSubmit(async ({ validUntil }) => {
    try {
      await extend.mutateAsync(validUntil);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  const minDate = max([
    addDays(parseISO(invite.validUntil), 1),
    addDays(startOfToday(), 1),
  ]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <ExtendIcon />
            Продлить срок
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="flex flex-col gap-3.5">
            <DialogDescription>
              Чтобы продлить срок действия кода, введите или выберите новую дату
              в поле ниже
            </DialogDescription>
            <p className="flex items-center gap-3 text-[15px] leading-none font-semibold tracking-[-0.02em]">
              Сейчас код действителен до
              <Chip>{formatDate(invite.validUntil)}</Chip>
            </p>
          </div>

          <hr className="border-border/80" />

          <form
            id={formId}
            onSubmit={submit}
            noValidate
            className="flex flex-col gap-[22px]"
          >
            <FormField
              htmlFor={`${formId}-date`}
              label="Продлить до"
              required
              error={errors.validUntil?.message}
            >
              <Controller
                control={control}
                name="validUntil"
                render={({ field }) => (
                  <DateInput
                    id={`${formId}-date`}
                    value={field.value}
                    onChange={field.onChange}
                    minDate={minDate}
                    aria-invalid={!!errors.validUntil}
                    aria-describedby={
                      errors.validUntil ? `${formId}-date-error` : undefined
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
            Продлить срок
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

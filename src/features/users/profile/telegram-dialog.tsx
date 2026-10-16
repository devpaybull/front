import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import telegramLogo from "@/assets/icons/telegram.svg";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import { updateTelegram } from "../api";
import { type TelegramField, telegramSchemas } from "../schemas";
import type { UserProfile } from "../types";
import { useProfileMutation } from "./use-profile-mutation";

const fields = {
  login: {
    title: "Telegram login",
    label: "Login",
    placeholder: "Введите telegram login",
    initial: (user: UserProfile) => user.telegram ?? "",
    patch: (value: string | string[]) => ({ telegram: value as string }),
  },
  id: {
    title: "Telegram ID",
    label: "ID",
    placeholder: "Введите telegram ID",
    initial: (user: UserProfile) => user.telegramId ?? "",
    patch: (value: string | string[]) => ({ telegramId: value as string }),
  },
  groups: {
    title: "Telegram группы",
    label: "Группы",
    placeholder: "Через запятую: traders2026, paybull_push",
    initial: (user: UserProfile) => user.telegramGroups.join(", "),
    patch: (value: string | string[]) => ({
      telegramGroups: value as string[],
    }),
  },
} satisfies Record<TelegramField, unknown>;

type TelegramDialogProps = {
  field: TelegramField;
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TelegramDialog({
  field,
  user,
  open,
  onOpenChange,
}: TelegramDialogProps) {
  const id = useId();
  const config = fields[field];
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<{ value: string }, unknown, { value: string | string[] }>({
    resolver: zodResolver(telegramSchemas[field]),
    defaultValues: { value: config.initial(user) },
  });
  const save = useProfileMutation(user.id, (value: string | string[]) =>
    updateTelegram(user.id, config.patch(value)),
  );

  const submit = handleSubmit(async ({ value }) => {
    try {
      await save.mutateAsync(value);
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <FormDialog
      title={config.title}
      icon={<img src={telegramLogo} alt="" className="size-5" />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitting={isSubmitting}
      error={errors.root?.message}
    >
      <FormField
        htmlFor={`${id}-value`}
        label={config.label}
        required
        error={errors.value?.message}
      >
        <Input
          id={`${id}-value`}
          autoComplete="off"
          placeholder={config.placeholder}
          aria-invalid={!!errors.value}
          {...register("value")}
        />
      </FormField>
    </FormDialog>
  );
}

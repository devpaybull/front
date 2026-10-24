import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useId } from "react";
import { useForm } from "react-hook-form";
import CloseIcon from "@/assets/icons/close.svg?react";
import LogoutIcon from "@/assets/icons/logout.svg?react";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { logout } from "@/features/auth/api";
import { userRoleMeta } from "@/features/users/user-role";
import { errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/dates";
import { accountProfileQuery, changePassword } from "./api";
import { type PasswordChangeForm, passwordChangeSchema } from "./schemas";

export function BlockHeader({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1.5 leading-none tracking-[-0.02em]">
        <h2 className="text-[17px] font-bold">{title}</h2>
        <p className="text-[13px] font-medium text-muted-foreground">{sub}</p>
      </div>
      {children}
    </div>
  );
}

export function ProfileBlock() {
  const { data } = useQuery(accountProfileQuery());
  const client = useQueryClient();
  const navigate = useNavigate();

  const leave = async () => {
    await logout();
    client.clear();
    await navigate({ to: "/admin/login" });
  };

  return (
    <Panel className="flex flex-col gap-5 p-5 pt-[17px]">
      <BlockHeader
        title="Основная информация профиля"
        sub="Данные вашего аккаунта"
      >
        <Button
          variant="secondary"
          className="h-[35px] gap-[7px] rounded-[12px] border-border px-3"
          onClick={leave}
        >
          <LogoutIcon className="size-5" />
          Выйти из аккаунта
        </Button>
      </BlockHeader>
      <div className="grid grid-cols-3 gap-2.5 leading-none tracking-[-0.02em]">
        <div className="flex h-20 items-center gap-2.5 rounded-[10px] bg-[#101419] px-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-primary/10 text-[24px] font-bold text-primary">
            {data?.login.charAt(0).toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-[15px] font-semibold text-[#dadae5]">
              {data?.login ?? "…"}
            </span>
            <span className="text-[14px] font-medium text-[#dadae5]/60">
              {data && userRoleMeta[data.role].label}
            </span>
          </span>
        </div>
        <div className="flex h-20 flex-col justify-center gap-3 rounded-[10px] bg-[#101419] px-5">
          <span className="text-[13px] font-medium text-foreground/60">
            User ID
          </span>
          <span className="truncate text-[15px] font-semibold">
            {data?.id ?? "…"}
          </span>
        </div>
        <div className="flex h-20 flex-col justify-center gap-3 rounded-[10px] bg-[#101419] px-5">
          <span className="text-[13px] font-medium text-foreground/60">
            Дата регистрации
          </span>
          <span className="text-[15px] font-semibold">
            {data ? formatDate(data.createdAt) : "…"}
          </span>
        </div>
      </div>
    </Panel>
  );
}

export function PasswordBlock() {
  const id = useId();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful, isDirty },
  } = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { current: "", next: "", repeat: "" },
  });

  const submit = handleSubmit(async ({ current, next }) => {
    try {
      await changePassword(current, next);
      reset(undefined, { keepIsSubmitSuccessful: true });
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  const field = (
    name: keyof PasswordChangeForm,
    label: string,
    placeholder: string,
  ) => {
    const fieldId = `${id}-${name}`;
    const error = errors[name]?.message;
    return (
      <div className="relative flex flex-1 flex-col gap-1.5">
        <label
          htmlFor={fieldId}
          className="pl-3 text-[13px] leading-none font-semibold tracking-[-0.03em]"
        >
          {label}
        </label>
        <PasswordInput
          id={fieldId}
          autoComplete={
            name === "current" ? "current-password" : "new-password"
          }
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...register(name)}
        />
        {error && (
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="absolute top-full mt-1.5 pl-3 text-[13px] leading-none tracking-[-0.03em] text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <Panel className="flex flex-col gap-[35px] p-5 pt-[17px]">
      <BlockHeader
        title="Изменение пароля"
        sub="Введите свой текущий пароль что бы изменить его"
      />
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex items-end gap-7">
          <div className="flex w-[965px] gap-2.5">
            {field("current", "Текущий пароль", "Введите текущий пароль")}
            {field("next", "Новый пароль", "Введите новый пароль")}
            {field(
              "repeat",
              "Повторите новый пароль",
              "Повторите новый пароль",
            )}
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-[14px] px-5"
            >
              Сохранить
            </Button>
            <Button
              type="button"
              variant="secondary"
              aria-label="Очистить поля"
              title="Очистить поля"
              disabled={!isDirty}
              onClick={() => reset()}
              className="size-11 rounded-[14px] p-0 text-foreground/60"
            >
              <CloseIcon className="size-5" />
            </Button>
          </div>
        </div>
        {(errors.root || isSubmitSuccessful) && (
          <p
            role={errors.root ? "alert" : "status"}
            className={
              errors.root
                ? "mt-3 text-[13px] text-destructive"
                : "mt-3 text-[13px] text-green"
            }
          >
            {errors.root?.message ?? "Пароль изменён"}
          </p>
        )}
      </form>
    </Panel>
  );
}

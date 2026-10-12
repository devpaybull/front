import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { errorMessage } from "@/lib/api";
import { type Credentials, credentialsSchema } from "./schemas";

type CredentialsFormProps = {
  onSubmit: (values: Credentials) => void | Promise<void>;
};

export function CredentialsForm({ onSubmit }: CredentialsFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { login: "", password: "" },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-7.5">
      <FormField htmlFor="login" label="Логин" error={errors.login?.message}>
        <Input
          id="login"
          autoComplete="username"
          placeholder="Введите логин учетной записи"
          aria-invalid={!!errors.login}
          aria-describedby={errors.login ? "login-error" : undefined}
          {...register("login")}
        />
      </FormField>

      <FormField
        htmlFor="password"
        label="Пароль"
        error={errors.password?.message}
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Введите пароль"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
      </FormField>

      {errors.root && (
        <p
          role="alert"
          className="text-center text-[13px] leading-none tracking-[-0.03em] text-destructive"
        >
          {errors.root.message}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        Войти
      </Button>
    </form>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { errorMessage } from "@/lib/api";
import { type Otp, otpSchema } from "./schemas";

type OtpFormProps = {
  onSubmit: (values: Otp) => void | Promise<void>;
  onBack: () => void;
};

export function OtpForm({ onSubmit, onBack }: OtpFormProps) {
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Otp>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      setValue("code", "");
      setError("code", { message: errorMessage(error) });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-7.5">
      <div className="flex flex-col items-center gap-3">
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <InputOTP
              placeholder="000000"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={field.value}
              onChange={field.onChange}
              onComplete={() => submit()}
              aria-invalid={!!errors.code}
              containerClassName="justify-center"
            >
              <InputOTPGroup className="gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  return (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="p-2.5 rounded-[14px] border border-border bg-secondary text-foreground first:rounded-l-[14px] last:rounded-r-[14px]"
                    />
                  );
                })}
              </InputOTPGroup>
            </InputOTP>
          )}
        />
        {errors.code && (
          <p
            role="alert"
            className="text-[13px] leading-none tracking-[-0.03em] text-destructive"
          >
            {errors.code.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3 w-[435px]">
        <Button type="submit" disabled={isSubmitting}>
          Войти
        </Button>
        <Button type="button" variant="secondary" onClick={onBack}>
          Назад
        </Button>
      </div>
    </form>
  );
}

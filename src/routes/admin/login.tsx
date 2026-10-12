import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { currentUserQuery, login, verifyOtp } from "@/features/auth/api";
import { CredentialsForm } from "@/features/auth/credentials-form";
import { LoginArt } from "@/features/auth/login-art";
import { OtpForm } from "@/features/auth/otp-form";
import { getSessionUser } from "@/features/auth/session";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: async () => {
    if (await getSessionUser()) {
      throw redirect({ to: "/admin/inventory" });
    }
  },
  component: LoginPage,
});

type Step = "credentials" | "otp";

function LoginPage() {
  const [step, setStep] = useState<Step>("credentials");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return (
    <main className="flex min-h-svh gap-5 bg-[#000104] p-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden aspect-square h-[calc(100svh-2.5rem)] min-w-0 lg:block"
      >
        <LoginArt />
      </motion.div>

      <div className="flex flex-1 items-center justify-center lg:shrink-0 lg:basis-[535px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[535px] rounded-2xl border border-border/80 bg-[#1b2127]/35 px-6 pt-[41px] pb-[49px] sm:px-[49px]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-10"
            >
              {step === "credentials" ? (
                <>
                  <header className="flex flex-col items-center gap-3 text-center">
                    <h1 className="text-[28px] leading-none font-black tracking-[-0.02em] sm:text-[34px]">
                      Добро пожаловать
                    </h1>
                    <p className="text-sm leading-none font-medium tracking-[-0.02em] text-muted-foreground">
                      Введите логин и пароль, чтобы войти
                    </p>
                  </header>
                  <CredentialsForm
                    onSubmit={async (values) => {
                      await login(values);
                      setStep("otp");
                    }}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center gap-6 text-center">
                  <header className="flex flex-col items-center gap-3 text-center">
                    <h1 className="text-[28px] leading-none font-black tracking-[-0.02em] sm:text-[34px]">
                      Добро пожаловать
                    </h1>
                    <p className="text-sm leading-none font-medium tracking-[-0.02em] text-muted-foreground">
                      Подтвердите свою учетную запись, введите код двойной
                      аутентификации
                    </p>
                  </header>

                  <OtpForm
                    onSubmit={async (values) => {
                      const user = await verifyOtp(values);
                      queryClient.setQueryData(
                        currentUserQuery().queryKey,
                        user,
                      );
                      await navigate({ to: "/admin/inventory" });
                    }}
                    onBack={() => setStep("credentials")}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}

import { cn } from "cn";
import { Eye, EyeOff } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? Eye : EyeOff;

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:text-primary"
      >
        <Icon className="size-5" />
      </button>
    </div>
  );
}

export { PasswordInput };

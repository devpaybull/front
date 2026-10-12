import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  htmlFor: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

export function FormField({
  htmlFor,
  label,
  required,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="relative flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>
        <span>
          {label}
          {required && (
            <span aria-hidden className="text-orange">
              *
            </span>
          )}
        </span>
      </Label>
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="absolute top-full mt-1.5 pl-3 text-[13px] leading-none tracking-[-0.03em] text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

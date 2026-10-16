import {
  type ComponentProps,
  type FormEventHandler,
  type ReactNode,
  useId,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormDialogProps = {
  title: string;
  icon: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitting: boolean;
  error?: string;
  submitLabel?: string;
  footerStart?: ReactNode;
  children: ReactNode;
};

export function FormDialog({
  title,
  icon,
  open,
  onOpenChange,
  onSubmit,
  submitting,
  error,
  submitLabel = "Сохранить",
  footerStart,
  children,
}: FormDialogProps) {
  const formId = useId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="min-h-0 overflow-y-auto">
          <form
            id={formId}
            onSubmit={onSubmit}
            noValidate
            className="flex flex-col gap-[22px]"
          >
            {children}
            {error && (
              <p
                role="alert"
                className="text-[13px] leading-none tracking-[-0.03em] text-destructive"
              >
                {error}
              </p>
            )}
          </form>
        </DialogBody>

        <DialogFooter className="shrink-0 items-center">
          {footerStart && <div className="mr-auto">{footerStart}</div>}
          <DialogClose render={<Button variant="secondary" />}>
            Отменить
          </DialogClose>
          <Button type="submit" form={formId} disabled={submitting}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DialogTextButton(props: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="text-[15px] leading-none font-semibold tracking-[-0.02em] text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:text-primary disabled:opacity-40"
      {...props}
    />
  );
}

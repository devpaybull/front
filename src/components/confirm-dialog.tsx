import { useMutation } from "@tanstack/react-query";
import type { ReactNode } from "react";
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

type ConfirmDialogProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<unknown>;
};

export function ConfirmDialog({
  title,
  icon,
  children,
  confirmLabel,
  destructive = false,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const mutation = useMutation({
    mutationFn: onConfirm,
    onSuccess: () => onOpenChange(false),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) mutation.reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3.5">
          <DialogDescription>{children}</DialogDescription>
          {mutation.isError && (
            <p
              role="alert"
              className="text-[13px] leading-none tracking-[-0.03em] text-destructive"
            >
              {errorMessage(mutation.error)}
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Отменить
          </DialogClose>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

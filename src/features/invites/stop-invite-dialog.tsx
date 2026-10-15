import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloseIcon from "@/assets/icons/close.svg?react";
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
import { stopInvite } from "./api";
import { Chip } from "./chip";
import type { Invite } from "./types";

type StopInviteDialogProps = {
  invite: Invite;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StopInviteDialog({
  invite,
  open,
  onOpenChange,
}: StopInviteDialogProps) {
  const queryClient = useQueryClient();
  const stop = useMutation({
    mutationFn: () => stopInvite(invite.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) stop.reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <CloseIcon />
            Остановить досрочно
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-3.5">
          <DialogDescription>
            Вы уверены, что хотите остановить код досрочно? После этого действия
            код получит статус «Истекший» и будет неактивным
          </DialogDescription>
          <p className="flex items-center gap-3 text-[15px] leading-none font-semibold tracking-[-0.02em]">
            Код
            <Chip>{invite.code}</Chip>
          </p>
          {stop.isError && (
            <p
              role="alert"
              className="text-[13px] leading-none tracking-[-0.03em] text-destructive"
            >
              {errorMessage(stop.error)}
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Отменить
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => stop.mutate()}
            disabled={stop.isPending}
          >
            Да, остановить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

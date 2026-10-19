import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import CommentIcon from "@/assets/icons/comment-dots.svg?react";
import { DialogTextButton, FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api";
import { updateDebt } from "./api";
import { type DebtCommentForm, debtCommentSchema } from "./schemas";
import type { Debt } from "./types";
import { useDebtMutation } from "./use-debt-mutation";

type DialogProps = {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommentDialog({ debt, open, onOpenChange }: DialogProps) {
  const id = useId();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DebtCommentForm>({
    resolver: zodResolver(debtCommentSchema),
    defaultValues: { comment: debt.comment ?? "" },
  });
  const save = useDebtMutation((comment: string | null) =>
    updateDebt(debt.id, { comment }),
  );

  const run = async (comment: string | null) => {
    try {
      await save.mutateAsync(comment);
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  };

  return (
    <FormDialog
      title="Комментарий"
      icon={<CommentIcon />}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(({ comment }) => run(comment))}
      submitting={isSubmitting || save.isPending}
      error={errors.root?.message}
      footerStart={
        debt.comment && (
          <DialogTextButton disabled={save.isPending} onClick={() => run(null)}>
            Удалить комментарий
          </DialogTextButton>
        )
      }
    >
      <FormField
        htmlFor={id}
        label="Укажите комментарий к долгу"
        error={errors.comment?.message}
      >
        <Textarea
          id={id}
          placeholder="Введите комментарий"
          className="min-h-[152px]"
          aria-invalid={!!errors.comment}
          aria-describedby={errors.comment ? `${id}-error` : undefined}
          {...register("comment")}
        />
      </FormField>
    </FormDialog>
  );
}

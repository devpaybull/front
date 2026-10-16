import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import BookmarkIcon from "@/assets/icons/bookmark.svg?react";
import { FormField } from "@/components/form-field";
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
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api";
import { saveUserNote } from "../api";
import { type NoteForm, noteSchema } from "../schemas";
import type { UserProfile } from "../types";
import { useProfileMutation } from "./use-profile-mutation";

type NoteDialogProps = {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NoteDialog({ user, open, onOpenChange }: NoteDialogProps) {
  const formId = useId();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
    defaultValues: { text: user.note?.text ?? "" },
  });

  const save = useProfileMutation(user.id, ({ text }: NoteForm) =>
    saveUserNote(user.id, text),
  );

  const submit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <BookmarkIcon />
            Пометка трейдера
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form
            id={formId}
            onSubmit={submit}
            noValidate
            className="flex flex-col gap-[22px]"
          >
            <FormField
              htmlFor={`${formId}-text`}
              label="Пометка"
              error={errors.text?.message ?? errors.root?.message}
            >
              <Textarea
                id={`${formId}-text`}
                placeholder="Укажите особенности работы, ошибки и прочие нюансы трейдера"
                aria-invalid={!!errors.text}
                aria-describedby={
                  errors.text || errors.root
                    ? `${formId}-text-error`
                    : undefined
                }
                {...register("text")}
              />
            </FormField>
          </form>
        </DialogBody>

        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Отменить
          </DialogClose>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

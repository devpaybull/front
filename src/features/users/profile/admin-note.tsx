import { useState } from "react";
import EditIcon from "@/assets/icons/edit.svg?react";
import TrashIcon from "@/assets/icons/trash.svg?react";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/dates";
import { deleteUserNote } from "../api";
import type { UserNote, UserProfile } from "../types";
import { NoteDialog } from "./note-dialog";
import { useProfileMutation } from "./use-profile-mutation";

const buttonClass =
  "gap-2.5 bg-orange/10 px-6 text-orange hover:bg-orange/15 hover:text-orange";

export function AdminNote({
  user,
  note,
}: {
  user: UserProfile;
  note: UserNote;
}) {
  const [editing, setEditing] = useState(false);
  const [opening, setOpening] = useState(0);
  const remove = useProfileMutation(user.id, () => deleteUserNote(user.id));

  return (
    <section className="flex flex-wrap items-start justify-between gap-6 rounded-2xl border border-dashed border-orange/15 bg-orange/10 p-[27px] leading-none font-semibold tracking-[-0.02em]">
      <div className="flex min-w-0 flex-col gap-3">
        <h3 className="text-[15px] text-orange">Пометка администратора</h3>
        <p className="text-[13px] leading-[17px] whitespace-pre-line">
          {note.text}
        </p>
        <p className="text-[13px] text-muted-foreground">
          {note.author} · {formatDate(note.updatedAt)}{" "}
          {formatTime(note.updatedAt)}
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          variant="secondary"
          className={buttonClass}
          onClick={() => {
            setOpening((n) => n + 1);
            setEditing(true);
          }}
        >
          <EditIcon className="size-[15px]" />
          Редактировать
        </Button>
        <Button
          variant="secondary"
          className={buttonClass}
          disabled={remove.isPending}
          onClick={() => remove.mutate()}
        >
          <TrashIcon className="size-5" />
          Удалить
        </Button>
      </div>

      <NoteDialog
        key={opening}
        user={user}
        open={editing}
        onOpenChange={setEditing}
      />
    </section>
  );
}

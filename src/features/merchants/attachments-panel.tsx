import { Link } from "@tanstack/react-router";
import CascadesIcon from "@/assets/icons/cascades.svg?react";
import TrashIcon from "@/assets/icons/trash.svg?react";
import { IconCell, IconTile } from "@/components/icon-tile";
import { LetterAvatar } from "@/components/letter-avatar";
import { Switch } from "@/components/ui/switch";
import { tailId } from "@/lib/format";
import { detachFromMerchant, updateMerchantAttachment } from "./api";
import type {
  Attachment,
  AttachmentFlags,
  Merchant,
  MerchantAttachments,
} from "./types";
import { mapMerchant, useMerchantsMutation } from "./use-merchants-mutation";

type Kind = keyof MerchantAttachments;

const rowFlags: { key: keyof AttachmentFlags; label: string }[] = [
  { key: "trade", label: "Торг." },
  { key: "cards", label: "Карта" },
  { key: "sbp", label: "СБП" },
];

export function AttachmentsPanel({ merchant }: { merchant: Merchant }) {
  const toggle = useMerchantsMutation(
    (v: { kind: Kind; userId: string; flags: Partial<AttachmentFlags> }) =>
      updateMerchantAttachment(merchant.id, v.kind, v.userId, v.flags),
    (list, v) =>
      mapMerchant(list, merchant.id, (m) => ({
        ...m,
        [v.kind]: m[v.kind].map((a) =>
          a.id === v.userId ? { ...a, flags: { ...a.flags, ...v.flags } } : a,
        ),
      })),
  );
  const detach = useMerchantsMutation(
    (v: { kind: Kind; userId: string }) =>
      detachFromMerchant(merchant.id, v.kind, v.userId),
    (list, v) =>
      mapMerchant(list, merchant.id, (m) => ({
        ...m,
        [v.kind]: m[v.kind].filter((a) => a.id !== v.userId),
      })),
  );

  const block = (kind: Kind, title: string, empty: string) => (
    <section className="flex flex-col gap-5 rounded-[11px] bg-[#101419]/60 p-3.5">
      <h3 className="text-[13px]">
        {title} ({merchant[kind].length})
      </h3>
      {merchant[kind].length === 0 ? (
        <p className="pb-1 text-[13px] text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col">
          {merchant[kind].map((a) => (
            <AttachmentRow
              key={a.id}
              kind={kind}
              attachment={a}
              onToggle={(flags) => toggle.mutate({ kind, userId: a.id, flags })}
              onDetach={() => detach.mutate({ kind, userId: a.id })}
            />
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="grid grid-cols-2 gap-[21px] pt-[15px]">
      {block("traders", "Прикрепленные трейдеры", "Трейдеров нет")}
      {block("cascades", "Прикрепленные каскады", "Каскадов нет")}
    </div>
  );
}

function AttachmentRow({
  kind,
  attachment: a,
  onToggle,
  onDetach,
}: {
  kind: Kind;
  attachment: Attachment;
  onToggle: (flags: Partial<AttachmentFlags>) => void;
  onDetach: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-border/80 pb-4 not-first:pt-4 last:border-b-0 last:pb-0">
      <Link
        to="/admin/users/$userId"
        params={{ userId: a.id }}
        className="min-w-0 outline-none transition-colors hover:text-blue focus-visible:text-blue"
      >
        <IconCell
          tile={
            kind === "traders" ? (
              <LetterAvatar name={a.login} />
            ) : (
              <IconTile tone="orange">
                <CascadesIcon />
              </IconTile>
            )
          }
          main={a.login}
          sub={<span title={a.id}>{tailId(a.id)}</span>}
        />
      </Link>
      <div className="flex shrink-0 items-center gap-2.5">
        {rowFlags.map(({ key, label }) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: the Switch inside is the control
          <label
            key={key}
            className="flex h-10 items-center gap-3.5 rounded-[12px] bg-[#3e454d]/30 px-2.5"
          >
            {label}
            <Switch
              size="sm"
              checked={a.flags[key]}
              onCheckedChange={(checked) => onToggle({ [key]: checked })}
            />
          </label>
        ))}
        <button
          type="button"
          aria-label={`Открепить ${a.login}`}
          title="Открепить"
          onClick={onDetach}
          className="grid size-5 place-items-center text-foreground/60 outline-none transition-colors hover:text-destructive focus-visible:text-destructive"
        >
          <TrashIcon className="size-5" />
        </button>
      </div>
    </li>
  );
}

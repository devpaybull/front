import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { motion } from "motion/react";
import { useState } from "react";
import ChevronDownIcon from "@/assets/icons/chevron-down-20.svg?react";
import { avatarToneFor, LetterAvatar } from "@/components/letter-avatar";
import type { UserRef } from "./types";

const FOLDED_COUNT = 3;
const FOLDED_HEIGHT = 58;

const chipClass =
  "flex h-[38px] shrink-0 items-center gap-2.5 rounded-[10px] border border-transparent bg-[#1b2127]/60 p-[7px] text-[15px] leading-none font-semibold tracking-[-0.02em]";

export function DependenciesCell({ users }: { users: UserRef[] }) {
  const [open, setOpen] = useState(false);
  const [wrapped, setWrapped] = useState(false);

  if (users.length === 0) {
    return (
      <Box>
        <span className={cn(chipClass, "px-[9px]")}>-</span>
      </Box>
    );
  }

  const foldable = users.length > 2;
  const hidden = users.length - FOLDED_COUNT;
  const toggle = () => {
    setOpen(!open);
    if (!open) setWrapped(true);
  };

  return (
    <motion.div
      initial={false}
      animate={{ height: open ? "auto" : FOLDED_HEIGHT }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      onAnimationComplete={() => setWrapped(open)}
      className="relative w-[410px] overflow-hidden rounded-[12px] bg-[#101419]"
    >
      <ul
        className={cn(
          "flex gap-2 p-2.5",
          wrapped ? "flex-wrap pr-[52px]" : "overflow-hidden",
        )}
      >
        {(wrapped ? users : users.slice(0, FOLDED_COUNT)).map((user) => (
          <li key={user.id} className="flex">
            <UserChip user={user} />
          </li>
        ))}
      </ul>

      {foldable && (
        <>
          {!wrapped && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 flex"
            >
              <div className="w-[34px] bg-linear-to-r from-[#11151a]/0 to-[#101419]" />
              <div className="w-[81px] bg-[#101419]" />
            </div>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-label={
              open ? "Свернуть зависимости" : "Показать все зависимости"
            }
            className="absolute top-[19px] right-[18px] flex items-center gap-1.5 rounded text-[13px] leading-none font-semibold tracking-[-0.03em] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {!wrapped && hidden > 0 && (
              <span className="rounded bg-[#262a30] px-1 py-0.5">
                +{hidden}
              </span>
            )}
            <ChevronDownIcon
              className={cn(
                "size-5 text-foreground/60 transition-transform duration-300",
                open && "rotate-180",
              )}
            />
          </button>
        </>
      )}
    </motion.div>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[58px] w-[410px] items-center rounded-[12px] bg-[#101419] px-2.5">
      {children}
    </div>
  );
}

function UserChip({ user }: { user: UserRef }) {
  return (
    <Link
      to="/admin/users/$userId"
      params={{ userId: user.id }}
      className={cn(
        chipClass,
        "outline-none transition-colors hover:border-[#303840] hover:bg-[#1b2127] focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <LetterAvatar
        name={user.login}
        tone={avatarToneFor(user.login)}
        className="size-[22px] rounded-[5px] text-[13px]"
      />
      {user.login}
    </Link>
  );
}

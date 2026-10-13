import { cn } from "cn";

const tones = {
  primary: "bg-primary/10 text-primary",
  green: "bg-green/10 text-green",
  blue: "bg-blue/10 text-blue",
};

export type AvatarTone = keyof typeof tones;

export function avatarToneFor(name: string): AvatarTone {
  const keys = Object.keys(tones) as AvatarTone[];
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return keys[sum % keys.length];
}

export function LetterAvatar({
  name,
  tone = "primary",
  className,
}: {
  name: string;
  tone?: AvatarTone;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-[31px] shrink-0 place-items-center rounded-lg text-[17px] leading-none font-bold tracking-[-0.03em]",
        tones[tone],
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

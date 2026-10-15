import { createContext } from "react";

export const HighlightContext = createContext("");

export function Highlighted({ text, part }: { text: string; part: string }) {
  const at = part ? text.toUpperCase().indexOf(part.toUpperCase()) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[3px] bg-primary/15 text-primary">
        {text.slice(at, at + part.length)}
      </mark>
      {text.slice(at + part.length)}
    </>
  );
}

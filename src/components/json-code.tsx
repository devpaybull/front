import { cn } from "cn";
import type { ReactNode } from "react";

const token =
  /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g;

function highlight(text: string) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(token)) {
    const [whole, string, colon, number, literal] = match;
    const at = match.index;
    parts.push(text.slice(last, at));
    if (string && colon) parts.push(whole);
    else
      parts.push(
        <span key={at} className={string ? "text-blue" : "text-orange"}>
          {string ?? number ?? literal}
        </span>,
      );
    last = at + whole.length;
  }
  parts.push(text.slice(last));
  return parts;
}

export function JsonCode({ value, wrap }: { value: unknown; wrap: boolean }) {
  const text = JSON.stringify(value, null, 2);
  return (
    <pre
      className={cn(
        "font-mono text-[13px] leading-[1.2] font-normal tracking-normal",
        wrap
          ? "break-all whitespace-pre-wrap"
          : "overflow-x-auto whitespace-pre",
      )}
    >
      <code>{highlight(text)}</code>
    </pre>
  );
}

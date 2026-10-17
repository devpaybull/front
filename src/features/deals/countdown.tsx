import { differenceInSeconds, parseISO } from "date-fns";
import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

export function useSecondsLeft(to: string) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return Math.max(0, differenceInSeconds(parseISO(to), now));
}

export function Countdown({ to }: { to: string }) {
  const left = useSecondsLeft(to);
  const hours = Math.floor(left / 3600);
  const time = `${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
  return (
    <time dateTime={to} className="tabular-nums">
      {hours > 0 ? `${hours}:${time}` : time}
    </time>
  );
}

export function niceTicks(max: number, steps = 4) {
  const raw = Math.max(max, 1) / steps;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? raw;
  return Array.from({ length: steps + 1 }, (_, i) => i * step);
}

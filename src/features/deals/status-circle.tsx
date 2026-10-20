export function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className={className ?? "size-5"}
    >
      <rect
        x="1.61816"
        y="1.61774"
        width="16.7645"
        height="16.7645"
        rx="8.38226"
        fill="currentColor"
      />
      <path
        d="M6.76758 9.99998L8.92302 12.1554L13.2339 7.84454"
        stroke="#0C1014"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

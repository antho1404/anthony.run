export function GridBackground() {
  return (
    <div className="absolute inset-0">
      <div className="size-full bg-radial from-muted/80 to-muted/0"></div>
      <div className="grid grid-cols-12 grid-rows-12 pointer-events-none">
        {Array.from({ length: 13 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute left-0 right-0 h-px bg-muted"
            style={{ top: `${(i / 12) * 100}%` }}
          />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute top-0 bottom-0 w-px bg-muted"
            style={{ left: `${(i / 12) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

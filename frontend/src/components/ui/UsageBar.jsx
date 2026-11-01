// Employees used / limit. limit null = unlimited (Pro). 80% se upar rang rust ho jata hai.
export default function UsageBar({ used, limit, label = 'Employees' }) {
  if (limit == null) {
    return (
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-mono text-xs uppercase tracking-wider text-ash">{label}</span>
          <span className="font-mono text-sm text-ink">{used} · Unlimited</span>
        </div>
        <div className="h-2 rounded-full bg-teal/20 overflow-hidden">
          <div className="h-full w-full rounded-full bg-teal/60" />
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((used / limit) * 100));
  const high = pct >= 80;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-xs uppercase tracking-wider text-ash">{label}</span>
        <span className={`font-mono text-sm ${high ? 'text-rust' : 'text-ink'}`}>
          {used} / {limit}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} used`}
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        className="h-2 rounded-full bg-border overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${high ? 'bg-rust' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

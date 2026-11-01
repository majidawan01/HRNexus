import { Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';

const SLICES = [
  { key: 'pro', name: 'Pro', color: '#4C5FD9' },
  { key: 'free', name: 'Free', color: '#CFC8B8' },
];

export default function PlanBreakdownChart({ summary, loading }) {
  return (
    <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-border shadow-sm h-full">
      <p className="font-mono text-xs uppercase tracking-wider text-ash mb-4">Plan breakdown</p>

      {loading ? (
        <div className="flex flex-col items-center gap-4 py-2">
          <Skeleton className="h-44 w-44 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : summary.total === 0 ? (
        <EmptyState icon={Building2} title="No companies yet" text="Plan split appears once companies sign up." />
      ) : (
        <>
          <div className="relative h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SLICES.map((s) => ({ name: s.name, value: summary[s.key] }))}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={summary.pro && summary.free ? 3 : 0}
                  stroke="none"
                >
                  {SLICES.map((s) => (
                    <Cell key={s.key} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '12px', color: '#FFFFFF' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-display text-3xl font-semibold text-ink">{summary.total}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ash">companies</span>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {SLICES.map((s) => {
              const pct = Math.round((summary[s.key] / summary.total) * 100);
              return (
                <li key={s.key} className="flex items-center justify-between text-sm font-body">
                  <span className="flex items-center gap-2 text-ink/80">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-mono text-ink">
                    {summary[s.key]} <span className="text-ash">({pct}%)</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';

export default function SignupsChart({ series, loading }) {
  const total = series.reduce((sum, p) => sum + p.signups, 0);

  return (
    <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-border shadow-sm h-full">
      <div className="flex items-baseline justify-between mb-4">
        <p className="font-mono text-xs uppercase tracking-wider text-ash">Signups, last 30 days</p>
        {!loading && <p className="font-mono text-sm text-ink">{total} new</p>}
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : total === 0 ? (
        <EmptyState icon={TrendingUp} title="No signups in the last 30 days" text="New companies will show up here." />
      ) : (
        // Parent ki height fixed, warna ResponsiveContainer chart nahi dikhata
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4C5FD9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4C5FD9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A0A" vertical={false} />
              <XAxis dataKey="label" stroke="#8A8A8A" fontSize={11} interval="preserveStartEnd" minTickGap={28} />
              <YAxis stroke="#8A8A8A" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '12px', color: '#FFFFFF' }}
                labelStyle={{ color: '#FFFFFF' }}
                itemStyle={{ color: '#FFFFFF' }}
                formatter={(v) => [v, 'Signups']}
              />
              <Area
                type="monotone"
                dataKey="signups"
                stroke="#4C5FD9"
                strokeWidth={2}
                fill="url(#signupFill)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

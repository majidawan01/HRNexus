import { useMemo, useState } from 'react';
import { Building2, Search } from 'lucide-react';
import PlanBadge from '../ui/PlanBadge';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { formatDate } from '../../lib/superadminStats';

const PAGE_SIZE = 15;
const TH = 'px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash text-left';

const usage = (c) => (c.employeeLimit == null ? `${c.employeeCount} · Unlimited` : `${c.employeeCount} / ${c.employeeLimit}`);

export default function CompaniesTable({ companies, loading }) {
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState('all');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((c) => {
      if (plan !== 'all' && c.plan !== plan) return false;
      if (!q) return true;
      return [c.name, c.adminEmail, c.adminName].some((v) => v?.toLowerCase().includes(q));
    });
  }, [companies, query, plan]);

  const shown = filtered.slice(0, visible);
  const clear = () => {
    setQuery('');
    setPlan('all');
    setVisible(PAGE_SIZE);
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between border-b border-border">
        <p className="font-mono text-xs uppercase tracking-wider text-ash">
          All companies{!loading && ` (${filtered.length})`}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search company or admin..."
              aria-label="Search companies"
              className="w-full sm:w-64 pl-9 pr-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
            />
          </div>
          <select
            value={plan}
            onChange={(e) => {
              setPlan(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            aria-label="Filter by plan"
            className="px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All plans</option>
            <option value="pro">Pro</option>
            <option value="free">Free</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-5 sm:p-6 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState icon={Building2} title="No companies yet" text="Companies appear here as soon as someone signs up." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No companies match"
          text="Try a different search or plan filter."
          action={
            <Button variant="secondary" size="sm" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <table className="hidden md:table w-full">
            <thead>
              <tr className="border-b border-border">
                <th className={TH}>Company</th>
                <th className={TH}>Plan</th>
                <th className={TH}>Employees</th>
                <th className={TH}>Admin</th>
                <th className={TH}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c._id} className="border-b border-border/60 hover:bg-bg/50 transition">
                  <td className="px-6 py-4 font-body text-sm text-ink font-medium">{c.name}</td>
                  <td className="px-6 py-4">
                    <PlanBadge plan={c.plan} />
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-ink">{usage(c)}</td>
                  <td className="px-6 py-4">
                    <p className="font-body text-sm text-ink">{c.adminName || '—'}</p>
                    <p className="font-mono text-xs text-ash">{c.adminEmail || '—'}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-ash whitespace-nowrap">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-border">
            {shown.map((c) => (
              <li key={c._id} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display font-semibold text-ink truncate">{c.name}</p>
                  <PlanBadge plan={c.plan} />
                </div>
                <p className="mt-1 text-sm font-body text-ink/70 truncate">
                  {c.adminName || '—'} · <span className="font-mono text-xs">{c.adminEmail || '—'}</span>
                </p>
                <p className="mt-2 flex justify-between text-xs font-mono text-ash">
                  <span>Employees: {usage(c)}</span>
                  <span>{formatDate(c.createdAt)}</span>
                </p>
              </li>
            ))}
          </ul>

          {filtered.length > shown.length && (
            <div className="p-4 text-center border-t border-border">
              <Button variant="secondary" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Show more ({filtered.length - shown.length} left)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

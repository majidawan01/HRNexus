import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Clock, Calendar, Wallet, AlertTriangle, Sparkles, RefreshCw, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import UsageBar from '../components/ui/UsageBar';
import API from '../api/axios';
import { useAuth } from '../context/auth-context';
import { useUpgrade } from '../context/upgrade-context';

const errorText = (err) => {
  if (err.code === 'ECONNABORTED') return 'The server is taking too long to respond.';
  if (!err.response) return 'Cannot reach the server. Check your connection.';
  return err.response.data?.message || 'Could not load the dashboard.';
};

export default function Dashboard() {
  const { user, company } = useAuth();
  const { openUpgrade } = useUpgrade();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const isAdmin = user.role === 'admin';
  const canManage = isAdmin || user.role === 'hr';

  // Ek hi request (/dashboard/stats). Timeout axios mein hai (15s), is liye "Loading..." kabhi hamesha nahi atakta.
  useEffect(() => {
    let cancelled = false;
    API.get('/dashboard/stats')
      .then((res) => {
        if (cancelled) return;
        setStats(res.data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorText(err));
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  };

  const loading = status === 'loading';
  const showPayroll = stats ? stats.totalPayroll !== null : canManage;

  const cards = [
    { label: 'Total Employees', value: stats?.totalEmployees, icon: Users, bg: 'bg-accent/10', text: 'text-accent' },
    { label: 'Present Today', value: stats?.presentToday, icon: Clock, bg: 'bg-teal/10', text: 'text-teal' },
    { label: 'Pending Leaves', value: stats?.pendingLeaves, icon: Calendar, bg: 'bg-rust/10', text: 'text-rust' },
    ...(showPayroll
      ? [
          {
            label: 'Total Payroll (Net)',
            value: stats ? `Rs. ${stats.totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : undefined,
            icon: Wallet,
            bg: 'bg-accent/10',
            text: 'text-accent',
          },
        ]
      : []),
  ];

  // Usage: employees / limit (limit null = Pro, unlimited)
  const used = stats?.totalEmployees ?? 0;
  const limit = company?.employeeLimit ?? null;
  const onFree = company?.plan === 'free' && limit != null;
  const pct = onFree ? used / limit : 0;
  const nearLimit = onFree && stats && pct >= 0.8;
  const atLimit = onFree && stats && used >= limit;

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <div className="mb-8">
          <p className="font-mono text-xs text-ash uppercase tracking-widest mb-1">Overview</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
            Welcome back, <span className="text-accent">{user.name?.split(' ')[0]}</span>
          </h1>
        </div>

        {status === 'error' && (
          <div role="alert" className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between rounded-2xl border border-rust/30 bg-rust/5 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-rust mt-0.5 shrink-0" />
              <div>
                <p className="font-display font-semibold text-ink">Could not load your dashboard</p>
                <p className="text-sm font-body text-ink/70">{error}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={retry}>
              <RefreshCw size={15} /> Try again
            </Button>
          </div>
        )}

        {/* Upgrade ka suggestion (80% ya zyada) */}
        {nearLimit && canManage && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between rounded-2xl border border-accent/30 bg-accent/[0.06] px-5 py-4">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="text-accent mt-0.5 shrink-0" />
              <div>
                <p className="font-display font-semibold text-ink">
                  {atLimit ? 'You have reached your Free plan limit' : `You have used ${used} of ${limit} employees`}
                </p>
                <p className="text-sm font-body text-ink/70">
                  {isAdmin
                    ? 'Upgrade to Pro for unlimited employees.'
                    : 'Ask your admin to upgrade to Pro for unlimited employees.'}
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={openUpgrade}>
                Upgrade to Pro
              </Button>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${cards.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 mb-6`}>
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-surface rounded-2xl p-6 border border-border shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4 ${card.text}`}>
                <card.icon size={20} />
              </div>
              <p className="font-mono text-xs uppercase tracking-wider text-ash mb-1">{card.label}</p>
              {loading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="font-display text-2xl font-semibold text-ink">{card.value ?? '—'}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Usage */}
        {canManage && company && (
          <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm mb-6">
            {loading ? (
              <>
                <Skeleton className="h-4 w-40 mb-3" />
                <Skeleton className="h-2 w-full" />
              </>
            ) : (
              <UsageBar used={used} limit={limit} label="Employees used" />
            )}
          </div>
        )}

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-surface rounded-2xl p-6 border border-border shadow-sm"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-ash mb-4">Employees by Department</p>

          {loading ? (
            <div className="h-72 flex items-end gap-4 px-2" aria-label="Loading chart">
              {[55, 80, 40, 65, 30].map((h, i) => (
                <Skeleton key={i} className="flex-1 rounded-b-none" style={{ height: `${h}%` }} />
              ))}
            </div>
          ) : status === 'error' ? (
            <EmptyState icon={AlertTriangle} title="Chart unavailable" text="We could not load the data for this chart." />
          ) : stats.departmentCounts.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No employees yet"
              text="Add your first employee to see the department breakdown."
              action={
                canManage && (
                  <Button to="/employees" size="sm">
                    <UserPlus size={16} /> Add employee
                  </Button>
                )
              }
            />
          ) : (
            // Parent ki height fixed hai, warna ResponsiveContainer 0 height par chart dikhata hi nahi
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.departmentCounts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A0A" />
                  <XAxis dataKey="name" stroke="#8A8A8A" fontSize={12} />
                  <YAxis stroke="#8A8A8A" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '12px', color: '#FFFFFF' }}
                    cursor={{ fill: '#4C5FD90D' }}
                  />
                  <Bar dataKey="count" fill="#4C5FD9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {isAdmin && company?.plan === 'free' && !nearLimit && (
          <p className="mt-6 text-xs font-body text-ash">
            Need more room? <Link to="/settings" className="text-accent hover:underline">See your plan</Link>
          </p>
        )}
      </div>
    </Layout>
  );
}

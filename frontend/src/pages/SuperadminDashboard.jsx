import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Building2, Crown, RefreshCw, Users, UserRound } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import StatCard from '../components/superadmin/StatCard';
import PlanBreakdownChart from '../components/superadmin/PlanBreakdownChart';
import SignupsChart from '../components/superadmin/SignupsChart';
import CompaniesTable from '../components/superadmin/CompaniesTable';
import API from '../api/axios';
import { buildSignupSeries, summarize } from '../lib/superadminStats';

const errorText = (err) => {
  if (err.code === 'ECONNABORTED') return 'The server is taking too long to respond.';
  if (!err.response) return 'Cannot reach the server. Check your connection.';
  return err.response.data?.message || 'Could not load companies.';
};

export default function SuperadminDashboard() {
  const [companies, setCompanies] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    API.get('/superadmin/companies')
      .then((res) => {
        if (cancelled) return;
        setCompanies(res.data);
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

  const reload = () => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  };

  const loading = status === 'loading';
  const summary = useMemo(() => summarize(companies), [companies]);
  const series = useMemo(() => buildSignupSeries(companies, 30), [companies]);
  const proShare = summary.total ? Math.round((summary.pro / summary.total) * 100) : 0;

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-ash uppercase tracking-widest mb-1">Platform</p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Companies</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={reload} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>

        {status === 'error' && (
          <div
            role="alert"
            className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between rounded-2xl border border-rust/30 bg-rust/5 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-rust mt-0.5 shrink-0" />
              <div>
                <p className="font-display font-semibold text-ink">Could not load companies</p>
                <p className="text-sm font-body text-ink/70">{error}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={reload}>
              <RefreshCw size={15} /> Try again
            </Button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total companies" value={summary.total} icon={Building2} loading={loading} />
            <StatCard
              label="Pro companies"
              value={summary.pro}
              hint={summary.total ? `${proShare}% of all companies` : undefined}
              icon={Crown}
              tone="bg-teal/10 text-teal"
              loading={loading}
            />
            <StatCard label="Free companies" value={summary.free} icon={UserRound} tone="bg-ash/15 text-ink/70" loading={loading} />
            <StatCard
              label="Employees across all"
              value={summary.employees.toLocaleString()}
              icon={Users}
              loading={loading}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SignupsChart series={series} loading={loading} />
            </div>
            <PlanBreakdownChart summary={summary} loading={loading} />
          </div>

          <CompaniesTable companies={companies} loading={loading} />
        </motion.div>
      </div>
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Copy, Database, Eye, EyeOff, Fingerprint, RefreshCw, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import PlanBadge from '../components/ui/PlanBadge';
import Skeleton from '../components/ui/Skeleton';
import UsageBar from '../components/ui/UsageBar';
import API from '../api/axios';
import { useAuth } from '../context/auth-context';
import { useConfirm } from '../context/confirm-context';
import { useToast } from '../context/toast-context';
import { useUpgrade } from '../context/upgrade-context';

const errorText = (err, fallback) =>
  err.response?.data?.message || (err.response ? fallback : 'Cannot reach the server. Check your connection.');

function Card({ icon: Icon, title, description, children }) {
  return (
    <section className="bg-surface rounded-2xl border border-border shadow-sm p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          {description && <p className="text-sm font-body text-ink/70 mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function CopyRow({ label, value, secret = false }) {
  const toast = useToast();
  const [show, setShow] = useState(!secret);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy. Select the text and copy it manually.');
    }
  };

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-ash mb-1.5">{label}</p>
      <div className="flex items-stretch gap-2">
        <code className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-bg border border-border text-sm font-mono text-ink truncate">
          {show ? value : '•'.repeat(24)}
        </code>
        {secret && (
          <button
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide' : 'Show'}
            className="px-3 rounded-xl border border-border text-ash hover:text-ink hover:bg-bg transition"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        <button
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="px-3 rounded-xl border border-border text-ash hover:text-ink hover:bg-bg transition"
        >
          {copied ? <Check size={16} className="text-teal" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const { refreshCompany } = useAuth();
  const { openUpgrade } = useUpgrade();
  const confirm = useConfirm();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [loadingSample, setLoadingSample] = useState(false);

  useEffect(() => {
    let cancelled = false;
    API.get('/company/me')
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorText(err, 'Could not load settings.'));
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

  const loadSample = async () => {
    const ok = await confirm({
      title: 'Load sample data?',
      message:
        'This adds 8 demo employees (DEMO-001 to DEMO-008) and about a week of attendance records to your company only. You can do this just once.',
      confirmText: 'Load sample data',
    });
    if (!ok) return;

    setLoadingSample(true);
    try {
      const res = await API.post('/company/sample-data');
      toast.success(`Added ${res.data.employeesAdded} employees and ${res.data.attendanceAdded} attendance records.`);
      reload();
      refreshCompany();
    } catch (err) {
      toast.error(errorText(err, 'Could not load sample data.'));
      if (err.response?.data?.code === 'SAMPLE_ALREADY_LOADED') reload();
    } finally {
      setLoadingSample(false);
    }
  };

  const webhookUrl = `${API.defaults.baseURL}/biometric/webhook`;
  const loading = status === 'loading';

  return (
    <Layout>
      <div className="p-4 sm:p-8 max-w-3xl">
        <div className="mb-8">
          <p className="font-mono text-xs text-ash uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Settings</h1>
        </div>

        {status === 'error' && (
          <div role="alert" className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between rounded-2xl border border-rust/30 bg-rust/5 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-rust mt-0.5 shrink-0" />
              <div>
                <p className="font-display font-semibold text-ink">Could not load settings</p>
                <p className="text-sm font-body text-ink/70">{error}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={reload}>
              <RefreshCw size={15} /> Try again
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <Card icon={Sparkles} title="Plan and usage" description="Your company's plan and how much of it you use.">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : data ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <p className="font-display text-lg font-semibold text-ink">{data.name}</p>
                  <PlanBadge plan={data.plan} />
                </div>
                <UsageBar used={data.employeeCount} limit={data.employeeLimit} />
                {data.plan === 'free' ? (
                  <Button onClick={openUpgrade}>Upgrade to Pro</Button>
                ) : (
                  <p className="text-sm font-body text-ink/70">You are on Pro. Add as many employees as you need.</p>
                )}
              </div>
            ) : null}
          </Card>

          <Card
            icon={Fingerprint}
            title="Biometric device"
            description="Point your attendance device (ADMS push) at this webhook. Keep the key private."
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : data ? (
              <div className="space-y-4">
                <CopyRow label="Webhook URL" value={webhookUrl} />
                <CopyRow label="Company key" value={data.biometricKey} secret />
                <p className="text-xs font-body text-ash leading-relaxed">
                  Send the key in the <code className="font-mono">x-biometric-key</code> header, or append{' '}
                  <code className="font-mono">?key=YOUR_KEY</code> to the URL if your device cannot set headers. Each
                  employee&apos;s <code className="font-mono">biometricId</code> must match their device ID.
                </p>
              </div>
            ) : null}
          </Card>

          <Card
            icon={Database}
            title="Sample data"
            description="Fill your workspace with demo employees and attendance to explore HRNexus."
          >
            {loading ? (
              <Skeleton className="h-10 w-44" />
            ) : data ? (
              data.sampleDataLoaded ? (
                <p className="inline-flex items-center gap-2 text-sm font-body text-ink/70">
                  <Check size={16} className="text-teal" /> Sample data has already been loaded for this company.
                </p>
              ) : (
                <div>
                  <p className="text-sm font-body text-ink/70 mb-4">
                    Adds 8 demo employees and about a week of attendance, in your company only. Available once.
                  </p>
                  <Button onClick={loadSample} loading={loadingSample}>
                    {loadingSample ? 'Loading...' : 'Load sample data'}
                  </Button>
                </div>
              )
            ) : null}
          </Card>
        </div>
      </div>
    </Layout>
  );
}

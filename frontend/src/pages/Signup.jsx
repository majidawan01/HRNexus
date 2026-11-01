import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import API from '../api/axios';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import { useToast } from '../context/toast-context';
import { useAuth } from '../context/auth-context';

const BENEFITS = [
  'Your own private company workspace',
  'Free for up to 10 employees',
  'Attendance, leave and payroll included',
  'Upgrade only when you grow',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ companyName: '', adminName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.companyName.trim()) er.companyName = 'Enter your company name.';
    if (!form.adminName.trim()) er.adminName = 'Enter your name.';
    if (!EMAIL_RE.test(form.email.trim())) er.email = 'Enter a valid email address.';
    if (form.password.length < 6) er.password = 'Use at least 6 characters.';
    return er;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      const res = await API.post('/auth/register-company', {
        companyName: form.companyName.trim(),
        adminName: form.adminName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      signIn(res.data);
      toast.success(`Welcome to HRNexus, ${form.adminName.trim().split(' ')[0]}!`);
      navigate('/onboarding');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED' || !err.response
          ? 'Cannot reach the server. Check your connection and try again.'
          : 'Sign up failed. Please try again.');
      if (/email/i.test(message)) {
        setErrors({ email: message });
      } else {
        setServerError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-2">
      {/* Left: brand panel (sirf bari screens par) */}
      <aside className="hidden lg:flex flex-col justify-between bg-accent/[0.07] border-r border-border p-12">
        <Logo className="text-2xl" />
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink tracking-tight leading-tight max-w-md">
            Set up HR for your company in minutes.
          </h1>
          <ul className="mt-8 space-y-4">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3 font-body text-ink/80">
                <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                  <Check size={14} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <p className="font-mono text-xs text-ash">HRNexus © 2026 · Built by Majid Awan</p>
      </aside>

      {/* Right: form */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-body text-ash hover:text-ink transition">
              <ArrowLeft size={16} /> Home
            </Link>
            <div className="lg:hidden">
              <Logo />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-surface rounded-2xl p-6 sm:p-8 shadow-lg border border-border"
          >
            <h2 className="font-display text-2xl font-semibold text-ink">Create your company</h2>
            <p className="mt-1 text-sm font-body text-ink/70">You&apos;ll be the admin. Free plan, no credit card.</p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <Field
                label="Company name"
                name="companyName"
                value={form.companyName}
                onChange={setField}
                error={errors.companyName}
                autoComplete="organization"
                placeholder="Acme Industries"
                autoFocus
              />
              <Field
                label="Your name"
                name="adminName"
                value={form.adminName}
                onChange={setField}
                error={errors.adminName}
                autoComplete="name"
                placeholder="Ayesha Khan"
              />
              <Field
                label="Work email"
                name="email"
                type="email"
                value={form.email}
                onChange={setField}
                error={errors.email}
                autoComplete="email"
                placeholder="you@company.com"
              />
              <Field
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={setField}
                error={errors.password}
                hint="At least 6 characters."
                autoComplete="new-password"
                placeholder="••••••••"
              />

              {serverError && (
                <p role="alert" className="text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">
                  {serverError}
                </p>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                {loading ? 'Creating workspace...' : 'Create company'}
              </Button>
            </form>
          </motion.div>

          <p className="text-center text-sm font-body text-ink/70 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

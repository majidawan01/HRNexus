import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import API from '../api/axios';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import { useAuth } from '../context/auth-context';
import { useToast } from '../context/toast-context';

const STEPS = ['First employee', 'Invite a teammate'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const errorMessage = (err, fallback) =>
  err.response?.data?.message || (err.response ? fallback : 'Cannot reach the server. Please try again.');

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const { company, refreshCompany } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const finish = (message) => {
    if (message) toast.success(message);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />
        <Link to="/dashboard" className="text-sm font-body text-ash hover:text-ink transition">
          Skip setup
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <div className="mt-4 mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-2">
            Welcome{company?.name ? `, ${company.name}` : ''}
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">Let&apos;s set up your workspace</h1>
          <p className="mt-2 text-sm font-body text-ink/70">Two quick steps. You can skip either and do it later.</p>
        </div>

        <ol className="flex items-center gap-3 mb-6" aria-label="Progress">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label} className="flex items-center gap-3 flex-1 last:flex-none" aria-current={active ? 'step' : undefined}>
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ${
                    done ? 'bg-teal text-white' : active ? 'bg-accent text-white' : 'bg-border text-ash'
                  }`}
                >
                  {done ? <Check size={14} /> : i + 1}
                </span>
                <span className={`text-sm font-body hidden sm:inline ${active ? 'text-ink font-medium' : 'text-ash'}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && <span className="flex-1 h-px bg-border" />}
              </li>
            );
          })}
        </ol>

        <div className="bg-surface rounded-2xl border border-border shadow-lg p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 ? (
                <EmployeeStep
                  onDone={async () => {
                    await refreshCompany();
                    setStep(1);
                  }}
                  onSkip={() => setStep(1)}
                />
              ) : (
                <TeammateStep
                  onDone={() => finish('Teammate invited. You are all set!')}
                  onSkip={() => finish('You are all set!')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function EmployeeStep({ onDone, onSkip }) {
  const toast = useToast();
  const [form, setForm] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    cnic: '',
    department: '',
    designation: '',
    baseSalary: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const er = {};
    if (!form.employeeCode.trim()) er.employeeCode = 'Required.';
    if (!form.fullName.trim()) er.fullName = 'Required.';
    if (!EMAIL_RE.test(form.email.trim())) er.email = 'Enter a valid email.';
    if (!form.cnic.trim()) er.cnic = 'Required.';
    if (form.baseSalary === '' || Number(form.baseSalary) < 0) er.baseSalary = 'Enter the monthly salary.';
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      await API.post('/employees', {
        ...form,
        employeeCode: form.employeeCode.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        cnic: form.cnic.trim(),
        baseSalary: Number(form.baseSalary),
      });
      toast.success(`${form.fullName.trim()} added.`);
      await onDone();
    } catch (err) {
      setServerError(errorMessage(err, 'Could not add the employee.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="font-display text-xl font-semibold text-ink">Add your first employee</h2>
      <p className="mt-1 text-sm font-body text-ink/70">Start with yourself or anyone on your team.</p>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <Field label="Employee code" name="employeeCode" value={form.employeeCode} onChange={setField} error={errors.employeeCode} placeholder="EMP001" autoFocus />
        <Field label="Full name" name="fullName" value={form.fullName} onChange={setField} error={errors.fullName} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={setField} error={errors.email} />
        <Field label="CNIC" name="cnic" value={form.cnic} onChange={setField} error={errors.cnic} placeholder="00000-0000000-0" />
        <Field label="Department" name="department" value={form.department} onChange={setField} />
        <Field label="Designation" name="designation" value={form.designation} onChange={setField} />
        <Field label="Monthly salary (Rs.)" name="baseSalary" type="number" min="0" value={form.baseSalary} onChange={setField} error={errors.baseSalary} className="sm:col-span-2" />
      </div>

      {serverError && (
        <p role="alert" className="mt-4 text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <Button type="submit" loading={loading}>
          Add employee &amp; continue
        </Button>
      </div>
    </form>
  );
}

function TeammateStep({ onDone, onSkip }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'hr' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const er = {};
    if (!form.name.trim()) er.name = 'Required.';
    if (!EMAIL_RE.test(form.email.trim())) er.email = 'Enter a valid email.';
    if (form.password.length < 6) er.password = 'Use at least 6 characters.';
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      await API.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      onDone();
    } catch (err) {
      const message = errorMessage(err, 'Could not invite your teammate.');
      if (/email/i.test(message)) setErrors({ email: message });
      else setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="font-display text-xl font-semibold text-ink">Invite a teammate</h2>
      <p className="mt-1 text-sm font-body text-ink/70">
        Create a login for someone who will help run HR. Share the email and password with them, and they can sign in
        right away.
      </p>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <Field label="Name" name="name" value={form.name} onChange={setField} error={errors.name} autoComplete="off" autoFocus />
        <Field label="Email" name="email" type="email" value={form.email} onChange={setField} error={errors.email} autoComplete="off" />
        <Field label="Temporary password" name="password" type="password" value={form.password} onChange={setField} error={errors.password} hint="At least 6 characters." autoComplete="new-password" />
        <div>
          <label htmlFor="onboarding-role" className="block text-xs font-mono uppercase tracking-wider text-ash mb-2">
            Role
          </label>
          <select
            id="onboarding-role"
            name="role"
            value={form.role}
            onChange={setField}
            className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-ink font-body focus:outline-none focus:ring-2 focus:ring-accent transition"
          >
            <option value="hr">HR</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {serverError && (
        <p role="alert" className="mt-4 text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onSkip}>
          Skip &amp; finish
        </Button>
        <Button type="submit" loading={loading}>
          Invite &amp; finish
        </Button>
      </div>
    </form>
  );
}

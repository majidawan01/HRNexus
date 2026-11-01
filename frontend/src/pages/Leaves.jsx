import { useState } from 'react';
import { Check, Plane, Plus, X as XIcon } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import ErrorBanner from '../components/ui/ErrorBanner';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import StatusPill from '../components/ui/StatusPill';
import API from '../api/axios';
import useResource from '../hooks/useResource';
import { errorText } from '../lib/errors';
import { useAuth } from '../context/auth-context';
import { useConfirm } from '../context/confirm-context';
import { useToast } from '../context/toast-context';

const EMPTY_FORM = {
  employeeId: '',
  leaveType: 'annual',
  startDate: '',
  endDate: '',
  totalDays: '',
  reason: '',
  isPaid: true,
};

const fmt = (d) => new Date(d).toLocaleDateString();

export default function Leaves() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const canApprove = user.role === 'admin' || user.role === 'hr';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const { data, status, error, reload } = useResource(async () => {
    const [leaves, emp] = await Promise.all([API.get('/leaves'), API.get('/employees')]);
    return { leaves: leaves.data, employees: emp.data };
  });
  const leaves = data?.leaves || [];
  const employees = data?.employees || [];

  const decide = async (lv, next) => {
    const name = lv.employeeId?.fullName || 'this employee';
    const ok = await confirm({
      title: next === 'approved' ? 'Approve leave?' : 'Reject leave?',
      message: `${name}: ${fmt(lv.startDate)} to ${fmt(lv.endDate)} (${lv.totalDays} days).`,
      confirmText: next === 'approved' ? 'Approve' : 'Reject',
      tone: next === 'approved' ? 'primary' : 'danger',
    });
    if (!ok) return;
    setBusyId(lv._id);
    try {
      await API.put(`/leaves/${lv._id}`, { status: next });
      toast.success(`Leave ${next}.`);
      reload(true);
    } catch (err) {
      toast.error(errorText(err, 'Could not update leave.'));
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { header: 'Employee', primary: true, cell: (l) => l.employeeId?.fullName || 'Unknown', className: 'font-body text-sm text-ink font-medium' },
    { header: 'Type', cell: (l) => l.leaveType, className: 'font-body text-sm text-ash capitalize' },
    { header: 'Dates', cell: (l) => `${fmt(l.startDate)} – ${fmt(l.endDate)}`, className: 'font-mono text-sm text-ash' },
    { header: 'Days', cell: (l) => l.totalDays, className: 'font-mono text-sm text-ash' },
    { header: 'Status', cell: (l) => <StatusPill status={l.status} />, className: '' },
    ...(canApprove
      ? [
          {
            header: '',
            className: '',
            cell: (l) =>
              l.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={busyId === l._id} onClick={() => decide(l, 'approved')} aria-label="Approve leave">
                    <Check size={16} className="text-teal" /> Approve
                  </Button>
                  <Button size="sm" variant="secondary" disabled={busyId === l._id} onClick={() => decide(l, 'rejected')} aria-label="Reject leave">
                    <XIcon size={16} className="text-rust" /> Reject
                  </Button>
                </div>
              ),
          },
        ]
      : []),
  ];

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <PageHeader eyebrow="Time off" title="Leaves">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Apply leave
          </Button>
        </PageHeader>

        {status === 'error' && <ErrorBanner title="Could not load leaves" message={error} onRetry={reload} />}

        <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-sm">
          {status === 'error' ? (
            <EmptyState icon={Plane} title="Leaves unavailable" text="Fix the problem above and try again." />
          ) : (
            <DataTable
              columns={columns}
              rows={leaves}
              loading={status === 'loading'}
              empty={
                <EmptyState
                  icon={Plane}
                  title="No leave requests yet"
                  text="Leave requests show up here, and managers can approve or reject them."
                  action={
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus size={18} /> Apply leave
                    </Button>
                  }
                />
              }
            />
          )}
        </div>
      </div>

      <ApplyModal open={isModalOpen} onClose={() => setIsModalOpen(false)} employees={employees} onSaved={() => reload(true)} />
    </Layout>
  );
}

function ApplyModal({ open, onClose, employees, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await API.post('/leaves', { ...form, totalDays: Number(form.totalDays) });
      toast.success('Leave request submitted.');
      setForm(EMPTY_FORM);
      onSaved();
      onClose();
    } catch (err) {
      setError(errorText(err, 'Failed to apply leave.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Apply leave" maxWidth="max-w-md">
      {employees.length === 0 ? (
        <EmptyState title="Add an employee first" text="A leave request needs an employee." />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field as="select" label="Employee" name="employeeId" value={form.employeeId} onChange={change} required>
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullName}
              </option>
            ))}
          </Field>
          <Field as="select" label="Leave type" name="leaveType" value={form.leaveType} onChange={change}>
            <option value="annual">Annual</option>
            <option value="sick">Sick</option>
            <option value="casual">Casual</option>
            <option value="unpaid">Unpaid</option>
            <option value="other">Other</option>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start date" type="date" name="startDate" value={form.startDate} onChange={change} required />
            <Field label="End date" type="date" name="endDate" value={form.endDate} onChange={change} required />
          </div>
          <Field label="Total days" type="number" min="1" name="totalDays" value={form.totalDays} onChange={change} required />
          <Field as="textarea" rows={2} label="Reason" name="reason" value={form.reason} onChange={change} required />
          <label className="flex items-center gap-2 text-sm font-body text-ink/70">
            <input type="checkbox" name="isPaid" checked={form.isPaid} onChange={change} />
            Paid leave
          </label>

          {error && (
            <p role="alert" className="text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" loading={saving} className="w-full">
            Submit request
          </Button>
        </form>
      )}
    </Modal>
  );
}

import { useState } from 'react';
import { Download, Plus, Wallet } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import ErrorBanner from '../components/ui/ErrorBanner';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import API from '../api/axios';
import useResource from '../hooks/useResource';
import { downloadFile } from '../lib/download';
import { errorText } from '../lib/errors';
import { useToast } from '../context/toast-context';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const rs = (n) => `Rs. ${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function Payroll() {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [slipId, setSlipId] = useState(null);

  const { data, status, error, reload } = useResource(async () => {
    const [pay, emp] = await Promise.all([API.get('/payroll'), API.get('/employees')]);
    return { payrolls: pay.data, employees: emp.data };
  });
  const payrolls = data?.payrolls || [];
  const employees = data?.employees || [];

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFile('/export/payroll', 'payroll_report.xlsx');
      toast.success('Payroll report downloaded.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  const downloadPayslip = async (p) => {
    setSlipId(p._id);
    const name = (p.employeeId?.fullName || 'employee').replace(/[^\w-]+/g, '_');
    try {
      await downloadFile(`/payslip/${p._id}`, `payslip_${name}_${p.year}_${String(p.month).padStart(2, '0')}.pdf`);
      toast.success('Payslip downloaded.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSlipId(null);
    }
  };

  const columns = [
    { header: 'Employee', primary: true, cell: (p) => p.employeeId?.fullName || 'Unknown', className: 'font-body text-sm text-ink font-medium' },
    { header: 'Period', cell: (p) => `${months[p.month - 1]} ${p.year}`, className: 'font-mono text-sm text-ash' },
    { header: 'Gross', cell: (p) => rs(p.grossSalary), className: 'font-mono text-sm text-ash' },
    { header: 'Deductions', cell: (p) => rs(p.totalDeductions), className: 'font-mono text-sm text-rust' },
    { header: 'Net salary', cell: (p) => rs(p.netSalary), className: 'font-mono text-sm text-teal font-semibold' },
    {
      header: '',
      className: '',
      cell: (p) => (
        <Button size="sm" variant="secondary" loading={slipId === p._id} onClick={() => downloadPayslip(p)}>
          {slipId !== p._id && <Download size={16} />} Payslip
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <PageHeader eyebrow="Compensation" title="Payroll">
          <Button variant="secondary" onClick={handleExport} loading={exporting}>
            {!exporting && <Download size={18} />} Export
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Generate payroll
          </Button>
        </PageHeader>

        {status === 'error' && <ErrorBanner title="Could not load payroll" message={error} onRetry={reload} />}

        <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-sm">
          {status === 'error' ? (
            <EmptyState icon={Wallet} title="Payroll unavailable" text="Fix the problem above and try again." />
          ) : (
            <DataTable
              columns={columns}
              rows={payrolls}
              loading={status === 'loading'}
              empty={
                <EmptyState
                  icon={Wallet}
                  title="No payroll records yet"
                  text="Generate payroll for an employee and month to see it here."
                  action={
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus size={18} /> Generate payroll
                    </Button>
                  }
                />
              }
            />
          )}
        </div>
      </div>

      <GenerateModal open={isModalOpen} onClose={() => setIsModalOpen(false)} employees={employees} onSaved={() => reload(true)} />
    </Layout>
  );
}

function GenerateModal({ open, onClose, employees, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await API.post('/payroll/generate', { ...form, month: Number(form.month), year: Number(form.year) });
      toast.success('Payroll generated.');
      onSaved();
      onClose();
    } catch (err) {
      setError(errorText(err, 'Failed to generate payroll.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate payroll" maxWidth="max-w-md">
      {employees.length === 0 ? (
        <EmptyState title="Add an employee first" text="Payroll is generated per employee." />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field as="select" label="Month" name="month" value={form.month} onChange={change}>
              {months.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </Field>
            <Field label="Year" type="number" name="year" value={form.year} onChange={change} required />
          </div>

          {error && (
            <p role="alert" className="text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" loading={saving} className="w-full">
            Generate
          </Button>
        </form>
      )}
    </Modal>
  );
}

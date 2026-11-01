import { useState } from 'react';
import { CalendarCheck, Download, Plus } from 'lucide-react';
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
import { downloadFile } from '../lib/download';
import { errorText } from '../lib/errors';
import { useAuth } from '../context/auth-context';
import { useToast } from '../context/toast-context';

const EMPTY_FORM = { employeeId: '', date: '', checkIn: '', status: 'present' };

export default function Attendance() {
  const { user } = useAuth();
  const toast = useToast();
  const canEdit = user.role === 'admin' || user.role === 'hr';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, status, error, reload } = useResource(async () => {
    const [att, emp] = await Promise.all([API.get('/attendance'), API.get('/employees')]);
    return { records: att.data, employees: emp.data };
  });
  const records = data?.records || [];
  const employees = data?.employees || [];

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFile('/export/attendance', 'attendance_report.xlsx');
      toast.success('Attendance report downloaded.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { header: 'Employee', primary: true, cell: (r) => r.employeeId?.fullName || 'Unknown', className: 'font-body text-sm text-ink font-medium' },
    { header: 'Date', cell: (r) => new Date(r.date).toLocaleDateString(), className: 'font-mono text-sm text-ash' },
    { header: 'Check in', cell: (r) => (r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'), className: 'font-mono text-sm text-ash' },
    { header: 'Status', cell: (r) => <StatusPill status={r.status} />, className: '' },
  ];

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <PageHeader eyebrow="Daily log" title="Attendance">
          {canEdit && (
            <>
              <Button variant="secondary" onClick={handleExport} loading={exporting}>
                {!exporting && <Download size={18} />} Export
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={18} /> Mark attendance
              </Button>
            </>
          )}
        </PageHeader>

        {status === 'error' && <ErrorBanner title="Could not load attendance" message={error} onRetry={reload} />}

        <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-sm">
          {status === 'error' ? (
            <EmptyState icon={CalendarCheck} title="Attendance unavailable" text="Fix the problem above and try again." />
          ) : (
            <DataTable
              columns={columns}
              rows={records}
              loading={status === 'loading'}
              empty={
                <EmptyState
                  icon={CalendarCheck}
                  title="No attendance records yet"
                  text={canEdit ? 'Mark attendance by hand, or connect a biometric device in Settings.' : 'Records will appear here once attendance is marked.'}
                  action={
                    canEdit && (
                      <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Mark attendance
                      </Button>
                    )
                  }
                />
              }
            />
          )}
        </div>
      </div>

      {canEdit && (
        <MarkModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employees={employees}
          onSaved={() => reload(true)}
        />
      )}
    </Layout>
  );
}

function MarkModal({ open, onClose, employees, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await API.post('/attendance', {
        ...form,
        checkIn: form.date && form.checkIn ? `${form.date}T${form.checkIn}:00` : undefined,
      });
      toast.success('Attendance saved.');
      setForm(EMPTY_FORM);
      onSaved();
      onClose();
    } catch (err) {
      setError(errorText(err, 'Failed to mark attendance.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Mark attendance" maxWidth="max-w-md">
      {employees.length === 0 ? (
        <EmptyState title="Add an employee first" text="Attendance needs at least one employee." />
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
          <Field label="Date" type="date" name="date" value={form.date} onChange={change} required />
          <Field label="Check-in time" type="time" name="checkIn" value={form.checkIn} onChange={change} />
          <Field as="select" label="Status" name="status" value={form.status} onChange={change}>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="half-day">Half day</option>
            <option value="on-leave">On leave</option>
          </Field>

          {error && (
            <p role="alert" className="text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" loading={saving} className="w-full">
            Save
          </Button>
        </form>
      )}
    </Modal>
  );
}

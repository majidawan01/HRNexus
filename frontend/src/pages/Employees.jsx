import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, Users } from 'lucide-react';
import Layout from '../components/Layout';
import EmployeeModal from '../components/EmployeeModal';
import PageHeader from '../components/ui/PageHeader';
import ErrorBanner from '../components/ui/ErrorBanner';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import StatusPill from '../components/ui/StatusPill';
import Button from '../components/ui/Button';
import API from '../api/axios';
import useResource from '../hooks/useResource';
import { errorText } from '../lib/errors';
import { useAuth } from '../context/auth-context';
import { useConfirm } from '../context/confirm-context';
import { useToast } from '../context/toast-context';

export default function Employees() {
  const { user, refreshCompany } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const canEdit = user.role === 'admin' || user.role === 'hr';
  const canDelete = user.role === 'admin';

  const { data, status, error, reload } = useResource(() => API.get('/employees').then((r) => r.data));
  const employees = useMemo(() => data || [], [data]);
  const loading = status === 'loading';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) => e.fullName?.toLowerCase().includes(q) || e.employeeCode?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  // Employee add/delete se plan usage badalta hai, isliye sidebar/dashboard ka count bhi taza karo
  const afterChange = () => {
    reload(true);
    refreshCompany();
  };

  const handleDelete = async (emp) => {
    const ok = await confirm({
      title: `Delete ${emp.fullName}?`,
      message: 'This removes the employee from your company. This cannot be undone.',
      confirmText: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setDeletingId(emp._id);
    try {
      await API.delete(`/employees/${emp._id}`);
      toast.success(`${emp.fullName} deleted.`);
      afterChange();
    } catch (err) {
      toast.error(errorText(err, 'Could not delete employee.'));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { header: 'Code', cell: (e) => e.employeeCode, className: 'font-mono text-sm text-ash' },
    { header: 'Name', primary: true, cell: (e) => e.fullName, className: 'font-body text-sm text-ink font-medium' },
    { header: 'Department', cell: (e) => e.department },
    { header: 'Designation', cell: (e) => e.designation },
    { header: 'Status', cell: (e) => <StatusPill status={e.status} />, className: '' },
    ...(canEdit
      ? [{ header: 'Salary', cell: (e) => `Rs. ${e.baseSalary?.toLocaleString() ?? 0}`, className: 'font-mono text-sm text-ink' }]
      : []),
    ...(canDelete
      ? [
          {
            header: '',
            className: 'text-right',
            cell: (e) => (
              <button
                onClick={() => handleDelete(e)}
                disabled={deletingId === e._id}
                aria-label={`Delete ${e.fullName}`}
                className="inline-flex items-center gap-1.5 text-rust hover:opacity-70 disabled:opacity-40 text-sm font-body"
              >
                <Trash2 size={16} />
                <span className="md:hidden">Delete</span>
              </button>
            ),
          },
        ]
      : []),
  ];

  const emptyState =
    employees.length === 0 ? (
      <EmptyState
        icon={Users}
        title="No employees yet"
        text={canEdit ? 'Add your first employee, or load sample data from Settings.' : 'Employees will appear here once they are added.'}
        action={
          canEdit && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add employee
            </Button>
          )
        }
      />
    ) : (
      <EmptyState
        icon={Search}
        title="No employees match"
        text="Try a different name or code."
        action={
          <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
            Clear search
          </Button>
        }
      />
    );

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <PageHeader eyebrow="Directory" title="Employees">
          {canEdit && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add employee
            </Button>
          )}
        </PageHeader>

        {status === 'error' && <ErrorBanner title="Could not load employees" message={error} onRetry={reload} />}

        <div className="relative mb-6 sm:max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
          <input
            type="search"
            placeholder="Search by name or code..."
            aria-label="Search employees"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
        </div>

        <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-sm">
          {status === 'error' ? (
            <EmptyState icon={Users} title="Employees unavailable" text="Fix the problem above and try again." />
          ) : (
            <DataTable columns={columns} rows={filtered} loading={loading} empty={emptyState} />
          )}
        </div>
      </div>

      {canEdit && <EmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={afterChange} />}
    </Layout>
  );
}

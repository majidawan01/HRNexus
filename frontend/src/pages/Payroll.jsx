import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Download } from 'lucide-react';
import Layout from '../components/Layout';
import API from '../api/axios';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [payRes, empRes] = await Promise.all([
        API.get('/payroll', { headers }),
        API.get('/employees', { headers }),
      ]);
      setPayrolls(payRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/payroll/generate', {
        ...formData,
        month: Number(formData.month),
        year: Number(formData.year),
      }, { headers });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate payroll.');
    }
  };

  const handleExport = async () => {
    try {
      const res = await API.get('/export/payroll', {
        headers,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payroll_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const downloadPayslip = (payrollId) => {
    window.open(`http://localhost:5000/api/payslip/${payrollId}`, '_blank');
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs text-ash uppercase tracking-widest mb-1">Compensation</p>
            <h1 className="font-display text-3xl font-semibold text-ink">Payroll</h1>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={handleExport}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-surface text-ink font-display font-medium px-5 py-3 rounded-xl border border-border"
            >
              <Download size={18} />
              Export
            </motion.button>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-accent text-white font-display font-medium px-5 py-3 rounded-xl shadow-sm"
            >
              <Plus size={18} />
              Generate Payroll
            </motion.button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-ash font-body">Loading...</p>
          ) : payrolls.length === 0 ? (
            <p className="p-8 text-center text-ash font-body">No payroll records yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Employee</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Period</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Gross</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Deductions</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Net Salary</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Payslip</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr key={p._id} className="border-b border-border/60 hover:bg-bg/50 transition">
                    <td className="px-6 py-4 font-body text-sm text-ink font-medium">
                      {p.employeeId?.fullName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-ash">
                      {months[p.month - 1]} {p.year}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-ash">
                      Rs. {p.grossSalary?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-rust">
                      Rs. {p.totalDeductions?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-teal font-semibold">
                      Rs. {p.netSalary?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => downloadPayslip(p._id)}
                        className="flex items-center gap-1.5 text-accent hover:opacity-70 text-sm font-body"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 px-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-2xl p-8 w-full max-w-md border border-border shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold text-ink">Generate Payroll</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-ash hover:text-ink transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">Employee</label>
                  <select name="employeeId" value={formData.employeeId} onChange={handleChange} required
                    className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">Month</label>
                    <select name="month" value={formData.month} onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                      {months.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">Year</label>
                    <input type="number" name="year" value={formData.year} onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>

                {error && (
                  <p className="text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">{error}</p>
                )}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                  className="w-full bg-accent text-white font-display font-medium py-3 rounded-xl shadow-sm">
                  Generate
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
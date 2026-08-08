import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, XCircle } from 'lucide-react';
import Layout from '../components/Layout';
import API from '../api/axios';

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    totalDays: '',
    reason: '',
    isPaid: true,
  });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canApprove = user.role === 'admin' || user.role === 'hr';

  const fetchData = async () => {
    try {
      const [leaveRes, empRes] = await Promise.all([
        API.get('/leaves', { headers }),
        API.get('/employees', { headers }),
      ]);
      setLeaves(leaveRes.data);
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
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/leaves', { ...formData, totalDays: Number(formData.totalDays) }, { headers });
      setIsModalOpen(false);
      setFormData({ employeeId: '', leaveType: 'annual', startDate: '', endDate: '', totalDays: '', reason: '', isPaid: true });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply leave.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/leaves/${id}`, { status }, { headers });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = {
    pending: 'bg-accent/10 text-accent',
    approved: 'bg-teal/10 text-teal',
    rejected: 'bg-rust/10 text-rust',
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs text-ash uppercase tracking-widest mb-1">Time Off</p>
            <h1 className="font-display text-3xl font-semibold text-ink">Leaves</h1>
          </div>
          <motion.button
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-accent text-white font-display font-medium px-5 py-3 rounded-xl shadow-sm"
          >
            <Plus size={18} />
            Apply Leave
          </motion.button>
        </div>

        <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-ash font-body">Loading...</p>
          ) : leaves.length === 0 ? (
            <p className="p-8 text-center text-ash font-body">No leave requests yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Employee</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Type</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Dates</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Days</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Status</th>
                  {canApprove && <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((lv) => (
                  <tr key={lv._id} className="border-b border-border/60 hover:bg-bg/50 transition">
                    <td className="px-6 py-4 font-body text-sm text-ink font-medium">
                      {lv.employeeId?.fullName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-body text-sm text-ash capitalize">{lv.leaveType}</td>
                    <td className="px-6 py-4 font-mono text-sm text-ash">
                      {new Date(lv.startDate).toLocaleDateString()} – {new Date(lv.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-ash">{lv.totalDays}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-mono uppercase ${statusColor[lv.status]}`}>
                        {lv.status}
                      </span>
                    </td>
                    {canApprove && (
                      <td className="px-6 py-4">
                        {lv.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(lv._id, 'approved')} className="text-teal hover:opacity-70">
                              <Check size={18} />
                            </button>
                            <button onClick={() => updateStatus(lv._id, 'rejected')} className="text-rust hover:opacity-70">
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
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
                <h2 className="font-display text-xl font-semibold text-ink">Apply Leave</h2>
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

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">Leave Type</label>
                  <select name="leaveType" value={formData.leaveType} onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                    <option value="annual">Annual</option>
                    <option value="sick">Sick</option>
                    <option value="casual">Casual</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required
                      className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required
                      className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">Total Days</label>
                  <input type="number" name="totalDays" value={formData.totalDays} onChange={handleChange} required
                    className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">Reason</label>
                  <textarea name="reason" value={formData.reason} onChange={handleChange} required rows={2}
                    className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>

                <label className="flex items-center gap-2 text-sm font-body text-ash">
                  <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleChange} />
                  Paid Leave
                </label>

                {error && (
                  <p className="text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">{error}</p>
                )}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                  className="w-full bg-accent text-white font-display font-medium py-3 rounded-xl shadow-sm">
                  Submit Request
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
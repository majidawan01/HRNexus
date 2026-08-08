import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Download } from 'lucide-react';
import Layout from '../components/Layout';
import API from '../api/axios';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    checkIn: '',
    status: 'present',
  });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [attRes, empRes] = await Promise.all([
        API.get('/attendance', { headers }),
        API.get('/employees', { headers }),
      ]);
      setRecords(attRes.data);
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
      const payload = {
        ...formData,
        checkIn: formData.date && formData.checkIn
          ? `${formData.date}T${formData.checkIn}:00`
          : undefined,
      };
      await API.post('/attendance', payload, { headers });
      setIsModalOpen(false);
      setFormData({ employeeId: '', date: '', checkIn: '', status: 'present' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance.');
    }
  };

  const handleExport = async () => {
    try {
      const res = await API.get('/export/attendance', {
        headers,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const statusColor = {
    present: 'bg-teal/10 text-teal',
    late: 'bg-accent/10 text-accent',
    absent: 'bg-rust/10 text-rust',
    'half-day': 'bg-accent/10 text-accent',
    'on-leave': 'bg-ash/10 text-ash',
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs text-ash uppercase tracking-widest mb-1">Daily Log</p>
            <h1 className="font-display text-3xl font-semibold text-ink">Attendance</h1>
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
              Mark Attendance
            </motion.button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-ash font-body">Loading...</p>
          ) : records.length === 0 ? (
            <p className="p-8 text-center text-ash font-body">No attendance records yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Employee</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Date</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Check In</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id} className="border-b border-border/60 hover:bg-bg/50 transition">
                    <td className="px-6 py-4 font-body text-sm text-ink font-medium">
                      {rec.employeeId?.fullName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-ash">
                      {new Date(rec.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-ash">
                      {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-mono uppercase ${statusColor[rec.status]}`}>
                        {rec.status}
                      </span>
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
                <h2 className="font-display text-xl font-semibold text-ink">Mark Attendance</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-ash hover:text-ink transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">Employee</label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">Check-In Time</label>
                  <input
                    type="time"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="half-day">Half Day</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>

                {error && (
                  <p className="text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">{error}</p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-accent text-white font-display font-medium py-3 rounded-xl shadow-sm"
                >
                  Save
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
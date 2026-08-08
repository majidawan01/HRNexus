import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import API from '../api/axios';

export default function EmployeeModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    cnic: '',
    contactNumber: '',
    email: '',
    department: '',
    designation: '',
    baseSalary: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await API.post('/employees', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
      onClose();
      setFormData({
        employeeCode: '', fullName: '', cnic: '', contactNumber: '',
        email: '', department: '', designation: '', baseSalary: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-ink">Add Employee</h2>
              <button onClick={onClose} className="text-ash hover:text-ink transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Employee Code" name="employeeCode" value={formData.employeeCode} onChange={handleChange} />
                <Field label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
                <Field label="CNIC" name="cnic" value={formData.cnic} onChange={handleChange} />
                <Field label="Contact" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
                <Field label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                <Field label="Base Salary" name="baseSalary" type="number" value={formData.baseSalary} onChange={handleChange} />
                <Field label="Department" name="department" value={formData.department} onChange={handleChange} />
                <Field label="Designation" name="designation" value={formData.designation} onChange={handleChange} />
              </div>

              {error && (
                <p className="text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">{error}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white font-display font-medium py-3 rounded-xl disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Adding...' : 'Add Employee'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
        required
      />
    </div>
  );
}
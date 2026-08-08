import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import Layout from '../components/Layout';
import EmployeeModal from '../components/EmployeeModal';
import API from '../api/axios';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) =>
    emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs text-ash uppercase tracking-widest mb-1">
              Directory
            </p>
            <h1 className="font-display text-3xl font-semibold text-ink">
              Employees
            </h1>
          </div>
          <motion.button
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-accent text-white font-display font-medium px-5 py-3 rounded-xl shadow-sm"
          >
            <Plus size={18} />
            Add Employee
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-ink font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
        </div>

        {/* Table */}
        <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-ash font-body">Loading employees...</p>
          ) : filteredEmployees.length === 0 ? (
            <p className="p-8 text-center text-ash font-body">No employees found.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Code</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Name</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Department</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Designation</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Status</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash">Salary</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="border-b border-border/60 hover:bg-bg/50 transition">
                    <td className="px-6 py-4 font-mono text-sm text-ash">{emp.employeeCode}</td>
                    <td className="px-6 py-4 font-body text-sm text-ink font-medium">{emp.fullName}</td>
                    <td className="px-6 py-4 font-body text-sm text-ash">{emp.department}</td>
                    <td className="px-6 py-4 font-body text-sm text-ash">{emp.designation}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-mono uppercase ${
                        emp.status === 'active' ? 'bg-accent text-white' : 'bg-rust/10 text-rust'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-ink">
                      Rs. {emp.baseSalary?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEmployees}
      />
    </Layout>
  );
}
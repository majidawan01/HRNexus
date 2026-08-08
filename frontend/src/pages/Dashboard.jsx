import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Calendar, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import Layout from '../components/Layout';
import API from '../api/axios';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    totalPayroll: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [empRes, attRes, leaveRes, payRes] = await Promise.all([
          API.get('/employees', { headers }),
          API.get('/attendance', { headers }),
          API.get('/leaves', { headers }),
          API.get('/payroll', { headers }),
        ]);

        const today = new Date().toDateString();
        const presentToday = attRes.data.filter(
          (a) => new Date(a.date).toDateString() === today && a.status !== 'absent'
        ).length;

        const pendingLeaves = leaveRes.data.filter((l) => l.status === 'pending').length;

        const totalPayroll = payRes.data.reduce((sum, p) => sum + (p.netSalary || 0), 0);

        setStats({
          totalEmployees: empRes.data.length,
          presentToday,
          pendingLeaves,
          totalPayroll,
        });

        const deptCounts = {};
        empRes.data.forEach((emp) => {
          const dept = emp.department || 'Other';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
        setChartData(Object.entries(deptCounts).map(([name, count]) => ({ name, count })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Employees', value: stats.totalEmployees, icon: Users, bg: 'bg-accent/10', text: 'text-accent' },
    { label: 'Present Today', value: stats.presentToday, icon: Clock, bg: 'bg-teal/10', text: 'text-teal' },
    { label: 'Pending Leaves', value: stats.pendingLeaves, icon: Calendar, bg: 'bg-rust/10', text: 'text-rust' },
    { label: 'Total Payroll (Net)', value: `Rs. ${stats.totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Wallet, bg: 'bg-accent/10', text: 'text-accent' },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <p className="font-mono text-xs text-ash uppercase tracking-widest mb-1">Overview</p>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Welcome back, <span className="text-accent">{user.name?.split(' ')[0]}</span>
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-surface rounded-2xl p-6 border border-border shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4 ${card.text}`}>
                <card.icon size={20} />
              </div>
              <p className="font-mono text-xs uppercase tracking-wider text-ash mb-1">
                {card.label}
              </p>
              <p className="font-display text-2xl font-semibold text-ink">
                {loading ? '—' : card.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-surface rounded-2xl p-6 border border-border shadow-sm"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-ash mb-4">
            Employees by Department
          </p>
          {!loading && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A0A" />
                <XAxis dataKey="name" stroke="#8A8A8A" fontSize={12} />
                <YAxis stroke="#8A8A8A" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '12px', color: '#FFFFFF' }}
                />
                <Bar dataKey="count" fill="#4C5FD9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-ash font-body text-sm py-12 text-center">
              {loading ? 'Loading chart...' : 'No data yet.'}
            </p>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
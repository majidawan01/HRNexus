import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-3 bg-surface px-3 py-1.5 rounded-full border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            <span className="font-mono text-[10px] text-ash tracking-widest uppercase">
              HR Platform
            </span>
          </div>
          <h1 className="font-display text-4xl font-semibold text-ink tracking-tight">
            HR<span className="text-accent">Nexus</span>
          </h1>
          <p className="text-ash text-sm mt-2 font-body">
            Workforce management, on schedule.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-surface rounded-2xl p-8 shadow-lg border border-border"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-ink font-body focus:outline-none focus:ring-2 focus:ring-accent transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-ink font-body focus:outline-none focus:ring-2 focus:ring-accent transition"
                required
              />
            </div>

            {error && (
              <p className="text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white font-display font-medium py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>
        </motion.div>

        <p className="text-center text-ash text-xs mt-6 font-mono">
          HRNexus © 2026 — Built by <span className="text-accent">Majid Awan</span>
        </p>
      </div>
    </div>
  );
}
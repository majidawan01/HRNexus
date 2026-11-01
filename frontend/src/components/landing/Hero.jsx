import { motion } from 'framer-motion';
import { ArrowRight, Users, Clock, Calendar, Wallet } from 'lucide-react';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-accent/[0.07] to-transparent pointer-events-none"
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 mb-6 bg-surface px-3 py-1.5 rounded-full border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[10px] sm:text-xs text-ash tracking-widest uppercase">
              HR platform · Free for up to 10 employees
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-semibold text-ink tracking-tight leading-[1.05] max-w-3xl mx-auto">
            HR operations for your whole company,{' '}
            <span className="text-accent">in one place.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg font-body text-ink/70 max-w-2xl mx-auto leading-relaxed">
            Employees, attendance, leave and payroll, with PDF payslips and Excel reports. Every company gets its own
            private workspace.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button to="/signup" size="lg" className="w-full sm:w-auto">
              Start free
              <ArrowRight size={18} />
            </Button>
            <Button href="#features" variant="secondary" size="lg" className="w-full sm:w-auto">
              See what&apos;s inside
            </Button>
          </div>
          <p className="mt-4 text-xs font-mono text-ash">No credit card · Set up in minutes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-14 sm:mt-20"
        >
          <DashboardPreview />
          <p className="mt-3 text-xs font-mono text-ash">Illustrative preview</p>
        </motion.div>
      </div>
    </section>
  );
}

// Dashboard ka khaaka (sirf illustration, asli data nahi)
function DashboardPreview() {
  const tiles = [
    { label: 'Employees', icon: Users, tone: 'bg-accent/10 text-accent' },
    { label: 'Present today', icon: Clock, tone: 'bg-teal/10 text-teal' },
    { label: 'Pending leaves', icon: Calendar, tone: 'bg-rust/10 text-rust' },
    { label: 'Payroll', icon: Wallet, tone: 'bg-accent/10 text-accent' },
  ];
  const bars = [62, 88, 45, 74, 30, 56];

  return (
    <div className="max-w-4xl mx-auto bg-surface border border-border rounded-2xl shadow-xl overflow-hidden text-left">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
        <span className="w-2.5 h-2.5 rounded-full bg-border" />
        <span className="w-2.5 h-2.5 rounded-full bg-border" />
        <span className="w-2.5 h-2.5 rounded-full bg-border" />
        <span className="ml-3 font-mono text-[10px] text-ash uppercase tracking-widest">Dashboard</span>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-xl border border-border p-3 sm:p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${t.tone}`}>
                <t.icon size={16} />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-ash">{t.label}</p>
              <div className="mt-2 h-3 w-12 rounded bg-border" />
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-border p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ash mb-4">Employees by department</p>
          <div className="flex items-end gap-3 sm:gap-5 h-28 sm:h-36">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-accent/80" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

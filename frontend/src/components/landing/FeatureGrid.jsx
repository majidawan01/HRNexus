import { motion } from 'framer-motion';
import { Users, Clock, CalendarCheck, Wallet, FileText, FileSpreadsheet, Fingerprint, ShieldCheck } from 'lucide-react';

// Sirf wohi features jo product mein sach mein maujood hain
const FEATURES = [
  { icon: Users, title: 'Employee directory', text: 'Profiles, departments, salary and bank details for everyone in one list.' },
  { icon: Clock, title: 'Attendance', text: 'Mark attendance by hand or let devices punch in. Late and overtime are tracked.' },
  { icon: CalendarCheck, title: 'Leave management', text: 'Employees apply, HR approves or rejects. Paid and unpaid leave feed payroll.' },
  { icon: Wallet, title: 'Payroll engine', text: 'Net salary from attendance, leaves, overtime, late deductions, allowances and deductions.' },
  { icon: FileText, title: 'PDF payslips', text: 'A clean payslip for every employee and month, ready to download.' },
  { icon: FileSpreadsheet, title: 'Excel reports', text: 'Export attendance and payroll to formatted spreadsheets in one click.' },
  { icon: Fingerprint, title: 'Biometric devices', text: 'Connect ZKTeco, Hikvision and other ADMS devices through a per-company webhook.' },
  { icon: ShieldCheck, title: 'Private by design', text: 'Each company is fully isolated, with roles for admin, HR, manager and employee.' },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">Features</p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
          Everything HR needs, nothing it doesn&apos;t.
        </h2>
        <p className="mt-4 font-body text-ink/70 leading-relaxed">
          From the first hire to the monthly payslip run, HRNexus covers the daily work in one tidy workspace.
        </p>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
            className="bg-surface rounded-2xl border border-border p-6 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
              <f.icon size={20} />
            </div>
            <h3 className="font-display font-semibold text-ink mb-1.5">{f.title}</h3>
            <p className="text-sm font-body text-ink/70 leading-relaxed">{f.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const ITEMS = [
  {
    q: 'What does the Free plan include?',
    a: 'Every feature, for up to 10 employees. When you reach the limit you can upgrade to Pro for unlimited employees.',
  },
  {
    q: 'Is billing real?',
    a: 'No. HRNexus is a demo project, so upgrading simply switches your company to Pro. No real payment is taken and no card details are stored.',
  },
  {
    q: 'Can other companies see my data?',
    a: 'No. Every company has its own isolated workspace. Employees, attendance, leave, payroll and files never cross between companies.',
  },
  {
    q: 'Who can do what inside my company?',
    a: 'The admin who signs up your company can add teammates as HR, manager or employee. Admins and HR manage people, attendance and payroll, while employees can apply for leave.',
  },
  {
    q: 'Does it work with biometric attendance devices?',
    a: 'Yes. Devices that support ADMS push (such as ZKTeco and Hikvision) can post punches to your company’s private webhook, and the first punch of the day becomes check-in and the second check-out.',
  },
  {
    q: 'Can I export my data?',
    a: 'Attendance and payroll reports download as Excel files, and each payroll record has a PDF payslip.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="scroll-mt-20 max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">FAQ</p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
          Questions, answered.
        </h2>
      </div>

      <div className="mt-10 space-y-3">
        {ITEMS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q} className="bg-surface border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(open ? -1 : i)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"
              >
                <span className="font-display font-medium text-ink">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-ash shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 sm:px-6 pb-5 text-sm font-body text-ink/70 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

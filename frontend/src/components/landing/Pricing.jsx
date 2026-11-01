import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Button from '../ui/Button';
import { PLANS } from '../../lib/plans';

export default function Pricing() {
  const plans = [PLANS.free, PLANS.pro];

  return (
    <section id="pricing" className="scroll-mt-20 bg-surface/60 border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">Pricing</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
            Start free. Upgrade when you grow.
          </h2>
          <p className="mt-4 font-body text-ink/70 leading-relaxed">
            Both plans include every feature. The only difference is how many employees you can add.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => {
            const featured = plan.id === 'pro';
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`relative rounded-2xl p-8 bg-surface border shadow-sm ${
                  featured ? 'border-accent ring-1 ring-accent' : 'border-border'
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-8 bg-accent text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                    For growing teams
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-ink">{plan.name}</h3>
                <p className="mt-1 text-sm font-body text-ink/70">{plan.tagline}</p>

                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-semibold text-ink">{plan.price}</span>
                  <span className="font-body text-sm text-ash">{plan.period}</span>
                </p>
                {featured && <p className="mt-1 text-xs font-mono text-ash">Demo price, no real billing</p>}

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm font-body text-ink/80">
                      <Check size={16} className="text-teal mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button to="/signup" variant={featured ? 'primary' : 'secondary'} className="mt-8 w-full">
                  {featured ? 'Start free, upgrade anytime' : 'Start free'}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

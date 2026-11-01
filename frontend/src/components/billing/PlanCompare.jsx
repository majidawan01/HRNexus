import { Check } from 'lucide-react';
import Button from '../ui/Button';
import { PLANS } from '../../lib/plans';

export default function PlanCompare({ currentPlan, onContinue }) {
  const plans = [PLANS.free, PLANS.pro];

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink pr-8">Upgrade to Pro</h2>
      <p className="mt-1 text-sm font-body text-ink/70">
        Every feature is already included. Pro simply removes the employee limit.
      </p>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const featured = plan.id === 'pro';
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-5 ${featured ? 'border-accent ring-1 ring-accent bg-accent/[0.03]' : 'border-border'}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-ink">{plan.name}</h3>
                {isCurrent && (
                  <span className="font-mono text-[10px] uppercase tracking-widest bg-ash/15 text-ink/70 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-semibold text-ink">{plan.price}</span>
                <span className="text-xs font-body text-ash">{plan.period}</span>
              </p>
              <ul className="mt-4 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-body text-ink/80">
                    <Check size={15} className="text-teal mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs font-mono text-ash">Demo price. No real billing.</p>

      <Button onClick={onContinue} size="lg" className="mt-5 w-full">
        Continue to payment
      </Button>
    </div>
  );
}

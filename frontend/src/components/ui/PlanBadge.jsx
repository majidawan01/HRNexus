import { PLANS } from '../../lib/plans';

export default function PlanBadge({ plan, className = '' }) {
  const isPro = plan === 'pro';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-widest ${
        isPro ? 'bg-accent text-white' : 'bg-ash/15 text-ink/70'
      } ${className}`}
    >
      {PLANS[plan]?.name || plan}
    </span>
  );
}

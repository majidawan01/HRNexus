import Skeleton from '../ui/Skeleton';

export default function StatCard({ label, value, hint, icon: Icon, tone = 'bg-accent/10 text-accent', loading }) {
  return (
    <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-border shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${tone} flex items-center justify-center mb-4`}>
        <Icon size={20} />
      </div>
      <p className="font-mono text-xs uppercase tracking-wider text-ash mb-1">{label}</p>
      {loading ? (
        <Skeleton className="h-8 w-20 mt-1" />
      ) : (
        <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      )}
      {hint && !loading && <p className="mt-1 text-xs font-body text-ash">{hint}</p>}
    </div>
  );
}

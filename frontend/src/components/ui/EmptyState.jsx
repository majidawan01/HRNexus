// Khaali list/chart ke liye: <EmptyState icon={Users} title="..." text="..." action={<Button/>} />
export default function EmptyState({ icon: Icon, title, text, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
          <Icon size={22} />
        </div>
      )}
      <p className="font-display font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm font-body text-ink/70">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

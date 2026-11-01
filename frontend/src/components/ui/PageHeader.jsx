// Har page ka upar wala hissa: chhota label, title, aur right side par buttons
export default function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="font-mono text-xs text-ash uppercase tracking-widest mb-1">{eyebrow}</p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

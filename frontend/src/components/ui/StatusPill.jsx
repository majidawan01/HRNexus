const TONES = {
  present: 'bg-teal/10 text-teal',
  approved: 'bg-teal/10 text-teal',
  active: 'bg-teal/10 text-teal',
  late: 'bg-accent/10 text-accent',
  pending: 'bg-accent/10 text-accent',
  'half-day': 'bg-accent/10 text-accent',
  absent: 'bg-rust/10 text-rust',
  rejected: 'bg-rust/10 text-rust',
  inactive: 'bg-rust/10 text-rust',
  'on-leave': 'bg-ash/15 text-ink/70',
};

export default function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-mono uppercase whitespace-nowrap ${
        TONES[status] || 'bg-ash/15 text-ink/70'
      }`}
    >
      {status}
    </span>
  );
}

import Skeleton from './Skeleton';

const TH = 'px-6 py-4 font-mono text-xs uppercase tracking-wider text-ash text-left';

// columns: [{ header, cell: (row) => node, primary?: true, className? }]
// Bari screen par table, mobile par card (primary column card ka title banta hai,
// baaki "header: value" ki line, jis column ka header khaali ho wo actions ki tarah neeche aata hai).
export default function DataTable({ columns, rows, rowKey = '_id', loading, skeletonRows = 5, empty }) {
  if (loading) {
    return (
      <div className="p-5 sm:p-6 space-y-3" aria-busy="true" aria-label="Loading">
        {Array.from({ length: skeletonRows }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (rows.length === 0) return empty;

  const primary = columns.find((c) => c.primary) || columns[0];
  const details = columns.filter((c) => c !== primary && c.header);
  const actions = columns.filter((c) => c !== primary && !c.header);

  return (
    <>
      <table className="hidden md:table w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((c, i) => (
              <th key={i} className={TH}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-b border-border/60 hover:bg-bg/50 transition">
              {columns.map((c, i) => (
                <td key={i} className={`px-6 py-4 ${c.className || 'font-body text-sm text-ash'}`}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="md:hidden divide-y divide-border">
        {rows.map((row) => (
          <li key={row[rowKey]} className="p-5">
            <div className="font-display font-semibold text-ink">{primary.cell(row)}</div>
            <dl className="mt-3 space-y-1.5">
              {details.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-4 text-sm">
                  <dt className="font-mono text-xs uppercase tracking-wider text-ash">{c.header}</dt>
                  <dd className="text-right font-body text-ink/80">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
            {actions.length > 0 && <div className="mt-3 flex justify-end gap-3">{actions.map((c, i) => <span key={i}>{c.cell(row)}</span>)}</div>}
          </li>
        ))}
      </ul>
    </>
  );
}

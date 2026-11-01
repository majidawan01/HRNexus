import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorBanner({ title = 'Could not load data', message, onRetry }) {
  return (
    <div
      role="alert"
      className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between rounded-2xl border border-rust/30 bg-rust/5 px-5 py-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-rust mt-0.5 shrink-0" />
        <div>
          <p className="font-display font-semibold text-ink">{title}</p>
          <p className="text-sm font-body text-ink/70">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw size={15} /> Try again
        </Button>
      )}
    </div>
  );
}

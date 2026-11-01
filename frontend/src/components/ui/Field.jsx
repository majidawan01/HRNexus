import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Label + input + error/hint. type="password" ho to show/hide button milta hai.
export default function Field({ label, error, hint, type = 'text', className = '', ...props }) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-mono uppercase tracking-wider text-ash mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={`w-full px-4 py-3 rounded-xl bg-bg border text-ink font-body focus:outline-none focus:ring-2 transition ${
            isPassword ? 'pr-12' : ''
          } ${error ? 'border-rust focus:ring-rust' : 'border-border focus:ring-accent'}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-ink transition"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {(error || hint) && (
        <p id={`${id}-msg`} className={`mt-1.5 text-xs font-body ${error ? 'text-rust' : 'text-ash'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

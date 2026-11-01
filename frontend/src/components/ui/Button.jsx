import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const BASE =
  'inline-flex items-center justify-center gap-2 font-display font-medium rounded-xl transition ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';

const VARIANTS = {
  primary: 'bg-accent text-white shadow-sm hover:opacity-90',
  secondary: 'bg-surface text-ink border border-border hover:bg-bg',
  ghost: 'text-ink/70 hover:text-ink hover:bg-surface',
  danger: 'bg-rust text-white shadow-sm hover:opacity-90',
};

const SIZES = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

// <Button to="/signup"> = router Link, <Button href="#faq"> = anchor, warna <button>
export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  ...props
}) {
  const cls = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...props} disabled={loading || props.disabled}>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

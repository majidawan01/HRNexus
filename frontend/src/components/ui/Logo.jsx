import { Link } from 'react-router-dom';

export default function Logo({ className = 'text-xl' }) {
  return (
    <Link to="/" aria-label="HRNexus home" className={`font-display font-semibold text-ink ${className}`}>
      HR<span className="text-accent">Nexus</span>
    </Link>
  );
}

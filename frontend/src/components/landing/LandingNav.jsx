import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { getSession, homePathFor } from '../../lib/session';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const session = getSession();

  return (
    <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-body text-ink/70 hover:text-ink transition">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <Button to={homePathFor(session.user)} size="sm">
              Open dashboard
            </Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button to="/signup" size="sm">
                Start free
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-ink"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-bg px-4 py-4 space-y-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-body text-ink/80 hover:bg-surface"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex gap-2">
            {session ? (
              <Button to={homePathFor(session.user)} className="flex-1">
                Open dashboard
              </Button>
            ) : (
              <>
                <Button to="/login" variant="secondary" className="flex-1">
                  Log in
                </Button>
                <Button to="/signup" className="flex-1">
                  Start free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

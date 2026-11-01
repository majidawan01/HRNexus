import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { getSession, homePathFor } from '../lib/session';

export default function NotFound() {
  const session = getSession();

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center">
      <Logo className="text-2xl" />
      <p className="mt-10 font-mono text-xs uppercase tracking-widest text-accent">Error 404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm font-body text-ink/70">
        The page you are looking for does not exist or has moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button to="/" variant="secondary">
          Home
        </Button>
        {session && <Button to={homePathFor(session.user)}>Open dashboard</Button>}
      </div>
    </div>
  );
}

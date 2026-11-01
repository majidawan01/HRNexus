import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import Button from '../ui/Button';

export default function Footer() {
  return (
    <footer>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-3xl bg-ink text-white px-6 py-12 sm:px-12 sm:py-14 text-center">
          <h2 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight">
            Ready to run HR the easy way?
          </h2>
          <p className="mt-3 font-body text-white/70">Create your company workspace in a couple of minutes.</p>
          <Button to="/signup" size="lg" className="mt-7">
            Start free
          </Button>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo className="text-lg" />
            <span className="text-xs font-mono text-ash">© 2026 · Built by Majid Awan</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-body text-ink/70" aria-label="Footer">
            <a href="#features" className="hover:text-ink transition">Features</a>
            <a href="#pricing" className="hover:text-ink transition">Pricing</a>
            <a href="#faq" className="hover:text-ink transition">FAQ</a>
            <Link to="/login" className="hover:text-ink transition">Log in</Link>
            <Link to="/signup" className="hover:text-ink transition">Sign up</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

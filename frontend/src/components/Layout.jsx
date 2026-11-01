import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Users, Clock, Calendar, Wallet, Building2, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import Logo from './ui/Logo';
import PlanBadge from './ui/PlanBadge';
import Skeleton from './ui/Skeleton';

const COMPANY_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: Clock },
  { to: '/leaves', label: 'Leaves', icon: Calendar },
  { to: '/payroll', label: 'Payroll', icon: Wallet, roles: ['admin', 'hr'] },
];

const SUPERADMIN_NAV = [{ to: '/superadmin', label: 'Companies', icon: Building2 }];

function SidebarContent({ onNavigate }) {
  const { user, company, signOut } = useAuth();
  const navigate = useNavigate();
  const isSuperadmin = user?.role === 'superadmin';

  const navItems = isSuperadmin
    ? SUPERADMIN_NAV
    : COMPANY_NAV.filter((item) => !item.roles || item.roles.includes(user?.role));

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <Logo className="text-xl" />
        <p className="text-ash text-xs mt-1 font-body">{isSuperadmin ? 'Platform admin' : 'Operations center'}</p>

        {!isSuperadmin && (
          <div className="mt-4 rounded-xl bg-surface border border-border px-3 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ash mb-1">Company</p>
            {company ? (
              <>
                <p className="font-display text-sm font-semibold text-ink truncate" title={company.name}>
                  {company.name}
                </p>
                <PlanBadge plan={company.plan} className="mt-1.5" />
              </>
            ) : (
              <>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12 mt-2" />
              </>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all ${
                isActive ? 'bg-accent text-white shadow-sm' : 'text-ink/70 hover:bg-surface hover:text-ink'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-surface rounded-xl border border-border">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink text-sm font-body font-medium truncate">{user?.name}</p>
            <p className="text-ash text-xs font-mono uppercase">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-ash hover:bg-rust/10 hover:text-rust transition-all font-body text-sm"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  // Drawer "kis page par khula" yaad rakhta hai, is liye page badalte hi khud band ho jata hai
  const location = useLocation();
  const [openOn, setOpenOn] = useState(null);
  const drawerOpen = openOn === location.pathname;
  const setDrawerOpen = (open) => setOpenOn(open ? location.pathname : null);
  const { company } = useAuth();

  // Esc se band, aur drawer khula ho to peeche scroll nahi
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpenOn(null);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-bg lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen border-r border-border bg-bg">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-bg/90 backdrop-blur border-b border-border">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="p-2 -ml-2 text-ink"
        >
          <Menu size={22} />
        </button>
        <Logo className="text-lg" />
        {company ? <PlanBadge plan={company.plan} /> : <span className="w-10" />}
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/50"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-bg border-r border-border shadow-xl"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-3 p-2 text-ash hover:text-ink"
              >
                <X size={20} />
              </button>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 overflow-x-auto">{children}</main>
    </div>
  );
}

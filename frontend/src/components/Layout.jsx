import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Calendar, Wallet, LogOut } from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/leaves', label: 'Leaves', icon: Calendar },
    { to: '/payroll', label: 'Payroll', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="inline-flex items-center gap-2 mb-3 bg-surface px-3 py-1.5 rounded-full border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            <span className="font-mono text-[10px] text-ash tracking-widest uppercase">
              HR Platform
            </span>
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">
            HR<span className="text-accent">Nexus</span>
          </h1>
          <p className="text-ash text-xs mt-1 font-body">Operations center</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all ${
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-ink/70 hover:bg-surface hover:text-ink'
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
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display text-sm">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink text-sm font-body font-medium truncate">{user.name}</p>
              <p className="text-ash text-xs font-mono uppercase">{user.role}</p>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
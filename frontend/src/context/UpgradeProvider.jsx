import { useMemo, useState } from 'react';
import UpgradeModal from '../components/billing/UpgradeModal';
import { UpgradeContext } from './upgrade-context';

export function UpgradeProvider({ children }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ openUpgrade: () => setOpen(true) }), []);

  return (
    <UpgradeContext.Provider value={value}>
      {children}
      <UpgradeModal open={open} onClose={() => setOpen(false)} />
    </UpgradeContext.Provider>
  );
}

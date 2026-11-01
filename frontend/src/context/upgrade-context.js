import { createContext, useContext } from 'react';

export const UpgradeContext = createContext(null);

// const { openUpgrade } = useUpgrade();  ->  koi bhi page/button se Upgrade modal khol sakta hai
export function useUpgrade() {
  const ctx = useContext(UpgradeContext);
  if (!ctx) throw new Error('useUpgrade must be used inside <UpgradeProvider>');
  return ctx;
}

import { createContext, useContext } from 'react';

export const ConfirmContext = createContext(null);

// const confirm = useConfirm();
// if (await confirm({ title: 'Delete?', message: '...', confirmText: 'Delete', tone: 'danger' })) { ... }
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
}

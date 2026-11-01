import { useCallback, useState } from 'react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { ConfirmContext } from './confirm-context';

const DEFAULTS = { title: 'Are you sure?', message: '', confirmText: 'Confirm', cancelText: 'Cancel', tone: 'primary' };

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState({ open: false, options: DEFAULTS, resolve: null });

  const confirm = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        setDialog({ open: true, options: { ...DEFAULTS, ...options }, resolve });
      }),
    []
  );

  const close = (result) => {
    dialog.resolve?.(result);
    setDialog((d) => ({ ...d, open: false, resolve: null }));
  };

  const { title, message, confirmText, cancelText, tone } = dialog.options;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={dialog.open} onClose={() => close(false)} title={title} maxWidth="max-w-md">
        {message && <p className="text-sm font-body text-ink/70 leading-relaxed">{message}</p>}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button variant="secondary" onClick={() => close(false)}>
            {cancelText}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={() => close(true)}>
            {confirmText}
          </Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

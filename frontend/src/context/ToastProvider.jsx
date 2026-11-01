import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext } from './toast-context';

const STYLES = {
  success: { icon: CheckCircle2, color: 'text-teal' },
  error: { icon: AlertCircle, color: 'text-rust' },
  info: { icon: Info, color: 'text-accent' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = ++nextId.current;
      setToasts((list) => [...list.slice(-3), { id, type, message }]);
      setTimeout(() => remove(id), type === 'error' ? 6000 : 4000);
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-[100] bottom-4 left-4 right-4 sm:left-auto sm:w-96 flex flex-col gap-2 pointer-events-none"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const { icon: Icon, color } = STYLES[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24 }}
                className="pointer-events-auto flex items-start gap-3 bg-surface border border-border rounded-xl shadow-lg px-4 py-3"
                role={t.type === 'error' ? 'alert' : 'status'}
              >
                <Icon size={18} className={`${color} mt-0.5 shrink-0`} />
                <p className="flex-1 text-sm font-body text-ink">{t.message}</p>
                <button
                  onClick={() => remove(t.id)}
                  aria-label="Dismiss"
                  className="text-ash hover:text-ink transition"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

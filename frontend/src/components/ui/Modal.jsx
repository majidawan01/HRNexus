import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

// Dialog: Esc/overlay click se band, peeche scroll band, focus andar, band hone par focus wapas.
// Mobile par neeche se chipka hua sheet, bari screen par beech mein.
export default function Modal({ open, onClose, title, description, children, maxWidth = 'max-w-lg', ariaLabel }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-ink/50 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : ariaLabel}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${maxWidth} max-h-[92vh] overflow-y-auto bg-surface border border-border shadow-xl rounded-t-2xl sm:rounded-2xl p-5 sm:p-8 focus:outline-none`}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 p-1.5 rounded-lg text-ash hover:text-ink hover:bg-bg transition"
            >
              <X size={20} />
            </button>
            {title && (
              <div className="mb-5 pr-8">
                <h2 id={titleId} className="font-display text-xl font-semibold text-ink">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm font-body text-ink/70">{description}</p>}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

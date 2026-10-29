import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#17211B]/40 backdrop-blur-sm"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'relative w-full rounded-2xl bg-white border border-[#E1E9E2] shadow-2xl z-10 overflow-hidden flex flex-col text-[#17211B]',
              maxWidth,
              className
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between p-6 pb-4 border-b border-[#E1E9E2]">
                <div className="space-y-1">
                  {title && (
                    <h2 className="text-lg font-bold text-[#17211B]">{title}</h2>
                  )}
                  {description && (
                    <p className="text-xs text-[#647168]">{description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#647168] hover:text-[#17211B] hover:bg-[#EAF6EE] transition-colors focus:outline-none"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Body Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-4 px-6 border-t border-[#E1E9E2] bg-[#F7FAF7] flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

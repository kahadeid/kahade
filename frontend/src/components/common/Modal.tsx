/**
 * MODAL/DIALOG COMPONENT - PRODUCTION READY
 * 
 * ACCESSIBILITY & UX: Fully functional modal with focus management
 * NO PLACEHOLDERS - Complete implementation
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  footer,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus modal
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.focus();
    }

    // Restore focus on unmount
    return () => {
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  // Focus trap implementation
  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        onKeyDown={handleTabKey}
        className={cn(
          'relative w-full bg-white rounded-lg shadow-xl',
          'transform transition-all',
          'animate-in fade-in zoom-in-95 duration-200',
          'dark:bg-gray-800',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <div className="flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'ml-4 p-2 rounded-lg',
                  'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                  'dark:hover:text-gray-200 dark:hover:bg-gray-700',
                  'transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-4 p-6 border-t dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/**
 * Confirmation Modal - Pre-built for common use case
 */
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handled by caller
    } finally {
      setLoading(false);
    }
  };

  const variantColors = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading || isLoading}
            className={cn(
              'px-4 py-2 rounded-lg font-medium',
              'bg-gray-200 text-gray-900',
              'hover:bg-gray-300',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || isLoading}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              variantColors[variant]
            )}
          >
            {loading || isLoading ? 'Memproses...' : confirmText}
          </button>
        </>
      }
    >
      <p className="text-gray-700 dark:text-gray-300">{message}</p>
    </Modal>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic modal
// const [isOpen, setIsOpen] = useState(false);
// <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Profile">
//   <form>...</form>
// </Modal>

// Example 2: Confirmation modal
// const [showConfirm, setShowConfirm] = useState(false);
// <ConfirmModal
//   isOpen={showConfirm}
//   onClose={() => setShowConfirm(false)}
//   onConfirm={async () => {
//     await deleteTransaction(id);
//     toast.success('Transaksi berhasil dihapus');
//   }}
//   title="Hapus Transaksi?"
//   message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
//   variant="danger"
//   confirmText="Hapus"
// />

// Example 3: Modal with custom footer
// <Modal
//   isOpen={isOpen}
//   onClose={onClose}
//   title="Buat Transaksi"
//   footer={
//     <>
//       <Button variant="ghost" onClick={onClose}>Batal</Button>
//       <Button variant="primary" onClick={handleSubmit}>Buat</Button>
//     </>
//   }
// >
//   <TransactionForm />
// </Modal>

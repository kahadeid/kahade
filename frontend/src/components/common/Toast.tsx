/**
 * TOAST NOTIFICATION SYSTEM
 * 
 * UX IMPROVEMENT: User feedback for actions
 * 
 * Provides toast notifications for success, error, warning, and info messages
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  hideToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

// ==========================================
// CONTEXT
// ==========================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ==========================================
// HOOK
// ==========================================

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// ==========================================
// PROVIDER
// ==========================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const toast: Toast = { id, message, variant, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => hideToast(id), duration);
      }
    },
    [hideToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, 'success', duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast(message, 'error', duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, 'warning', duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast(message, 'info', duration),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, hideToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

// ==========================================
// TOAST COMPONENT
// ==========================================

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const { id, message, variant } = toast;

  // Variant styles
  const variantStyles = {
    success: 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-100',
    error: 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-100',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    info: 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  };

  // Icons
  const icons = {
    success: <CheckCircle className="w-5 aria-hidden="true" h-5" />,
    error: <XCircle className="w-5 aria-hidden="true" h-5" />,
    warning: <AlertTriangle className="w-5 aria-hidden="true" h-5" />,
    info: <Info className="w-5 aria-hidden="true" h-5" />,
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border-l-4 shadow-lg',
        'animate-in slide-in-from-right-full',
        'min-w-[300px] max-w-md',
        variantStyles[variant]
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="flex-shrink-0">{icons[variant]}</div>

      {/* Message */}
      <div className="flex-1 text-sm font-medium">{message}</div>

      {/* Close button */}
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==========================================
// TOAST CONTAINER
// ==========================================

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

// ==========================================
// STANDALONE TOAST FUNCTIONS (Alternative)
// ==========================================

/**
 * Standalone toast functions (use without provider)
 * Note: These require ToastProvider to be in the component tree
 */
export const toast = {
  success: (message: string) => {
    // This is a placeholder - actual implementation uses context
  },
  error: (message: string) => {
  },
  warning: (message: string) => {
  },
  info: (message: string) => {
  },
};

// ==========================================
// USAGE EXAMPLES
// ==========================================

/**
 * SETUP:
 * 
 * 1. Wrap your app with ToastProvider:
 * ```tsx
 * import { ToastProvider } from '@/components/common/Toast';
 * 
 * function App() {
 *   return (
 *     <ToastProvider>
 *       <YourApp />
 *     </ToastProvider>
 *   );
 * }
 * ```
 * 
 * 2. Use the hook in components:
 * ```tsx
 * import { useToast } from '@/components/common/Toast';
 * 
 * function MyComponent() {
 *   const toast = useToast();
 * 
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       toast.success('Data berhasil disimpan!');
 *     } catch (error) {
 *       toast.error('Gagal menyimpan data');
 *     }
 *   };
 * 
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 * 
 * 3. Different variants:
 * ```tsx
 * const toast = useToast();
 * 
 * toast.success('Berhasil!');
 * toast.error('Terjadi kesalahan!');
 * toast.warning('Perhatian!');
 * toast.info('Informasi penting');
 * 
 * // With custom duration
 * toast.success('Pesan ini hilang dalam 3 detik', 3000);
 * 
 * // Manual control
 * toast.showToast('Custom message', 'info', 0); // Won't auto-dismiss
 * ```
 * 
 * 4. Common use cases:
 * ```tsx
 * // After form submission
 * const handleSubmit = async (data) => {
 *   try {
 *     await api.post('/endpoint', data);
 *     toast.success('Form berhasil dikirim!');
 *     router.push('/success');
 *   } catch (error) {
 *     toast.error('Gagal mengirim form');
 *   }
 * };
 * 
 * // After delete action
 * const handleDelete = async (id) => {
 *   if (!confirm('Yakin ingin menghapus?')) return;
 *   
 *   try {
 *     await api.delete(`/items/${id}`);
 *     toast.success('Item berhasil dihapus');
 *     refetch();
 *   } catch (error) {
 *     toast.error('Gagal menghapus item');
 *   }
 * };
 * 
 * // After copy to clipboard
 * const handleCopy = async (text) => {
 *   const success = await copyToClipboard(text);
 *   if (success) {
 *     toast.success('Teks berhasil disalin!');
 *   } else {
 *     toast.error('Gagal menyalin teks');
 *   }
 * };
 * 
 * // After file upload
 * const handleUpload = async (file) => {
 *   try {
 *     toast.info('Mengunggah file...');
 *     await uploadFile(file);
 *     toast.success('File berhasil diunggah!');
 *   } catch (error) {
 *     toast.error('Gagal mengunggah file');
 *   }
 * };
 * ```
 */

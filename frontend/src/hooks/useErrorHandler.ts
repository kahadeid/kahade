import { useCallback } from 'react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ErrorHandlerOptions {
  silent?: boolean;
  customMessage?: string;
}

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, options?: ErrorHandlerOptions) => {
    const { silent = false, customMessage } = options || {};

    let errorMessage = 'Terjadi kesalahan yang tidak diketahui';

    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message || errorMessage;
      
      // Log to monitoring service in production
      if (import.meta.env.PROD) {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: errorMessage,
        });
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    if (!silent) {
      toast.error(customMessage || errorMessage);
    }

    return errorMessage;
  }, []);

  const handleSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const handleInfo = useCallback((message: string) => {
    toast.info(message);
  }, []);

  const handleWarning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  return { 
    handleError, 
    handleSuccess, 
    handleInfo, 
    handleWarning 
  };
}

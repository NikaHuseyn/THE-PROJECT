import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseErrorHandlerOptions {
  defaultErrorMessage?: string;
  showToast?: boolean;
  logError?: boolean;
}

interface ErrorHandlerResult {
  error: Error | null;
  isError: boolean;
  handleError: (error: Error | unknown, customMessage?: string) => void;
  clearError: () => void;
  retry: (fn: () => Promise<void> | void) => Promise<void>;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}): ErrorHandlerResult => {
  const {
    defaultErrorMessage = 'An unexpected error occurred',
    showToast = true,
    logError = true
  } = options;

  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((error: Error | unknown, customMessage?: string) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    setError(errorObj);

    if (logError) {
      console.error('Error caught by useErrorHandler:', errorObj);
    }

    if (showToast) {
      toast({
        title: "Error",
        description: customMessage || errorObj.message || defaultErrorMessage,
        variant: "destructive",
      });
    }
  }, [defaultErrorMessage, showToast, logError, toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (fn: () => Promise<void> | void) => {
    try {
      clearError();
      await fn();
    } catch (retryError) {
      handleError(retryError, 'Retry failed');
    }
  }, [clearError, handleError]);

  return {
    error,
    isError: error !== null,
    handleError,
    clearError,
    retry
  };
};

export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const { error, isError, handleError, clearError } = useErrorHandler();

  const execute = useCallback(async (
    operation: () => Promise<any>,
    options?: {
      onSuccess?: (result: any) => void;
      onError?: (error: Error) => void;
      errorMessage?: string;
    }
  ) => {
    try {
      setLoading(true);
      clearError();
      
      const result = await operation();
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const errorMessage = options?.errorMessage || 'Operation failed';
      handleError(error, errorMessage);
      
      if (options?.onError && error instanceof Error) {
        options.onError(error);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  return {
    execute,
    loading,
    error,
    isError,
    clearError
  };
};
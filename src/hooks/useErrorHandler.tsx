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
      fallbackData?: any;
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
      
      // Return fallback data if provided
      return options?.fallbackData || null;
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

// Enhanced hook for API calls with automatic retries
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { error, isError, handleError, clearError } = useErrorHandler();

  const call = useCallback(async (
    apiCall: () => Promise<any>,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
      onSuccess?: (result: any) => void;
      onError?: (error: Error, attempt: number) => void;
      errorMessage?: string;
      fallbackData?: any;
    }
  ) => {
    const { 
      maxRetries = 2, 
      retryDelay = 1000, 
      onSuccess, 
      onError, 
      errorMessage = 'API call failed',
      fallbackData 
    } = options || {};

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setLoading(true);
        setRetryCount(attempt);
        
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }

        const result = await apiCall();
        clearError();
        setRetryCount(0);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (onError) {
          onError(lastError, attempt + 1);
        }
        
        if (attempt === maxRetries) {
          handleError(lastError, `${errorMessage} (after ${maxRetries + 1} attempts)`);
          return fallbackData || null;
        }
      } finally {
        setLoading(false);
      }
    }
  }, [handleError, clearError]);

  return {
    call,
    loading,
    error,
    isError,
    retryCount,
    clearError
  };
};
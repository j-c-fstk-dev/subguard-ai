declare module 'react-hot-toast' {
  export interface ToastOptions {
    duration?: number;
    style?: React.CSSProperties;
    className?: string;
    icon?: React.ReactNode;
    iconTheme?: {
      primary: string;
      secondary: string;
    };
    ariaProps?: {
      role: string;
      'aria-live': 'polite' | 'assertive';
    };
  }

  export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'loading' | 'blank' | 'custom';
    duration?: number;
    createdAt: number;
    visible: boolean;
    height?: number;
  }

  export interface ToasterProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    toastOptions?: ToastOptions;
    reverseOrder?: boolean;
    gutter?: number;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
  }

  export const Toaster: React.FC<ToasterProps>;
  export const toast: {
    (message: string, options?: ToastOptions): string;
    success: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
    loading: (message: string, options?: ToastOptions) => string;
    custom: (message: React.ReactNode, options?: ToastOptions) => string;
    dismiss: (toastId?: string) => void;
    remove: (toastId?: string) => void;
    promise: <T>(
      promise: Promise<T>,
      msgs: {
        loading: string;
        success: string;
        error: string;
      },
      options?: ToastOptions
    ) => Promise<T>;
  };
}
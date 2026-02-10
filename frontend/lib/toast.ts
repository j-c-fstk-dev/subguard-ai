import toast from 'react-hot-toast';

const toastInstance = toast as any;

interface ToastAction {
  label: string;
  onClick: () => void;
}

export const showSuccess = (message: string, action?: ToastAction) => {
  toastInstance.success(message, {
    duration: action ? 5000 : 3000,
    position: 'top-right' as const,
  });
  
  if (action) {
    setTimeout(() => {
      action.onClick();
    }, 500);
  }
};

export const showError = (message: string) => {
  toastInstance.error(message, {
    duration: 4000,
    position: 'top-right' as const,
  });
};
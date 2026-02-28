import { Toast, type ToastData } from './toast';
import './toast_container.scss';

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          style={toast.style}
          title={toast.title}
          message={toast.message}
          exiting={toast.exiting}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

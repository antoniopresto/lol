import type { ReactNode } from 'react';
import './toast.scss';

export type ToastStyle = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  style: ToastStyle;
  title: string;
  message?: string;
  exiting: boolean;
}

interface ToastProps {
  style: ToastStyle;
  title: string;
  message?: string;
  exiting: boolean;
  onDismiss: () => void;
}

function ToastIcon({ style }: { style: ToastStyle }): ReactNode {
  switch (style) {
    case 'success':
      return (
        <svg
          className="toast__icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2" />
          <path
            d="M5 8.5L7 10.5L11 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'error':
      return (
        <svg
          className="toast__icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2" />
          <path
            d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'info':
      return (
        <svg
          className="toast__icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2" />
          <path
            d="M8 5V5.01M8 7V11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function Toast({
  style,
  title,
  message,
  exiting,
  onDismiss,
}: ToastProps) {
  const isError = style === 'error';
  return (
    <div
      className={`toast toast--${style}${exiting ? ' toast--exiting' : ''}`}
      onClick={onDismiss}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <ToastIcon style={style} />
      <div className="toast__content">
        <span className="toast__title">{title}</span>
        {message && <span className="toast__message">{message}</span>}
      </div>
    </div>
  );
}

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import './alert.scss';

export type AlertActionStyle = 'default' | 'destructive' | 'cancel';

export interface AlertAction {
  label: string;
  style?: AlertActionStyle;
  onAction: () => void;
}

export interface AlertOptions {
  title: string;
  message?: string;
  icon?: ReactNode;
  primaryAction: AlertAction;
  dismissAction?: AlertAction;
}

interface AlertProps extends AlertOptions {
  onDismiss: (confirmed: boolean) => void;
}

const EXIT_ANIMATION_MS = 150;

export function Alert({
  title,
  message,
  icon,
  primaryAction,
  dismissAction,
  onDismiss,
}: AlertProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const onDismissRef = useRef(onDismiss);
  const dismissActionRef = useRef(dismissAction);
  const [exiting, setExiting] = useState(false);
  const titleId = useId();
  const messageId = useId();

  onDismissRef.current = onDismiss;
  dismissActionRef.current = dismissAction;

  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  function animateOut(confirmed: boolean) {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      onDismissRef.current(confirmed);
    }, EXIT_ANIMATION_MS);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        dismissActionRef.current?.onAction();
        onDismissRef.current(false);
        return;
      }
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled])',
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable.item(0);
        const last = focusable.item(focusable.length - 1);
        if (!first || !last) return;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      dismissAction?.onAction();
      animateOut(false);
    }
  }

  function handlePrimaryClick() {
    primaryAction.onAction();
    animateOut(true);
  }

  function handleDismissClick() {
    dismissAction?.onAction();
    animateOut(false);
  }

  const primaryClassName = `alert__button alert__button--${primaryAction.style ?? 'default'}`;

  return (
    <div
      className={`alert__backdrop${exiting ? ' alert__backdrop--exiting' : ''}`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={`alert__dialog${exiting ? ' alert__dialog--exiting' : ''}`}
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
      >
        {icon && <div className="alert__icon">{icon}</div>}
        <h2 className="alert__title" id={titleId}>
          {title}
        </h2>
        {message && (
          <p className="alert__message" id={messageId}>
            {message}
          </p>
        )}
        <div className="alert__actions">
          {dismissAction && (
            <button
              type="button"
              className="alert__button alert__button--cancel"
              onClick={handleDismissClick}
            >
              {dismissAction.label}
            </button>
          )}
          <button
            type="button"
            className={primaryClassName}
            onClick={handlePrimaryClick}
            ref={primaryRef}
          >
            {primaryAction.label}
          </button>
        </div>
      </div>
    </div>
  );
}

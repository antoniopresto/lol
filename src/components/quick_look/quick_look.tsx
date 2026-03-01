import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import './quick_look.scss';

export interface QuickLookProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

const EXIT_ANIMATION_MS = 150;

export function QuickLook({ title, children, onClose }: QuickLookProps) {
  const [exiting, setExiting] = useState(false);
  const exitingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  onCloseRef.current = onClose;

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  function animateOut() {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    setTimeout(() => {
      onCloseRef.current();
    }, EXIT_ANIMATION_MS);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        animateOut();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
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
      animateOut();
    }
  }

  return (
    <div
      className={`quick-look__backdrop${exiting ? ' quick-look__backdrop--exiting' : ''}`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={`quick-look__card${exiting ? ' quick-look__card--exiting' : ''}`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="quick-look__header">
          <h2 className="quick-look__title" id={titleId}>
            {title}
          </h2>
          <button
            type="button"
            className="quick-look__close"
            ref={closeButtonRef}
            onClick={() => animateOut()}
            aria-label="Close preview"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="quick-look__body">{children}</div>
      </div>
    </div>
  );
}

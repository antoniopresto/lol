import { useCallback, useRef, useState } from 'react';
import type { AlertOptions } from '../components/alert/alert';

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertOptions | null>(null);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirmAlert = useCallback((
    options: AlertOptions,
  ): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      resolveRef.current = resolve;
      setAlertState(options);
    });
  }, []);

  const dismiss = useCallback((confirmed: boolean) => {
    if (resolveRef.current) {
      resolveRef.current(confirmed);
      resolveRef.current = null;
    }
    setAlertState(null);
  }, []);

  return {
    alertState,
    confirmAlert,
    dismiss,
  };
}

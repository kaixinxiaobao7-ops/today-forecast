import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToastFn } from '../types';

export function useToast(): { message: string; visible: boolean; toast: ToastFn } {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | null>(null);

  const toast = useCallback<ToastFn>((nextMessage) => {
    setMessage(nextMessage);
    setVisible(true);
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      setVisible(false);
      timer.current = null;
    }, 2800);
  }, []);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  return { message, visible, toast };
}

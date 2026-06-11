import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: { ctrl?: boolean; meta?: boolean; shift?: boolean; preventDefault?: boolean }
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k !== key.toLowerCase()) return;
      if (options?.ctrl && !e.ctrlKey) return;
      if (options?.meta && !e.metaKey) return;
      if (options?.shift && !e.shiftKey) return;
      if (options?.preventDefault !== false) e.preventDefault();
      callback();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, options]);
}

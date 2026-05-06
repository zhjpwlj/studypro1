import { useEffect } from 'react';

interface CommandMap {
  [key: string]: () => void;
}

export const useKeyboardCommands = (commands: CommandMap): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Construct command string
      let cmd = '';
      if (ctrl) cmd += 'ctrl+';
      if (shift) cmd += 'shift+';
      cmd += key;

      if (commands[cmd]) {
        e.preventDefault();
        commands[cmd]();
      } else if (commands[key]) {
        // Simple key command
        e.preventDefault();
        commands[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return (): void => window.removeEventListener('keydown', handleKeyDown);
  }, [commands]);
};

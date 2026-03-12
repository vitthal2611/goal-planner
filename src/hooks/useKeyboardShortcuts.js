import { useEffect } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if user is typing in an input/textarea
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        document.activeElement?.tagName
      );

      shortcuts.forEach(({ key, ctrlKey, shiftKey, callback }) => {
        const keyMatch = event.key.toLowerCase() === key.toLowerCase();
        const ctrlMatch = ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shiftKey ? event.shiftKey : !event.shiftKey;

        if (keyMatch && ctrlMatch && shiftMatch) {
          // Allow Enter key even when typing
          if (key === 'Enter' || !isTyping) {
            event.preventDefault();
            callback(event);
          }
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export default useKeyboardShortcuts;

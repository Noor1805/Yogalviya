import { useEffect } from 'react';

export function useHotkeys(key: string, callback: (e: KeyboardEvent) => void, ctrlKey: boolean = false) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignoree if user is typing in an input or textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key.toLowerCase() === key.toLowerCase() && (ctrlKey ? e.ctrlKey || e.metaKey : true)) {
                e.preventDefault();
                callback(e);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [key, callback, ctrlKey]);
}

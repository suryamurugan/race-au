import { useEffect } from 'react';
import { toast } from 'sonner';

// Simple global copy/paste prevention
export function useCopyPastePrevent() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent copy/paste/cut shortcuts
            if (
                (e.ctrlKey || e.metaKey) &&
                (e.key === 'c' ||
                    e.key === 'v' ||
                    e.key === 'x' ||
                    e.key === 'a')
            ) {
                e.preventDefault();
                toast.error(
                    'Copy/paste operations are disabled during challenges',
                    {
                        duration: 3000,
                    },
                );
            }

            // Prevent developer tools
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
                toast.error(
                    'Developer tools access is disabled during challenges',
                    {
                        duration: 3000,
                    },
                );
            }
        };

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            toast.error('Copying is disabled during challenges', {
                duration: 3000,
            });
        };

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            toast.error('Pasting is disabled during challenges', {
                duration: 3000,
            });
        };

        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault();
            toast.error('Cutting is disabled during challenges', {
                duration: 3000,
            });
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            toast.error('Right-click is disabled during challenges', {
                duration: 3000,
            });
        };

        const handleSelectStart = (e: Event) => {
            const target = e.target as HTMLElement;
            // Allow selection in input fields
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        };

        // Add event listeners to document
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('cut', handleCut);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);

        // Apply CSS to body
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('cut', handleCut);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);

            // Restore CSS
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
        };
    }, []);
}

// Hook for protecting the entire page/component
export function usePageProtection() {
    return useCopyPastePrevent();
}

// Hook specifically for protecting input fields - same as page protection for now
export function useInputProtection() {
    return useCopyPastePrevent();
}

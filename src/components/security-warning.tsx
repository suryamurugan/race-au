'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface SecurityWarningProps {
    show: boolean;
    message: string;
    onClose: () => void;
}

export function SecurityWarning({
    show,
    message,
    onClose,
}: SecurityWarningProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm rounded-lg border border-red-500/20 bg-red-500/10 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <svg
                    className="h-5 w-5 flex-shrink-0 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                </svg>
                <div>
                    <h4 className="font-mono text-sm font-semibold text-red-500">
                        Security Alert
                    </h4>
                    <p className="font-mono text-xs text-red-500/80">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Hook to manage security warnings
export function useSecurityWarning() {
    const [warning, setWarning] = useState<{ show: boolean; message: string }>({
        show: false,
        message: '',
    });

    const showWarning = (message: string) => {
        setWarning({ show: true, message });
        toast.error(message, {
            duration: 3000,
            style: {
                fontFamily: 'monospace',
            },
        });
    };

    const hideWarning = () => {
        setWarning({ show: false, message: '' });
    };

    return {
        warning,
        showWarning,
        hideWarning,
    };
}

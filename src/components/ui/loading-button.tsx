'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    loadingText?: string;
    variant?:
        | 'default'
        | 'destructive'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
    (
        {
            className,
            children,
            variant,
            size,
            isLoading = false,
            loadingText,
            disabled,
            ...props
        },
        ref,
    ) => {
        return (
            <Button
                className={cn(className)}
                variant={variant}
                size={size}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {loadingText || children}
                    </>
                ) : (
                    children
                )}
            </Button>
        );
    },
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton, type LoadingButtonProps };

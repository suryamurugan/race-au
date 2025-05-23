import SignIn from '@/components/sign-in';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { ArrowLeft, DatabaseZap, Terminal } from 'lucide-react';
import { CircuitPattern } from '@/components/circuit-pattern';
import { GridOverlay } from '@/components/grid-overlay';

export default function LoginPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center overflow-hidden transition-colors">
            {/* Background Effects */}
            <div className="opacity-[0.15] dark:opacity-[0.25]">
                <CircuitPattern />
                <GridOverlay />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">
                <div className="flex flex-col items-center space-y-2 text-center">
                    {/* Header with back button and logo */}
                    <div className="mb-2 flex items-center gap-2">
                        {/* Back button */}

                        {/* Logo and site name */}
                        <Link href="/" className="flex items-center space-x-2">
                            <DatabaseZap className="text-primary h-6 w-6" />
                            <span className="text-primary font-mono text-2xl font-bold">
                                RACE_SYS
                            </span>
                        </Link>
                    </div>
                    <p className="text-primary/80 font-mono">
                        {'>'} AUTHENTICATION_REQUIRED
                    </p>
                </div>
                <div className="mt-6">
                    <SignIn />
                </div>
            </div>
        </div>
    );
}

import SignIn from '@/components/sign-in';

import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { ArrowLeft, ChevronsUp, Ship } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center space-y-2 text-center">
                    {/* Header with back button and logo */}
                    <div className="mb-2 flex items-center gap-2">
                        {/* Back button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            asChild
                        >
                            <Link href="/">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="sr-only">Back to home</span>
                            </Link>
                        </Button>

                        {/* Logo and site name */}
                        <Link href="/" className="flex items-center space-x-2">
                            <ChevronsUp className="text-primary h-6 w-6" />
                            <span className="text-primary text-2xl font-bold">
                                Race
                            </span>
                        </Link>
                    </div>
                    <p className="text-muted-foreground">Sign in to race.</p>
                </div>
                <div className="mt-6">
                    <SignIn />
                </div>
            </div>
        </div>
    );
}

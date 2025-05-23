'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingButton } from './ui/loading-button';
import { signIn, useSession } from '@/server/auth/client';
import { Terminal, AlertCircle } from 'lucide-react';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const session = useSession();

    // If user is logged in, don't show the form
    if (session.data) {
        return null;
    }

    const handleSignIn = async () => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await signIn.email({ email, password });

            if (error) {
                setError(error.message || 'An error occurred during sign in');
                setLoading(false);
            } else {
                // Reset loading state - let middleware handle redirect
                setLoading(false);
                // Force a page refresh to trigger middleware
                window.location.href = '/';
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError(null);

        try {
            await signIn.social({
                provider: 'google',
                callbackURL: '/',
            });
            // Reset loading state
            setGoogleLoading(false);
        } catch (err) {
            setError('Failed to sign in with Google');
            setGoogleLoading(false);
        }
    };

    return (
        <Card className="border-primary/20 bg-card/80 dark:bg-card/50 backdrop-blur transition-colors">
            <CardHeader>
                <CardTitle className="text-primary font-mono text-lg md:text-xl">
                    {'>'} SYSTEM_ACCESS
                </CardTitle>
                <CardDescription className="text-primary/70 font-mono text-xs md:text-sm">
                    {'>'} ENTER_CREDENTIALS
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive dark:bg-destructive/20 flex items-center gap-2 rounded-md p-3 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-mono">{error}</span>
                        </div>
                    )}

                    {/* Google OAuth Button */}
                    <LoadingButton
                        variant="outline"
                        className="border-primary/20 text-primary/90 hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20 w-full font-mono transition-colors"
                        onClick={handleGoogleSignIn}
                        isLoading={googleLoading}
                        loadingText="CONNECTING_TO_GOOGLE..."
                    >
                        <Terminal className="mr-2 h-4 w-4" />
                        AUTH_VIA_GOOGLE
                    </LoadingButton>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="border-primary/20 dark:border-primary/30 w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card text-primary/70 dark:bg-background px-2 font-mono">
                                {'>'} OR_USE_CREDENTIALS
                            </span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSignIn();
                        }}
                    >
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-primary/90 font-mono"
                                >
                                    {'>'} EMAIL
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@terminal.sys"
                                    required
                                    className="border-primary/20 bg-card/50 text-primary placeholder:text-primary/50 hover:border-primary/30 focus:border-primary/40 dark:border-primary/30 dark:bg-background/50 font-mono"
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                    }}
                                    value={email}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-primary/90 font-mono"
                                >
                                    {'>'} PASSWORD
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="********"
                                    autoComplete="password"
                                    className="border-primary/20 bg-card/50 text-primary placeholder:text-primary/50 hover:border-primary/30 focus:border-primary/40 dark:border-primary/30 dark:bg-background/50 font-mono"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>

                            <LoadingButton
                                type="submit"
                                className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 dark:border-primary/30 dark:bg-primary/20 dark:hover:bg-primary/30 w-full font-mono transition-colors"
                                isLoading={loading}
                                loadingText="AUTHENTICATING..."
                            >
                                {'>'} AUTHENTICATE
                            </LoadingButton>
                        </div>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}

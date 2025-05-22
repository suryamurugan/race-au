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
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingButton } from './ui/loading-button';
import { signIn } from '@/server/auth/client';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignIn = async () => {
        setLoading(true);
        setError(null);

        const { error } = await signIn.email({ email, password });

        if (error) {
            setError(error.message || 'An error occurred during sign in');
            setLoading(false);
        } else {
            router.push('/');
            // Loading state remains active during navigation
        }
    };

    return (
        <Card className="max-w-md rounded-t-none">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSignIn();
                    }}
                >
                    <div className="grid gap-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                                value={email}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Input
                                id="password"
                                type="password"
                                placeholder="password"
                                autoComplete="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <LoadingButton
                            type="submit"
                            className="w-full"
                            isLoading={loading}
                            loadingText="Signing in..."
                        >
                            Login
                        </LoadingButton>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

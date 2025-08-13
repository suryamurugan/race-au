'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Trophy, Award, User, DatabaseZap, LogOut } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useSession, signOut } from '@/server/auth/client';
import { Button } from './ui/button';

const navItems = [
    { label: 'Home', href: '/', icon: Home },
    {
        label: 'Challenges',
        href: '/challenges/81699dcb-a988-4124-bd29-6bec3066c88d',
        icon: Trophy,
    },
    {
        label: 'Leaderboard',
        href: '/leaderboard?challenge=81699dcb-a988-4124-bd29-6bec3066c88d',
        icon: Award,
    },
    // { label: 'Profile', href: '/profile', icon: User },
];

export function NavBar() {
    const pathname = usePathname();
    const router = useRouter();
    const session = useSession();

    // If not logged in, don't show the navbar
    if (!session.data) {
        return null;
    }

    const isActive = (href: string) => {
        if (href.includes('?')) {
            const [path] = href.split('?');
            return pathname === path;
        }
        return pathname === href;
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="border-primary/20 bg-background/95 sticky top-0 z-50 border-b backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link
                                href="/"
                                className="text-primary font-mono text-xl font-bold tracking-wider"
                            >
                                <div className="flex items-center gap-2">
                                    <DatabaseZap className="h-5 w-5" />
                                    <span>RACE</span>
                                </div>
                            </Link>
                            <div className="hidden items-center space-x-1 md:flex">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'relative rounded-md px-3 py-2 font-mono text-sm transition-colors',
                                            isActive(item.href)
                                                ? 'text-primary'
                                                : 'text-muted-foreground hover:text-primary',
                                        )}
                                    >
                                        {isActive(item.href) && (
                                            <motion.div
                                                layoutId="desktop-nav-indicator"
                                                className="border-primary/20 bg-primary/10 absolute inset-0 z-[-1] rounded-md border"
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 350,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        {'>'} {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <ThemeToggle />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-primary font-mono"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="sr-only">Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className="border-primary/20 bg-background/95 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-sm md:hidden">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-around">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative flex w-16 flex-col items-center justify-center space-y-1 py-2"
                                >
                                    <div className="relative">
                                        <Icon
                                            className={cn(
                                                'h-5 w-5 transition-colors duration-200',
                                                active
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground',
                                            )}
                                        />
                                        <AnimatePresence>
                                            {active && (
                                                <motion.div
                                                    initial={{
                                                        scale: 0.5,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        scale: 1,
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        scale: 0.5,
                                                        opacity: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.2,
                                                    }}
                                                    className="border-primary/20 bg-primary/10 absolute inset-0 -m-1 rounded-full border"
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <span
                                        className={cn(
                                            'font-mono text-xs transition-colors duration-200',
                                            active
                                                ? 'text-primary font-medium'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {'>'} {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                        {/* Mobile Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="relative flex w-16 flex-col items-center justify-center space-y-1 py-2"
                        >
                            <div className="relative">
                                <LogOut className="text-muted-foreground h-5 w-5 transition-colors duration-200" />
                            </div>
                            <span className="text-muted-foreground font-mono text-xs transition-colors duration-200">
                                {'>'} Logout
                            </span>
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
}

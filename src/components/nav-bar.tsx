'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Trophy, Award, User } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Challenges', href: '/challenges', icon: Trophy },
    { label: 'Leaderboard', href: '/leaderboard', icon: Award },
    { label: 'Profile', href: '/profile', icon: User },
];

export function NavBar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link
                                href="/"
                                className="from-primary to-primary/50 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent"
                            >
                                Race
                            </Link>
                            <div className="hidden items-center space-x-1 md:flex">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                            pathname === item.href
                                                ? 'text-primary'
                                                : 'text-muted-foreground hover:text-primary',
                                        )}
                                    >
                                        {pathname === item.href && (
                                            <motion.div
                                                layoutId="desktop-nav-indicator"
                                                className="bg-primary/10 absolute inset-0 z-[-1] rounded-md"
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 350,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className="bg-background/80 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-sm md:hidden">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-around">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

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
                                                isActive
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground',
                                            )}
                                        />
                                        <AnimatePresence>
                                            {isActive && (
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
                                                    className="bg-primary/10 absolute inset-0 -m-1 rounded-full"
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <span
                                        className={cn(
                                            'text-xs transition-colors duration-200',
                                            isActive
                                                ? 'text-primary font-medium'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </>
    );
}

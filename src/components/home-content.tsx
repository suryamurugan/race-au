'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { CircuitPattern } from '@/components/circuit-pattern';
import { GridOverlay } from '@/components/grid-overlay';

const HACKER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';

function generateRandomString(length: number) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += HACKER_CHARS[Math.floor(Math.random() * HACKER_CHARS.length)];
    }
    return result;
}

function HackerText({ text }: { text: string }) {
    const [displayText, setDisplayText] = useState('');
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        let iterations = 0;
        const maxIterations = 3;
        const interval = setInterval(() => {
            setDisplayText(generateRandomString(text.length));
            iterations++;
            if (iterations >= maxIterations) {
                clearInterval(interval);
                setDisplayText(text);
                setIsAnimating(false);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [text]);

    return (
        <span className={cn('font-mono', isAnimating && 'text-primary')}>
            {displayText}
        </span>
    );
}

export function HomeContent({ userName }: { userName?: string | null }) {
    return (
        <div className="relative min-h-screen">
            <CircuitPattern />
            <GridOverlay />

            <div className="relative z-10 container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <h1 className="font-mono text-4xl font-bold tracking-wider">
                            {'>'} <HackerText text="HELLO, FRIEND" />
                        </h1>
                        {userName && (
                            <p className="text-muted-foreground mt-2 font-mono text-lg">
                                {'>'} Welcome back, {userName}
                            </p>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Link
                            href="/challenges/9f8586c1-bdd4-4f1d-b112-6449de4c530d"
                            className="group bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-6 py-3 font-mono transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                            {'>'} ENTER CHALLENGE
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-muted-foreground mt-8 font-mono text-sm"
                    >
                        {'>'} Ready to test your skills?
                    </motion.p>
                </div>
            </div>
        </div>
    );
}

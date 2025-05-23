'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="hover:bg-primary/10 rounded-full p-2 transition-colors"
        >
            <AnimatedIcon isDark={theme === 'dark'} />
        </motion.button>
    );
}

function AnimatedIcon({ isDark }: { isDark: boolean }) {
    return (
        <div className="relative h-5 w-5">
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isDark ? 1 : 0, opacity: isDark ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
            >
                <Moon className="h-5 w-5" />
            </motion.div>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isDark ? 0 : 1, opacity: isDark ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
            >
                <Sun className="h-5 w-5" />
            </motion.div>
        </div>
    );
}

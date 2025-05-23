import { z } from 'zod';

/**
 * Server-side environment variables schema
 * Add all required server env vars here.
 */
const serverSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    DATABASE_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    RESEND_API_KEY: z.string().optional(),
    // Example:
    // NEXTAUTH_SECRET: z.string().min(1),
});

/**
 * Client-side environment variables schema
 * Add all required public env vars here (must start with NEXT_PUBLIC_)
 */
const clientSchema = z.object({
    NEXT_PUBLIC_APP_URL: z.string().url(),
    // Example:
    // NEXT_PUBLIC_API_URL: z.string().url(),
});

function getServerEnv() {
    // Log all environment variables
    const currentEnv = {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
    };

    const parsed = serverSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error('\nEnvironment Variables Status:');
        console.error('----------------------------');
        Object.entries(currentEnv).forEach(([key, value]) => {
            console.error(`${key}: ${value ? '✅ Present' : '❌ Missing'}`);
            if (value) {
                console.error(`  Value: ${value}`);
            }
        });
        console.error('\nValidation Errors:');
        console.error('------------------');
        console.error(parsed.error.flatten().fieldErrors);

        // Don't throw error during build time, just warn
        if (
            process.env.NODE_ENV === 'production' &&
            process.env.NEXT_PHASE !== 'phase-production-build'
        ) {
            throw new Error('Invalid server environment variables');
        }

        // Return partial data with defaults for build time
        return {
            NODE_ENV: process.env.NODE_ENV || 'development',
            DATABASE_URL: process.env.DATABASE_URL || '',
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
            GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
            RESEND_API_KEY: process.env.RESEND_API_KEY,
        };
    }
    return parsed.data;
}

function getClientEnv() {
    if (typeof window === 'undefined') {
        throw new Error('getClientEnv should only be called on the client');
    }
    const parsed = clientSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error(
            '❌ Invalid client environment variables:',
            parsed.error.flatten().fieldErrors,
        );
        throw new Error('Invalid client environment variables');
    }
    return parsed.data;
}

export const env = {
    ...getServerEnv(),
    ...(typeof window !== 'undefined' ? getClientEnv() : {}),
};

// Usage:
// import { env } from '@/lib/env';
// env.DATABASE_URL, env.NEXT_PUBLIC_API_URL, etc.

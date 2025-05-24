import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/server/db';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { sendEmail } from '@/lib/email';
import {
    createVerificationEmail,
    createResetPasswordEmail,
} from '@/lib/email-templates';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    database: drizzleAdapter(db, {
        provider: 'pg',
        usePlural: true,
    }),
    plugins: [
        nextCookies(),
        admin({
            defaultRole: 'user',
            impersonationSessionDuration: 60 * 60 * 24,
        }),
    ],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            redirectURI: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            const { subject, html } = createVerificationEmail(url);
            await sendEmail({ to: user.email, subject, html });
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        expiresIn: 3600,
    },
    emailAndPassword: {
        enabled: true,
        password: {
            hash: async (password: string): Promise<string> => {
                // Add the same secret pepper used in seeding
                const secret = 'race-cialabs-atria';
                const passwordWithSecret = `${password}${secret}`;

                // Use scrypt directly like Better Auth does
                const salt = randomBytes(32);
                const derivedKey = (await scryptAsync(
                    passwordWithSecret,
                    salt,
                    64,
                )) as Buffer;
                return salt.toString('hex') + ':' + derivedKey.toString('hex');
            },
            verify: async ({ password, hash }): Promise<boolean> => {
                // Add the same secret pepper for verification
                const secret = 'race-cialabs-atria';
                const passwordWithSecret = `${password}${secret}`;

                console.log('🔐 Password verification started');
                console.log('📝 Input password length:', password.length);
                console.log('🔑 Hash length:', hash.length);

                // Parse the stored hash
                const [saltHex, keyHex] = hash.split(':');
                const salt = Buffer.from(saltHex, 'hex');
                const storedKey = Buffer.from(keyHex, 'hex');

                console.log('🧂 Salt length:', salt.length);
                console.log('🔑 Stored key length:', storedKey.length);

                // Derive key from the provided password
                const derivedKey = (await scryptAsync(
                    passwordWithSecret,
                    salt,
                    64,
                )) as Buffer;

                console.log('🔑 Derived key length:', derivedKey.length);

                // Use timing-safe comparison
                const isValid = timingSafeEqual(storedKey, derivedKey);
                console.log('✅ Password verification result:', isValid);

                return isValid;
            },
        },
        // disableSignUp: false,
        // requireEmailVerification: false,
        // minPasswordLength: 8,
        // maxPasswordLength: 128,
        // autoSignIn: true,
        // sendResetPassword: async ({ user, url }) => {
        //     const { subject, html } = createResetPasswordEmail(url);
        //     await sendEmail({ to: user.email, subject, html });
        // },
        // resetPasswordTokenExpiresIn: 3600,
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
});

export async function getUserSession(headers?: Headers) {
    return auth.api.getSession({
        headers: headers ?? new Headers(),
    });
}

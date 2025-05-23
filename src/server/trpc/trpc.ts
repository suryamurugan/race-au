import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import superjson from 'superjson';
import { getUserSession } from '../auth/server';
import { challengeRouter } from './routers/challenge';

// Infer the Session type from the return type of getUserSession
export type Session = Awaited<ReturnType<typeof getUserSession>>;

// Context type that contains the user session if available
export interface Context {
    session?: Session | null;
}

export const createContext = async () => {
    const headersList = await headers();
    const session = await getUserSession(headersList);
    return { session };
};

// export type Context = ReturnType<typeof createContext>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

const isAuthenticated = t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }
    return next({
        ctx: {
            ...ctx,
            session: ctx.session,
        },
    });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);

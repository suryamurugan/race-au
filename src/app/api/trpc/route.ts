import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { challengeRouter } from '@/server/trpc/routers/challenge';
// Initialize tRPC with a JSON transformer
const t = initTRPC.context<{}>().create({
    transformer: superjson,
});
const router = t.router;
const publicProcedure = t.procedure;

// Root router with hello world route
const appRouter = router({
    hello: publicProcedure.query(() => 'Hello world'),
    challenge: challengeRouter,
});

// Export type definition of the API
export type AppRouter = typeof appRouter;

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: () => ({}),
    });

export { handler as GET, handler as POST };

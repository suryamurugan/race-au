import { appRouter } from '@/server/trpc/routers/_app';
import { createContext } from '@/server/trpc/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

// Next.js App Router handler
export async function GET(request: Request) {
    return fetchRequestHandler({
        endpoint: '/api/trpc',
        req: request,
        router: appRouter,
        createContext,
    });
}
export const POST = GET;

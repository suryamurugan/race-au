import { publicProcedure, router } from '../trpc';
import { challengeRouter } from './challenge';
import { userRouter } from './user';
import { taskRouter } from './task';
import { teamRouter } from './team';

// App router with example hello procedure
export const appRouter = router({
    user: userRouter,
    hello: publicProcedure.query(() => 'Hello world'),
    challenge: challengeRouter,
    task: taskRouter,
    team: teamRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

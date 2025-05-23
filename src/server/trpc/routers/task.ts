import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { taskService } from '@/lib/services/task';

export const taskRouter = router({
    submitAnswer: protectedProcedure
        .input(
            z.object({
                taskId: z.string(),
                teamId: z.string(),
                answer: z.union([z.string(), z.number()]),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const result = await taskService.submitAnswer({
                ...input,
                submittedBy: ctx.session.user.id,
            });

            return result;
        }),

    getSubmission: protectedProcedure
        .input(
            z.object({
                taskId: z.string(),
                teamId: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const submission = await taskService.getSubmission(input);
            return submission;
        }),

    getAllSubmissions: protectedProcedure
        .input(
            z.object({
                taskId: z.string(),
                teamId: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const submissions = await taskService.getAllSubmissions(input);
            return submissions;
        }),

    getAllModuleSubmissions: protectedProcedure
        .input(
            z.object({
                moduleId: z.string(),
                teamId: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const submissions =
                await taskService.getAllModuleSubmissions(input);
            return submissions;
        }),
});

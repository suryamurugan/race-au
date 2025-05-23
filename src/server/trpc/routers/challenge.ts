import { challengeService } from '@/lib/services/challenge';
import { protectedProcedure, router } from '../trpc';
import { z } from 'zod';

const createChallengeSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    startDate: z.date(),
    endDate: z.date(),
    isActive: z.boolean().default(true),
});

export const challengeRouter = router({
    create: protectedProcedure
        .input(createChallengeSchema)
        .mutation(async ({ input }) => {
            const challenge = await challengeService.create({
                id: crypto.randomUUID(),
                title: input.title,
                description: input.description,
                startDate: input.startDate,
                endDate: input.endDate,
                isActive: input.isActive,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            if (!challenge) {
                throw new Error('Failed to create challenge');
            }

            return challenge;
        }),

    list: protectedProcedure.query(async () => {
        return challengeService.list();
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const challenge = await challengeService.getById(input.id);
            if (!challenge) {
                throw new Error('Challenge not found');
            }
            return challenge;
        }),
});

export type ChallengeRouter = typeof challengeRouter;

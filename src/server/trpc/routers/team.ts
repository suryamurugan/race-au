import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { teamService } from '@/lib/services/team';

export const teamRouter = router({
    getTeamMembers: protectedProcedure
        .input(z.object({ teamId: z.string() }))
        .query(async ({ input }) => {
            const members = await teamService.getTeamMembers(input.teamId);
            return members;
        }),
});

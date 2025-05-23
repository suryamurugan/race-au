import { db } from '@/server/db';
import { teams } from '@/server/db/schema';
import { eq, InferSelectModel } from 'drizzle-orm';

export type Team = InferSelectModel<typeof teams>;

export const teamRepo = {
    async getByChallengeId(challengeId: string) {
        const result = await db
            .select()
            .from(teams)
            .where(eq(teams.challengeId, challengeId));
        return result;
    },
};

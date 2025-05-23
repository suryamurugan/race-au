import { db } from '@/server/db';
import { challenge } from '@/server/db/schema';
import { eq, InferSelectModel } from 'drizzle-orm';

export type Challenge = InferSelectModel<typeof challenge>;

export const challengeRepo = {
    async getById(id: string) {
        const result = await db
            .select()
            .from(challenge)
            .where(eq(challenge.id, id));
        return result[0];
    },

    async create(data: Challenge) {
        const result = await db.insert(challenge).values(data);
        return result;
    },

    async list() {
        const result = await db
            .select()
            .from(challenge)
            .orderBy(challenge.createdAt);
        return result;
    },
};

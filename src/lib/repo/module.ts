import { db } from '@/server/db';
import { modules } from '@/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

export type Module = InferSelectModel<typeof modules>;

export const moduleRepo = {
    async getById(id: string) {
        const result = await db
            .select()
            .from(modules)
            .where(eq(modules.id, id));
        return result[0];
    },

    async getByChallengeId(challengeId: string) {
        const result = await db
            .select()
            .from(modules)
            .where(eq(modules.challengeId, challengeId))
            .orderBy(modules.order);
        return result;
    },

    async getModuleCount(challengeId: string) {
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(modules)
            .where(eq(modules.challengeId, challengeId));
        return Number(result[0]?.count || 0);
    },

    async create(data: Module) {
        const result = await db.insert(modules).values(data);
        return result;
    },
};

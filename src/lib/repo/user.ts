import { eq, gt, InferSelectModel } from 'drizzle-orm';
import { subDays } from 'date-fns';
import { sql } from 'drizzle-orm';
import { db } from '@/server/db';
import { users } from '@/server/db/auth-schema';

// Define types based on schema
export type User = InferSelectModel<typeof users>;

export const userRepo = {
    async count(filters?: { role?: string }) {
        const query = filters?.role ? eq(users.role, filters.role) : undefined;

        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(query);

        return Number(result[0].count);
    },

    async countActive() {
        const thirtyDaysAgo = subDays(new Date(), 30);

        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(gt(users.updatedAt, thirtyDaysAgo));

        return Number(result[0].count);
    },
};

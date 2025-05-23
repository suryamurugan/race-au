import { protectedProcedure, router } from '../trpc';
import { db } from '@/server/db';
import { taskSubmissions, users } from '@/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const userRouter = router({
    profile: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        // Get user details
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Get completed tasks count
        const completedTasksResult = await db
            .select({
                count: sql<number>`count(*)`,
            })
            .from(taskSubmissions)
            .where(
                sql`${taskSubmissions.submittedBy} = ${userId} AND ${taskSubmissions.status} = 'correct'`,
            );

        // Get total points
        const pointsResult = await db
            .select({
                total: sql<number>`COALESCE(sum(${taskSubmissions.points}), 0)`,
            })
            .from(taskSubmissions)
            .where(
                sql`${taskSubmissions.submittedBy} = ${userId} AND ${taskSubmissions.status} = 'correct'`,
            );

        // Get recent activity
        const recentActivity = await db
            .select()
            .from(taskSubmissions)
            .where(eq(taskSubmissions.submittedBy, userId))
            .orderBy(taskSubmissions.submittedAt)
            .limit(5);

        return {
            ...user,
            completedTasks: Number(completedTasksResult[0]?.count || 0),
            totalPoints: Number(pointsResult[0]?.total || 0),
            recentActivity,
        };
    }),
});

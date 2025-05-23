import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { db } from '@/server/db';
import { taskSubmissions, teams, teamMembers, users } from '@/server/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export const leaderboardRouter = router({
    getData: publicProcedure
        .input(z.object({ challengeId: z.string().nullable() }))
        .query(async ({ input }) => {
            if (!input.challengeId) {
                return [];
            }

            const leaderboardData = await db
                .select({
                    teamId: teams.id,
                    teamName: teams.name,
                    totalPoints:
                        sql<number>`COALESCE(SUM(CASE WHEN ${taskSubmissions.status} = 'correct' THEN ${taskSubmissions.points} ELSE 0 END), 0)`.as(
                            'total_points',
                        ),
                    completedTasks:
                        sql<number>`COALESCE(COUNT(DISTINCT CASE WHEN ${taskSubmissions.status} = 'correct' THEN ${taskSubmissions.taskId} END), 0)`.as(
                            'completed_tasks',
                        ),
                    memberNames: sql<
                        string[]
                    >`COALESCE(ARRAY_AGG(DISTINCT ${users.name}), ARRAY[]::text[])`.as(
                        'member_names',
                    ),
                })
                .from(teams)
                .leftJoin(taskSubmissions, eq(teams.id, taskSubmissions.teamId))
                .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
                .leftJoin(users, eq(teamMembers.userId, users.id))
                .where(eq(teams.challengeId, input.challengeId))
                .groupBy(teams.id, teams.name)
                .orderBy(desc(sql`total_points`));

            return leaderboardData;
        }),
});

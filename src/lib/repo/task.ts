import { db } from '@/server/db';
import { taskSubmissions, tasks, users, modules } from '@/server/db/schema';
import {
    eq,
    and,
    InferSelectModel,
    desc,
    inArray,
    sum,
    sql,
} from 'drizzle-orm';

export type Task = InferSelectModel<typeof tasks>;
export type TaskSubmission = InferSelectModel<typeof taskSubmissions>;

export const taskRepo = {
    async getById(id: string) {
        console.log('Getting task by ID:', id);
        const result = await db.select().from(tasks).where(eq(tasks.id, id));
        console.log('Found task:', result[0]);
        return result[0];
    },

    async getByModuleId(moduleId: string) {
        const result = await db
            .select()
            .from(tasks)
            .where(eq(tasks.moduleId, moduleId))
            .orderBy(tasks.order);
        return result;
    },

    async create(data: Task) {
        const result = await db.insert(tasks).values(data).returning();
        return result[0];
    },

    async createSubmission(
        data: Omit<TaskSubmission, 'id' | 'submittedAt' | 'updatedAt'>,
    ) {
        console.log('Creating submission with data:', data);
        const result = await db
            .insert(taskSubmissions)
            .values(data)
            .returning();
        console.log('Created submission:', result[0]);
        return result[0];
    },

    async getSubmission({
        taskId,
        teamId,
    }: {
        taskId: string;
        teamId: string;
    }) {
        console.log('Getting submission for:', { taskId, teamId });
        const result = await db
            .select()
            .from(taskSubmissions)
            .where(
                and(
                    eq(taskSubmissions.taskId, taskId),
                    eq(taskSubmissions.teamId, teamId),
                ),
            )
            .orderBy(desc(taskSubmissions.submittedAt))
            .limit(1);
        console.log('Found submission:', result[0]);
        return result[0];
    },

    async getAllSubmissions({
        taskId,
        teamId,
    }: {
        taskId: string;
        teamId: string;
    }) {
        console.log('Getting all submissions for:', { taskId, teamId });
        const result = await db
            .select()
            .from(taskSubmissions)
            .where(
                and(
                    eq(taskSubmissions.taskId, taskId),
                    eq(taskSubmissions.teamId, teamId),
                ),
            )
            .orderBy(desc(taskSubmissions.submittedAt));
        console.log('Found submissions:', result);
        return result;
    },

    async getAllSubmissionsWithSubmitter({
        taskId,
        teamId,
    }: {
        taskId: string;
        teamId: string;
    }) {
        console.log('Getting all submissions with submitter for:', {
            taskId,
            teamId,
        });
        const result = await db
            .select({
                id: taskSubmissions.id,
                taskId: taskSubmissions.taskId,
                teamId: taskSubmissions.teamId,
                submittedBy: taskSubmissions.submittedBy,
                answer: taskSubmissions.answer,
                status: taskSubmissions.status,
                points: taskSubmissions.points,
                feedback: taskSubmissions.feedback,
                submittedAt: taskSubmissions.submittedAt,
                updatedAt: taskSubmissions.updatedAt,
                submitter: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    image: users.image,
                },
            })
            .from(taskSubmissions)
            .innerJoin(users, eq(taskSubmissions.submittedBy, users.id))
            .where(
                and(
                    eq(taskSubmissions.taskId, taskId),
                    eq(taskSubmissions.teamId, teamId),
                ),
            )
            .orderBy(desc(taskSubmissions.submittedAt));
        console.log('Found submissions:', result);
        return result;
    },

    async getAllModuleSubmissions({
        moduleId,
        teamId,
    }: {
        moduleId: string;
        teamId: string;
    }) {
        // First get all tasks for this module
        const moduleTasks = await db
            .select()
            .from(tasks)
            .where(eq(tasks.moduleId, moduleId));

        // Then get all submissions for these tasks
        const result = await db
            .select()
            .from(taskSubmissions)
            .where(
                and(
                    eq(taskSubmissions.teamId, teamId),
                    inArray(
                        taskSubmissions.taskId,
                        moduleTasks.map((t) => t.id),
                    ),
                ),
            )
            .orderBy(desc(taskSubmissions.submittedAt));

        return result;
    },

    async getTeamChallengeScore({
        challengeId,
        teamId,
    }: {
        challengeId: string;
        teamId: string;
    }) {
        // Get total points for a team in a specific challenge
        const result = await db
            .select({
                totalPoints:
                    sql<number>`COALESCE(SUM(CASE WHEN ${taskSubmissions.status} = 'correct' THEN ${taskSubmissions.points} ELSE 0 END), 0)`.as(
                        'total_points',
                    ),
                completedTasks:
                    sql<number>`COALESCE(COUNT(DISTINCT CASE WHEN ${taskSubmissions.status} = 'correct' THEN ${taskSubmissions.taskId} END), 0)`.as(
                        'completed_tasks',
                    ),
            })
            .from(taskSubmissions)
            .innerJoin(tasks, eq(taskSubmissions.taskId, tasks.id))
            .innerJoin(modules, eq(tasks.moduleId, modules.id))
            .where(
                and(
                    eq(taskSubmissions.teamId, teamId),
                    eq(modules.challengeId, challengeId),
                ),
            );

        return {
            totalPoints: Number(result[0]?.totalPoints || 0),
            completedTasks: Number(result[0]?.completedTasks || 0),
        };
    },
};

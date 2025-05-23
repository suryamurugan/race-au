import { db } from '@/server/db';
import { teamMembers, users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const teamService = {
    async getTeamMembers(teamId: string) {
        const members = await db
            .select({
                id: teamMembers.id,
                teamId: teamMembers.teamId,
                userId: teamMembers.userId,
                role: teamMembers.role,
                joinedAt: teamMembers.joinedAt,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    image: users.image,
                },
            })
            .from(teamMembers)
            .innerJoin(users, eq(teamMembers.userId, users.id))
            .where(eq(teamMembers.teamId, teamId));

        return members;
    },
};

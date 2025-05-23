import { db } from '@/server/db';
import { teamMembers, users, teams } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

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

    async getUserTeamForChallenge({
        challengeId,
        userId,
    }: {
        challengeId: string;
        userId: string;
    }) {
        // First find the team the user is part of for this challenge
        const result = await db
            .select({
                team: {
                    id: teams.id,
                    name: teams.name,
                    challengeId: teams.challengeId,
                    description: teams.description,
                    createdAt: teams.createdAt,
                    updatedAt: teams.updatedAt,
                },
            })
            .from(teams)
            .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
            .where(
                and(
                    eq(teams.challengeId, challengeId),
                    eq(teamMembers.userId, userId),
                ),
            )
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        const team = result[0].team;

        // Get all members of this team
        const members = await this.getTeamMembers(team.id);

        return {
            ...team,
            members,
        };
    },
};

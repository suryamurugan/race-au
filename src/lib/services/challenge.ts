import { Challenge, challengeRepo } from '../repo/challenge';
import { moduleService } from './module';
import { teamRepo } from '../repo/team';
import { teamService } from './team';

export const challengeService = {
    async getById(id: string) {
        const challenge = await challengeRepo.getById(id);
        if (!challenge) return null;

        // Get modules with tasks
        const modules = await moduleService.getByChallengeId(challenge.id);

        // Get teams for this challenge
        const challengeTeams = await teamRepo.getByChallengeId(challenge.id);

        // Get team members for each team
        const teamsWithMembers = await Promise.all(
            challengeTeams.map(async (team) => {
                const members = await teamService.getTeamMembers(team.id);
                return {
                    ...team,
                    members,
                };
            }),
        );

        return {
            ...challenge,
            modules,
            teams: teamsWithMembers,
        };
    },
    async create(data: Challenge) {
        const result = await challengeRepo.create(data);
        return result;
    },
    async list() {
        const challenges = await challengeRepo.list();

        // Get module count for each challenge
        const challengesWithModuleCount = await Promise.all(
            challenges.map(async (challenge) => {
                const moduleCount = await moduleService.getModuleCount(
                    challenge.id,
                );
                return {
                    ...challenge,
                    moduleCount,
                };
            }),
        );

        return challengesWithModuleCount;
    },
};

import { Module, moduleRepo } from '../repo/module';
import { taskService } from './task';

export const moduleService = {
    async getById(id: string) {
        const result = await moduleRepo.getById(id);
        return result;
    },

    async getByChallengeId(challengeId: string) {
        const modules = await moduleRepo.getByChallengeId(challengeId);

        // Get tasks for each module
        const modulesWithTasks = await Promise.all(
            modules.map(async (module) => {
                const tasks = await taskService.getByModuleId(module.id);
                return {
                    ...module,
                    tasks,
                };
            }),
        );

        return modulesWithTasks;
    },

    async getModuleCount(challengeId: string) {
        return moduleRepo.getModuleCount(challengeId);
    },

    async create(data: Module) {
        const result = await moduleRepo.create(data);
        return result;
    },
};

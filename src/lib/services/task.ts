import { Task, taskRepo } from '../repo/task';

export const taskService = {
    async getById(id: string) {
        const result = await taskRepo.getById(id);
        return result;
    },

    async getByModuleId(moduleId: string) {
        const result = await taskRepo.getByModuleId(moduleId);
        return result;
    },

    async create(data: Task) {
        const result = await taskRepo.create(data);
        return result;
    },

    async getSubmission({
        taskId,
        teamId,
    }: {
        taskId: string;
        teamId: string;
    }) {
        console.log('Getting submission for:', { taskId, teamId });
        const result = await taskRepo.getSubmission({ taskId, teamId });
        console.log('Found submission:', result);
        return result;
    },

    async getAllSubmissions({
        taskId,
        teamId,
    }: {
        taskId: string;
        teamId: string;
    }) {
        console.log('Getting all submissions for:', { taskId, teamId });
        const result = await taskRepo.getAllSubmissionsWithSubmitter({
            taskId,
            teamId,
        });
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
        const result = await taskRepo.getAllModuleSubmissions({
            moduleId,
            teamId,
        });
        console.log('Found module submissions:', result);
        return result;
    },

    async getTeamChallengeScore({
        challengeId,
        teamId,
    }: {
        challengeId: string;
        teamId: string;
    }) {
        const result = await taskRepo.getTeamChallengeScore({
            challengeId,
            teamId,
        });
        console.log('Found team challenge score:', result);
        return result;
    },

    async submitAnswer({
        taskId,
        teamId,
        submittedBy,
        answer,
    }: {
        taskId: string;
        teamId: string;
        submittedBy: string;
        answer: string | number;
    }) {
        console.log('Submitting answer:', {
            taskId,
            teamId,
            submittedBy,
            answer,
        });
        // Get the task to check the answer
        const task = await taskRepo.getById(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        // Convert answer to the correct format
        const formattedAnswer =
            task.answerType === 'multiple_choice'
                ? (task.options as string[])[answer as number]
                : answer;

        // Check if the answer is correct
        const isCorrect =
            task.answerType === 'multiple_choice'
                ? (task.correctAnswer as string[]).includes(
                      (task.options as string[])[answer as number],
                  )
                : (task.correctAnswer as string[]).some(
                      (correct) =>
                          correct.toLowerCase() ===
                          (answer as string).toLowerCase(),
                  );

        console.log('Answer validation:', {
            formattedAnswer,
            isCorrect,
            taskType: task.answerType,
            correctAnswer: task.correctAnswer,
        });

        // Create the submission
        const submission = await taskRepo.createSubmission({
            taskId,
            teamId,
            submittedBy,
            answer: formattedAnswer,
            status: isCorrect ? 'correct' : 'incorrect',
            points: isCorrect ? task.points : 0,
            feedback: null,
        });

        console.log('Created submission:', submission);

        return {
            submission,
            isCorrect,
        };
    },
};

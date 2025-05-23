import 'dotenv/config';
import { db, pool } from '@/server/db';
import { users, accounts } from '@/server/db/auth-schema';
import {
    challenge,
    modules,
    tasks,
    teams,
    teamMembers,
    taskSubmissions,
} from '@/server/db/schema';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

interface ChallengeWithModules {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    moduleIds: string[];
}

interface CreatedTask {
    id: string;
    moduleId: string;
    title: string;
    points: number;
    order: number;
    type: string;
    answerType: string;
    correctAnswer: unknown;
    options: unknown;
}

interface CreatedTeam {
    id: string;
    challengeId: string;
    name: string;
    memberIds: string[];
}

async function main() {
    console.log('🌱 Starting seeding...');

    // Create 20 users
    const createdUsers = [];
    const hashedPassword =
        '48b339c8914e9c1d32b52b5f853cfcee:bc924a17d1004dab0642ace48d4b455f99d828e1146d744ef6d3350580394ba945441596f7f58092d3665992e7813d683c58c01d93b6064883581dbc8192c639';

    for (let i = 0; i < 20; i++) {
        const userId = uuidv4();
        const user = {
            id: userId,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            emailVerified: true,
            role: i < 5 ? 'admin' : 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(users).values(user);

        // Create account with password for each user
        await db.insert(accounts).values({
            id: uuidv4(),
            userId: userId,
            accountId: userId,
            providerId: 'credential',
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        createdUsers.push(user);
    }

    // Create 10 challenges
    const createdChallenges: ChallengeWithModules[] = [];
    const allCreatedTasks: CreatedTask[] = [];

    for (let i = 0; i < 10; i++) {
        const challengeId = uuidv4();
        const challengeData = {
            id: challengeId,
            title: `Challenge ${i + 1}`,
            description: `Description for Challenge ${i + 1}`,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(challenge).values(challengeData);
        createdChallenges.push({ ...challengeData, moduleIds: [] });

        // Create 10 modules for each challenge
        for (let j = 0; j < 10; j++) {
            const moduleId = uuidv4();
            const moduleData = {
                id: moduleId,
                challengeId: challengeId,
                title: `Module ${j + 1} for Challenge ${i + 1}`,
                description: `Description for Module ${j + 1}`,
                order: j + 1,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await db.insert(modules).values(moduleData);
            createdChallenges[i].moduleIds.push(moduleId);

            // Create tasks for each module
            const sampleTasks = [
                {
                    title: 'List User-Defined Tables',
                    description: `
                        <div>
                            <h3>Task Description</h3>
                            <p>List the names of all user-defined tables in the database (excluding system tables like sqlite_master, sqlite_sequence), in alphabetical order, separated by a comma and a space.</p>
                            <div class="bg-muted/50 mt-6 rounded-md p-4">
                                <h4 class="text-base font-medium mb-2">Expected Format</h4>
                                <p>A comma-separated string (e.g., BuildingRooms, CourseSchedule, Courses, Departments, Enrollments, ProfessorResearchAreas, Professors, Prerequisites, ResearchGrants, Students).</p>
                            </div>
                        </div>
                    `,
                    points: 100,
                    type: 'sql',
                    answerType: 'opentext',
                    correctAnswer: [
                        'BuildingRooms, CourseSchedule, Courses, Departments, Enrollments, ProfessorResearchAreas, Professors, Prerequisites, ResearchGrants, Students',
                    ],
                    options: null,
                    metadata: {
                        hints: [
                            'Use the sqlite_master table to query table names',
                            'Remember to exclude system tables',
                            'Use ORDER BY for alphabetical sorting',
                        ],
                    },
                },
                {
                    title: 'Identify Column Data Type',
                    description: `
                        <div>
                            <h3>Task Description</h3>
                            <p>What is the declared data type of the grade column in the Enrollments table as returned by PRAGMA table_info?</p>
                            <div class="bg-muted/50 mt-6 rounded-md p-4">
                                <h4 class="text-base font-medium mb-2">Expected Format</h4>
                                <p>The data type string (e.g., TEXT).</p>
                            </div>
                        </div>
                    `,
                    points: 75,
                    type: 'sql',
                    answerType: 'multiple_choice',
                    correctAnswer: [1],
                    options: ['INTEGER', 'TEXT', 'REAL', 'NUMERIC'],
                    metadata: {
                        hints: [
                            'Use PRAGMA table_info(Enrollments)',
                            'Look for the grade column in the result',
                        ],
                    },
                },
                {
                    title: 'Count Departments',
                    description: `
                        <div>
                            <h3>Task Description</h3>
                            <p>How many departments are listed in the Departments table?</p>
                            <div class="bg-muted/50 mt-6 rounded-md p-4">
                                <h4 class="text-base font-medium mb-2">Expected Format</h4>
                                <p>A single integer (e.g., 7).</p>
                            </div>
                        </div>
                    `,
                    points: 50,
                    type: 'sql',
                    answerType: 'opentext',
                    correctAnswer: ['7'],
                    options: null,
                    metadata: {
                        hints: [
                            'Use COUNT(*)',
                            "Don't forget to query the Departments table",
                        ],
                    },
                },
            ];

            // Add sample tasks first
            for (let k = 0; k < sampleTasks.length; k++) {
                const task = sampleTasks[k];
                const taskId = uuidv4();
                const taskData = {
                    id: taskId,
                    moduleId: moduleId,
                    title: task.title,
                    description: task.description,
                    points: task.points,
                    order: k + 1,
                    type: task.type,
                    answerType: task.answerType,
                    correctAnswer: task.correctAnswer,
                    options: task.options,
                    metadata: task.metadata,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                await db.insert(tasks).values(taskData);
                allCreatedTasks.push({
                    id: taskId,
                    moduleId: moduleId,
                    title: task.title,
                    points: task.points,
                    order: k + 1,
                    type: task.type,
                    answerType: task.answerType,
                    correctAnswer: task.correctAnswer,
                    options: task.options,
                });
            }

            // Fill remaining tasks with generic ones
            for (let k = sampleTasks.length; k < 10; k++) {
                const taskId = uuidv4();
                const isMultipleChoice = k % 2 === 0;
                const taskData = {
                    id: taskId,
                    moduleId: moduleId,
                    title: `Task ${k + 1} for Module ${j + 1}`,
                    description: `
                        <div>
                            <h3>Task Description</h3>
                            <p>This is a generic task ${k + 1} for module ${j + 1}. Please complete the required objectives and submit your answer in the appropriate format.</p>
                            <div class="bg-muted/50 mt-6 rounded-md p-4">
                                <h4 class="text-base font-medium mb-2">Expected Format</h4>
                                <p>Please provide your answer in the format specified by the task requirements.</p>
                            </div>
                        </div>
                    `,
                    points: Math.floor(Math.random() * 100) + 50,
                    order: k + 1,
                    type: ['quiz', 'ctf', 'coding'][
                        Math.floor(Math.random() * 3)
                    ],
                    answerType: isMultipleChoice
                        ? 'multiple_choice'
                        : 'opentext',
                    correctAnswer: isMultipleChoice ? [0] : ['sample_answer'],
                    options: isMultipleChoice
                        ? ['Option A', 'Option B', 'Option C', 'Option D']
                        : null,
                    metadata: {
                        hints: ['Hint 1', 'Hint 2'],
                    },
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                await db.insert(tasks).values(taskData);
                allCreatedTasks.push({
                    id: taskId,
                    moduleId: moduleId,
                    title: taskData.title,
                    points: taskData.points,
                    order: k + 1,
                    type: taskData.type,
                    answerType: taskData.answerType,
                    correctAnswer: taskData.correctAnswer,
                    options: taskData.options,
                });
            }
        }
    }

    // Create 10 teams
    const createdTeams: CreatedTeam[] = [];
    for (let i = 0; i < 10; i++) {
        const teamId = uuidv4();
        await db.insert(teams).values({
            id: teamId,
            challengeId: createdChallenges[i].id,
            name: `Team ${i + 1}`,
            description: `Description for Team ${i + 1}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Assign 2 random users to each team
        const teamUserIndices = new Set<number>();
        while (teamUserIndices.size < 2) {
            teamUserIndices.add(
                Math.floor(Math.random() * createdUsers.length),
            );
        }

        const teamUserArray = Array.from(teamUserIndices);
        const memberIds: string[] = [];

        for (let j = 0; j < teamUserArray.length; j++) {
            const userId = createdUsers[teamUserArray[j]].id;
            await db.insert(teamMembers).values({
                id: uuidv4(),
                teamId: teamId,
                userId: userId,
                role: j === 0 ? 'leader' : 'member',
                joinedAt: new Date(),
            });
            memberIds.push(userId);
        }

        createdTeams.push({
            id: teamId,
            challengeId: createdChallenges[i].id,
            name: `Team ${i + 1}`,
            memberIds: memberIds,
        });
    }

    // Create realistic task submissions for teams
    console.log('🔄 Creating task submissions...');

    for (const team of createdTeams) {
        // Get tasks for this team's challenge
        const challengeModuleIds =
            createdChallenges.find((c) => c.id === team.challengeId)
                ?.moduleIds || [];
        const teamTasks = allCreatedTasks.filter((task) =>
            challengeModuleIds.includes(task.moduleId),
        );

        // Sort tasks by module and order to simulate progressive completion
        const sortedTasks = teamTasks.sort((a, b) => {
            const moduleComparison =
                challengeModuleIds.indexOf(a.moduleId) -
                challengeModuleIds.indexOf(b.moduleId);
            if (moduleComparison !== 0) return moduleComparison;
            return a.order - b.order;
        });

        // Simulate different team performance levels
        const teamPerformance = 0.3 + Math.random() * 0.6; // 30% to 90% completion rate
        const tasksToComplete = Math.floor(
            sortedTasks.length * teamPerformance,
        );

        for (let i = 0; i < tasksToComplete; i++) {
            const task = sortedTasks[i];
            const submitter =
                team.memberIds[
                    Math.floor(Math.random() * team.memberIds.length)
                ];

            // Create 1-3 submissions per completed task (showing progression/attempts)
            const submissionCount = Math.floor(Math.random() * 3) + 1;

            for (let attempt = 0; attempt < submissionCount; attempt++) {
                const isLastAttempt = attempt === submissionCount - 1;
                const isCorrect = isLastAttempt && Math.random() > 0.2; // 80% chance final attempt is correct

                let answer: unknown;
                let status: string;
                let points: number | null;

                if (task.answerType === 'multiple_choice') {
                    if (isCorrect && Array.isArray(task.correctAnswer)) {
                        answer = task.correctAnswer[0]; // Use the correct answer
                    } else {
                        // Random wrong answer
                        const options = task.options as string[];
                        answer = Math.floor(Math.random() * options.length);
                    }
                } else {
                    if (isCorrect && Array.isArray(task.correctAnswer)) {
                        answer = task.correctAnswer[0]; // Use the correct answer
                    } else {
                        answer = `wrong_answer_attempt_${attempt + 1}`;
                    }
                }

                status = isCorrect ? 'correct' : 'incorrect';
                points = isCorrect ? task.points : 0;

                // Add some time progression between attempts
                const baseTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
                const attemptTime = new Date(
                    baseTime.getTime() +
                        i * 60 * 60 * 1000 +
                        attempt * 10 * 60 * 1000,
                ); // Space out attempts

                await db.insert(taskSubmissions).values({
                    id: uuidv4(),
                    taskId: task.id,
                    teamId: team.id,
                    submittedBy: submitter,
                    answer: answer,
                    status: status,
                    points: points,
                    feedback: null,
                    submittedAt: attemptTime,
                    updatedAt: attemptTime,
                });
            }
        }
    }

    console.log('✅ Seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${createdUsers.length} users`);
    console.log(`   - ${createdChallenges.length} challenges`);
    console.log(`   - ${createdChallenges.length * 10} modules`);
    console.log(`   - ${allCreatedTasks.length} tasks`);
    console.log(`   - ${createdTeams.length} teams`);
    console.log(`   - Task submissions for realistic leaderboard data`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
        process.exit(0);
    });

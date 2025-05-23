import { db } from '@/server/db';
import { challenge, taskSubmissions, teams } from '@/server/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { SelectChallenge } from './select-challenge';
import { Trophy, Users, Star, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CircuitPattern } from '@/components/circuit-pattern';
import { GridOverlay } from '@/components/grid-overlay';

async function getLeaderboardData(challengeId: string | null) {
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
        })
        .from(teams)
        .leftJoin(taskSubmissions, eq(teams.id, taskSubmissions.teamId))
        .where(challengeId ? eq(teams.challengeId, challengeId) : undefined)
        .groupBy(teams.id, teams.name)
        .orderBy(desc(sql`total_points`));

    return leaderboardData;
}

async function getChallenges() {
    return db
        .select({
            id: challenge.id,
            title: challenge.title,
        })
        .from(challenge)
        .where(eq(challenge.isActive, true));
}

export default async function LeaderboardPage({
    searchParams,
}: {
    searchParams: { challenge?: string };
}) {
    const challenges = await getChallenges();
    // const selectedChallengeId = searchParams.challenge || null;
    const selectedChallengeId = (await searchParams).challenge || null;
    const leaderboardData = await getLeaderboardData(selectedChallengeId);

    return (
        <div className="relative min-h-screen">
            <CircuitPattern />
            <GridOverlay />

            <div className="relative z-10 container mx-auto px-4 py-8">
                <div className="absolute top-4 right-4 w-[300px]">
                    <SelectChallenge
                        challenges={challenges}
                        selectedValue={selectedChallengeId}
                    />
                </div>

                <h1 className="mb-8 font-mono text-3xl font-bold tracking-wider">
                    {'>'} CHALLENGE LEADERBOARD
                </h1>

                {selectedChallengeId ? (
                    /* Leaderboard Table */
                    <div className="border-primary/20 bg-background/95 overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm">
                        <table className="divide-primary/20 min-w-full divide-y">
                            <thead className="bg-primary/5">
                                <tr>
                                    <th className="text-primary px-6 py-3 text-left font-mono text-xs tracking-wider uppercase">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="h-4 w-4" />
                                            {'>'} RANK
                                        </div>
                                    </th>
                                    <th className="text-primary px-6 py-3 text-left font-mono text-xs tracking-wider uppercase">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            {'>'} TEAM
                                        </div>
                                    </th>
                                    <th className="text-primary px-6 py-3 text-left font-mono text-xs tracking-wider uppercase">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4" />
                                            {'>'} POINTS
                                        </div>
                                    </th>
                                    <th className="text-primary px-6 py-3 text-left font-mono text-xs tracking-wider uppercase">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            {'>'} TASKS
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-primary/20 divide-y">
                                {leaderboardData.map((team, index) => (
                                    <tr
                                        key={team.teamId}
                                        className={cn(
                                            'transition-colors duration-200',
                                            index % 2 === 0
                                                ? 'bg-background'
                                                : 'bg-primary/5',
                                        )}
                                    >
                                        <td className="text-foreground px-6 py-4 font-mono text-sm whitespace-nowrap">
                                            {index + 1}
                                        </td>
                                        <td className="text-foreground px-6 py-4 font-mono text-sm whitespace-nowrap">
                                            {'>'} {team.teamName}
                                        </td>
                                        <td className="text-foreground px-6 py-4 font-mono text-sm whitespace-nowrap">
                                            {team.totalPoints || 0}
                                        </td>
                                        <td className="text-foreground px-6 py-4 font-mono text-sm whitespace-nowrap">
                                            {team.completedTasks || 0}
                                        </td>
                                    </tr>
                                ))}
                                {leaderboardData.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-muted-foreground px-6 py-4 text-center font-mono"
                                        >
                                            {'>'} NO TEAMS FOUND FOR THIS
                                            CHALLENGE
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-background/95 border-primary/20 flex flex-col items-center justify-center rounded-lg border p-12 text-center shadow-lg backdrop-blur-sm">
                        <TrendingUp className="text-primary mb-4 h-16 w-16 animate-pulse" />
                        <p className="text-foreground font-mono text-xl tracking-wider">
                            {'>'} READY TO SEE WHO'S LEADING THE PACK?
                        </p>
                        <p className="text-muted-foreground mt-2 font-mono text-lg tracking-wider">
                            {'>'} SELECT A CHALLENGE TO VIEW THE LEADERBOARD
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

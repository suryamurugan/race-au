'use client';

import { api } from '@/trpc/react';
import { SelectChallenge } from './select-challenge';
import { Trophy, Users, Star, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CircuitPattern } from '@/components/circuit-pattern';
import { GridOverlay } from '@/components/grid-overlay';
import { useLeaderboardEffects } from '@/lib/hooks/useLeaderboardEffects';
import { useSearchParams } from 'next/navigation';
// Import test functions to make them available globally
import '@/lib/test-confetti';

interface LeaderboardEntry {
    teamId: string;
    teamName: string;
    totalPoints: number;
    completedTasks: number;
}

interface Challenge {
    id: string;
    title: string;
}

export default function LeaderboardPage() {
    const searchParams = useSearchParams();
    const selectedChallengeId = searchParams.get('challenge') || null;

    const { data: challenges = [], isLoading: challengesLoading } =
        api.challenge.list.useQuery();

    const { data: leaderboardData = [], isLoading: leaderboardLoading } =
        api.leaderboard.getData.useQuery(
            { challengeId: selectedChallengeId },
            {
                enabled: !!selectedChallengeId,
                refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
                refetchOnWindowFocus: true,
            },
        );

    // Use the confetti effects hook
    useLeaderboardEffects(leaderboardData);

    const isLoading = challengesLoading || leaderboardLoading;

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
                    <div className="border-primary/20 bg-background/95 overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                <span className="ml-2 font-mono">
                                    Loading leaderboard...
                                </span>
                            </div>
                        ) : (
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
                                    {leaderboardData.map(
                                        (
                                            team: LeaderboardEntry,
                                            index: number,
                                        ) => (
                                            <tr
                                                key={team.teamId}
                                                className={cn(
                                                    'transform transition-all duration-500 ease-in-out',
                                                    'hover:scale-[1.01] hover:shadow-md',
                                                    index % 2 === 0
                                                        ? 'bg-background'
                                                        : 'bg-primary/5',
                                                    // Special styling for top 3
                                                    index === 0 &&
                                                        'border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-transparent',
                                                    index === 1 &&
                                                        'border-l-4 border-gray-400 bg-gradient-to-r from-gray-400/10 to-transparent',
                                                    index === 2 &&
                                                        'border-l-4 border-orange-600 bg-gradient-to-r from-orange-600/10 to-transparent',
                                                )}
                                            >
                                                <td className="text-foreground px-6 py-4 font-mono text-sm whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={cn(
                                                                'flex h-8 w-8 items-center justify-center rounded-full font-bold',
                                                                index === 0 &&
                                                                    'bg-yellow-500 text-yellow-900',
                                                                index === 1 &&
                                                                    'bg-gray-400 text-gray-900',
                                                                index === 2 &&
                                                                    'bg-orange-600 text-orange-100',
                                                                index > 2 &&
                                                                    'bg-primary/20 text-primary',
                                                            )}
                                                        >
                                                            {index + 1}
                                                        </span>
                                                        {index === 0 && (
                                                            <Trophy className="h-4 w-4 text-yellow-500" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-foreground px-6 py-4 font-mono text-sm whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">
                                                            {'>'}{' '}
                                                            {team.teamName}
                                                        </span>
                                                        {index <= 2 && (
                                                            <span className="bg-primary/20 text-primary animate-pulse rounded-full px-2 py-1 text-xs">
                                                                TOP {index + 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-foreground px-6 py-4 font-mono text-sm whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold">
                                                            {team.totalPoints ||
                                                                0}
                                                        </span>
                                                        <Star className="h-4 w-4 text-yellow-500" />
                                                    </div>
                                                </td>
                                                <td className="text-foreground px-6 py-4 font-mono text-sm whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {team.completedTasks ||
                                                                0}
                                                        </span>
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                    {leaderboardData.length === 0 &&
                                        !isLoading && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="text-muted-foreground px-6 py-8 text-center font-mono"
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Trophy className="h-12 w-12 opacity-50" />
                                                        <span>
                                                            {'>'} NO TEAMS FOUND
                                                            FOR THIS CHALLENGE
                                                        </span>
                                                        <span className="text-xs">
                                                            Teams will appear
                                                            here once they start
                                                            solving tasks!
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    <div className="bg-background/95 border-primary/20 flex flex-col items-center justify-center rounded-lg border p-12 text-center shadow-lg backdrop-blur-sm">
                        <TrendingUp className="text-primary mb-4 h-16 w-16 animate-bounce" />
                        <p className="text-foreground font-mono text-xl tracking-wider">
                            {'>'} READY TO SEE WHO'S LEADING THE PACK?
                        </p>
                        <p className="text-muted-foreground mt-2 font-mono text-lg tracking-wider">
                            {'>'} SELECT A CHALLENGE TO VIEW THE LEADERBOARD
                        </p>
                    </div>
                )}

                {selectedChallengeId && (
                    <div className="mt-4 text-center">
                        <p className="text-muted-foreground font-mono text-xs">
                            {'>'} Live updates every 10 seconds • Last updated:{' '}
                            {new Date().toLocaleTimeString()}
                        </p>
                        <p className="text-muted-foreground mt-1 font-mono text-xs">
                            {'>'} Open console and try:{' '}
                            <code>testConfetti.rankUp()</code>,{' '}
                            <code>testConfetti.points()</code>,{' '}
                            <code>testConfetti.newTeam()</code>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

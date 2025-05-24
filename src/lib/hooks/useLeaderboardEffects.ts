'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface LeaderboardEntry {
    teamId: string;
    teamName: string;
    totalPoints: number;
    completedTasks: number;
}

// Base confetti configuration with shorter duration
const baseConfettiConfig = {
    disableForReducedMotion: true,
    gravity: 0.8,
    decay: 0.91,
    scalar: 0.8,
    ticks: 150, // Reduces duration (default is 200)
};

export function useLeaderboardEffects(data: LeaderboardEntry[]) {
    const previousDataRef = useRef<LeaderboardEntry[]>([]);
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip effects on first render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            previousDataRef.current = data;
            return;
        }

        const previousData = previousDataRef.current;

        if (previousData.length === 0) {
            previousDataRef.current = data;
            return;
        }

        // Create maps for easy lookup
        const previousMap = new Map(
            previousData.map((team, index) => [
                team.teamId,
                { ...team, rank: index + 1 },
            ]),
        );
        const currentMap = new Map(
            data.map((team, index) => [
                team.teamId,
                { ...team, rank: index + 1 },
            ]),
        );

        // Check for changes
        let hasSignificantChanges = false;
        const teamChanges: Array<{
            teamName: string;
            type: 'rankUp' | 'rankDown' | 'pointsIncrease' | 'newTeam';
            oldRank?: number;
            newRank?: number;
            pointsDiff?: number;
        }> = [];

        // Check each current team
        data.forEach((currentTeam, currentIndex) => {
            const currentRank = currentIndex + 1;
            const previousTeam = previousMap.get(currentTeam.teamId);

            if (!previousTeam) {
                // New team appeared
                teamChanges.push({
                    teamName: currentTeam.teamName,
                    type: 'newTeam',
                    newRank: currentRank,
                });
                hasSignificantChanges = true;
            } else {
                const oldRank = previousTeam.rank;
                const pointsDiff =
                    currentTeam.totalPoints - previousTeam.totalPoints;

                // Check for rank changes
                if (currentRank < oldRank) {
                    // Rank improved (lower number = better rank)
                    teamChanges.push({
                        teamName: currentTeam.teamName,
                        type: 'rankUp',
                        oldRank,
                        newRank: currentRank,
                        pointsDiff,
                    });
                    hasSignificantChanges = true;
                } else if (currentRank > oldRank) {
                    // Rank dropped
                    teamChanges.push({
                        teamName: currentTeam.teamName,
                        type: 'rankDown',
                        oldRank,
                        newRank: currentRank,
                        pointsDiff,
                    });
                    hasSignificantChanges = true;
                } else if (pointsDiff > 0) {
                    // Points increased but same rank
                    teamChanges.push({
                        teamName: currentTeam.teamName,
                        type: 'pointsIncrease',
                        pointsDiff,
                    });
                    hasSignificantChanges = true;
                }
            }
        });

        // Trigger effects based on changes
        if (hasSignificantChanges) {
            triggerLeaderboardEffects(teamChanges);
        }

        // Update the reference
        previousDataRef.current = data;
    }, [data]);
}

function triggerLeaderboardEffects(
    changes: Array<{
        teamName: string;
        type: 'rankUp' | 'rankDown' | 'pointsIncrease' | 'newTeam';
        oldRank?: number;
        newRank?: number;
        pointsDiff?: number;
    }>,
) {
    changes.forEach((change, index) => {
        // Delay each effect slightly for multiple changes
        setTimeout(() => {
            switch (change.type) {
                case 'rankUp':
                    triggerRankUpConfetti(
                        change.teamName,
                        change.oldRank!,
                        change.newRank!,
                    );
                    break;
                case 'newTeam':
                    triggerNewTeamConfetti(change.teamName);
                    break;
                case 'pointsIncrease':
                    triggerPointsConfetti(change.teamName, change.pointsDiff!);
                    break;
                case 'rankDown':
                    // Less celebratory effect for rank drops
                    triggerMinorEffect();
                    break;
            }
        }, index * 300); // Stagger effects by 300ms
    });
}

function triggerRankUpConfetti(
    teamName: string,
    oldRank: number,
    newRank: number,
) {
    // Big celebration for moving up in rank - from both sides
    const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'];

    // Left side confetti
    confetti({
        ...baseConfettiConfig,
        particleCount: 30,
        spread: 60,
        angle: 60,
        origin: { x: 0, y: 0.3 }, // From left side, upper area
        colors: colors,
        ticks: 120,
    });

    // Right side confetti
    confetti({
        ...baseConfettiConfig,
        particleCount: 30,
        spread: 60,
        angle: 120,
        origin: { x: 1, y: 0.3 }, // From right side, upper area
        colors: colors,
        ticks: 120,
    });

    // Additional celebration for top 3 positions - from top corners
    if (newRank <= 3) {
        setTimeout(() => {
            // Top left corner
            confetti({
                ...baseConfettiConfig,
                particleCount: 20,
                angle: 45,
                spread: 45,
                origin: { x: 0, y: 0 }, // Top left corner
                colors: ['#FFD700', '#C0C0C0', '#CD7F32'],
                ticks: 100,
            });
            // Top right corner
            confetti({
                ...baseConfettiConfig,
                particleCount: 20,
                angle: 135,
                spread: 45,
                origin: { x: 1, y: 0 }, // Top right corner
                colors: ['#FFD700', '#C0C0C0', '#CD7F32'],
                ticks: 100,
            });
        }, 200);
    }

    console.log(
        `🎉 ${teamName} moved up from rank ${oldRank} to rank ${newRank}!`,
    );
}

function triggerNewTeamConfetti(teamName: string) {
    // Welcome celebration for new teams - from sides
    // Left side
    confetti({
        ...baseConfettiConfig,
        particleCount: 25,
        spread: 55,
        angle: 70,
        origin: { x: 0, y: 0.4 }, // From left side
        colors: ['#00FF00', '#00CED1', '#32CD32', '#98FB98'],
        ticks: 120,
    });

    // Right side
    confetti({
        ...baseConfettiConfig,
        particleCount: 25,
        spread: 55,
        angle: 110,
        origin: { x: 1, y: 0.4 }, // From right side
        colors: ['#00FF00', '#00CED1', '#32CD32', '#98FB98'],
        ticks: 120,
    });

    console.log(`🎊 Welcome ${teamName} to the leaderboard!`);
}

function triggerPointsConfetti(teamName: string, pointsDiff: number) {
    // Smaller celebration for points increase - from one random side
    const fromLeft = Math.random() > 0.5;

    confetti({
        ...baseConfettiConfig,
        particleCount: 20,
        spread: 50,
        angle: fromLeft ? 60 : 120,
        origin: {
            x: fromLeft ? 0 : 1,
            y: 0.5,
        },
        colors: ['#FFD700', '#FFA500'],
        ticks: 100,
    });

    console.log(`⭐ ${teamName} earned ${pointsDiff} more points!`);
}

function triggerMinorEffect() {
    // Subtle effect for less positive changes - small burst from random side
    const fromLeft = Math.random() > 0.5;

    confetti({
        ...baseConfettiConfig,
        particleCount: 8,
        spread: 30,
        angle: fromLeft ? 60 : 120,
        origin: {
            x: fromLeft ? 0 : 1,
            y: 0.6,
        },
        colors: ['#87CEEB'],
        ticks: 80,
    });
}

// Test script to manually trigger confetti effects
// Can be called from browser console for testing

import confetti from 'canvas-confetti';

// Base confetti configuration with shorter duration
const baseConfettiConfig = {
    disableForReducedMotion: true,
    gravity: 0.8,
    decay: 0.91,
    scalar: 0.8,
    ticks: 150, // Reduces duration (default is 200)
};

export function testRankUpConfetti() {
    console.log('🎉 Testing rank up confetti!');

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

export function testNewTeamConfetti() {
    console.log('🎊 Testing new team confetti!');

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
}

export function testPointsConfetti() {
    console.log('⭐ Testing points increase confetti!');

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
}

interface WindowWithTestConfetti extends Window {
    testConfetti?: {
        rankUp: () => void;
        newTeam: () => void;
        points: () => void;
    };
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
    (window as WindowWithTestConfetti).testConfetti = {
        rankUp: testRankUpConfetti,
        newTeam: testNewTeamConfetti,
        points: testPointsConfetti,
    };
}

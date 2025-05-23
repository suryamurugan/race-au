// Test script to manually trigger confetti effects
// Can be called from browser console for testing

import confetti from 'canvas-confetti';

export function testRankUpConfetti() {
    console.log('🎉 Testing rank up confetti!');

    // Big celebration for moving up in rank
    const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'];

    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
    });

    // Additional burst for top 3 positions
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFD700', '#C0C0C0', '#CD7F32'], // Gold, Silver, Bronze
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FFD700', '#C0C0C0', '#CD7F32'],
        });
    }, 200);
}

export function testNewTeamConfetti() {
    console.log('🎊 Testing new team confetti!');

    confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00FF00', '#00CED1', '#32CD32', '#98FB98'],
    });
}

export function testPointsConfetti() {
    console.log('⭐ Testing points increase confetti!');

    confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#FFD700', '#FFA500'],
    });
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
    (window as any).testConfetti = {
        rankUp: testRankUpConfetti,
        newTeam: testNewTeamConfetti,
        points: testPointsConfetti,
    };
}

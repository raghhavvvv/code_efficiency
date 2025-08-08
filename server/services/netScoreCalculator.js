// server/services/netScoreCalculator.js
const { PrismaClient } = require('@prisma/client');
const KeystrokeAnalyzer = require('./keystrokeAnalyzer');
const FocusAnalyzer = require('./focusAnalyzer');
// Import other analyzers as you create them

const prisma = new PrismaClient();

const WEIGHTS = {
    keystroke: 0.25, // Increased weight now that it's more accurate
    focus: 0.30,     // Focus is a key indicator of efficiency
    idle: 0.10,
    error: 0.25,
    paste: 0.10,
};

class NETScoreCalculator {
    static async calculateForSession(sessionId) {
        // Fetch the session and all its related metrics
        const session = await prisma.codingSession.findUnique({
            where: { id: sessionId },
            include: {
                keystrokeMetrics: true,
                focusMetrics: true,
                idleMetrics: true,
                pasteEvents: true,
                // errorMetrics, taskMetrics...
            },
        });

        if (!session || !session.endTime) {
            console.error(`Session ${sessionId} not found or not completed.`);
            return { netScore: 0 };
        }

        const sessionDurationInSeconds = (session.endTime.getTime() - session.startTime.getTime()) / 1000;

        // --- Calculate individual scores using Analyzers ---
        
        const keystrokeScore = KeystrokeAnalyzer.calculateEfficiency(session.keystrokeMetrics, sessionDurationInSeconds);
        await prisma.keystrokeMetrics.update({ where: { sessionId }, data: { efficiencyScore: keystrokeScore } });
        
        const focusScore = FocusAnalyzer.calculateEfficiency(session.focusMetrics, sessionDurationInSeconds);
        if(session.focusMetrics) { // Only update if focusMetrics exist
            await prisma.focusMetrics.update({ where: { sessionId }, data: { efficiencyScore: focusScore } });
        }

        // --- Placeholder scores for metrics not yet implemented ---
        const idleScore = 50; // Placeholder
        const errorScore = 50; // Placeholder
        
        // Simple Paste Score Calculation
        const pasteScore = Math.max(0, 100 - (session.pasteEvents.length * 20)); // -20 pts per paste

        // --- Calculate final weighted NET Score ---
        
        const weightedScore =
            (keystrokeScore * WEIGHTS.keystroke) +
            (focusScore * WEIGHTS.focus) +
            (idleScore * WEIGHTS.idle) +
            (errorScore * WEIGHTS.error) +
            (pasteScore * WEIGHTS.paste);
            
        const totalWeight = Object.values(WEIGHTS).reduce((sum, weight) => sum + weight, 0);

        const finalNetScore = Math.round(weightedScore / totalWeight);

        // Update the session and user's overall score
        await prisma.codingSession.update({
            where: { id: sessionId },
            data: { netScore: finalNetScore },
        });

        await this.updateUserNetScore(session.userId);

        console.log(`[Session ${sessionId}] Final NET Score: ${finalNetScore}`);
        return { netScore: finalNetScore };
    }

    static async updateUserNetScore(userId) {
        // ... (this function remains the same as before) ...
    }
}

module.exports = NETScoreCalculator;
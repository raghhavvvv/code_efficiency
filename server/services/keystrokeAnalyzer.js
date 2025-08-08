// server/services/keystrokeAnalyzer.js

// Constants
const TARGET_WPM = 50; // Target words per minute (assuming avg 5 chars/word)
const TARGET_KPM = TARGET_WPM * 5; // Target keystrokes per minute

class KeystrokeAnalyzer {
    static calculateEfficiency(metrics, sessionDurationInSeconds) {
        if (!metrics || !sessionDurationInSeconds || sessionDurationInSeconds < 1) {
            return 50; // Default score if no data
        }

        const { keystrokeCount, backspaceCount } = metrics;
        const sessionDurationInMinutes = sessionDurationInSeconds / 60;

        // 1. Typing Speed Factor (0-40 points)
        // Calculated as a ratio of user's KPM to the target KPM.
        const userKPM = keystrokeCount / sessionDurationInMinutes;
        const speedRatio = Math.min(1, userKPM / TARGET_KPM); // Cap at 100% of target
        const speedFactor = speedRatio * 40;

        // 2. Backspace Ratio Factor (0-30 points)
        // Penalizes for excessive error correction. A ratio > 30% gets 0 points.
        const backspaceRatio = keystrokeCount > 0 ? backspaceCount / keystrokeCount : 0;
        const backspacePenalty = Math.min(1, backspaceRatio / 0.3) * 30; // Scale penalty up to 30% ratio
        const backspaceFactor = 30 - backspacePenalty;
        
        // 3. Typing Consistency Factor (0-30 points) - Placeholder
        // A real implementation would analyze timestamps in keystrokeLog for rhythm.
        // For now, we'll give a default score that rewards lower backspace ratios.
        const consistencyFactor = 30 * (1 - Math.min(1, backspaceRatio / 0.5));
        
        const totalScore = speedFactor + backspaceFactor + consistencyFactor;
        return Math.max(0, Math.min(100, Math.round(totalScore))); // Clamp score between 0 and 100
    }
}

module.exports = KeystrokeAnalyzer;
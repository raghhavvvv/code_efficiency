// server/services/focusAnalyzer.js

class FocusAnalyzer {
    static calculateEfficiency(metrics, sessionDurationInSeconds) {
        if (!metrics || !sessionDurationInSeconds || sessionDurationInSeconds < 1) {
            return 50; // Default score
        }

        const { totalFocusTime, contextSwitches } = metrics;
        const totalFocusTimeInSeconds = totalFocusTime / 1000;

        // 1. Focus Percentage (0-60 points)
        // Percentage of the session spent with the editor in focus.
        const focusPercentage = totalFocusTimeInSeconds / sessionDurationInSeconds;
        const focusFactor = focusPercentage * 60;

        // 2. Context Switching Penalty (0-40 points)
        // Penalize frequent context switches. More than 1 switch per minute is heavily penalized.
        const sessionDurationInMinutes = sessionDurationInSeconds / 60;
        const switchesPerMinute = contextSwitches / sessionDurationInMinutes;
        const switchPenalty = Math.min(1, switchesPerMinute / 2) * 40; // Scale penalty up to 2 switches/min
        const contextSwitchFactor = 40 - switchPenalty;

        const totalScore = focusFactor + contextSwitchFactor;
        return Math.max(0, Math.min(100, Math.round(totalScore)));
    }
}

module.exports = FocusAnalyzer;
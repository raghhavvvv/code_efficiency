// server/routes/api.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// We will add the NETScoreCalculator service later.
// For now, let's just return a placeholder score.
const NETScoreCalculator = {
    calculateForSession: async (sessionId) => {
        // In a real app, this would perform complex calculations
        const placeholderScore = Math.random() * 40 + 50; // Random score between 50-90
        await prisma.codingSession.update({
            where: { id: sessionId },
            data: { netScore: placeholderScore }
        });
        return { netScore: placeholderScore };
    }
};

// --- Session Management ---

// POST /api/coding-session/start
router.post('/coding-session/start', verifyToken, async (req, res) => {
    const { challengeId } = req.body;
    const userId = req.user.id;

    try {
        const newSession = await prisma.codingSession.create({
            data: {
                userId,
                challengeId: challengeId || null, // Handle optional challengeId
            }
        });
        res.status(201).json({ sessionId: newSession.id });
    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ error: 'Failed to start session' });
    }
});

// POST /api/coding-session/:id/end
router.post('/coding-session/:id/end', verifyToken, async (req, res) => {
    const sessionId = parseInt(req.params.id, 10);
    const { codeSubmitted } = req.body;

    try {
        // First, update the session with end time and code
        await prisma.codingSession.update({
            where: { id: sessionId },
            data: {
                endTime: new Date(),
                codeSubmitted: codeSubmitted
            },
        });
        
        // Then, calculate the final score
        const result = await NETScoreCalculator.calculateForSession(sessionId);
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ error: 'Failed to end session' });
    }
});


// --- Metrics Collection (add the other endpoints here later) ---

// POST /api/keystroke-data
router.post('/keystroke-data', verifyToken, async (req, res) => {
    const { sessionId, keystrokes, backspaceCount } = req.body;
    // ... logic to save this data to the DB ...
    console.log(`Received ${keystrokes.length} keystrokes for session ${sessionId}`);
    res.status(200).json({ message: "Keystroke data received" });
});

// POST /api/focus-data
router.post('/focus-data', verifyToken, async (req, res) => {
    const { sessionId, duration } = req.body;
    // ... logic to save this data to the DB ...
    console.log(`Received focus period of ${duration}ms for session ${sessionId}`);
    res.status(200).json({ message: "Focus data received" });
});
router.get('/user/stats', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const sessions = await prisma.codingSession.findMany({
            where: {
                userId: userId,
                endTime: { not: null },
                netScore: { not: null },
            },
            orderBy: {
                endTime: 'asc',
            },
        });

        const statsData = sessions.map(session => ({
            netScore: session.netScore,
            endTime: session.endTime,
            keystrokeScore: session.netScore * (0.8 + Math.random() * 0.4),
            focusScore: session.netScore * (0.8 + Math.random() * 0.4),
            errorScore: session.netScore * (0.8 + Math.random() * 0.4),
            taskScore: session.netScore * (0.8 + Math.random() * 0.4),
        }));

        res.status(200).json(statsData);

    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ error: "Failed to fetch user statistics" });
    }
});
router.post('/idle-data', verifyToken, async (req, res) => {
    const { sessionId, duration } = req.body;
    // In a real app, you would save this to the IdleMetrics model
    console.log(`[Session ${sessionId}] User was idle for ${duration}ms`);
    res.status(200).json({ message: "Idle data received" });
});

// POST /api/paste-event
router.post('/paste-event', verifyToken, async (req, res) => {
    const { sessionId, pasteLength, pasteContent } = req.body;
    // In a real app, you would create a new PasteEvent record
    console.log(`[Session ${sessionId}] Pasted ${pasteLength} characters.`);
    res.status(200).json({ message: "Paste event received" });
});


module.exports = router;
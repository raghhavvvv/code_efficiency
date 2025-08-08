// server/routes/challenges.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// GET /api/challenges - Fetch all challenges
router.get('/', verifyToken, async (req, res) => {
    try {
        const challenges = await prisma.challenge.findMany({
            orderBy: {
                id: 'asc'
            }
        });
        res.status(200).json(challenges);
    } catch (error) {
        console.error("Error fetching challenges:", error);
        res.status(500).json({ error: "Failed to fetch challenges." });
    }
});

// GET /api/challenges/:id - Fetch a single challenge by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const challengeId = parseInt(req.params.id, 10);
        const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId }
        });

        if (!challenge) {
            return res.status(404).json({ error: "Challenge not found." });
        }
        res.status(200).json(challenge);
    } catch (error) {
        console.error(`Error fetching challenge ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to fetch challenge." });
    }
});

module.exports = router;